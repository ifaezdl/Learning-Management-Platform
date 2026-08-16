import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { api_base_url } from "../../../environment";
import chatService, { ChatMessage, CourseChat } from "../../../services/chat.service";

export interface TypingUser {
  userId: number;
  firstName?: string | null;
  lastName?: string | null;
}

export interface ChatEvent {
  type: string;
  data: any;
}

interface ChatContextValue {
  chats: CourseChat[] | null;
  unread: Record<number, number>;
  lastMessages: Record<number, CourseChat["LastMessage"]>;
  typing: Record<number, TypingUser[]>;
  readState: Record<number, Record<number, number>>;
  connected: boolean;
  myId: number | null;
  refreshChats: () => Promise<void>;
  setOpenCourse: (courseId: number | null) => void;
  clearUnread: (courseId: number) => void;
  applyLocalRead: (courseId: number, lastReadMessageId: number) => void;
  subscribe: (courseId: number, cb: (event: ChatEvent) => void) => () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const TYPING_TIMEOUT = 6000;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const myId = user?.id ?? null;

  const [chats, setChats] = useState<CourseChat[] | null>(null);
  const [unread, setUnread] = useState<Record<number, number>>({});
  const [lastMessages, setLastMessages] = useState<
    Record<number, CourseChat["LastMessage"]>
  >({});
  const [typing, setTyping] = useState<Record<number, TypingUser[]>>({});
  const [readState, setReadState] = useState<Record<number, Record<number, number>>>({});
  const [connected, setConnected] = useState(false);

  const openCourseRef = useRef<number | null>(null);
  const listenersRef = useRef<Map<number, Set<(event: ChatEvent) => void>>>(
    new Map(),
  );
  const typingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const myIdRef = useRef<number | null>(null);
  myIdRef.current = myId;

  const setOpenCourse = useCallback((courseId: number | null) => {
    openCourseRef.current = courseId;
  }, []);

  const clearUnread = useCallback((courseId: number) => {
    setUnread((prev) => {
      if (!prev[courseId]) return prev;
      const next = { ...prev };
      delete next[courseId];
      return next;
    });
  }, []);

  const applyLocalRead = useCallback(
    (courseId: number, lastReadMessageId: number) => {
      setReadState((prev) => {
        const courseReads = { ...(prev[courseId] ?? {}) };
        if ((courseReads[myIdRef.current ?? -1] ?? 0) >= lastReadMessageId) {
          return prev;
        }
        if (myIdRef.current != null) {
          courseReads[myIdRef.current] = lastReadMessageId;
        }
        return { ...prev, [courseId]: courseReads };
      });
    },
    [],
  );

  const refreshChats = useCallback(async () => {
    try {
      const data = await chatService.getChats();
      setChats(data);
      const unreadMap: Record<number, number> = {};
      const lastMap: Record<number, CourseChat["LastMessage"]> = {};
      data.forEach((c) => {
        if (c.UnreadCount > 0) unreadMap[c.Id] = c.UnreadCount;
        if (c.LastMessage) lastMap[c.Id] = c.LastMessage;
      });
      setUnread(unreadMap);
      setLastMessages(lastMap);
    } catch {
      setChats([]);
    }
  }, []);

  const subscribe = useCallback(
    (courseId: number, cb: (event: ChatEvent) => void) => {
      let set = listenersRef.current.get(courseId);
      if (!set) {
        set = new Set();
        listenersRef.current.set(courseId, set);
      }
      set.add(cb);
      const listenerSet = set;
      return () => {
        listenerSet.delete(cb);
        if (listenerSet.size === 0) listenersRef.current.delete(courseId);
      };
    },
    [],
  );

  const updateTyping = useCallback(
    (courseId: number, userId: number, isTyping: boolean, name?: TypingUser) => {
      setTyping((prev) => {
        const current = prev[courseId] ?? [];
        const exists = current.some((t) => t.userId === userId);
        let next: TypingUser[];
        if (isTyping && !exists) {
          next = [...current, name ?? { userId }];
        } else if (!isTyping && exists) {
          next = current.filter((t) => t.userId !== userId);
        } else {
          return prev;
        }
        return { ...prev, [courseId]: next };
      });
      if (isTyping) {
        const key = `${courseId}:${userId}`;
        const existing = typingTimersRef.current.get(key);
        if (existing) clearTimeout(existing);
        typingTimersRef.current.set(
          key,
          setTimeout(() => {
            setTyping((prev) => {
              const current = prev[courseId] ?? [];
              const next = current.filter((t) => t.userId !== userId);
              return current.length === next.length
                ? prev
                : { ...prev, [courseId]: next };
            });
            typingTimersRef.current.delete(key);
          }, TYPING_TIMEOUT),
        );
      }
    },
    [],
  );

