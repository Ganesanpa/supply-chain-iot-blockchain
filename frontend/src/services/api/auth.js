// services/api/auth.js
import axios from "axios";

const API = "http://localhost:5000/api";

// REGISTER
export const registerUser = async (data) => {
  const res = await axios.post(`${API}/auth/register`, data);
  return res.data;
};

// LOGIN
export const loginUser = async (data) => {
  try {
    const res = await axios.post(`${API}/auth/login`, data);
    return res.data;
  } catch (err) {
    return err.response.data;
  }
};