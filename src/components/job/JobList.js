import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Badge,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { jobService, employerService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const { currentUser, isAuthenticated } = useAuth();
  const isEmployer = isAuthenticated && currentUser?.userType === "EMPLOYER";
  const employerOnly = isEmployer; // <-- Thêm dòng này nếu muốn tự động

  // Load jobs when component mounts
  useEffect(() => {
    fetchJobs();
  }, [employerOnly]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      let response;

      if (isEmployer && employerOnly) {
        // Chỉ employer mới gọi getMyJobs
        response = await employerService.getMyJobs();
      } else {
        // Candidate hoặc chưa đăng nhập thì gọi getAllJobs
        response = await jobService.getAllJobs();
      }

      setJobs(response.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to fetch jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!isEmployer) return;

    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        // Sử dụng đúng id (jobId) khi gọi API xóa
        await employerService.deleteJob(id);
        setSuccessMessage("Job deleted successfully!");
        // Remove the deleted job from the state
        setJobs(jobs.filter((job) => (job.id || job.jobId) !== id));

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } catch (err) {
        setError("Failed to delete job. Please try again.");
        console.error("Error deleting job:", err);
        if (err.response && err.response.data) {
          console.error("Backend trả về:", err.response.data);
        }
      }
    }
  };

  return (
    <Container className="mt-4">
      <Row className="mb-3">
        <Col>
          <h2>{employerOnly ? "My Job Listings" : "All Job Listings"}</h2>
        </Col>
        {isEmployer && (
          <Col className="text-end">
            <Link to="/employer/jobs/new">
              <Button variant="primary">Post New Job</Button>
            </Link>
          </Col>
        )}
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {loading ? (
        <div className="text-center">
          <p>Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <Alert variant="info">
          {employerOnly
            ? "You haven't posted any jobs yet. Create a new job to get started."
            : "No jobs found."}
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên công việc</th>
              <th>Loại hình</th>
              <th>Cấp bậc</th>
              <th>Địa điểm làm việc</th>
              <th>Mức lương</th>
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
                    bg={job.jobStatus === "ACTIVE" ? "success" : "secondary"}
                  >
                    {job.jobStatus}
                  </Badge>
                </td>
                <td>
                  <Link to={`/jobs/view/${job.id || job.jobId}`}>
                    <Button variant="info" size="sm" className="me-2">
                      View
                    </Button>
                  </Link>

                  {isEmployer && employerOnly && (
                    <>
                      <Link to={`/employer/jobs/edit/${job.id || job.jobId}`}>
                        <Button variant="warning" size="sm" className="me-2">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(job.id || job.jobId)}
                      >
                        Delete
                      </Button>
                    </>
                  )}

                  {isAuthenticated && currentUser?.userType === "CANDIDATE" && (
                    <Link to={`/applications/new/${job.id || job.jobId}`}>
                      <Button variant="success" size="sm">
                        Apply
                      </Button>
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default JobList;
