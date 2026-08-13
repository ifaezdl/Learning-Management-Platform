import api from "./api";

export interface CreateInstructorRequestData {
  description?: string;
  resume?: File | null;
}

class InstructorRequestService {
  async create(data: CreateInstructorRequestData) {
    const formData = new FormData();
    if (data.description) formData.append("description", data.description);
    if (data.resume) formData.append("resume", data.resume);

    const response = await api.post("/instructor-requests", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }
}

export default new InstructorRequestService();
