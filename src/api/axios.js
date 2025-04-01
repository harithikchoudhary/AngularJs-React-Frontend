import axios from "axios";

export default axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: false, // Changed from true to false since we don't need credentials
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});