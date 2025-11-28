import axios from "axios";
import { API_URL } from "../config/api";

export async function getUserByToken(
  userId: string | undefined,
  token: string
) {
  const res = await axios.get(`${API_URL}/api/usuarios/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}
