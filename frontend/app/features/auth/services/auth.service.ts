import api from "@/app/lib/axios";
import { registerDto } from "../types/auth.types";

export const register = async (data: registerDto) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};
