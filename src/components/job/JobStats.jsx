import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Alert, Badge } from "react-bootstrap";
import { employerService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { FaChartPie, FaListAlt, FaCheckCircle, FaTimesCircle, FaHourglass } from "react-icons/fa";
import "./Job.css";

// Register the required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const JobStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated, currentUser } = useAuth();

  useEffect(() => {
    if (isAuthenticated && currentUser?.userType === "EMPLOYER") {
      fetchJobStats();
    }
  }, [isAuthenticated, currentUser]);

  const fetchJobStats = async () => {
    try {
      setLoading(true);
      const response = await employerService.getJobStats();
      setStats(response.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching job stats:", err);
      setError("Không thể tải thống kê công việc. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals for summary cards
  const totalJobs = stats.length;
  const totalApplications = stats.reduce(
    (sum, job) => sum + (job.daNhan + job.tuChoi + job.choDuyet),
    0
  );
  const totalAccepted = stats.reduce((sum, job) => sum + job.daNhan, 0);
  const totalRejected = stats.reduce((sum, job) => sum + job.tuChoi, 0);
  const totalPending = stats.reduce((sum, job) => sum + job.choDuyet, 0);

  // Prepare chart data
  const chartData = {
    labels: ["Đã nhận", "Từ chối", "Chờ duyệt"],
    datasets: [
      {
        data: [totalAccepted, totalRejected, totalPending],
        backgroundColor: ["#28a745", "#dc3545", "#ffc107"],
        hoverBackgroundColor: ["#218838", "#c82333", "#e0a800"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const total = totalAccepted + totalRejected + totalPending;
            const percentage = Math.round((value / total) * 100);
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-dark">Thống kê ứng tuyển</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center">
          <p>Đang tải thống kê...</p>
        </div>
      ) : stats.length === 0 ? (
        <Alert variant="info">
          Không có dữ liệu thống kê. Có thể bạn chưa đăng tuyển công việc nào.
        </Alert>
      ) : (
        <>
          {/* Summary Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="job-card">
                <Card.Header>
                  <Card.Title>Tổng số công việc</Card.Title>
                </Card.Header>
                <Card.Body className="text-center">
                  <FaListAlt size={30} className="mb-3 text-primary" />
                  <Card.Text className="display-4">{totalJobs}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="job-card">
                <Card.Header>
                  <Card.Title>Tổng số ứng tuyển</Card.Title>
                </Card.Header>
                <Card.Body className="text-center">
                  <FaChartPie size={30} className="mb-3 text-primary" />
                  <Card.Text className="display-4">{totalApplications}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="job-card">
                <Card.Header>
                  <Card.Title>Đã nhận</Card.Title>
                </Card.Header>
                <Card.Body className="text-center">
                  <FaCheckCircle size={30} className="mb-3 text-success" />
                  <Card.Text className="display-4">{totalAccepted}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="job-card">
                <Card.Header>
                  <Card.Title>Đã từ chối</Card.Title>
                </Card.Header>
                <Card.Body className="text-center">
                  <FaTimesCircle size={30} className="mb-3 text-danger" />
                  <Card.Text className="display-4">{totalRejected}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Chart Row */}
          <Row className="mb-4">
            <Col md={6}>
              <div className="job-detail-section">
                <h3>
                  <FaChartPie className="me-2" />
                  Thống kê trạng thái ứng tuyển
                </h3>
                <div style={{ height: "300px" }}>
                  <Pie data={chartData} options={chartOptions} />
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="job-detail-section">
                <h3>
                  <FaListAlt className="me-2" />
                  Tỷ lệ ứng tuyển
                </h3>
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <td>Tổng số ứng tuyển:</td>
                      <td><strong>{totalApplications}</strong></td>
                    </tr>
                    <tr>
                      <td>Tỷ lệ đã nhận:</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-2" style={{ width: "15px", height: "15px", backgroundColor: "#28a745", borderRadius: "50%" }}></div>
                          <strong>{totalApplications > 0 ? Math.round((totalAccepted / totalApplications) * 100) : 0}%</strong>
                          <span className="ms-2">({totalAccepted})</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>Tỷ lệ từ chối:</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-2" style={{ width: "15px", height: "15px", backgroundColor: "#dc3545", borderRadius: "50%" }}></div>
                          <strong>{totalApplications > 0 ? Math.round((totalRejected / totalApplications) * 100) : 0}%</strong>
                          <span className="ms-2">({totalRejected})</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>Tỷ lệ chờ duyệt:</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-2" style={{ width: "15px", height: "15px", backgroundColor: "#ffc107", borderRadius: "50%" }}></div>
                          <strong>{totalApplications > 0 ? Math.round((totalPending / totalApplications) * 100) : 0}%</strong>
                          <span className="ms-2">({totalPending})</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>

          {/* Job Application Stats Table */}
          <div className="job-detail-section">
            <h3>
              <FaListAlt className="me-2" />
              Chi tiết ứng tuyển theo công việc
            </h3>
            <Table striped bordered hover responsive className="job-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên công việc</th>
                  <th>Ngày tạo</th>
                  <th>Tổng số ứng tuyển</th>
                  <th>Đã nhận</th>
                  <th>Từ chối</th>
                  <th>Chờ duyệt</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((job) => {
                  const total = job.daNhan + job.tuChoi + job.choDuyet;
                  return (
                    <tr key={job.jobId}>
                      <td>{job.jobId}</td>
                      <td>{job.jobName}</td>
                      <td>{new Date(job.createdDate).toLocaleDateString()}</td>
                      <td>
                        <Badge className="filter-badge">{total}</Badge>
                      </td>
                      <td>
                        <Badge bg="success">{job.daNhan}</Badge>
                      </td>
                      <td>
                        <Badge bg="danger">{job.tuChoi}</Badge>
                      </td>
                      <td>
                        <Badge bg="warning">{job.choDuyet}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </>
      )}
    </Container>
  );
};

export default JobStats; 