import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://abtestingtools-backend.up.railway.app", // Replace with your API's base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
