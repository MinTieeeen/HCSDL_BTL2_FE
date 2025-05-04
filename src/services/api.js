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
          console.warn("Access forbidden - authentication required or insufficient permissions");
          // Don't redirect - just return a rejected promise with a clear message
          error.isAuthError = true;
          error.friendlyMessage = "Vui lòng đăng nhập để truy cập tính năng này.";
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

// Job Service - for job related endpoints
export const jobService = {
  // Public operations (no auth required)
  getAllJobs: () => {
    console.log("getAllJobs function is temporarily disabled");
    return { data: [] };
    // Original implementation commented out:
    // return apiClient.get("/jobs");
  },

  // Get job by ID
  getJobById: async (id) => {
    try {
      // Check if user is authenticated and get role
      const isAuthenticated = localStorage.getItem('token') !== null;
      const userType = localStorage.getItem('userType');
      
      // If user is an employer, try to get the job from employer's jobs first
      if (isAuthenticated && userType === 'EMPLOYER') {
        try {
          console.log("User is employer, trying to get job from employer's jobs");
          // Get all employer's jobs first
          const myJobsResponse = await employerService.getMyJobs();
          const myJobs = myJobsResponse.data || [];
          
          // Find the job with matching ID
          const job = myJobs.find(job => 
            (job.id?.toString() === id.toString()) || 
            (job.jobId?.toString() === id.toString())
          );
          
          // If found, return it
          if (job) {
            console.log("Job found in employer's jobs:", job);
            return { data: job };
          } else {
            console.log("Job not found in employer's jobs, will try regular API");
          }
        } catch (employerError) {
          console.error("Error fetching from employer jobs:", employerError);
          // Continue to try the regular API
        }
      }
      
      // Regular API call (will be used for non-employers or when job not found in employer's jobs)
      console.log("Fetching job with regular API call");
      return await apiClient.get(`/jobs/${id}`);
    } catch (error) {
      // Check if user is authenticated before trying fallback
      const isAuthenticated = localStorage.getItem('token') !== null;
      if (!isAuthenticated) {
        throw new Error("Authentication required to view job details");
      }
      
      console.error("Error in getJobById:", error);
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
      
      // Create payload with proper string types to prevent Integer/String casting errors
      const payload = {
        action: "get",
        sortOrder: "DESC"
      };
      
      // Add optional parameters only if they have values - convert numbers to strings
      if (filters.salaryFrom !== undefined) {
        payload.salaryFrom = String(filters.salaryFrom);
      }
      
      if (filters.salaryTo !== undefined) {
        payload.salaryTo = String(filters.salaryTo);
      }
      
      // Include post date if provided
      if (filters.postDate) {
        payload.postDate = filters.postDate;
      }
      
      // Include jcName if provided - ensure it's a string
      if (filters.jcName && filters.jcName !== "") {
        payload.jcName = String(filters.jcName);
      }
      
      // Set filter flag as a string "0" or "1"
      payload.filter = filters.filter ? "1" : "0";
      
      console.log("Sending job filter to API:", payload);
      console.log("Payload gửi đi:", JSON.stringify(payload, null, 2));
      
      try {
        // Use the same endpoint as btl2-1.5b
        const response = await authApiClient.post("/employers/jobs/search-by-salary-date", payload);
        console.log("Server filtering successful:", response.data?.length || 0, "jobs found");
        return response;
      } catch (serverError) {
        // Log the specific server error
        console.error("Server filtering failed:", serverError.message);
        console.error("Detailed error:", serverError.response?.data || "No detailed error");
        
        // Try with public API client as fallback
        console.log("Trying with public API client");
        try {
          const publicResponse = await apiClient.post("/employers/jobs/search-by-salary-date", payload);
          return publicResponse;
        } catch (publicError) {
          console.error("Public API filtering failed:", publicError.message);
          // Fall back to client-side filtering
          console.log("Falling back to client-side filtering");
          throw publicError;
        }
      }
    } catch (error) {
      console.error("Filter API error:", error);
      
      // Fallback to client-side filtering
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

    // Always get all jobs from the normal endpoint 
    return authApiClient.get("/employers/my-jobs")
      .then(response => {
        console.log(`Fetched ${response.data?.length || 0} jobs from my-jobs endpoint`);
        let jobs = response.data || [];
        
        // If there are filter params, apply them client-side
        if (params && Object.keys(params).length > 0) {
          console.log("Applying filters client-side:", params);
          
          jobs = clientSideJobFilter(jobs, params);
          console.log(`After filtering: ${jobs.length} jobs remain`);
        }
        
        return { data: jobs };
      })
      .catch(error => {
        console.error("Error fetching employer jobs:", error);
        return { data: [] };
      });
  },

  // Get a specific job by ID from employer's jobs
  getMyJobById: async (id) => {
    try {
      // Try to get directly from backend if endpoint exists
      return await authApiClient.get(`/employers/my-jobs/${id}`);
    } catch (error) {
      console.error("Error fetching specific employer job by ID:", error);
      
      // If direct endpoint not available, try to get all jobs and find the specific one
      console.log("Falling back to getting all jobs and filtering for job ID:", id);
      const response = await employerService.getMyJobs();
      const jobs = response.data || [];
      
      const job = jobs.find(job => 
        (job.id?.toString() === id.toString()) || 
        (job.jobId?.toString() === id.toString())
      );
      
      if (!job) {
        throw new Error("Job not found or you don't have permission to access it");
      }
      
      return { data: job };
    }
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
  
  // Search by keyword - now using the standalone searchJCByKeyword function
  searchJobsByKeyword: (keyword) => {
    console.log("searchJobsByKeyword using standalone searchJCByKeyword function");
    return searchJCByKeyword(keyword);
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
    if (filters.salaryFrom !== undefined && job.salaryFrom < filters.salaryFrom) {
      return false;
    }
    
    if (filters.salaryTo !== undefined && job.salaryTo > filters.salaryTo) {
      return false;
    }
    
    // Handle post date filtering
    if (filters.postDate) {
      const filterDate = new Date(filters.postDate);
      const jobPostDate = new Date(job.postDate);
      if (jobPostDate < filterDate) {
        return false;
      }
    }
    
    // Handle job status filtering (for onlyOpenJobs)
    if (filters.jobStatus && job.jobStatus !== filters.jobStatus) {
      return false;
    }
    
    // If we got here, the job passes all filters
    return true;
  });
};

// Add a dedicated function for searching by job category keyword
// This is now a completely standalone function, separate from getMyJobs
export const searchJCByKeyword = async (keyword) => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("searchJCByKeyword: Authentication required");
    // Return empty results instead of throwing error
    return { 
      data: [], 
      error: true, 
      message: "Vui lòng đăng nhập để sử dụng chức năng tìm kiếm." 
    };
  }
  
  const payload = {
    action: "search",
    jcName: keyword,
  };

  console.log("searchJCByKeyword: Payload:", payload);
  
  try {
    // Use the exact same structure as btl2-1.5b's implementation
    const res = await axios.post(
      "http://localhost:8080/api/employers/jobs/search-by-salary-date",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    // Return data in the same format as btl2-1.5b
    return { data: res.data.data || [] };
  } catch (error) {
    // Check if it's an auth error
    if (error.response && error.response.status === 403) {
      console.warn("Tìm kiếm yêu cầu quyền đăng nhập");
      return { 
        data: [], 
        error: true, 
        authError: true,
        message: "Vui lòng đăng nhập để sử dụng chức năng tìm kiếm." 
      };
    }
    
    console.error("Lỗi tìm kiếm công việc:", error.message);
    
    // Fall back to client-side search for consistent user experience
    try {
      console.log("Đang chuyển sang tìm kiếm cục bộ");
      const allJobsResponse = await apiClient.get("/jobs");
      const allJobs = allJobsResponse.data || [];
      
      const searchLower = keyword.toLowerCase();
      const filteredJobs = allJobs.filter(job => 
        job.jobName?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower) ||
        job.level?.toLowerCase().includes(searchLower) ||
        job.contractType?.toLowerCase().includes(searchLower) ||
        job.location?.toLowerCase().includes(searchLower) ||
        job.jobType?.toLowerCase().includes(searchLower)
      );
      
      console.log(`Tìm thấy ${filteredJobs.length} công việc phù hợp`);
      return { data: filteredJobs };
    } catch (fallbackError) {
      console.error("Tìm kiếm cục bộ thất bại:", fallbackError);
      return { 
        data: [], 
        error: true,
        message: "Không thể tìm kiếm công việc. Vui lòng thử lại sau."
      };
    }
  }
};

const apiServices = {
  authService,
  jobService,
  employerService,
  candidateService,
};

export default apiServices;
 