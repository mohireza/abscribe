import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080", // Replace with your API's base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
