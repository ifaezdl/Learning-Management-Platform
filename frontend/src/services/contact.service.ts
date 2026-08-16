import api from "./api";

export interface ContactMessage {
  Id: number;
  FullName: string;
  Email: string;
  Phone: string | null;
  Subject: string | null;
  Message: string;
  User_Id: number | null;
  IsRead: boolean;
  CreatedAt: string;
}

export interface CreateContactMessageRequest {
  fullName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface ContactMessagesPage {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  items: ContactMessage[];
}

export interface ContactMessagesQuery {
  search?: string;
  status?: "all" | "unread" | "read";
  page?: number;
  pageSize?: number;
}

const contactService = {
  sendMessage: (data: CreateContactMessageRequest) =>
    api.post("/contact-messages", data).then((res) => res.data),

  getMessages: (query: ContactMessagesQuery = {}) =>
    api
      .get<ContactMessagesPage>("/contact-messages", { params: query })
      .then((res) => res.data),

  markRead: (id: number) =>
    api.put(`/contact-messages/${id}/read`).then((res) => res.data),

  markUnread: (id: number) =>
    api.put(`/contact-messages/${id}/unread`).then((res) => res.data),

  deleteMessage: (id: number) =>
    api.delete(`/contact-messages/${id}`).then((res) => res.data),
};

export default contactService;
