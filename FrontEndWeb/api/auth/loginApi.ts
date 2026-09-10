import { client } from "../client";
import { LoginData } from "../../types/Login";

export const loginApi = async (loginData: LoginData) => {
  const formData = new URLSearchParams();
  formData.append("username", loginData.email);
  formData.append("password", loginData.password);

  const res = await client.post("/v1/auth/login", formData.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return res.data;
};
