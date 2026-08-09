import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const registerUser = async (
  username: string,
  email: string,
  password: string,
) => {
  const response = await api.post("/auth/register", {
    username,
    email,
    password,
  });

  return response.data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const getCurrentUser = async (token: string) => {
  const response = await api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
