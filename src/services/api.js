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
      console.warn("No authentication token found, redirecting to login");
      // Instead of immediately rejecting, allow the 401 response to handle the redirect
      return config;
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
          localStorage.removeItem("userType");
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
      
      const data = response.data;
      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("typeId", data.typeId);
        localStorage.setItem("userType", userType);
      }
      return data;
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("typeId");
    localStorage.removeItem("userType");
  },
};

// Job Service - for general job operations
export const jobService = {
  // Public operations (no auth required)
  getAllJobs: () => apiClient.get("/jobs"),
  
  getJobById: async (id) => {
    try {
      // Try server-side fetch first
      return await apiClient.get(`/jobs/${id}`);
    } catch (error) {
      // If we get 403, fallback to client-side search
      if (error.response && error.response.status === 403) {
        console.log("Job detail API requires authentication, falling back to client-side search");
        const response = await apiClient.get("/jobs");
        const job = response.data.find(job => 
          (job.id?.toString() === id.toString()) || 
          (job.jobId?.toString() === id.toString()) || 
          (job.JobID?.toString() === id.toString())
        );
        
        if (!job) {
          throw new Error("Job not found");
        }
        
        return { data: job };
      }
      throw error;
    }
  },
  
  // Search for jobs
  searchJobs: (params) => apiClient.post("/jobs/search", params),
  
  // Search jobs by keyword
  searchJobsByKeyword: async (keyword) => {
    try {
      // Try server-side search first
      return await apiClient.get(`/jobs/search?keyword=${encodeURIComponent(keyword)}`);
    } catch (error) {
      // If we get 403, fallback to client-side filtering
      if (error.response && error.response.status === 403) {
        console.log("Search API requires authentication, falling back to client-side search");
        const response = await apiClient.get("/jobs");
        const filteredData = response.data.filter(job => 
          job.jobName?.toLowerCase().includes(keyword.toLowerCase()) || 
          job.description?.toLowerCase().includes(keyword.toLowerCase()) ||
          job.level?.toLowerCase().includes(keyword.toLowerCase()) ||
          job.contractType?.toLowerCase().includes(keyword.toLowerCase()) ||
          job.location?.toLowerCase().includes(keyword.toLowerCase())
        );
        return { data: filteredData };
      }
      throw error;
    }
  },

  // Filter jobs
  filterJobs: async (filters) => {
    try {
      // Add debugging
      console.log("filterJobs called with:", filters);
      
      // Create a simplified payload to match backend expectations
      const payload = {
        action: filters.action || "get",
        sortOrder: filters.sortOrder || "DESC",
        salaryFrom: filters.salaryFrom || 0,
        salaryTo: filters.salaryTo || 99999999999999,
        jcName: filters.jcName || "",
        filter: true
      };
      
      // If there's a post date, include it
      if (filters.postDate) {
        payload.postDate = filters.postDate;
      }
      
      console.log("Sending job filter to API:", payload);
      
      try {
        // Try server-side filtering first
        const response = await apiClient.post("/employers/jobs/search-by-salary-date", payload);
        console.log("Server filtering successful:", response.data?.length || 0, "jobs found");
        return response;
      } catch (serverError) {
        // Log the specific server error
        console.error("Server filtering failed:", serverError.message);
        console.error("Detailed error:", serverError.response?.data || "No detailed error");
        
        // If we get a 500 error (missing stored procedure), fall back to client-side
        console.log("Falling back to client-side filtering");
        throw serverError; // Re-throw to trigger the fallback
      }
    } catch (error) {
      console.error("Filter API error:", error);
      
      // Always fallback to client-side filtering
      console.log("Executing client-side filtering");
      const response = await apiClient.get("/jobs");
      
      // Apply client-side filters
      const filteredData = clientSideJobFilter(response.data, filters);
      
      console.log("Client-side filtered data:", filteredData.length, "jobs found");
      return { data: filteredData };
    }
  },

  // Protected operations (auth required)
  getJobsByStatus: (status) => authApiClient.get(`/jobs/status/${status}`),
  getJobsByEmployer: (employerId) =>
    authApiClient.get(`/jobs/employers/${employerId}`),
};