  const handleEvent = useCallback(
    (event: ChatEvent) => {
      const data = event.data ?? {};
      const courseId = data.courseId as number | undefined;
      if (courseId == null) return;

      if (event.type === "new-message") {
        const message: ChatMessage = data.message;
        if (message.Sender.Id !== myIdRef.current) {
          setLastMessages((prev) => ({ ...prev, [courseId]: message as any }));
          if (openCourseRef.current !== courseId) {
            setUnread((prev) => ({
              ...prev,
              [courseId]: (prev[courseId] ?? 0) + 1,
            }));
            const senderName = `${message.Sender.FirstName ?? ""} ${message.Sender.LastName ?? ""}`.trim();
            const preview =
              message.Content?.slice(0, 60) ||
              (message.AttachmentName ? `📎 ${message.AttachmentName}` : "پیوست");
            toast(
              `${senderName}: ${preview}`,
              { icon: "💬" },
            );
          }
        } else {
          setLastMessages((prev) => ({ ...prev, [courseId]: message as any }));
          applyLocalRead(courseId, message.Id);
        }
      } else if (event.type === "typing") {
        updateTyping(
          courseId,
          data.userId,
          data.isTyping,
          data.userId !== myIdRef.current
            ? { userId: data.userId, firstName: data.firstName, lastName: data.lastName }
            : undefined,
        );
      } else if (event.type === "read") {
        setReadState((prev) => ({
          ...prev,
          [courseId]: {
            ...(prev[courseId] ?? {}),
            [data.userId]: data.lastReadMessageId,
          },
        }));
      }

      // Forward everything to the open chat window (if subscribed)
      const listeners = listenersRef.current.get(courseId);
      if (listeners) {
        listeners.forEach((cb) => cb(event));
      }
    },
    [applyLocalRead, updateTyping],
  );

  // SSE connection
  useEffect(() => {
    if (!myId) return;
    if (!localStorage.getItem("accessToken")) return;

    let es: EventSource | null = null;
    let tokenRef = localStorage.getItem("accessToken");
    let interval: ReturnType<typeof setInterval> | null = null;

    const connect = () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      tokenRef = token;
      es = new EventSource(
        `${api_base_url}/chat/events?token=${encodeURIComponent(token)}`,
      );
      es.onopen = () => setConnected(true);
      es.onerror = () => {
        setConnected(false);
        // EventSource reconnects automatically with the same URL
      };
      const handlers: Record<string, (e: MessageEvent) => void> = {
        "new-message": (e) => handleEvent({ type: "new-message", data: JSON.parse(e.data) }),
        typing: (e) => handleEvent({ type: "typing", data: JSON.parse(e.data) }),
        read: (e) => handleEvent({ type: "read", data: JSON.parse(e.data) }),
        reaction: (e) => handleEvent({ type: "reaction", data: JSON.parse(e.data) }),
        "new-poll": (e) => handleEvent({ type: "new-poll", data: JSON.parse(e.data) }),
        "poll-vote": (e) => handleEvent({ type: "poll-vote", data: JSON.parse(e.data) }),
        "message-deleted": (e) => handleEvent({ type: "message-deleted", data: JSON.parse(e.data) }),
        ping: () => undefined,
      };
      Object.entries(handlers).forEach(([name, fn]) =>
        es!.addEventListener(name, fn as EventListener),
      );
    };

    connect();

    // When the access token is refreshed (15 min expiry), reconnect with it
    interval = setInterval(() => {
      const current = localStorage.getItem("accessToken");
      if (current && current !== tokenRef) {
        es?.close();
        connect();
      }
    }, 30000);

    return () => {
      if (interval) clearInterval(interval);
      es?.close();
    };
  }, [myId, handleEvent]);

  // Reset when the user changes
  useEffect(() => {
    setChats(null);
    setUnread({});
    setLastMessages({});
    setTyping({});
    setReadState({});
  }, [myId]);

  const value: ChatContextValue = {
    chats,
    unread,
    lastMessages,
    typing,
    readState,
    connected,
    myId,
    refreshChats,
    setOpenCourse,
    clearUnread,
    applyLocalRead,
    subscribe,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextValue => {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used inside ChatProvider");
  }
  return ctx;
};
