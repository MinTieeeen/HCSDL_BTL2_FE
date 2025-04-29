import axios from "axios";

// Base URL configuration - changed to use the correct backend port
const API_URL = "http://localhost:8080/api";

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create a separate instance for authenticated requests
const authApiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for authenticated requests
authApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return Promise.reject(new Error("No authentication token found"));
    }
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Common response interceptor
const responseInterceptor = [
  (response) => response.data,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("typeId");
          window.location.href = "/login";
          break;
        case 403:
          console.error("Access forbidden - check your permissions");
          break;
        case 404:
          console.error("Resource not found");
          break;
        default:
          console.error(`Server error: ${error.response.status}`);
      }
    } else if (error.request) {
      console.error("No response received from server");
    } else {
      console.error("Error setting up request:", error.message);
    }
    return Promise.reject(error);
  },
];

// Add response interceptor to both clients
apiClient.interceptors.response.use(...responseInterceptor);
authApiClient.interceptors.response.use(...responseInterceptor);

// Auth Service
export const authService = {
  login: (username, password, userType) => {
    return apiClient
      .post("/auth/login", { username, password, userType })
      .then((response) => {
        // Store the token
        const data = response.data;
        if (data.accessToken) {
          localStorage.setItem("token", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          localStorage.setItem("typeId", data.typeId);
          localStorage.setItem("userType", userType); // Thêm dòng này
        }
        return data;
      });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("typeId");
  },
};

// Job Service - for general job operations
export const jobService = {
  // Public operations (no auth required)
  getAllJobs: () => apiClient.get("/jobs"),
  getJobById: (id) => authApiClient.get(`/jobs/${id}`),

  // Protected operations (auth required)
  getJobsByStatus: (status) => authApiClient.get(`/jobs/status/${status}`),
  getJobsByEmployer: (employerId) =>
    authApiClient.get(`/jobs/employer/${employerId}`),
};

// Employer Service - for employer specific operations (all require auth)
export const employerService = {
  // Get current employer's jobs
  getMyJobs: () => authApiClient.get("/employers/my-jobs"),

  // Get current employer's jobs by status
  getMyJobsByStatus: (status) =>
    authApiClient.get(`/employers/my-jobs/status/${status}`),

  // Create a new job
  createJob: (jobData) => authApiClient.post("/employers/my-jobs", jobData),

  // Update a job (JobUpdateDTO)
  updateJob: (id, jobData) =>
    authApiClient.put(`/employers/my-jobs/${id}`, jobData),

  // Delete a job
  deleteJob: (id) => authApiClient.delete(`/employers/my-jobs/${id}`),

  // Get job application statistics
  getJobStats: () => authApiClient.get("/employers/my-jobs/stats"),
};

// Candidate Service - for candidate specific operations (all require auth)
export const candidateService = {
  // Get candidate's applications
  getMyApplications: () => authApiClient.get("/candidates/my-applications"),

  // Apply for a job
  applyForJob: (jobId, applicationData) =>
    authApiClient.post(`/candidates/jobs/${jobId}/apply`, applicationData),

  // Update application
  updateApplication: (applicationId, applicationData) =>
    authApiClient.put(
      `/candidates/applications/${applicationId}`,
      applicationData
    ),

  // Delete application
  deleteApplication: (applicationId) =>
    authApiClient.delete(`/candidates/applications/${applicationId}`),

  // Get application status
  getApplicationStatus: (applicationId) =>
    authApiClient.get(`/candidates/applications/${applicationId}/status`),
};

const apiServices = {
  authService,
  jobService,
  employerService,
  candidateService,
};

export default apiServices;
