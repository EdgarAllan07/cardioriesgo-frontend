import { cookies } from "next/headers";
import axios from "axios";

export async function getUserByToken(
  userId: string | undefined,
  token: string
) {
    const res = await axios.get(`http://localhost:3000/api/usuarios/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}
