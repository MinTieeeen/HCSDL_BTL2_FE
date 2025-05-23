import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, ListGroup, Breadcrumb } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaBriefcase, FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt, FaUserTie, FaClock, FaBuilding, FaInfoCircle } from 'react-icons/fa';
import './Job.css';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await jobService.getJobById(id);
      setJob(response.data);
    } catch (err) {
      setError('Không thể tải thông tin công việc. Vui lòng thử lại.');
      console.error('Error fetching job details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <p>Đang tải thông tin công việc...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate('/jobs')}>
          Quay lại danh sách
        </Button>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Không tìm thấy công việc.</Alert>
        <Button variant="secondary" onClick={() => navigate('/jobs')}>
          Quay lại danh sách
        </Button>
      </Container>
    );
  }

  const isEmployer = isAuthenticated && currentUser?.userType === "EMPLOYER" && 
    (currentUser?.id === job.EmployerID || currentUser?.id === job.employerId);
  const isCandidate = isAuthenticated && currentUser?.userType === "CANDIDATE";

  return (
    <Container className="mt-4">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Trang chủ</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/jobs" }}>Công việc</Breadcrumb.Item>
        <Breadcrumb.Item active>{job.JobName || job.jobName}</Breadcrumb.Item>
      </Breadcrumb>

      <div className="job-detail-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="mb-2 text-white">{job.JobName || job.jobName}</h2>
            <div>
              <Badge className="filter-badge me-2">
                {(job.JobStatus || job.jobStatus) === 'Đang mở' ? 'Đang mở' : 'Đã đóng'}
              </Badge>
              <span className="text-white">Ngày đăng: {formatDate(job.postDate || job.PostDate)}</span>
            </div>
          </div>
        </div>
      </div>

      <Row>
        <Col md={8}>
          <div className="job-detail-section">
            <h3>
              <FaInfoCircle className="me-2" />
              Thông tin chi tiết
            </h3>
            <div className="mb-4">
              <h5 className="text-primary">Mô tả công việc:</h5>
              <div style={{ whiteSpace: 'pre-line' }}>{job.JD || job.jobDescription || 'Không có thông tin mô tả công việc.'}</div>
            </div>
            
        
          </div>
        </Col>
        
        <Col md={4}>
          <div className="job-detail-section mb-4">
            <h3>
              <FaBriefcase className="me-2" />
              Thông tin cơ bản
            </h3>
            <ListGroup variant="flush">
              <ListGroup.Item className="border-0 ps-0">
                <div className="d-flex">
                  <div className="me-3"><FaBriefcase size={20} className="text-primary" /></div>
                  <div>
                    <div className="text-muted">Loại công việc</div>
                    <div><strong>{job.JobType || job.contractType}</strong></div>
                  </div>
                </div>
              </ListGroup.Item>
              
              <ListGroup.Item className="border-0 ps-0">
                <div className="d-flex">
                  <div className="me-3"><FaUserTie size={20} className="text-primary" /></div>
                  <div>
                    <div className="text-muted">Cấp bậc</div>
                    <div><strong>{job.Level || job.level}</strong></div>
                  </div>
                </div>
              </ListGroup.Item>
              
              <ListGroup.Item className="border-0 ps-0">
                <div className="d-flex">
                  <div className="me-3"><FaMapMarkerAlt size={20} className="text-primary" /></div>
                  <div>
                    <div className="text-muted">Địa điểm</div>
                    <div><strong>{job.Location || job.location}</strong></div>
                  </div>
                </div>
              </ListGroup.Item>
              
              <ListGroup.Item className="border-0 ps-0">
                <div className="d-flex">
                  <div className="me-3"><FaMoneyBillWave size={20} className="text-primary" /></div>
                  <div>
                    <div className="text-muted">Mức lương</div>
                    <div><strong>{(job.SalaryFrom || job.salaryFrom)?.toLocaleString()} - {(job.SalaryTo || job.salaryTo)?.toLocaleString()} VND</strong></div>
                  </div>
                </div>
              </ListGroup.Item>
              
              <ListGroup.Item className="border-0 ps-0">
                <div className="d-flex">
                  <div className="me-3"><FaClock size={20} className="text-primary" /></div>
                  <div>
                    <div className="text-muted">Kinh nghiệm</div>
                    <div><strong>{job.RequireExpYear || job.requireExpYear || 0} năm</strong></div>
                  </div>
                </div>
              </ListGroup.Item>
              
              <ListGroup.Item className="border-0 ps-0">
                <div className="d-flex">
                  <div className="me-3"><FaCalendarAlt size={20} className="text-primary" /></div>
                  <div>
                    <div className="text-muted">Hạn ứng tuyển</div>
                    <div><strong>{formatDate(job.expireDate)}</strong></div>
                  </div>
                </div>
              </ListGroup.Item>
            </ListGroup>
          </div>
          
          {isCandidate && (job.JobStatus === 'Đang mở' || job.jobStatus === 'Đang mở') && (
            <div className="text-center mb-4">
              <Link to={`/applications/new/${job.JobID || job.jobId || job.id}`}>
                <Button className="btn-job-primary w-100 py-3">Ứng tuyển ngay</Button>
              </Link>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default JobDetail; 