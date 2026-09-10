import { client } from "../client";
import { SignUpData } from "../../types/SignUp";

export const signupApi = async (signUpData: SignUpData) => {
  const res = await client.post("/v1/auth/signup", signUpData);
  return res.data;
};
