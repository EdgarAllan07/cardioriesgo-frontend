"use client";

import { useRouter } from "next/navigation";
import { LoginPage } from "@/pages/login-page";
import axios from "axios";

export default function Login() {
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    try {
      // TODO: Replace with your actual API endpoint
      // If your backend is on a different port (e.g., 5000), use the full URL: http://localhost:5000/api/login
      const loginPayload = {
        correo:email,
        contrasena:password,
      };
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        loginPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);

      // Axios throws an error for non-2xx responses by default, so explicit check might be redundant
      // but checking status is safe. Axios response does not have .ok property.
      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Login failed");
      }

      // Axios automatically parses JSON response into .data
      const responseData = response.data;
      const token = responseData.token; // Adjust this based on your API response structure
      if (token) {
        // Set the cookie that middleware expects
        // Note: In a real app, consider using httpOnly cookies via a Server Action or Route Handler if possible
        // For client-side:
        document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `userId=${responseData.userId}; path=/; max-age=86400; SameSite=Strict`;
        router.push("/dashboard");
      } else {
        console.error("No token received");
        // Handle error (show toast, etc.)
      }
    } catch (error) {
      console.error("Error during login:", error);
      // Handle error (show toast, etc.)
      throw error; // Re-throw so LoginPage can handle loading state
    }
  };

  return <LoginPage onLogin={handleLogin} />;
}
