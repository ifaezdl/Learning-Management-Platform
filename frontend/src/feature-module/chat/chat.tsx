import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import "./chat.scss";

import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../core/common/chat/chatContext";

import chatService, {
  ChatMember,
  ChatMessage,
  ChatPoll,
  CourseChat,
} from "../../services/chat.service";

// Role based layout
import StudentProfileCard from "../student/common/profileCard";
import InstructorProfileCard from "../Instructor/common/profileCard";
import AdminProfileCard from "../admin/common/profileCard";

import StudentSidebar from "../student/common/studentSidebar";
import InstructorSidebar from "../Instructor/common/instructorSidebar";
import AdminSidebar from "../admin/common/adminSidebar";
import { api_base_url } from "../../environment";

const REACTIONS = ["👍", "❤️", "😂", "😮", "🎉", "😢"];

/* =========================================================
   HELPERS
========================================================= */

const fullName = (
  user?: {
    FirstName?: string | null;
    LastName?: string | null;
    UserName?: string | null;
  } | null,
) =>
  [user?.FirstName, user?.LastName].filter(Boolean).join(" ") ||
  user?.UserName ||
  "کاربر";

const faNum = (value: number | string) =>
  Number(value).toLocaleString("fa-IR", {
    useGrouping: false,
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const listTime = (iso?: string) => {
  if (!iso) return "";

  const date = new Date(iso);
  const now = new Date();

  return date.toDateString() === now.toDateString()
    ? date.toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : date.toLocaleDateString("fa-IR", {
        day: "numeric",
        month: "numeric",
      });
};

const dayLabel = (iso: string) => {
  const date = new Date(iso);
  const today = new Date();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return "امروز";
  if (sameDay(date, yesterday)) return "دیروز";

  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const dayKey = (iso: string) => {
  const date = new Date(iso);

  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const fileSize = (size?: string | null) => {
  const value = Number(size ?? 0);

  if (!value) return "";

  if (value < 1024) {
    return `${faNum(value)} بایت`;
  }

  if (value < 1024 * 1024) {
    return `${faNum((value / 1024).toFixed(1))} کیلوبایت`;
  }

  return `${faNum((value / (1024 * 1024)).toFixed(1))} مگابایت`;
};

const fileIcon = (name?: string | null, type?: string | null) => {
  if (type?.startsWith("image/")) {
    return "isax isax-gallery";
  }

  if (type?.startsWith("video/")) {
    return "isax isax-video-play";
  }

  if (type?.startsWith("audio/")) {
    return "isax isax-audio-square";
  }

  const ext = (name || "").split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    return "isax isax-document-text-1";
  }

  if (["zip", "rar", "7z"].includes(ext || "")) {
    return "isax isax-archive-1";
  }

  if (["doc", "docx"].includes(ext || "")) {
    return "isax isax-document-text";
  }

  if (["xls", "xlsx", "csv"].includes(ext || "")) {
    return "isax isax-table";
  }

  return "isax isax-document-1";
};

/* =========================================================
   CHAT AVATAR — Telegram-style initials fallback
========================================================= */

const AVATAR_COLORS = [
  "#E57373",
  "#F06292",
  "#BA68C8",
  "#9575CD",
  "#7986CB",
  "#64B5F6",
  "#4FC3F7",
  "#4DD0E1",
  "#4DB6AC",
  "#81C784",
  "#AED581",
  "FFD54F",
  "#FFB74D",
  "#FF8A65",
  "#A1887F",
  "#90A4AE",
];

const getColorForName = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (firstName?: string | null, lastName?: string | null) => {
  const f = firstName?.trim()?.[0] || "";
  const l = lastName?.trim()?.[0] || "";
  return (f + l).toUpperCase() || "؟";
};

const ChatAvatar: React.FC<{
  src?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  className?: string;
  size?: number;
}> = ({ src, firstName, lastName, className = "", size }) => {
  const [imgError, setImgError] = useState(false);

  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "کاربر";

  if (src && !imgError) {
    return (
      <div
        className={`chat-avatar-img ${className}`}
        style={size ? { width: size, height: size } : undefined}
      >
        <img src={src} alt="" onError={() => setImgError(true)} />
      </div>
    );
  }

  const initials = getInitials(firstName, lastName);
  const bgColor = getColorForName(fullName);

  return (
    <div
      className={`chat-avatar-initials ${className}`}
      style={{
        backgroundColor: bgColor,
        ...(size ? { width: size, height: size } : {}),
      }}
    >
      <span>{initials}</span>
    </div>
  );
};

/* =========================================================
   TYPES
========================================================= */

interface Attachment {
  path: string;
  originalName: string;
  mimetype: string;
  size: number;
  preview?: string;
}

interface TimelineItem {
  key: string;
  ts: number;
  kind: "message" | "poll";
  message?: ChatMessage;
  poll?: ChatPoll;
}

/* =========================================================
   MAIN CHAT PAGE
========================================================= */

const ChatPage = () => {
  const { courseId } = useParams<{ courseId?: string }>();
  const navigate = useNavigate();

  const { user } = useAuth();
  const chatCtx = useChat();

  const myId = user?.id ?? null;
  const courseIdNum = courseId ? Number(courseId) : null;

  /* ---------------------------------------------------------
     STATE
  --------------------------------------------------------- */

  const [search, setSearch] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [polls, setPolls] = useState<ChatPoll[]>([]);
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [readState, setReadState] = useState<Record<number, number>>({});

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [attachment, setAttachment] = useState<Attachment | null>(null);

  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);

  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const [reactionOpenId, setReactionOpenId] = useState<number | null>(null);

  const [membersOpen, setMembersOpen] = useState(false);

  const [pollModalOpen, setPollModalOpen] = useState(false);

  const [courseTitle, setCourseTitle] = useState<string | null>(null);

  /* ---------------------------------------------------------
     REFS
  --------------------------------------------------------- */

  const scrollRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const nearBottomRef = useRef(true);

  const typingSentAtRef = useRef(0);

  const lastMarkedRef = useRef<Record<number, number>>({});

  const loadedRef = useRef<number | null>(null);

  /* ---------------------------------------------------------
     PERMISSIONS
  --------------------------------------------------------- */

  const canCreatePoll = user?.roleId === 2 || user?.roleId === 3;

  /* =========================================================
     CHAT LIST
  ========================================================= */

  useEffect(() => {
    chatCtx.refreshChats();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chatsList: CourseChat[] = useMemo(() => {
    const base = chatCtx.chats ?? [];

    const merged = base.map((chat) => ({
      ...chat,
      LastMessage: chatCtx.lastMessages[chat.Id] ?? chat.LastMessage,
      UnreadCount: chatCtx.unread[chat.Id] ?? chat.UnreadCount,
    }));

    merged.sort((a, b) => {
      const first = a.LastMessage
        ? new Date(a.LastMessage.CreatedAt).getTime()
        : 0;

      const second = b.LastMessage
        ? new Date(b.LastMessage.CreatedAt).getTime()
        : 0;

      return second - first;
    });

    if (!search.trim()) {
      return merged;
    }

    const query = search.trim().toLowerCase();

    return merged.filter((chat) => chat.Title.toLowerCase().includes(query));
  }, [chatCtx.chats, chatCtx.lastMessages, chatCtx.unread, search]);

  const selectedCourse = useMemo(
    () => chatsList.find((chat) => chat.Id === courseIdNum) ?? null,
    [chatsList, courseIdNum],
  );

  const openChat = useCallback(
    (id: number) => {
      navigate(`/chat/${id}`);
    },
    [navigate],
  );

  /* =========================================================
     READ STATE
  ========================================================= */

  const markReadSafe = useCallback(
    (cid: number, msgId: number) => {
      if ((lastMarkedRef.current[cid] ?? 0) >= msgId) {
        return;
      }

      lastMarkedRef.current[cid] = msgId;

      chatService.markRead(cid, msgId).catch(() => {});

      chatCtx.applyLocalRead(cid, msgId);
      chatCtx.clearUnread(cid);
    },
    [chatCtx],
  );

  /* =========================================================
     SCROLL
  ========================================================= */

  const scrollToBottom = useCallback((smooth = true) => {
    const element = scrollRef.current;

    if (!element) return;

    element.scrollTo({
      top: element.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  /* =========================================================
     LOAD CHAT
  ========================================================= */

  const loadInitial = useCallback(
    async (cid: number) => {
      setLoading(true);

      try {
        const [messagesPage, membersResponse, pollsResponse] =
          await Promise.all([
            chatService.getMessages(cid, {
              limit: 30,
            }),
            chatService.getMembers(cid),
            chatService.getPolls(cid),
          ]);

        setMessages(messagesPage.messages);

        setHasMore(messagesPage.hasMore);

        setMembers(membersResponse.Members);

        setCourseTitle(membersResponse.CourseTitle);

        setPolls(pollsResponse);

        const contextReads = chatCtx.readState[cid] ?? {};

        setReadState({
          ...messagesPage.readState,
          ...contextReads,
        });

        if (messagesPage.messages.length) {
          markReadSafe(
            cid,
            messagesPage.messages[messagesPage.messages.length - 1].Id,
          );
        }

        requestAnimationFrame(() => scrollToBottom(false));
      } catch {
        toast.error("بارگذاری گفتگو ناموفق بود");
      } finally {
        setLoading(false);
      }
    },
    [chatCtx, markReadSafe, scrollToBottom],
  );

  /* =========================================================
     CHANGE CHAT
  ========================================================= */

  useEffect(() => {
    if (!courseIdNum) {
      chatCtx.setOpenCourse(null);

      setMessages([]);
      setPolls([]);
      setMembers([]);
      setCourseTitle(null);
      setReadState({});
      setReplyTo(null);
      setAttachment(null);

      loadedRef.current = null;

      return;
    }

    chatCtx.setOpenCourse(courseIdNum);
    chatCtx.clearUnread(courseIdNum);

    if (loadedRef.current !== courseIdNum) {
      loadedRef.current = courseIdNum;

      loadInitial(courseIdNum);
    }

    return () => {
      chatCtx.setOpenCourse(null);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseIdNum]);

  /* =========================================================
     LIVE EVENTS
  ========================================================= */

  useEffect(() => {
    if (!courseIdNum) return;

    const unsubscribe = chatCtx.subscribe(courseIdNum, (event) => {
      if (event.type === "new-message") {
        const message = event.data.message as ChatMessage;

        setMessages((previous) =>
          previous.some((item) => item.Id === message.Id)
            ? previous
            : [...previous, message],
        );

        markReadSafe(courseIdNum, message.Id);

        if (nearBottomRef.current) {
          requestAnimationFrame(() => scrollToBottom(true));
        }
      }

      if (event.type === "reaction") {
        const { messageId, reactions } = event.data;

        setMessages((previous) =>
          previous.map((item) =>
            item.Id === messageId
              ? {
                  ...item,
                  Reactions: reactions,
                }
              : item,
          ),
        );
      }

      if (event.type === "message-deleted") {
        const { messageId } = event.data;

        setMessages((previous) =>
          previous.filter((item) => item.Id !== messageId),
        );
      }

      if (event.type === "new-poll") {
        setPolls((previous) => [
          event.data.poll,
          ...previous.filter((poll) => poll.Id !== event.data.poll.Id),
        ]);
      }

      if (event.type === "poll-vote") {
        setPolls((previous) =>
          previous.map((poll) =>
            poll.Id === event.data.pollId ? event.data.poll : poll,
          ),
        );
      }

      if (event.type === "read") {
        setReadState((previous) => ({
          ...previous,
          [event.data.userId]: event.data.lastReadMessageId,
        }));
      }
    });

    return unsubscribe;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseIdNum, chatCtx.subscribe, markReadSafe, scrollToBottom]);

  /* =========================================================
     LOAD OLDER
  ========================================================= */

  const loadOlder = useCallback(async () => {
    if (!courseIdNum || loadingMore || !hasMore || messages.length === 0) {
      return;
    }

    setLoadingMore(true);

    const element = scrollRef.current;

    const previousHeight = element?.scrollHeight ?? 0;

    try {
      const page = await chatService.getMessages(courseIdNum, {
        beforeId: messages[0].Id,
        limit: 30,
      });

      setMessages((previous) => [...page.messages, ...previous]);

      setHasMore(page.hasMore);

      requestAnimationFrame(() => {
        if (element) {
          element.scrollTop = element.scrollHeight - previousHeight;
        }
      });
    } catch {
      // intentionally ignored
    } finally {
      setLoadingMore(false);
    }
  }, [courseIdNum, loadingMore, hasMore, messages]);

  const handleScroll = useCallback(() => {
    const element = scrollRef.current;

    if (!element) return;

    nearBottomRef.current =
      element.scrollHeight - element.scrollTop - element.clientHeight < 120;

    if (element.scrollTop < 50) {
      loadOlder();
    }
  }, [loadOlder]);

  /* =========================================================
     TYPING
  ========================================================= */

  const handleInputChange = (value: string) => {
    setInput(value);

    if (!courseIdNum) return;

    const now = Date.now();

    if (now - typingSentAtRef.current > 2500) {
      typingSentAtRef.current = now;

      chatService.sendTyping(courseIdNum, true).catch(() => {});
    }
  };

  const sendTypingStop = useCallback(() => {
    if (!courseIdNum) return;

    chatService.sendTyping(courseIdNum, false).catch(() => {});
  }, [courseIdNum]);

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  const handleSend = async () => {
    const content = input.trim();

    if ((!content && !attachment) || !courseIdNum || sending) {
      return;
    }

    setSending(true);

    try {
      const message = await chatService.sendMessage(courseIdNum, {
        content: content || undefined,
        attachmentUrl: attachment?.path,
        attachmentName: attachment?.originalName,
        attachmentType: attachment?.mimetype,
        attachmentSize: attachment ? String(attachment.size) : undefined,
        replyToId: replyTo?.Id,
      });

      setMessages((previous) =>
        previous.some((item) => item.Id === message.Id)
          ? previous
          : [...previous, message],
      );

      setInput("");
      setAttachment(null);
      setReplyTo(null);

      sendTypingStop();

      markReadSafe(courseIdNum, message.Id);

      requestAnimationFrame(() => scrollToBottom(true));
    } catch {
      toast.error("ارسال پیام ناموفق بود");
    } finally {
      setSending(false);
    }
  };

  /* =========================================================
     FILE
  ========================================================= */

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("حداکثر حجم فایل ۵۰ مگابایت است");
      return;
    }

    setUploading(true);

    try {
      const uploaded = await chatService.uploadAttachment(file);

      setAttachment({
        path: uploaded.path,
        originalName: uploaded.originalName,
        mimetype: uploaded.mimetype,
        size: uploaded.size,
        preview: uploaded.mimetype.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      });
    } catch {
      toast.error("آپلود فایل ناموفق بود");
    } finally {
      setUploading(false);
    }
  };

  /* =========================================================
     REACTION
  ========================================================= */

  const toggleReaction = async (messageId: number, reaction: string) => {
    try {
      const reactions = await chatService.react(messageId, reaction);

      setMessages((previous) =>
        previous.map((item) =>
          item.Id === messageId
            ? {
                ...item,
                Reactions: reactions,
              }
            : item,
        ),
      );
    } catch {
      toast.error("ثبت واکنش ناموفق بود");
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const deleteMessage = async (message: ChatMessage) => {
    if (!window.confirm("آیا از حذف این پیام مطمئن هستید؟")) {
      return;
    }

    try {
      await chatService.deleteMessage(message.Id);

      setMessages((previous) =>
        previous.filter((item) => item.Id !== message.Id),
      );
    } catch {
      toast.error("حذف پیام ناموفق بود");
    }
  };

  /* =========================================================
     POLL
  ========================================================= */

  const votePoll = async (poll: ChatPoll, optionId: number) => {
    try {
      const updated = await chatService.votePoll(poll.Id, optionId);

      setPolls((previous) =>
        previous.map((item) => (item.Id === poll.Id ? updated : item)),
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "ثبت رأی ناموفق بود");
    }
  };

  /* =========================================================
     TIMELINE
  ========================================================= */

  const timeline: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [];

    messages.forEach((message) => {
      items.push({
        key: `m${message.Id}`,
        ts: new Date(message.CreatedAt).getTime(),
        kind: "message",
        message,
      });
    });

    polls.forEach((poll) => {
      items.push({
        key: `p${poll.Id}`,
        ts: new Date(poll.CreatedAt).getTime(),
        kind: "poll",
        poll,
      });
    });

    items.sort((a, b) => a.ts - b.ts);

    return items;
  }, [messages, polls]);

  const othersMaxRead = useMemo(() => {
    return Object.entries(readState)
      .filter(([userId]) => Number(userId) !== myId)
      .reduce((max, [, value]) => Math.max(max, value as number), 0);
  }, [readState, myId]);

  const typingUsers = chatCtx.typing[courseIdNum ?? -1] ?? [];

  const onlineCount = members.filter((member) => member.IsOnline).length;

  const totalMembers = members.length;

  /* =========================================================
     ROLE LAYOUT
  ========================================================= */

  const ProfileCard =
    user?.roleId === 1
      ? StudentProfileCard
      : user?.roleId === 2
        ? InstructorProfileCard
        : AdminProfileCard;

  const Sidebar =
    user?.roleId === 1
      ? StudentSidebar
      : user?.roleId === 2
        ? InstructorSidebar
        : AdminSidebar;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <div className="content mt-5">
        <div className="container">
          {/* Profile */}
          <ProfileCard />

          {/* Horizontal navigation */}
          <Sidebar />

          {/* =================================================
              CHAT APPLICATION
          ================================================= */}

          <div className="modern-chat-page">
            {/* Chat heading */}

            <div className="modern-chat-heading">
              <div>
                <span className="modern-chat-eyebrow">پیام‌رسان دوره‌ها</span>

                <h4>گفتگوهای شما</h4>

                <p>ارتباط مستقیم با اعضای دوره و مشاهده پیام‌ها</p>
              </div>

              <div
                className={`modern-chat-connection ${
                  chatCtx.connected ? "connected" : "disconnected"
                }`}
              >
                <span className="connection-dot" />

                <span>
                  {chatCtx.connected ? "اتصال برقرار است" : "در حال اتصال…"}
                </span>
              </div>
            </div>

            {/* =================================================
                CHAT APP
            ================================================= */}

            <div className="modern-chat-app">
              {/* =================================================
                  CONVERSATIONS
              ================================================= */}

              <aside
                className={`modern-chat-sidebar ${
                  courseIdNum ? "mobile-hidden" : ""
                }`}
              >
                <div className="modern-chat-sidebar-header">
                  <div>
                    <h5>گفتگوها</h5>

                    <span>{faNum(chatsList.length)} دوره</span>
                  </div>

                  <span className="modern-chat-sidebar-icon">
                    <i className="isax isax-messages-25" />
                  </span>
                </div>

                {/* Search */}

                <div className="modern-chat-search">
                  <i className="isax isax-search-normal-1" />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="جستجوی گفتگو..."
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="پاک کردن جستجو"
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                  )}
                </div>

                {/* Conversation list */}

                <div className="modern-conversation-list">
                  {chatsList.length === 0 ? (
                    <div className="modern-chat-empty">
                      <div className="modern-chat-empty-icon">
                        <i className="isax isax-message-search" />
                      </div>

                      <strong>
                        {search ? "گفتگویی پیدا نشد" : "هنوز گفتگویی ندارید"}
                      </strong>

                      <span>
                        {search
                          ? "عبارت جستجو را تغییر دهید."
                          : "گفتگوهای دوره‌های شما اینجا نمایش داده می‌شوند."}
                      </span>
                    </div>
                  ) : (
                    chatsList.map((chat) => {
                      const last = chat.LastMessage;

                      const preview = last
                        ? last.Content ||
                          (last.AttachmentName
                            ? `📎 ${last.AttachmentName}`
                            : "پیوست")
                        : "هنوز پیامی ارسال نشده";

                      const isActive = chat.Id === courseIdNum;

                      return (
                        <button
                          key={chat.Id}
                          type="button"
                          className={`modern-conversation ${
                            isActive ? "active" : ""
                          }`}
                          onClick={() => openChat(chat.Id)}
                        >
                          <div className="modern-conversation-avatar">
                            <ChatAvatar
                              src={
                                chat.Thumbnail
                                  ? `${api_base_url}${chat.Thumbnail}`
                                  : null
                              }
                              firstName={chat.Title}
                              size={46}
                            />

                            {isActive && (
                              <span className="modern-conversation-active-dot" />
                            )}
                          </div>

                          <div className="modern-conversation-content">
                            <div className="modern-conversation-top">
                              <strong>{chat.Title}</strong>

                              <span>{listTime(last?.CreatedAt)}</span>
                            </div>

                            <div className="modern-conversation-bottom">
                              <span>
                                {last
                                  ? `${fullName(last.Sender)}: ${preview}`
                                  : preview}
                              </span>

                              {chat.UnreadCount > 0 && (
                                <b>{faNum(chat.UnreadCount)}</b>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </aside>

              {/* =================================================
                  CHAT WINDOW
              ================================================= */}

              <main
                className={`modern-chat-window ${
                  courseIdNum ? "mobile-visible" : ""
                }`}
              >
                {!courseIdNum ? (
                  <div className="modern-chat-welcome">
                    <div className="modern-chat-welcome-icon">
                      <i className="isax isax-messages-25" />
                    </div>

                    <h4>یک گفتگو را انتخاب کنید</h4>

                    <p>
                      از لیست گفتگوها یک دوره را انتخاب کنید تا پیام‌ها نمایش
                      داده شوند.
                    </p>
                  </div>
                ) : (
                  <ChatWindow
                    courseId={courseIdNum}
                    courseTitle={
                      courseTitle ?? selectedCourse?.Title ?? "گفتگو"
                    }
                    memberCount={totalMembers}
                    onlineCount={onlineCount}
                    loading={loading}
                    messages={messages}
                    hasMore={hasMore}
                    loadingMore={loadingMore}
                    onLoadMore={loadOlder}
                    onScroll={handleScroll}
                    scrollRef={scrollRef}
                    myId={myId}
                    othersMaxRead={othersMaxRead}
                    hoveredId={hoveredId}
                    setHoveredId={setHoveredId}
                    reactionOpenId={reactionOpenId}
                    setReactionOpenId={setReactionOpenId}
                    onReact={toggleReaction}
                    onDelete={deleteMessage}
                    onReply={setReplyTo}
                    replyTo={replyTo}
                    setReplyTo={setReplyTo}
                    input={input}
                    setInput={handleInputChange}
                    onSend={handleSend}
                    sending={sending}
                    uploading={uploading}
                    attachment={attachment}
                    setAttachment={setAttachment}
                    fileInputRef={fileInputRef}
                    onFileSelect={handleFileSelect}
                    typingUsers={typingUsers}
                    canCreatePoll={canCreatePoll}
                    onOpenPollModal={() => setPollModalOpen(true)}
                    onOpenMembers={() => setMembersOpen(true)}
                    onBackToList={() => navigate("/chat")}
                    onVote={votePoll}
                    timeline={timeline}
                  />
                )}
              </main>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MEMBERS MODAL
      ===================================================== */}

      {courseIdNum && membersOpen && (
        <MembersModal members={members} onClose={() => setMembersOpen(false)} />
      )}

      {/* =====================================================
          POLL MODAL
      ===================================================== */}

      {courseIdNum && pollModalOpen && (
        <PollCreateModal
          courseId={courseIdNum}
          onClose={() => setPollModalOpen(false)}
          onCreated={(poll) => {
            setPolls((previous) => [
              poll,
              ...previous.filter((item) => item.Id !== poll.Id),
            ]);

            setPollModalOpen(false);

            toast.success("نظرسنجی ایجاد شد");
          }}
        />
      )}
    </>
  );
};

/* =========================================================
   CHAT WINDOW
========================================================= */

interface ChatWindowProps {
  courseId: number;
  courseTitle: string;
  memberCount: number;
  onlineCount: number;

  loading: boolean;

  messages: ChatMessage[];
  hasMore: boolean;
  loadingMore: boolean;

  onLoadMore: () => void;
  onScroll: () => void;

  scrollRef: React.RefObject<HTMLDivElement | null>;

  myId: number | null;
  othersMaxRead: number;

  hoveredId: number | null;
  setHoveredId: React.Dispatch<React.SetStateAction<number | null>>;

  reactionOpenId: number | null;
  setReactionOpenId: React.Dispatch<React.SetStateAction<number | null>>;

  onReact: (messageId: number, reaction: string) => void;

  onDelete: (message: ChatMessage) => void;

  onReply: (message: ChatMessage) => void;

  replyTo: ChatMessage | null;

  setReplyTo: (message: ChatMessage | null) => void;

  input: string;

  setInput: (value: string) => void;

  onSend: () => void;

  sending: boolean;
  uploading: boolean;

  attachment: Attachment | null;

  setAttachment: (attachment: Attachment | null) => void;

  fileInputRef: React.RefObject<HTMLInputElement | null>;

  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;

  typingUsers: {
    userId: number;
    firstName?: string | null;
    lastName?: string | null;
  }[];

  canCreatePoll: boolean;

  onOpenPollModal: () => void;
  onOpenMembers: () => void;
  onBackToList: () => void;

  onVote: (poll: ChatPoll, optionId: number) => void;

  timeline: TimelineItem[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  courseTitle,
  memberCount,
  onlineCount,
  loading,
  messages,
  hasMore,
  loadingMore,
  onLoadMore,
  onScroll,
  scrollRef,
  myId,
  othersMaxRead,
  hoveredId,
  setHoveredId,
  reactionOpenId,
  setReactionOpenId,
  onReact,
  onDelete,
  onReply,
  replyTo,
  setReplyTo,
  input,
  setInput,
  onSend,
  sending,
  uploading,
  attachment,
  setAttachment,
  fileInputRef,
  onFileSelect,
  typingUsers,
  canCreatePoll,
  onOpenPollModal,
  onOpenMembers,
  onBackToList,
  onVote,
  timeline,
}) => {
  return (
    <div className="modern-chat-inner">
      {/* =================================================
          CHAT HEADER
      ================================================= */}

      <header className="modern-chat-header">
        <div className="modern-chat-header-main">
          <button
            type="button"
            className="modern-chat-back"
            onClick={onBackToList}
            aria-label="بازگشت"
          >
            <i className="isax isax-arrow-right-1" />
          </button>

          <div className="modern-chat-course-avatar">
            <i className="isax isax-book-1" />
          </div>

          <div className="modern-chat-header-info">
            <h5>{courseTitle}</h5>

            <div>
              <span>{faNum(memberCount)} عضو</span>

              <span className="modern-chat-header-separator">•</span>

              <span className="modern-chat-online">
                <i />
                {onlineCount > 0
                  ? `${faNum(onlineCount)} آنلاین`
                  : "بدون کاربر آنلاین"}
              </span>
            </div>
          </div>
        </div>

        <div className="modern-chat-header-actions">
          {canCreatePoll && (
            <button
              type="button"
              title="ایجاد نظرسنجی"
              onClick={onOpenPollModal}
            >
              <i className="isax isax-chart-square" />
            </button>
          )}

          <button type="button" title="اعضای دوره" onClick={onOpenMembers}>
            <i className="isax isax-profile-2user5" />
          </button>
        </div>
      </header>

      {/* =================================================
          MESSAGE AREA
      ================================================= */}

      <div className="modern-chat-messages" ref={scrollRef} onScroll={onScroll}>
        {loading ? (
          <div className="modern-chat-loading">
            <div className="modern-chat-loader" />

            <span>در حال بارگذاری گفتگو...</span>
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="modern-load-more">
                <button
                  type="button"
                  onClick={onLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore
                    ? "در حال بارگذاری..."
                    : "نمایش پیام‌های قدیمی‌تر"}

                  <i className="isax isax-arrow-up-2" />
                </button>
              </div>
            )}

            {timeline.length === 0 ? (
              <div className="modern-chat-first-message">
                <div>
                  <i className="isax isax-message-text-1" />
                </div>

                <h5>هنوز پیامی وجود ندارد</h5>

                <p>اولین پیام این گفتگو را ارسال کنید.</p>
              </div>
            ) : (
              <div className="modern-message-list">
                {timeline.map((item, index) => {
                  const previous = timeline[index - 1];

                  const showDaySeparator =
                    item.kind === "message" &&
                    (!previous ||
                      (previous.kind === "message" &&
                        dayKey(previous.message!.CreatedAt) !==
                          dayKey(item.message!.CreatedAt)) ||
                      (previous.kind === "poll" &&
                        dayKey(previous.poll!.CreatedAt) !==
                          dayKey(item.message!.CreatedAt)));

                  return (
                    <React.Fragment key={item.key}>
                      {showDaySeparator && (
                        <div className="modern-day-divider">
                          <span>{dayLabel(item.message!.CreatedAt)}</span>
                        </div>
                      )}

                      {item.kind === "message" ? (
                        <MessageBubble
                          message={item.message!}
                          myId={myId}
                          isFirstInGroup={
                            !previous ||
                            previous.kind !== "message" ||
                            previous.message!.Sender.Id !==
                              item.message!.Sender.Id ||
                            new Date(item.message!.CreatedAt).getTime() -
                              new Date(previous.message!.CreatedAt).getTime() >
                              5 * 60 * 1000
                          }
                          isLastInGroup={
                            !timeline[index + 1] ||
                            timeline[index + 1].kind !== "message" ||
                            timeline[index + 1].message!.Sender.Id !==
                              item.message!.Sender.Id
                          }
                          isRead={othersMaxRead >= item.message!.Id}
                          hovered={hoveredId === item.message!.Id}
                          setHovered={setHoveredId}
                          reactionOpen={reactionOpenId === item.message!.Id}
                          setReactionOpen={setReactionOpenId}
                          onReact={onReact}
                          onDelete={onDelete}
                          onReply={onReply}
                        />
                      ) : (
                        <PollCard poll={item.poll!} onVote={onVote} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* Typing */}

            {typingUsers.length > 0 && (
              <div className="modern-typing">
                <div className="modern-typing-avatar">
                  <i className="isax isax-user" />
                </div>

                <span>
                  {typingUsers
                    .map((typing) =>
                      [typing.firstName, typing.lastName]
                        .filter(Boolean)
                        .join(" "),
                    )
                    .join("، ")}{" "}
                  در حال نوشتن
                </span>

                <div className="modern-typing-dots">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* =================================================
          COMPOSER
      ================================================= */}

      <div className="modern-chat-composer">
        {/* Reply */}

        {replyTo && (
          <div className="modern-reply-preview">
            <div className="modern-reply-icon">
              <i className="isax isax-reply" />
            </div>

            <div className="modern-reply-content">
              <strong>
                پاسخ به{" "}
                {replyTo.Sender.Id === myId ? "شما" : fullName(replyTo.Sender)}
              </strong>

              <span>
                {replyTo.Content ||
                  (replyTo.AttachmentName
                    ? `📎 ${replyTo.AttachmentName}`
                    : "پیوست")}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setReplyTo(null)}
              aria-label="لغو پاسخ"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        )}

        {/* Attachment */}

        {attachment && (
          <div className="modern-attachment-preview">
            <div className="modern-attachment-icon">
              {attachment.preview ? (
                <img src={attachment.preview} alt="" />
              ) : (
                <i
                  className={fileIcon(
                    attachment.originalName,
                    attachment.mimetype,
                  )}
                />
              )}
            </div>

            <div className="modern-attachment-info">
              <strong>{attachment.originalName}</strong>

              <span>{fileSize(String(attachment.size))}</span>
            </div>

            <button
              type="button"
              onClick={() => setAttachment(null)}
              aria-label="حذف فایل"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        )}

        <div className="modern-composer-row">
          {/* Attachment */}

          <label className="modern-composer-action" title="افزودن فایل">
            {uploading ? (
              <i className="isax isax-loader-3 modern-spin" />
            ) : (
              <i className="isax isax-paperclip-2" />
            )}

            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={onFileSelect}
            />
          </label>

          {/* Input */}

          <div className="modern-composer-input">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  onSend();
                }
              }}
              placeholder="پیام خود را بنویسید..."
              disabled={sending || uploading}
            />
          </div>

          {/* Send */}

          <button
            type="button"
            className="modern-send-button"
            onClick={onSend}
            disabled={sending || uploading || (!input.trim() && !attachment)}
            aria-label="ارسال پیام"
          >
            {sending ? (
              <i className="isax isax-loader-3 modern-spin" />
            ) : (
              <i className="isax isax-send-1" />
            )}
          </button>
        </div>

        <div className="modern-composer-hint">
          برای ارسال سریع Enter را فشار دهید
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MESSAGE BUBBLE
========================================================= */

interface MessageBubbleProps {
  message: ChatMessage;

  myId: number | null;

  isFirstInGroup: boolean;
  isLastInGroup: boolean;

  isRead: boolean;

  hovered: boolean;

  setHovered: (id: number | null) => void;

  reactionOpen: boolean;

  setReactionOpen: React.Dispatch<React.SetStateAction<number | null>>;

  onReact: (messageId: number, reaction: string) => void;

  onDelete: (message: ChatMessage) => void;

  onReply: (message: ChatMessage) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  myId,
  isFirstInGroup,
  isLastInGroup,
  isRead,
  hovered,
  setHovered,
  reactionOpen,
  setReactionOpen,
  onReact,
  onDelete,
  onReply,
}) => {
  const { user } = useAuth();

  const isOwn = message.Sender.Id === myId;

  const showMeta = isFirstInGroup;

  const showActions = hovered || reactionOpen;

  const myAvatar = user?.avatar
    ? `${api_base_url}${user.avatar}`
    : "assets/img/user/user-01.jpg";

  const groupedReactions = useMemo(() => {
    const map = new Map<
      string,
      {
        emoji: string;
        count: number;
        mine: boolean;
      }
    >();

    message.Reactions.forEach((reaction) => {
      const current = map.get(reaction.Reaction) ?? {
        emoji: reaction.Reaction,
        count: 0,
        mine: false,
      };

      current.count += 1;

      if (reaction.User_Id === myId) {
        current.mine = true;
      }

      map.set(reaction.Reaction, current);
    });

    return Array.from(map.values());
  }, [message.Reactions, myId]);

  const renderBody = () => (
    <>
      {message.ReplyTo && (
        <div className="modern-message-reply">
          <div className="modern-message-reply-line" />

          <div>
            <strong>
              {message.ReplyTo.Sender?.Id === myId
                ? "شما"
                : fullName(message.ReplyTo.Sender)}
            </strong>

            <span>
              {message.ReplyTo.Content ||
                (message.ReplyTo.AttachmentName
                  ? `📎 ${message.ReplyTo.AttachmentName}`
                  : "پیوست")}
            </span>
          </div>
        </div>
      )}

      {message.Content && (
        <p className="modern-message-text">{message.Content}</p>
      )}

      {message.AttachmentUrl &&
        (message.AttachmentType?.startsWith("image/") ? (
          <a
            href={`${api_base_url}${message.AttachmentUrl}`}
            target="_blank"
            rel="noreferrer"
            className="modern-image-attachment"
          >
            <img
              src={`${api_base_url}${message.AttachmentUrl}`}
              alt={message.AttachmentName || "تصویر"}
            />
          </a>
        ) : (
          <div className="modern-file-attachment">
            <div className="modern-file-icon">
              <i
                className={fileIcon(
                  message.AttachmentName,
                  message.AttachmentType,
                )}
              />
            </div>

            <div className="modern-file-info">
              <a
                href={`${api_base_url}${message.AttachmentUrl}`}
                target="_blank"
                rel="noreferrer"
              >
                {message.AttachmentName || "فایل پیوست"}
              </a>

              <span>{fileSize(message.AttachmentSize)}</span>
            </div>

            <a
              href={`${api_base_url}${message.AttachmentUrl}`}
              download={message.AttachmentName || undefined}
              title="دانلود"
            >
              <i className="isax isax-document-download" />
            </a>
          </div>
        ))}
    </>
  );

  const renderReactions =
    groupedReactions.length > 0 ? (
      <div className="modern-reactions">
        {groupedReactions.map((reaction) => (
          <button
            key={reaction.emoji}
            type="button"
            className={reaction.mine ? "mine" : ""}
            onClick={() => onReact(message.Id, reaction.emoji)}
          >
            <span>{reaction.emoji}</span>

            {reaction.count > 1 && <small>{faNum(reaction.count)}</small>}
          </button>
        ))}
      </div>
    ) : null;

  const actions = (
    <div className="modern-message-actions">
      <button
        type="button"
        title="واکنش"
        onClick={() =>
          setReactionOpen((previous) =>
            previous === message.Id ? null : message.Id,
          )
        }
      >
        <i className="fa-regular fa-face-smile" />
      </button>

      <button type="button" title="پاسخ" onClick={() => onReply(message)}>
        <i className="fa-solid fa-reply" />
      </button>

      {isOwn && (
        <button type="button" title="حذف" onClick={() => onDelete(message)}>
          <i className="fa-solid fa-trash-can" />
        </button>
      )}
    </div>
  );

  const reactionBar = reactionOpen ? (
    <ReactionBar
      onReact={(reaction) => {
        onReact(message.Id, reaction);

        setReactionOpen(null);
      }}
    />
  ) : null;

  // ------- OWN MESSAGES — right side (RTL) -------
  if (isOwn) {
    return (
      <div
        className={`modern-message-row own ${
          isLastInGroup ? "last" : "continued"
        }`}
        onMouseEnter={() => setHovered(message.Id)}
        onMouseLeave={() => setHovered(null)}
      >
        {showMeta && (
          <div className="modern-message-avatar own-avatar">
            <ChatAvatar
              src={myAvatar}
              firstName={user?.firstName}
              lastName={user?.lastName}
              size={32}
            />
          </div>
        )}

        <div className="modern-message-column">
          {showMeta && (
            <div className="modern-message-meta own-meta">
              <span>{formatTime(message.CreatedAt)}</span>

              <i
                className={
                  isRead ? "fa-solid fa-check-double" : "fa-solid fa-check"
                }
              />
            </div>
          )}

          <div className="modern-message-content-row">
            <div className="modern-message-bubble own-bubble">
              {renderBody()}

              <div className="modern-message-footer">
                <span>{formatTime(message.CreatedAt)}</span>

                <i
                  className={
                    isRead ? "fa-solid fa-check-double" : "fa-solid fa-check"
                  }
                />
              </div>
            </div>

            {reactionBar}
          </div>

          {showActions && actions}

          {renderReactions}
        </div>
      </div>
    );
  }

  // ------- RECEIVED MESSAGES — left side (RTL) -------
  return (
    <div
      className={`modern-message-row ${isLastInGroup ? "last" : "continued"}`}
      onMouseEnter={() => setHovered(message.Id)}
      onMouseLeave={() => setHovered(null)}
    >
      {showMeta ? (
        <div className="modern-message-avatar">
          <ChatAvatar
            src={
              message.Sender.Avatar
                ? `${api_base_url}${message.Sender.Avatar}`
                : null
            }
            firstName={message.Sender.FirstName}
            lastName={message.Sender.LastName}
            size={32}
          />
        </div>
      ) : (
        <div className="modern-message-avatar-placeholder" />
      )}

      <div className="modern-message-column">
        {showMeta && (
          <div className="modern-message-meta">
            <span className="sender-name">{fullName(message.Sender)}</span>

            <span>{formatTime(message.CreatedAt)}</span>
          </div>
        )}

        <div className="modern-message-content-row">
          <div className="modern-message-bubble">
            {renderBody()}

            {!showMeta && (
              <div className="modern-message-footer">
                <span>{formatTime(message.CreatedAt)}</span>
              </div>
            )}
          </div>

          {reactionBar}
        </div>

        {showActions && actions}

        {renderReactions}
      </div>
    </div>
  );
};

/* =========================================================
   REACTION BAR
========================================================= */

const ReactionBar: React.FC<{
  onReact: (reaction: string) => void;
}> = ({ onReact }) => (
  <div className="modern-reaction-picker">
    {REACTIONS.map((reaction) => (
      <button key={reaction} type="button" onClick={() => onReact(reaction)}>
        {reaction}
      </button>
    ))}
  </div>
);

/* =========================================================
   POLL
========================================================= */

const PollCard: React.FC<{
  poll: ChatPoll;
  onVote: (poll: ChatPoll, optionId: number) => void;
}> = ({ poll, onVote }) => {
  const voted = poll.MyVote != null;

  return (
    <div className="modern-poll-wrapper">
      <div className="modern-poll-card">
        <div className="modern-poll-header">
          <div className="modern-poll-icon">
            <i className="isax isax-chart-square" />
          </div>

          <div>
            <strong>نظرسنجی</strong>

            <span>{faNum(poll.TotalVotes)} رأی</span>
          </div>
        </div>

        <h6>{poll.Question}</h6>

        <div className="modern-poll-options">
          {poll.Options.map((option) => {
            const selected = poll.MyVote === option.Id;

            return (
              <button
                key={option.Id}
                type="button"
                disabled={voted}
                className={`modern-poll-option ${selected ? "selected" : ""}`}
                onClick={() => {
                  if (!voted) {
                    onVote(poll, option.Id);
                  }
                }}
              >
                {voted && (
                  <span
                    className="modern-poll-progress"
                    style={{
                      width: `${option.Percent}%`,
                    }}
                  />
                )}

                <span className="modern-poll-option-content">
                  <span>
                    {selected && <i className="fa-solid fa-check" />}

                    {option.OptionText}
                  </span>

                  {voted && <b>{faNum(option.Percent)}%</b>}
                </span>
              </button>
            );
          })}
        </div>

        <div className="modern-poll-footer">
          {voted ? "رأی شما ثبت شد" : "برای رأی دادن یک گزینه را انتخاب کنید"}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MEMBERS MODAL
========================================================= */

const MembersModal: React.FC<{
  members: ChatMember[];
  onClose: () => void;
}> = ({ members, onClose }) => (
  <div className="modern-modal-overlay" onClick={onClose}>
    <div className="modern-modal" onClick={(event) => event.stopPropagation()}>
      <div className="modern-modal-header">
        <div>
          <span>اعضای گفتگو</span>

          <strong>{faNum(members.length)} نفر</strong>
        </div>

        <button type="button" onClick={onClose} aria-label="بستن">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      <div className="modern-modal-body">
        {members.map((member) => (
          <div key={member.Id} className="modern-member">
            <div className="modern-member-avatar">
              <ChatAvatar
                src={member.Avatar ? `${api_base_url}${member.Avatar}` : null}
                firstName={member.FirstName}
                lastName={member.LastName}
                size={40}
              />

              {member.IsOnline && <span />}
            </div>

            <div className="modern-member-info">
              <strong>{fullName(member)}</strong>

              <span className={member.IsOnline ? "online" : ""}>
                {member.IsOnline ? "آنلاین" : "آفلاین"}
              </span>
            </div>

            <small>{member.RoleLabel}</small>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* =========================================================
   CREATE POLL MODAL
========================================================= */

const PollCreateModal: React.FC<{
  courseId: number;
  onClose: () => void;
  onCreated: (poll: ChatPoll) => void;
}> = ({ courseId, onClose, onCreated }) => {
  const [question, setQuestion] = useState("");

  const [options, setOptions] = useState(["", ""]);

  const [submitting, setSubmitting] = useState(false);

  const setOption = (index: number, value: string) => {
    setOptions((previous) =>
      previous.map((option, currentIndex) =>
        currentIndex === index ? value : option,
      ),
    );
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions((previous) => [...previous, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions((previous) =>
        previous.filter((_, currentIndex) => currentIndex !== index),
      );
    }
  };

  const submit = async () => {
    const cleanQuestion = question.trim();

    const cleanOptions = options.map((option) => option.trim()).filter(Boolean);

    if (!cleanQuestion) {
      toast.error("سؤال نظرسنجی را وارد کنید");
      return;
    }

    if (cleanOptions.length < 2) {
      toast.error("حداقل دو گزینه وارد کنید");
      return;
    }

    setSubmitting(true);

    try {
      const poll = await chatService.createPoll(courseId, {
        question: cleanQuestion,
        options: cleanOptions,
      });

      onCreated(poll);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "ایجاد نظرسنجی ناموفق بود");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modern-modal-overlay" onClick={onClose}>
      <div
        className="modern-modal modern-poll-create-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modern-modal-header">
          <div>
            <span>ایجاد نظرسنجی</span>

            <strong>نظر اعضای دوره را دریافت کنید</strong>
          </div>

          <button type="button" onClick={onClose} aria-label="بستن">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="modern-modal-body">
          <div className="modern-form-group">
            <label>سؤال نظرسنجی</label>

            <input
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="مثلاً: کدام مبحث را بیشتر توضیح دهم؟"
              maxLength={300}
            />
          </div>

          <div className="modern-form-group">
            <label>گزینه‌ها</label>

            <div className="modern-poll-create-options">
              {options.map((option, index) => (
                <div key={index} className="modern-poll-create-option">
                  <span>{faNum(index + 1)}</span>

                  <input
                    type="text"
                    value={option}
                    onChange={(event) => setOption(index, event.target.value)}
                    placeholder={`گزینه ${faNum(index + 1)}`}
                    maxLength={150}
                  />

                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOption(index)}>
                      <i className="fa-solid fa-xmark" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {options.length < 6 && (
            <button
              type="button"
              className="modern-add-option"
              onClick={addOption}
            >
              <i className="isax isax-add" />
              افزودن گزینه
            </button>
          )}
        </div>

        <div className="modern-modal-footer">
          <button
            type="button"
            className="modern-modal-cancel"
            onClick={onClose}
          >
            انصراف
          </button>

          <button
            type="button"
            className="modern-modal-submit"
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? "در حال ایجاد..." : "ایجاد نظرسنجی"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
