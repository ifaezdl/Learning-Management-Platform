import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api_base_url } from "../../environment";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../core/common/chat/chatContext";
import chatService, {
  ChatMember,
  ChatMessage,
  ChatPoll,
  CourseChat,
} from "../../services/chat.service";

// role-aware layout
import StudentProfileCard from "../student/common/profileCard";
import InstructorProfileCard from "../Instructor/common/profileCard";
import AdminProfileCard from "../admin/common/profileCard";
import StudentSidebar from "../student/common/studentSidebar";
import InstructorSidebar from "../Instructor/common/instructorSidebar";
import AdminSidebar from "../admin/common/adminSidebar";

const REACTIONS = ["👍", "❤️", "😂", "😮", "🎉", "😢"];

// ---------------------------------------------------------------- helpers

const fullName = (u?: {
  FirstName?: string | null;
  LastName?: string | null;
  UserName?: string | null;
} | null) =>
  [u?.FirstName, u?.LastName].filter(Boolean).join(" ") || u?.UserName || "کاربر";

const faNum = (n: number | string) =>
  Number(n).toLocaleString("fa-IR", { useGrouping: false });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const listTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString()
    ? d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("fa-IR", { day: "numeric", month: "numeric" });
};

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (same(d, today)) return "امروز";
  if (same(d, yesterday)) return "دیروز";
  return d.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const dayKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

const fileSize = (size?: string | null) => {
  const n = Number(size ?? 0);
  if (!n) return "";
  if (n < 1024) return `${faNum(n)} بایت`;
  if (n < 1024 * 1024) return `${faNum((n / 1024).toFixed(1))} کیلوبایت`;
  return `${faNum((n / (1024 * 1024)).toFixed(1))} مگابایت`;
};

const fileIcon = (name?: string | null, type?: string | null) => {
  if (type?.startsWith("image/")) return "isax isax-gallery";
  if (type?.startsWith("video/")) return "isax isax-video-play";
  if (type?.startsWith("audio/")) return "isax isax-audio-square";
  const ext = (name || "").split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "isax isax-document-text-1";
  if (["zip", "rar", "7z"].includes(ext || "")) return "isax isax-archive-1";
  if (["doc", "docx"].includes(ext || "")) return "isax isax-document-text";
  if (["xls", "xlsx", "csv"].includes(ext || "")) return "isax isax-table";
  return "isax isax-document-1";
};

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

// ---------------------------------------------------------------- main page

