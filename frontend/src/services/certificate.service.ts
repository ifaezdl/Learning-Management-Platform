import api from "./api";

export interface Certificate {
  Id: number;
  Student_Id: number;
  Course_Id: number;
  Attempt_Id: number;
  CertificateCode: string;
  Score: number;
  MaxScore: number;
  IssuedAt: string;
  Courses: { Title: string };
}

class CertificateService {
  async myCertificates(): Promise<Certificate[]> {
    const res = await api.get("/certificates/my");
    return res.data;
  }

  async getCertificate(id: number): Promise<Certificate> {
    const res = await api.get(`/certificates/${id}`);
    return res.data;
  }
}

export default new CertificateService();
