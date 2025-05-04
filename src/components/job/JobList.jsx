import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Badge,
  Card,
  Form,
} from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { jobService, employerService, searchJCByKeyword } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { 
  FaFilter, 
  FaSortAmountDown, 
  FaSortAmountUp, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaMoneyBillWave, 
  FaCalendarAlt, 
  FaBriefcase,
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaPaperPlane,
  FaLock
} from "react-icons/fa";
import SearchBar from "./SearchBar";
import FilterModal from "./FilterModal";
import "./Job.css";

const JobList = ({ employerOnly }) => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortField, setSortField] = useState("postDate");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [activeFilters, setActiveFilters] = useState({});
  const [totalJobs, setTotalJobs] = useState(0);

  const { currentUser, isAuthenticated } = useAuth();
  const isEmployer = isAuthenticated && currentUser?.userType === "EMPLOYER";
  const location = useLocation();
  const navigate = useNavigate();
  const isMyJobsPage = employerOnly || location.pathname.includes("/employer/jobs") || location.pathname === "/my-jobs";

  // Load jobs when component mounts
  useEffect(() => {
    if (!isAuthenticated && !isMyJobsPage) {
      // If user is not authenticated, show login message instead
      setLoading(false);
      return;
    }
    
    fetchJobs();
  }, [isMyJobsPage, employerOnly, sortField, sortOrder, isAuthenticated]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching jobs...");
      
      let response;
      if (isEmployer && isMyJobsPage) {
        // Employer viewing "My Jobs" page - get all jobs regardless of status
        console.log("Fetching all employer jobs (both open and closed)");
        response = await employerService.getMyJobs({
          action: "get",
          sortOrder: sortOrder,
          includeAll: true // Make sure to include all job statuses
        });
      } else {
        // Public view of all jobs is disabled - commented out getAllJobs functionality
        /* 
        console.log("Fetching all jobs");
        response = await jobService.getAllJobs();
        */
        
        // Instead, return an empty array
        response = { data: [] };
        
        // If user is authenticated, show an information message
        if (isAuthenticated) {
          setError("Chức năng xem tất cả công việc đã bị tạm khóa. Vui lòng sử dụng tính năng tìm kiếm.");
        }
      }

      // Ensure we have a response object with data property
      let jobData = response?.data || [];
      console.log(`Received ${jobData.length} jobs from API`);
      
      // Apply sorting if we have data
      const sortedData = jobData.length > 0 ? sortJobs(jobData, sortField, sortOrder) : [];
      
      setJobs(sortedData);
      setTotalJobs(sortedData.length);
      
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Không thể tải danh sách công việc. Vui lòng thử lại sau.");
      // Set empty jobs array to avoid UI errors
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  };

  const sortJobs = (data, field, order) => {
    return [...data].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      // Handle numeric fields
      if (field === 'salaryFrom' || field === 'salaryTo') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }
      
      // Handle date fields
      if (field === 'postDate' || field === 'expireDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (order === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const handleSort = (field) => {
    if (field === sortField) {
      // Toggle sort order if the same field is clicked
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      // Set new field and default to DESC
      setSortField(field);
      setSortOrder('DESC');
    }
  };

  const handleDelete = async (id) => {
    if (!isEmployer) return;

    if (window.confirm("Bạn có chắc chắn muốn xóa công việc này không?")) {
      try {
        await employerService.deleteJob(id);
        setSuccessMessage("Đã xóa công việc thành công!");
        // Remove the deleted job from the state
        setJobs(jobs.filter((job) => (job.id || job.jobId) !== id));

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } catch (err) {
        setError("Không thể xóa công việc. Vui lòng thử lại.");
        console.error("Error deleting job:", err);
        if (err.response && err.response.data) {
          console.error("Backend trả về:", err.response.data);
        }
      }
    }
  };

  const handleSearch = async (keyword) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log("Searching for JCName category:", keyword);
      
      let response;
      try {
        // Create payload for JCName search
        const payload = {
          action: "search",
          jcName: keyword,
        };
        
        console.log("Using searchJCByKeyword API with payload:", payload);
        
        // Import this function from the api.js to ensure we're using the correct implementation
        const searchResults = await searchJCByKeyword(keyword);
        response = searchResults;
        
        // Clear error if successful
        setError("");
      } catch (searchError) {
        console.error("Search API error:", searchError);
        setError("Lỗi hệ thống: Không thể tìm kiếm từ máy chủ. Đang thử tìm kiếm cục bộ...");
        
        // Try to fall back to client-side search - commented out for now
        /* 
        try {
          const allJobsResponse = isEmployer && isMyJobsPage
            ? await employerService.getMyJobs()
            : await jobService.getAllJobs();
            
          // Do client-side JCName category filtering instead of keyword search
          const allJobs = allJobsResponse.data || [];
          const filteredJobs = allJobs.filter(job => 
            job.jcName === keyword || 
            job.jobCategory === keyword
          );
          
          response = { data: filteredJobs };
          
          // Update error message to show we're using client-side search
          setError("Sử dụng tìm kiếm cục bộ. Kết quả có thể không đầy đủ.");
        } catch (fallbackError) {
          console.error("Fallback search failed:", fallbackError);
          throw new Error("Không thể tìm kiếm. Vui lòng thử lại sau.");
        }
        */
        
        // Instead, return an empty result
        response = { data: [] };
        setError("Không thể tìm kiếm. Vui lòng thử lại sau.");
      }
      
      setJobs(response.data || []);
      setTotalJobs(response.data?.length || 0);
      
      // Update active filters with jcName instead of keyword
      setActiveFilters({
        ...activeFilters,
        jcName: keyword
      });
    } catch (err) {
      console.error("Error searching jobs:", err);
      setError(err.message || "Không thể tìm kiếm công việc. Vui lòng thử lại sau.");
      // Keep existing jobs in case of error
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (filterParams) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log("Applying filters:", filterParams);
      
      // Store only the display values for badges
      const displayFilters = {};
      
      // Copy relevant filter values for display
      if (filterParams.salaryFrom !== undefined && filterParams.salaryFrom !== 0) {
        displayFilters.salaryFrom = filterParams.salaryFrom;
      }
      
      if (filterParams.salaryTo !== undefined && filterParams.salaryTo !== 0) {
        displayFilters.salaryTo = filterParams.salaryTo;
      }
      
      if (filterParams.postDate) {
        displayFilters.postDate = filterParams.postDate;
      }
      
      if (filterParams.jcName && filterParams.jcName !== "") {
        displayFilters.jcName = filterParams.jcName;
      }
      
      // Add job status to display filters if specified
      if (filterParams.jobStatus) {
        displayFilters.jobStatus = filterParams.jobStatus;
      }
      
      setActiveFilters(displayFilters);
      
      // Make API call
      let response;
      try {
        if (isEmployer && isMyJobsPage) {
          // Filter employer's jobs
          response = await employerService.getMyJobs(filterParams);
        } else {
          // Filter public jobs - commented out
          /*
          response = await jobService.filterJobs(filterParams);
          */
          
          // Instead, return an empty result
          response = { data: [] };
          setError("Chức năng lọc tất cả công việc đã bị tạm khóa.");
        }
      } catch (apiError) {
        console.error("API error during filtering:", apiError);
        setError("Lỗi hệ thống: Không thể lọc công việc từ máy chủ.");
        
        // Client-side fallback has been commented out
        /*
        // Try to load all jobs and filter client-side as last resort
        try {
          const allJobsResponse = isEmployer && isMyJobsPage 
            ? await employerService.getMyJobs() 
            : await jobService.getAllJobs();
            
          response = { data: allJobsResponse.data || [] };
        } catch (fallbackError) {
          console.error("Even fallback job loading failed:", fallbackError);
          throw new Error("Không thể lấy dữ liệu từ máy chủ. Vui lòng thử lại sau.");
        }
        */
        
        // Just use an empty array
        response = { data: [] };
      }
      
      // Ensure we have a response object with data property
      let jobData = response?.data || [];
      
      // If job status filter is applied, filter client-side as well to ensure it works
      if (filterParams.jobStatus) {
        jobData = jobData.filter(job => job.jobStatus === filterParams.jobStatus);
      }
      
      console.log(`Received ${jobData.length} filtered jobs`);
      
      setJobs(jobData);
      setTotalJobs(jobData.length);
      setShowFilterModal(false);
      
      // Clear error if successful
      if (jobData.length > 0) {
        setError("");
      }
    } catch (err) {
      console.error("Error filtering jobs:", err);
      setError(err.message || "Không thể lọc danh sách công việc. Vui lòng thử lại sau.");
      // Keep existing jobs in case of error
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setActiveFilters({});
    fetchJobs();
  };

  const renderFilterBadges = () => {
    const badges = [];
    
    if (activeFilters.keyword) {
      badges.push(
        <Badge className="filter-badge me-2 mb-2" key="keyword">
          Từ khóa: {activeFilters.keyword}
        </Badge>
      );
    }
    
    if (activeFilters.jcName) {
      badges.push(
        <Badge className="filter-badge me-2 mb-2" key="jcName">
          Danh mục: {activeFilters.jcName}
        </Badge>
      );
    }
    
    if (activeFilters.salaryFrom !== undefined) {
      badges.push(
        <Badge className="filter-badge me-2 mb-2" key="salaryFrom">
          Lương từ: {Number(activeFilters.salaryFrom).toLocaleString()} VND
        </Badge>
      );
    }
    
    if (activeFilters.salaryTo !== undefined) {
      badges.push(
        <Badge className="filter-badge me-2 mb-2" key="salaryTo">
          Lương đến: {Number(activeFilters.salaryTo).toLocaleString()} VND
        </Badge>
      );
    }
    
    if (activeFilters.postDate) {
      badges.push(
        <Badge className="filter-badge me-2 mb-2" key="postDate">
          Từ ngày: {new Date(activeFilters.postDate).toLocaleDateString('vi-VN')}
        </Badge>
      );
    }
    
    if (activeFilters.jobStatus) {
      badges.push(
        <Badge className="filter-badge me-2 mb-2" key="jobStatus">
          Trạng thái: {activeFilters.jobStatus}
        </Badge>
      );
    }
    
    return badges;
  };

  const renderJobCards = () => {
    return (
      <Row xs={1} md={2} lg={3} className="g-4">
        {jobs.map((job) => (
          <Col key={job.jobId}>
            <Card className="job-card h-100">
              <Card.Header>
                <Card.Title>{job.jobName}</Card.Title>
                <Badge
                  bg={job.jobStatus === "Đang mở" ? "success" : "secondary"}
                  className="mb-2"
                >
                  {job.jobStatus}
                </Badge>
              </Card.Header>
              <Card.Body>
                <Card.Text>
                  <div className="d-flex align-items-center mb-2">
                    <FaBriefcase className="me-2 text-primary" />
                    <span><strong>Loại hình:</strong> {job.contractType}</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <FaBuilding className="me-2 text-primary" />
                    <span><strong>Cấp bậc:</strong> {job.level}</span>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <FaMapMarkerAlt className="me-2 text-primary" />
                    <span><strong>Địa điểm:</strong> {job.location}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaMoneyBillWave className="me-2 text-primary" />
                    <span><strong>Mức lương:</strong> {job.salaryFrom?.toLocaleString()} - {job.salaryTo?.toLocaleString()}</span>
                  </div>
                </Card.Text>
              </Card.Body>
              <Card.Footer>
                <div className="d-flex justify-content-between">
                  <Link to={`/jobs/view/${job.id || job.jobId}`}>
                    <Button className="btn-icon btn-icon-view">
                      <FaEye />
                    </Button>
                  </Link>

                  {isEmployer && isMyJobsPage && (
                    <div className="action-buttons">
                      <Link to={`/employer/jobs/edit/${job.id || job.jobId}`}>
                        <Button className="btn-icon btn-icon-edit">
                          <FaEdit />
                        </Button>
                      </Link>
                      <Button
                        className="btn-icon btn-icon-delete"
                        onClick={() => handleDelete(job.id || job.jobId)}
                      >
                        <FaTrashAlt />
                      </Button>
                    </div>
                  )}

                  {isAuthenticated && currentUser?.userType === "CANDIDATE" && !isMyJobsPage && (
                    <Link to={`/applications/new/${job.id || job.jobId}`}>
                      <Button className="btn-icon btn-icon-view">
                        <FaPaperPlane />
                      </Button>
                    </Link>
                  )}
                </div>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    
    return sortOrder === 'ASC' 
      ? <FaSortAmountUp className="ms-1" /> 
      : <FaSortAmountDown className="ms-1" />;
  };

  const renderJobTable = () => {
    return (
      <Table striped bordered hover responsive className="job-table">
        <thead>
          <tr>
            <th>ID</th>
            <th onClick={() => handleSort('jobName')} style={{ cursor: 'pointer' }}>
              Tên công việc {renderSortIcon('jobName')}
            </th>
            <th>Loại hình</th>
            <th>Cấp bậc</th>
            <th>Địa điểm làm việc</th>
            <th onClick={() => handleSort('salaryFrom')} style={{ cursor: 'pointer' }}>
              Mức lương {renderSortIcon('salaryFrom')}
            </th>
            <th>Tình trạng</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.jobId}>
              <td>{job.jobId}</td>
              <td>{job.jobName}</td>
              <td>{job.contractType}</td>
              <td>{job.level}</td>
              <td>{job.location}</td>
              <td>
                {job.salaryFrom?.toLocaleString()} -{" "}
                {job.salaryTo?.toLocaleString()}
              </td>
              <td>
                <Badge
                  className="filter-badge"
                >
                  {job.jobStatus === "Đang mở" ? "Đang mở" : "Đã đóng"}
                </Badge>
              </td>
              <td>
                <Link to={`/jobs/view/${job.id || job.jobId}`}>
                  <Button className="btn-job-primary btn-sm me-2">
                    Xem
                  </Button>
                </Link>

                {isEmployer && isMyJobsPage && (
                  <>
                    <Link to={`/employer/jobs/edit/${job.id || job.jobId}`}>
                      <Button className="btn-job-outline btn-sm me-2">
                        Sửa
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(job.id || job.jobId)}
                    >
                      Xóa
                    </Button>
                  </>
                )}

                {isAuthenticated && currentUser?.userType === "CANDIDATE" && !isMyJobsPage && (
                  <Link to={`/applications/new/${job.id || job.jobId}`}>
                    <Button className="btn-job-secondary btn-sm">
                      Ứng tuyển
                    </Button>
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  // Render login message when user is not authenticated
  const renderLoginMessage = () => {
    return (
      <div className="text-center my-5 py-5">
        <div className="login-required-message">
          <FaLock className="lock-icon mb-4" />
          <h3>Đăng nhập để tiếp tục</h3>
          <p className="text-muted mb-4">Vui lòng đăng nhập để xem danh sách công việc và tìm kiếm</p>
          <Link to="/login">
            <Button className="btn-job-primary px-4 py-2">
              Đăng nhập ngay
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <Container className="mt-4">
      <Row className="mb-3">
        <Col md={6}>
          <h2 className="text-dark">{isMyJobsPage ? "Công việc của tôi" : "Tất cả công việc"}</h2>
          <p className="text-muted">Hiển thị {jobs.length} công việc</p>
        </Col>
        <Col md={6} className="d-flex justify-content-end align-items-center">
          {isEmployer && (
            <Link to="/employer/jobs/new">
              <Button className="btn-job-primary">Đăng tuyển việc mới</Button>
            </Link>
          )}
        </Col>
      </Row>

      {!isAuthenticated && !isMyJobsPage ? (
        renderLoginMessage()
      ) : (
        <>
          <Row className="mb-4">
            <Col md={8}>
              <SearchBar onSearch={handleSearch} />
            </Col>
            <Col md={4} className="d-flex justify-content-end">
              <Button 
                className="btn-job-outline d-flex align-items-center"
                onClick={() => setShowFilterModal(true)}
              >
                <FaFilter className="me-2" /> Lọc công việc
              </Button>
            </Col>
          </Row>

          {/* Active filter badges */}
          {Object.keys(activeFilters).length > 0 && (
            <Row className="mb-3">
              <Col>
                <div className="d-flex flex-wrap align-items-center">
                  <span className="me-2">Lọc theo:</span>
                  {renderFilterBadges()}
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={clearFilters}
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              </Col>
            </Row>
          )}

          {error && <Alert variant="danger">{error}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}

          {loading ? (
            <div className="text-center">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : jobs.length === 0 ? (
            <Alert variant="info">
              {isMyJobsPage
                ? "Bạn chưa đăng tuyển công việc nào. Tạo công việc mới để bắt đầu."
                : "Không tìm thấy công việc nào. Vui lòng sử dụng tính năng tìm kiếm."}
            </Alert>
          ) : (
            renderJobCards()
          )}

          {/* Filter Modal */}
          <FilterModal 
            show={showFilterModal} 
            onHide={() => setShowFilterModal(false)} 
            onFilter={handleFilter}
          />
        </>
      )}
    </Container>
  );
};

export default JobList; 