const ChatPage = () => {
  const { courseId } = useParams<{ courseId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const chatCtx = useChat();
  const myId = user?.id ?? null;

  const courseIdNum = courseId ? Number(courseId) : null;

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

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nearBottomRef = useRef(true);
  const typingSentAtRef = useRef(0);
  const lastMarkedRef = useRef<Record<number, number>>({});
  const loadedRef = useRef<number | null>(null);

  const canCreatePoll = user?.roleId === 2 || user?.roleId === 3;

  // ------------------------------------------------------------ chat list

  useEffect(() => {
    chatCtx.refreshChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chatsList: CourseChat[] = useMemo(() => {
    const base = chatCtx.chats ?? [];
    const merged = base.map((c) => ({
      ...c,
      LastMessage: chatCtx.lastMessages[c.Id] ?? c.LastMessage,
      UnreadCount: chatCtx.unread[c.Id] ?? c.UnreadCount,
    }));
    merged.sort((a, b) => {
      const ta = a.LastMessage
        ? new Date(a.LastMessage.CreatedAt).getTime()
        : 0;
      const tb = b.LastMessage
        ? new Date(b.LastMessage.CreatedAt).getTime()
        : 0;
      return tb - ta;
    });
    if (!search.trim()) return merged;
    const q = search.trim().toLowerCase();
    return merged.filter((c) => c.Title.toLowerCase().includes(q));
  }, [chatCtx.chats, chatCtx.lastMessages, chatCtx.unread, search]);

  const selectedCourse = useMemo(
    () => chatsList.find((c) => c.Id === courseIdNum) ?? null,
    [chatsList, courseIdNum],
  );

  const openChat = useCallback(
    (id: number) => {
      navigate(`/chat/${id}`);
    },
    [navigate],
  );

  // ------------------------------------------------------------ open chat

  const markReadSafe = useCallback(
    (cid: number, msgId: number) => {
      if ((lastMarkedRef.current[cid] ?? 0) >= msgId) return;
      lastMarkedRef.current[cid] = msgId;
      chatService.markRead(cid, msgId).catch(() => {});
      chatCtx.applyLocalRead(cid, msgId);
      chatCtx.clearUnread(cid);
    },
    [chatCtx],
  );

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  const loadInitial = useCallback(
    async (cid: number) => {
      setLoading(true);
      try {
        const [page, membersRes, pollsRes] = await Promise.all([
          chatService.getMessages(cid, { limit: 30 }),
          chatService.getMembers(cid),
          chatService.getPolls(cid),
        ]);
        setMessages(page.messages);
        setHasMore(page.hasMore);
        setMembers(membersRes.Members);
        setCourseTitle(membersRes.CourseTitle);
        setPolls(pollsRes);
        // merge read state (page data + anything live from context)
        const ctxReads = chatCtx.readState[cid] ?? {};
        setReadState({ ...page.readState, ...ctxReads });
        if (page.messages.length) {
          markReadSafe(cid, page.messages[page.messages.length - 1].Id);
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

  // load when the selected chat changes
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

  // live events for the open chat
  useEffect(() => {
    if (!courseIdNum) return;
    const unsub = chatCtx.subscribe(courseIdNum, (event) => {
      if (event.type === "new-message") {
        const msg = event.data.message as ChatMessage;
        setMessages((prev) =>
          prev.some((m) => m.Id === msg.Id) ? prev : [...prev, msg],
        );
        markReadSafe(courseIdNum, msg.Id);
        if (nearBottomRef.current) {
          requestAnimationFrame(() => scrollToBottom(true));
        }
      } else if (event.type === "reaction") {
        const { messageId, reactions } = event.data;
        setMessages((prev) =>
          prev.map((m) =>
            m.Id === messageId ? { ...m, Reactions: reactions } : m,
          ),
        );
      } else if (event.type === "message-deleted") {
        const { messageId } = event.data;
        setMessages((prev) => prev.filter((m) => m.Id !== messageId));
      } else if (event.type === "new-poll") {
        setPolls((prev) => [
          event.data.poll,
          ...prev.filter((p) => p.Id !== event.data.poll.Id),
        ]);
      } else if (event.type === "poll-vote") {
        setPolls((prev) =>
          prev.map((p) => (p.Id === event.data.pollId ? event.data.poll : p)),
        );
      } else if (event.type === "read") {
        setReadState((prev) => ({
          ...prev,
          [event.data.userId]: event.data.lastReadMessageId,
        }));
      }
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseIdNum, chatCtx.subscribe, markReadSafe, scrollToBottom]);

  // ------------------------------------------------------------ scrolling

  const loadOlder = useCallback(async () => {
    if (!courseIdNum || loadingMore || !hasMore || messages.length === 0) return;
    setLoadingMore(true);
    const el = scrollRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    try {
      const page = await chatService.getMessages(courseIdNum, {
        beforeId: messages[0].Id,
        limit: 30,
      });
      setMessages((prev) => [...page.messages, ...prev]);
      setHasMore(page.hasMore);
      requestAnimationFrame(() => {
        if (el) el.scrollTop = el.scrollHeight - prevHeight;
      });
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  }, [courseIdNum, loadingMore, hasMore, messages]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    nearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (el.scrollTop < 50) loadOlder();
  }, [loadOlder]);

  // ------------------------------------------------------------ sending

  const handleInputChange = (v: string) => {
    setInput(v);
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

  const handleSend = async () => {
    const content = input.trim();
    if ((!content && !attachment) || !courseIdNum || sending) return;
    setSending(true);
    try {
      const msg = await chatService.sendMessage(courseIdNum, {
        content: content || undefined,
        attachmentUrl: attachment?.path,
        attachmentName: attachment?.originalName,
        attachmentType: attachment?.mimetype,
        attachmentSize: attachment ? String(attachment.size) : undefined,
        replyToId: replyTo?.Id,
      });
      setMessages((prev) =>
        prev.some((m) => m.Id === msg.Id) ? prev : [...prev, msg],
      );
      setInput("");
      setAttachment(null);
      setReplyTo(null);
      sendTypingStop();
      markReadSafe(courseIdNum, msg.Id);
      requestAnimationFrame(() => scrollToBottom(true));
    } catch {
      toast.error("ارسال پیام ناموفق بود");
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("حداکثر حجم فایل ۵۰ مگابایت است");
      return;
    }
    setUploading(true);
    try {
      const up = await chatService.uploadAttachment(file);
      setAttachment({
        path: up.path,
        originalName: up.originalName,
        mimetype: up.mimetype,
        size: up.size,
        preview: up.mimetype.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      });
    } catch {
      toast.error("آپلود فایل ناموفق بود");
    } finally {
      setUploading(false);
    }
  };

  // ------------------------------------------------------------ reactions

  const toggleReaction = async (messageId: number, reaction: string) => {
    try {
      const reactions = await chatService.react(messageId, reaction);
      setMessages((prev) =>
        prev.map((m) =>
          m.Id === messageId ? { ...m, Reactions: reactions } : m,
        ),
      );
    } catch {
      toast.error("ثبت واکنش ناموفق بود");
    }
  };

  const deleteMessage = async (message: ChatMessage) => {
    if (!window.confirm("آیا از حذف این پیام مطمئن هستید؟")) return;
    try {
      await chatService.deleteMessage(message.Id);
      setMessages((prev) => prev.filter((m) => m.Id !== message.Id));
    } catch {
      toast.error("حذف پیام ناموفق بود");
    }
  };

  // ------------------------------------------------------------ polls

  const votePoll = async (poll: ChatPoll, optionId: number) => {
    try {
      const updated = await chatService.votePoll(poll.Id, optionId);
      setPolls((prev) =>
        prev.map((p) => (p.Id === poll.Id ? updated : p)),
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ثبت رأی ناموفق بود");
    }
  };

  // ------------------------------------------------------------ timeline

  const timeline: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [];
    messages.forEach((m) =>
      items.push({
        key: `m${m.Id}`,
        ts: new Date(m.CreatedAt).getTime(),
        kind: "message",
        message: m,
      }),
    );
    polls.forEach((p) =>
      items.push({
        key: `p${p.Id}`,
        ts: new Date(p.CreatedAt).getTime(),
        kind: "poll",
        poll: p,
      }),
    );
    items.sort((a, b) => a.ts - b.ts);
    return items;
  }, [messages, polls]);

  const othersMaxRead = useMemo(() => {
    return Object.entries(readState)
      .filter(([uid]) => Number(uid) !== myId)
      .reduce((max, [, v]) => Math.max(max, v as number), 0);
  }, [readState, myId]);

  const typingUsers = chatCtx.typing[courseIdNum ?? -1] ?? [];
  const onlineCount = members.filter((m) => m.IsOnline).length;
  const totalMembers = members.length;

  // ------------------------------------------------------------ role layout

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

  return (
    <>
      <div className="content mt-5">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <Sidebar />
            <div className="col-lg-9">
              <div className="instructor-message">
                <h5 className="page-title d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <span>گفتگوهای دوره</span>
                  <span
                    className={`badge fs-12 ${
                      chatCtx.connected
                        ? "bg-success-transparent"
                        : "bg-light text-muted"
                    }`}
                  >
                    <i
                      className={`fa-solid fa-circle me-1 fs-8 ${
                        chatCtx.connected ? "text-success" : "text-muted"
                      }`}
                    />
                    {chatCtx.connected ? "آنلاین" : "در حال اتصال…"}
                  </span>
                </h5>
                <div className="row g-3">
                  {/* -------------------- chat list -------------------- */}
                  <div
                    className={`col-lg-4 ${
                      courseIdNum ? "d-none d-lg-block" : ""
                    }`}
                  >
                    <div className="chat-cont-left h-100">
                      <div className="chat-card mb-0 flex-fill">
                        <div className="chat-header">
                          <div className="input-icon">
                            <span className="input-icon-addon">
                              <i className="isax isax-search-normal-1 fs-14" />
                            </span>
                            <input
                              type="text"
                              className="form-control form-control-md"
                              placeholder="جستجوی دوره…"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="chat-body chat-users-list chat-scroll">
                          {chatsList.length === 0 ? (
                            <div className="chat-empty-state">
                              <i className="isax isax-message-text-1" />
                              <p className="mb-0">
                                {search
                                  ? "دوره‌ای با این نام پیدا نشد"
                                  : "هنوز گفتگویی ندارید"}
                              </p>
                            </div>
                          ) : (
                            chatsList.map((chat) => {
                              const last = chat.LastMessage;
                              const preview = last
                                ? last.Content ||
                                  (last.AttachmentName
                                    ? `📎 ${last.AttachmentName}`
                                    : "پیوست")
                                : "بدون پیام";
                              const isActive = chat.Id === courseIdNum;
                              return (
                                <div
                                  key={chat.Id}
                                  className={`chat-member d-flex align-items-center ${
                                    isActive ? "active" : ""
                                  }`}
                                  style={{ cursor: "pointer" }}
                                  onClick={() => openChat(chat.Id)}
                                >
                                  <div className="d-flex align-items-center flex-grow-1">
                                    <span className="avatar avatar-lg avatar-rounded flex-shrink-0 me-2">
                                      <img
                                        src={
                                          chat.Thumbnail
                                            ? `${api_base_url}${chat.Thumbnail}`
                                            : "assets/img/course/course-01.jpg"
                                        }
                                        alt=""
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src =
                                            "assets/img/course/course-01.jpg";
                                        }}
                                      />
                                    </span>
                                    <div className="flex-grow-1 overflow-hidden">
                                      <h6 className="fs-16 fw-medium mb-1 d-flex align-items-center">
                                        <span className="text-truncate">
                                          {chat.Title}
                                        </span>
                                        {chat.UnreadCount > 0 && (
                                          <span className="msg-count badge badge-secondary d-flex align-items-center justify-content-center rounded-circle ms-2 flex-shrink-0">
                                            {faNum(chat.UnreadCount)}
                                          </span>
                                        )}
                                      </h6>
                                      <p className="fs-14 text-gray-6 mb-0 d-flex justify-content-between align-items-center">
                                        <span className="text-truncate">
                                          {last
                                            ? `${fullName(last.Sender)}: ${preview}`
                                            : preview}
                                        </span>
                                        <span className="ms-2 flex-shrink-0">
                                          {listTime(last?.CreatedAt)}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* -------------------- chat window -------------------- */}
                  <div
                    className={`col-lg-8 chat-cont-right chat-window-long ${
                      courseIdNum ? "" : "d-none"
                    }`}
                  >
                    {!courseIdNum ? (
                      <div className="chat-two-card chat-window mb-0 shadow-none flex-fill">
                        <div className="chat-empty-state">
                          <i className="isax isax-message-text-1" />
                          <p className="mb-0">
                            یک گفتگو را از لیست انتخاب کنید
                          </p>
                        </div>
                      </div>
                    ) : (
                      <ChatWindow
                        courseId={courseIdNum}
                        courseTitle={
                          courseTitle ?? selectedCourse?.Title ?? "…"
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {courseIdNum && membersOpen && (
        <MembersModal
          members={members}
          onClose={() => setMembersOpen(false)}
        />
      )}

      {courseIdNum && pollModalOpen && (
        <PollCreateModal
          courseId={courseIdNum}
          onClose={() => setPollModalOpen(false)}
          onCreated={(poll) => {
            setPolls((prev) => [
              poll,
              ...prev.filter((p) => p.Id !== poll.Id),
            ]);
            setPollModalOpen(false);
            toast.success("نظرسنجی ایجاد شد");
          }}
        />
      )}
    </>
  );
};

// ---------------------------------------------------------------- chat window

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
  setReplyTo: (m: ChatMessage | null) => void;
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  sending: boolean;
  uploading: boolean;
  attachment: Attachment | null;
  setAttachment: (a: Attachment | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  typingUsers: { userId: number; firstName?: string | null; lastName?: string | null }[];
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
    <div className="chat-two-card chat-window mb-0 shadow-none flex-fill">
      {/* header */}
      <div className="card-header border-0 p-0">
        <div className="msg_head position-relative">
          <div className="d-flex align-items-center">
            <button
              className="btn back-user-list"
              onClick={onBackToList}
              aria-label="بازگشت به لیست"
            >
              <i className="fas fa-chevron-left" />
            </button>
            <div>
              <h6 className="fs-16 mb-1 d-flex align-items-center">
                {courseTitle}
                {onlineCount > 0 && (
                  <span className="badge bg-success-transparent fs-11 ms-2">
                    <i className="fa-solid fa-circle text-success fs-8 me-1" />
                    {faNum(onlineCount)} آنلاین
                  </span>
                )}
              </h6>
              <p className="fs-13 text-muted mb-0">
                {faNum(memberCount)} عضو
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center send-action">
            {canCreatePoll && (
              <button
                className="btn chat-search-btn send-action-btn"
                title="ایجاد نظرسنجی"
                onClick={onOpenPollModal}
              >
                <i className="isax isax-chart-square" />
              </button>
            )}
            <button
              className="btn chat-search-btn send-action-btn"
              title="اعضای گروه"
              onClick={onOpenMembers}
            >
              <i className="isax isax-profile-2user5" />
            </button>
          </div>
        </div>
      </div>

      {/* messages */}
      <div
        className="msg_card_body chat-scroll course-live-chat"
        ref={scrollRef}
        onScroll={onScroll}
      >
        {loading ? (
          <div className="chat-empty-state">
            <i className="isax isax-loader-3" />
            <p className="mb-0">در حال بارگذاری…</p>
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="chat-load-more">
                <button
                  className="btn btn-sm btn-light rounded-pill"
                  onClick={onLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "در حال بارگذاری…" : "پیام‌های قدیمی‌تر"}
                </button>
              </div>
            )}

            {timeline.length === 0 ? (
              <div className="chat-empty-state">
                <i className="isax isax-message-text-1" />
                <p className="mb-0">اولین پیام را بنویسید</p>
              </div>
            ) : (
              <ul className="list-unstyled p-0">
                {timeline.map((item, idx) => {
                  const prev = timeline[idx - 1];
                  const showDaySep =
                    item.kind === "message" &&
                    (!prev ||
                      (prev.kind === "message" &&
                        dayKey(prev.message!.CreatedAt) !==
                          dayKey(item.message!.CreatedAt)) ||
                      (prev.kind === "poll" &&
                        dayKey(prev.poll!.CreatedAt) !==
                          dayKey(item.message!.CreatedAt)));
                  return (
                    <React.Fragment key={item.key}>
                      {showDaySep && (
                        <li className="chat-day-sep">
                          <span>{dayLabel(item.message!.CreatedAt)}</span>
                        </li>
                      )}
                      {item.kind === "message" ? (
                        <MessageBubble
                          message={item.message!}
                          myId={myId}
                          isFirstInGroup={
                            !prev ||
                            prev.kind !== "message" ||
                            prev.message!.Sender.Id !== item.message!.Sender.Id ||
                            new Date(item.message!.CreatedAt).getTime() -
                              new Date(prev.message!.CreatedAt).getTime() >
                              5 * 60 * 1000
                          }
                          isLastInGroup={
                            !timeline[idx + 1] ||
                            timeline[idx + 1].kind !== "message" ||
                            timeline[idx + 1].message!.Sender.Id !==
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
              </ul>
            )}

            {/* typing indicator */}
            {typingUsers.length > 0 && (
              <div className="d-flex align-items-center">
                <span className="fs-12 text-muted me-2">
                  {typingUsers
                    .map((t) =>
                      [t.firstName, t.lastName].filter(Boolean).join(" "),
                    )
                    .join("، ")}{" "}
                  در حال نوشتن…
                </span>
                <div className="chat-typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* footer */}
      <div className="chat-footer border-0 pt-0">
        {replyTo && (
          <div className="chat-reply-quote mb-2">
            <span className="quote-name">
              {replyTo.Sender.Id === myId ? "شما" : fullName(replyTo.Sender)}
            </span>
            <span className="quote-text">
              {replyTo.Content ||
                (replyTo.AttachmentName
                  ? `📎 ${replyTo.AttachmentName}`
                  : "پیوست")}
            </span>
            <button
              className="btn-close-reply"
              onClick={() => setReplyTo(null)}
              aria-label="بستن پاسخ"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        )}

        {attachment && (
          <div className="d-flex align-items-center justify-content-between bg-light rounded p-2 mb-2">
            <div className="d-flex align-items-center gap-2">
              {attachment.preview ? (
                <img
                  src={attachment.preview}
                  alt=""
                  className="rounded"
                  style={{ width: 44, height: 44, objectFit: "cover" }}
                />
              ) : (
                <i className={`${fileIcon(attachment.originalName, attachment.mimetype)} fs-3 text-primary`} />
              )}
              <div className="overflow-hidden">
                <div className="fs-13 fw-semibold text-truncate" style={{ maxWidth: 260 }}>
                  {attachment.originalName}
                </div>
                <div className="fs-12 text-muted">{fileSize(String(attachment.size))}</div>
              </div>
            </div>
            <button
              className="btn btn-sm btn-light rounded-circle"
              onClick={() => setAttachment(null)}
              aria-label="حذف پیوست"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        )}

        <div className="d-flex align-items-center">
          <div className="d-flex align-items-center chat-input-icons">
            <label className="btn no-bg mb-0" title="ارسال فایل">
              {uploading ? (
                <i className="isax isax-loader-3 text-gray-5" />
              ) : (
                <i className="text-gray-5 isax isax-paperclip" />
              )}
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={onFileSelect}
              />
            </label>
          </div>
          <div className="chat-input me-2">
            <input
              className="form-control"
              placeholder="پیام خود را بنویسید…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
            />
          </div>
          <div>
            <button
              className="btn btn-secondary btn_send"
              onClick={onSend}
              disabled={sending || uploading}
            >
              <i
                className="isax isax-send-1 text-white"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- message bubble

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
  const showReactionBar = hovered || reactionOpen;

  const myAvatar = user?.avatar
    ? `${api_base_url}${user.avatar}`
    : "assets/img/user/user-01.jpg";

  const groupedReactions = useMemo(() => {
    const map = new Map<string, { emoji: string; count: number; mine: boolean }>();
    message.Reactions.forEach((r) => {
      const cur = map.get(r.Reaction) ?? {
        emoji: r.Reaction,
        count: 0,
        mine: false,
      };
      cur.count += 1;
      if (r.User_Id === myId) cur.mine = true;
      map.set(r.Reaction, cur);
    });
    return Array.from(map.values());
  }, [message.Reactions, myId]);

  const renderBody = () => (
    <>
      {message.ReplyTo && (
        <div className="chat-reply-inside">
          <span className="quote-name">
            {message.ReplyTo.Sender?.Id === myId
              ? "شما"
              : fullName(message.ReplyTo.Sender)}
          </span>
          <span className="quote-text">
            {message.ReplyTo.Content ||
              (message.ReplyTo.AttachmentName
                ? `📎 ${message.ReplyTo.AttachmentName}`
                : "پیوست")}
          </span>
        </div>
      )}

      {message.Content && <p className="mb-0">{message.Content}</p>}

      {message.AttachmentUrl &&
        (message.AttachmentType?.startsWith("image/") ? (
          <a
            href={`${api_base_url}${message.AttachmentUrl}`}
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={`${api_base_url}${message.AttachmentUrl}`}
              alt={message.AttachmentName || "تصویر"}
              className="chat-attachment-img"
            />
          </a>
        ) : (
          <div className="chat-attachment-file">
            <div className="file-icon">
              <i className={fileIcon(message.AttachmentName, message.AttachmentType)} />
            </div>
            <div className="file-meta">
              <a
                href={`${api_base_url}${message.AttachmentUrl}`}
                target="_blank"
                rel="noreferrer"
                className="file-name"
                title={message.AttachmentName || "فایل"}
              >
                {message.AttachmentName || "فایل پیوست"}
              </a>
              <div className="file-size">
                {fileSize(message.AttachmentSize)}
              </div>
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

  const renderReactions = () => (
    <div>
      {groupedReactions.map((g) => (
        <span
          key={g.emoji}
          className={`chat-reaction-chip ${g.mine ? "mine" : ""}`}
          onClick={() => onReact(message.Id, g.emoji)}
        >
          {g.emoji}
          {g.count > 1 && <span className="count">{faNum(g.count)}</span>}
        </span>
      ))}
    </div>
  );

  const liClass = isOwn
    ? `media sent d-flex align-items-end${isLastInGroup ? "" : " msg-continued"}`
    : `media received${isLastInGroup ? "" : " msg-continued"}`;

  if (isOwn) {
    return (
      <li className={liClass}>
        <div className="media-body flex-grow-1">
          <div className="msg-box">
            <div className="d-flex align-items-end justify-content-end mb-1">
              {showMeta && (
                <div className="avatar avatar-md avatar-rounded flex-shrink-0 ms-2">
                  <img
                    src={myAvatar}
                    alt=""
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "assets/img/user/user-01.jpg";
                    }}
                  />
                </div>
              )}
              <div className="position-relative">
                <div className="d-flex align-items-center justify-content-end mb-1">
                  <div className="d-flex align-items-center">
                    {isRead ? (
                      <i
                        className="fa-solid fa-check-double me-2 text-success fs-12"
                        title="خوانده شد"
                      />
                    ) : (
                      <i
                        className="fa-solid fa-check me-2 text-muted fs-12"
                        title="ارسال شد"
                      />
                    )}
                    <p className="mb-0">{formatTime(message.CreatedAt)}</p>
                    <i className="fa-solid fa-circle text-gray-1 fs-7 mx-1" />
                  </div>
                  <h6 className="fs-14 fw-normal d-flex align-items-center">
                    شما
                  </h6>
                </div>
                <div
                  className="chat-msg-wrap"
                  onMouseEnter={() => setHovered(message.Id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {showReactionBar && (
                    <ReactionBar
                      onReact={(r) => {
                        onReact(message.Id, r);
                        setReactionOpen(null);
                      }}
                    />
                  )}
                  <div className="sent-message">{renderBody()}</div>
                  {renderReactions()}
                  <ChatMsgActions
                    message={message}
                    onReact={() =>
                      setReactionOpen((prev) =>
                        prev === message.Id ? null : message.Id,
                      )
                    }
                    onReply={onReply}
                    onDelete={onDelete}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className={liClass}>
      <div className="d-flex align-items-end mb-1">
        {showMeta ? (
          <div className="avatar avatar-md avatar-rounded flex-shrink-0 me-2">
            <img
              src={
                message.Sender.Avatar
                  ? `${api_base_url}${message.Sender.Avatar}`
                  : "assets/img/user/user-02.jpg"
              }
              alt=""
              onError={(e) => {
                (e.target as HTMLImageElement).src = "assets/img/user/user-02.jpg";
              }}
            />
          </div>
        ) : (
          <span className="flex-shrink-0 me-2" style={{ width: 32 }} />
        )}
        <div className="media-body flex-grow-1">
          {showMeta && (
            <div className="d-flex align-items-center mb-1">
              <h6 className="fs-14 fw-normal d-flex align-items-center">
                {fullName(message.Sender)}
              </h6>
              <div className="d-flex align-items-center">
                <i className="fa-solid fa-circle text-gray-1 fs-7 mx-1" />
                <p className="mb-0">{formatTime(message.CreatedAt)}</p>
              </div>
            </div>
          )}
          <div className="msg-box">
            <div
              className="chat-msg-wrap position-relative"
              onMouseEnter={() => setHovered(message.Id)}
              onMouseLeave={() => setHovered(null)}
            >
              {showReactionBar && (
                <ReactionBar
                  onReact={(r) => {
                    onReact(message.Id, r);
                    setReactionOpen(null);
                  }}
                />
              )}
              <div className="received-message me-2">{renderBody()}</div>
              {renderReactions()}
              <ChatMsgActions
                message={message}
                onReact={() =>
                  setReactionOpen((prev) =>
                    prev === message.Id ? null : message.Id,
                  )
                }
                onReply={onReply}
                onDelete={onDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

const ReactionBar: React.FC<{ onReact: (r: string) => void }> = ({ onReact }) => (
  <div className="chat-reaction-bar">
    {REACTIONS.map((r) => (
      <button key={r} onClick={() => onReact(r)} type="button">
        {r}
      </button>
    ))}
  </div>
);

const ChatMsgActions: React.FC<{
  message: ChatMessage;
  onReact: () => void;
  onReply: (m: ChatMessage) => void;
  onDelete: (m: ChatMessage) => void;
}> = ({ message, onReact, onReply, onDelete }) => {
  return (
    <div className="chat-msg-actions">
      <button type="button" title="واکنش" onClick={onReact}>
        <i className="fa-regular fa-face-smile" />
      </button>
      <button type="button" title="پاسخ" onClick={() => onReply(message)}>
        <i className="fa-solid fa-reply" />
      </button>
      <button
        type="button"
        title="حذف"
        onClick={() => {
          if (window.confirm("آیا از حذف این پیام مطمئن هستید؟")) {
            onDelete(message);
          }
        }}
      >
        <i className="fa-solid fa-trash-can" />
      </button>
    </div>
  );
};

// ---------------------------------------------------------------- poll card

const PollCard: React.FC<{
  poll: ChatPoll;
  onVote: (poll: ChatPoll, optionId: number) => void;
}> = ({ poll, onVote }) => {
  const voted = poll.MyVote != null;
  return (
    <li className="d-flex">
      <div className="chat-poll-card w-100">
        <div className="poll-question">📊 {poll.Question}</div>
        <div className="poll-meta">
          توسط {fullName(poll.Creator)} · {faNum(poll.TotalVotes)} رأی
        </div>
        {poll.Options.map((opt) => {
          const isMyChoice = poll.MyVote === opt.Id;
          return (
            <div
              key={opt.Id}
              className={`poll-option ${isMyChoice ? "voted" : ""} ${
                voted ? "disabled" : ""
              }`}
              onClick={() => {
                if (!voted) onVote(poll, opt.Id);
              }}
            >
              {voted && (
                <div
                  className="poll-option-fill"
                  style={{ width: `${opt.Percent}%` }}
                />
              )}
              <div className="poll-option-body">
                <span className="opt-text">
                  {isMyChoice && <i className="fa-solid fa-check me-1" />}
                  {opt.OptionText}
                </span>
                {voted && (
                  <span className="opt-pct">{faNum(opt.Percent)}٪</span>
                )}
              </div>
            </div>
          );
        })}
        <div className="poll-total">
          {voted ? "رأی شما ثبت شد · برای تغییر رأی دوباره انتخاب کنید" : "برای رأی دادن روی گزینه بزنید"}
        </div>
      </div>
    </li>
  );
};

// ---------------------------------------------------------------- modals

const MembersModal: React.FC<{
  members: ChatMember[];
  onClose: () => void;
}> = ({ members, onClose }) => (
  <div
    className="modal d-block"
    tabIndex={-1}
    style={{ background: "rgba(0,0,0,0.5)" }}
    onClick={onClose}
  >
    <div
      className="modal-dialog modal-dialog-centered"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h6 className="modal-title mb-0">
            اعضای گروه ({faNum(members.length)})
          </h6>
          <button type="button" className="btn-close" onClick={onClose} aria-label="بستن" />
        </div>
        <div className="modal-body" style={{ maxHeight: 420, overflowY: "auto" }}>
          {members.map((m) => (
            <div key={m.Id} className="chat-members-item">
              <span className="avatar avatar-md avatar-rounded flex-shrink-0 position-relative">
                <img
                  src={
                    m.Avatar
                      ? `${api_base_url}${m.Avatar}`
                      : "assets/img/user/user-02.jpg"
                  }
                  alt=""
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "assets/img/user/user-02.jpg";
                  }}
                />
                {m.IsOnline && <span className="chat-online-dot" />}
              </span>
              <div className="flex-grow-1">
                <div className="fs-14 fw-semibold">{fullName(m)}</div>
                <div className="fs-12 text-muted">
                  {m.IsOnline ? (
                    <span className="text-success">آنلاین</span>
                  ) : (
                    "آفلاین"
                  )}
                </div>
              </div>
              <span className="badge bg-light text-muted fs-12">{m.RoleLabel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const PollCreateModal: React.FC<{
  courseId: number;
  onClose: () => void;
  onCreated: (poll: ChatPoll) => void;
}> = ({ courseId, onClose, onCreated }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);

  const setOption = (idx: number, value: string) =>
    setOptions((prev) => prev.map((o, i) => (i === idx ? value : o)));

  const addOption = () => {
    if (options.length < 6) setOptions((prev) => [...prev, ""]);
  };
  const removeOption = (idx: number) => {
    if (options.length > 2)
      setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = async () => {
    const q = question.trim();
    const opts = options.map((o) => o.trim()).filter(Boolean);
    if (!q) {
      toast.error("سؤال نظرسنجی را وارد کنید");
      return;
    }
    if (opts.length < 2) {
      toast.error("حداقل دو گزینه وارد کنید");
      return;
    }
    setSubmitting(true);
    try {
      const poll = await chatService.createPoll(courseId, {
        question: q,
        options: opts,
      });
      onCreated(poll);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ایجاد نظرسنجی ناموفق بود");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal d-block"
      tabIndex={-1}
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h6 className="modal-title mb-0">ایجاد نظرسنجی جدید</h6>
            <button type="button" className="btn-close" onClick={onClose} aria-label="بستن" />
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">
                <span className="text-danger me-1">*</span>
                سؤال
              </label>
              <input
                type="text"
                className="form-control"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="مثلاً: کدام مبحث را بیشتر توضیح دهم؟"
                maxLength={300}
              />
            </div>
            <label className="form-label">
              <span className="text-danger me-1">*</span>
              گزینه‌ها
            </label>
            {options.map((opt, idx) => (
              <div key={idx} className="d-flex align-items-center mb-2 gap-2">
                <input
                  type="text"
                  className="form-control"
                  value={opt}
                  onChange={(e) => setOption(idx, e.target.value)}
                  placeholder={`گزینه ${faNum(idx + 1)}`}
                  maxLength={150}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-light"
                    onClick={() => removeOption(idx)}
                    aria-label="حذف گزینه"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <button
                type="button"
                className="btn btn-sm btn-light rounded-pill"
                onClick={addOption}
              >
                <i className="isax isax-add me-1" />
                افزودن گزینه
              </button>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-light" onClick={onClose}>
              انصراف
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? "در حال ایجاد…" : "ایجاد نظرسنجی"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
