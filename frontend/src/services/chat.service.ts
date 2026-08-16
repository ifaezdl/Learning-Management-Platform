import api from "./api";

export interface ChatSender {
  Id: number;
  FirstName?: string | null;
  LastName?: string | null;
  UserName?: string | null;
  Avatar?: string | null;
  Role_Id?: number;
}

export interface ChatReaction {
  User_Id: number;
  Reaction: string;
}

export interface ChatReplyTo {
  Id: number;
  Content?: string | null;
  AttachmentUrl?: string | null;
  AttachmentName?: string | null;
  Sender?: ChatSender | null;
}

export interface ChatMessage {
  Id: number;
  Course_Id: number;
  Content?: string | null;
  AttachmentUrl?: string | null;
  AttachmentName?: string | null;
  AttachmentType?: string | null;
  AttachmentSize?: string | null;
  ReplyTo_Id?: number | null;
  CreatedAt: string;
  Sender: ChatSender;
  ReplyTo?: ChatReplyTo | null;
  Reactions: ChatReaction[];
}

export interface CourseChat {
  Id: number;
  Title: string;
  Thumbnail?: string | null;
  IsPublished: boolean;
  Teacher: { Id: number; FirstName?: string | null; LastName?: string | null };
  MemberCount: number;
  LastMessage?: {
    Id: number;
    Content?: string | null;
    AttachmentUrl?: string | null;
    AttachmentName?: string | null;
    AttachmentType?: string | null;
    CreatedAt: string;
    Sender: ChatSender;
  } | null;
  UnreadCount: number;
  LastReadMessageId: number;
}

export interface MessagesPage {
  messages: ChatMessage[];
  readState: Record<number, number>;
  participantIds: number[];
  hasMore: boolean;
}

export interface ChatMember {
  Id: number;
  FirstName?: string | null;
  LastName?: string | null;
  UserName?: string | null;
  Avatar?: string | null;
  RoleLabel: string;
  IsOnline: boolean;
  LastReadMessageId: number;
}

export interface PollOption {
  Id: number;
  OptionText: string;
  Votes: number;
  Percent: number;
}

export interface ChatPoll {
  Id: number;
  Question: string;
  IsActive: boolean;
  CreatedAt: string;
  Creator: ChatSender;
  TotalVotes: number;
  MyVote: number | null;
  Options: PollOption[];
}

class ChatService {
  async getChats(): Promise<CourseChat[]> {
    const response = await api.get("/chat/courses");
    return response.data;
  }

  async getMessages(
    courseId: number,
    params?: { beforeId?: number; limit?: number },
  ): Promise<MessagesPage> {
    const response = await api.get(`/chat/courses/${courseId}/messages`, {
      params,
    });
    return response.data;
  }

  async getMembers(courseId: number): Promise<{
    CourseId: number;
    CourseTitle: string;
    Members: ChatMember[];
  }> {
    const response = await api.get(`/chat/courses/${courseId}/members`);
    return response.data;
  }

  async sendMessage(
    courseId: number,
    data: {
      content?: string;
      attachmentUrl?: string;
      attachmentName?: string;
      attachmentType?: string;
      attachmentSize?: string;
      replyToId?: number;
    },
  ): Promise<ChatMessage> {
    const response = await api.post(`/chat/courses/${courseId}/messages`, data);
    return response.data;
  }

  async deleteMessage(messageId: number) {
    const response = await api.delete(`/chat/messages/${messageId}`);
    return response.data;
  }

  async markRead(courseId: number, lastReadMessageId: number) {
    const response = await api.post(`/chat/courses/${courseId}/read`, {
      lastReadMessageId,
    });
    return response.data;
  }

  async sendTyping(courseId: number, isTyping: boolean) {
    const response = await api.post(`/chat/courses/${courseId}/typing`, {
      isTyping,
    });
    return response.data;
  }

  async react(messageId: number, reaction: string): Promise<ChatReaction[]> {
    const response = await api.post(`/chat/messages/${messageId}/reaction`, {
      reaction,
    });
    return response.data;
  }

  async getPolls(courseId: number): Promise<ChatPoll[]> {
    const response = await api.get(`/chat/courses/${courseId}/polls`);
    return response.data;
  }

  async createPoll(
    courseId: number,
    data: { question: string; options: string[] },
  ): Promise<ChatPoll> {
    const response = await api.post(`/chat/courses/${courseId}/polls`, data);
    return response.data;
  }

  async votePoll(pollId: number, optionId: number): Promise<ChatPoll> {
    const response = await api.post(`/chat/polls/${pollId}/vote`, { optionId });
    return response.data;
  }

  async uploadAttachment(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/upload/chat", formData, {
      headers: { "Content-Type": undefined },
    });
    return response.data as {
      fileName: string;
      originalName: string;
      path: string;
      size: number;
      mimetype: string;
    };
  }
}

export default new ChatService();
