import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

export const fetchJobs = () => API.get("/jobs");
export const fetchJob = (id) => API.get(`/jobs/${id}`);
export const fetchAnalytics = () => API.get("/jobs/analytics/summary");
export const classifyJob = (data) => API.post("/predictions/classify", data);
export const predictSalary = (data) => API.post("/predictions/salary", data);
export const matchResume = (data) => API.post("/predictions/match", data);
export const askAssistant = (data) => API.post("/assistant", data);
export const saveJob = (data) => API.post("/users/save-job", data);
export const fetchSavedJobs = (email) => API.get(`/users/${email}/saved-jobs`);