// Employer Service - for employer specific operations (all require auth)
export const employerService = {
  // Get current employer's jobs
  getMyJobs: (params = {}) => {
    console.log("getMyJobs called with params:", params);

    // Handle keyword search
    if (params.keyword) {
      console.log("Keyword search in getMyJobs:", params.keyword);
      
      // Create a simplified payload for keyword search
      const payload = {
        action: "search",
        jcName: params.keyword,
        sortOrder: params.sortOrder || "DESC"
      };
      
      console.log("Calling keyword search API with payload:", payload);
      
      // Try server-side keyword search with error handling
      return authApiClient.post("/employers/jobs/search-by-salary-date", payload)
        .catch(async error => {
          console.error("API error in keyword search:", error.message);
          
          // Fall back to client-side keyword search
          console.log("Falling back to client-side keyword search");
          
          try {
            // Get all employer jobs and filter by keyword
            const response = await authApiClient.get("/employers/my-jobs");
            const allJobs = response.data || [];
            
            // Filter jobs by keyword (case-insensitive)
            const keyword = params.keyword.toLowerCase();
            const filteredJobs = allJobs.filter(job => 
              job.jobName?.toLowerCase().includes(keyword) || 
              job.description?.toLowerCase().includes(keyword) ||
              job.level?.toLowerCase().includes(keyword) ||
              job.contractType?.toLowerCase().includes(keyword) ||
              job.location?.toLowerCase().includes(keyword) ||
              job.jobType?.toLowerCase().includes(keyword)
            );
            
            console.log("Client-side keyword search results:", filteredJobs.length);
            return { data: filteredJobs };
          } catch (fallbackError) {
            console.error("Fallback keyword search failed:", fallbackError);
            return { data: [] };
          }
        });
    }
    
    // If filter params are provided, use filtering logic
    else if (params && Object.keys(params).length > 0) {
      console.log("Using filter params in getMyJobs:", params);
      
      // Create a simplified payload with the exact fields the API expects
      const payload = {
        action: params.action || "get",
        sortOrder: params.sortOrder || "DESC",
        salaryFrom: params.salaryFrom || 0,
        salaryTo: params.salaryTo || 99999999999999,
        jcName: params.jcName || "",
        filter: true
      };
      
      // If there's a post date, include it
      if (params.postDate) {
        payload.postDate = params.postDate;
      }
      
      console.log("Calling API with payload:", payload);
      
      // Try server-side filtering with proper error handling
      return authApiClient.post("/employers/jobs/search-by-salary-date", payload)
        .catch(async error => {
          console.error("API error in getMyJobs filtering:", error.message);
          
          if (error.response && error.response.status === 500) {
            console.log("Received 500 error. Falling back to client-side filtering of all employer jobs");
            
            try {
              // Get all employer jobs and filter client-side
              const response = await authApiClient.get("/employers/my-jobs");
              const allJobs = response.data || [];
              
              // Use the common filtering function
              const filteredJobs = clientSideJobFilter(allJobs, params);
              console.log("Client-side filtered employer jobs:", filteredJobs.length);
              
              return { data: filteredJobs };
            } catch (fallbackError) {
              console.error("Even fallback failed:", fallbackError);
              return { data: [] }; // Last resort empty array
            }
          }
          
          // For other errors, return empty array
          return { data: [] };
        });
    }

    // Otherwise, get all jobs
    console.log("Getting all employer jobs without filters");
    return authApiClient.get("/employers/my-jobs?includeAll=true")
      .catch(error => {
        console.error("Error fetching all employer jobs:", error);
        return { data: [] };
      });
  },

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
  
  // Advanced search with filters
  searchJobsByFilters: (filterParams) => {
    console.log("searchJobsByFilters redirecting to getMyJobs for consistent implementation");
    return employerService.getMyJobs(filterParams);
  },
  
  // Search by keyword
  searchJobsByKeyword: (keyword) => {
    console.log("searchJobsByKeyword redirecting to getMyJobs for consistent implementation");
    return employerService.getMyJobs({ keyword });
  },
};

// Candidate Service - for candidate specific operations (all require auth)
export const candidateService = {
  // Get candidate's applications
  getAllApplications: () => authApiClient.get("/candidates/my-applications"),

  // Apply for a job
  createApplication: (applicationData) =>
    authApiClient.post(`/candidates/jobs/${applicationData.jobId}/apply`, applicationData),

  // Get application details
  getApplicationById: (candidateId, jobId) =>
    authApiClient.get(`/candidates/applications/${candidateId}/${jobId}`),

  // Update application
  updateApplication: (candidateId, jobId, applicationData) =>
    authApiClient.put(
      `/candidates/applications/${candidateId}/${jobId}`,
      applicationData
    ),

  // Delete application
  deleteApplication: (candidateId, jobId) =>
    authApiClient.delete(`/candidates/applications/${candidateId}/${jobId}`),

  // Get application status
  getApplicationStatus: (candidateId, jobId) =>
    authApiClient.get(`/candidates/applications/${candidateId}/${jobId}/status`),
};

// Add new helper function for client-side filtering
const clientSideJobFilter = (jobs, filters) => {
  return jobs.filter(job => {
    // Apply filters based on the filter parameters
    if (filters.salaryFrom !== undefined && Number(filters.salaryFrom) > 0 && job.salaryFrom < filters.salaryFrom) return false;
    if (filters.salaryTo !== undefined && Number(filters.salaryTo) > 0 && job.salaryTo > filters.salaryTo) return false;
    
    // Filter by job category name if specified
    if (filters.jcName && filters.jcName !== "" && job.jobType !== filters.jcName) return false;
    
    // Handle post date filtering
    if (filters.postDate) {
      const filterDate = new Date(filters.postDate);
      const jobPostDate = new Date(job.postDate);
      if (jobPostDate < filterDate) return false;
    }
    
    return true;
  });
};

const apiServices = {
  authService,
  jobService,
  employerService,
  candidateService,
};

export default apiServices;
