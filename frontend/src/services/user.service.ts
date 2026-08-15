import api from "./api";

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  userName?: string;
  email?: string;
  mobile?: string;
  sexId?: number;
}
export interface InstructorRequestUser {
  Id: number;
  FirstName: string;
  LastName: string;
  UserName: string;
  Email: string;
  Avatar?: string;
}

export interface InstructorRequestItem {
  RequestId: number;
  Status: string;
  Description?: string;
  ResumeUrl?: string;
  CreatedAt: string;
  User: InstructorRequestUser;
}

export interface PaginatedInstructorRequests {
  data: InstructorRequestItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface User {
  Id: number;
  FirstName: string;
  LastName: string;
  UserName: string;
  Email: string;
  Mobile: string;
  Role_Id: number;
  Sex_Id: number;
  IsActive: boolean;
  RequestStatus?: string;
  RequestId?: number;
}

class UserService {
  async getProfile() {
    const response = await api.get("/users/profile");
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest) {
    debugger;
    const response = await api.put("/users/profile", data);
    return response.data;
  }

  async changePassword(data: ChangePasswordRequest) {
    const response = await api.put("/users/change-password", data);
    return response.data;
  }

  async getUsers() {
    const response = await api.get("/users");
    return response.data;
  }

  async approveInstructorRequest(requestId: number) {
    const response = await api.put(`/instructor-requests/${requestId}/approve`);
    return response.data;
  }

  async rejectInstructorRequest(requestId: number) {
    const response = await api.put(`/instructor-requests/${requestId}/reject`);
    return response.data;
  }
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await api.post("/users/profile/avatar", formData, {
      headers: { "Content-Type": undefined },
    });

    return response.data;
  }
  async deleteAvatar() {
    const response = await api.delete("/users/profile/avatar");
    return response.data;
  }
  async getInstructorRequests(params: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const response = await api.get<PaginatedInstructorRequests>(
      "/instructor-requests",
      { params },
    );
    return response.data;
  }
}

export default new UserService();
