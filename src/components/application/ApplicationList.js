import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Row, Col, Alert, Card, Badge, Tabs, Tab, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { candidateService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaEye, FaTrashAlt, FaBriefcase, FaCalendarAlt, FaCheck, FaTimes, FaHourglassHalf } from 'react-icons/fa';

const ApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await candidateService.getAllApplications();
      setApplications(response.data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách ứng tuyển. Vui lòng thử lại sau.');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (candidateId, jobId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn ứng tuyển này không?')) {
      try {
        await candidateService.deleteApplication(candidateId, jobId);
        setSuccessMessage('Đã xóa đơn ứng tuyển thành công!');
        // Remove the deleted application from the state
        setApplications(applications.filter(
          app => !(app.CandidateID === candidateId && app.JobID === jobId)
        ));
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        setError('Không thể xóa đơn ứng tuyển. Vui lòng thử lại.');
        console.error('Error deleting application:', err);
      }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Đã nộp':
        return <FaCheck className="text-primary" />;
      case 'Đang xem xét':
        return <FaHourglassHalf className="text-info" />;
      case 'Đạt yêu cầu':
        return <FaCheck className="text-success" />;
      case 'Không đạt':
        return <FaTimes className="text-danger" />;
      case 'Yêu cầu thông tin bổ sung':
        return <FaHourglassHalf className="text-warning" />;
      case 'Đã nhận việc':
        return <FaCheck className="text-success" />;
      default:
        return <FaHourglassHalf className="text-secondary" />;
    }
  };

  // Helper function to determine badge color based on application status
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Đã nộp':
        return 'primary';
      case 'Đang xem xét':
        return 'info';
      case 'Đạt yêu cầu':
        return 'success';
      case 'Không đạt':
        return 'danger';
      case 'Yêu cầu thông tin bổ sung':
        return 'warning';
      case 'Đã nhận việc':
        return 'success';
      case 'Hoàn thành':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const filteredApplications = () => {
    if (activeTab === 'all') {
      return applications;
    }
    return applications.filter(app => {
      switch (activeTab) {
        case 'pending':
          return ['Đã nộp', 'Đang xem xét', 'Yêu cầu thông tin bổ sung'].includes(app.Status);
        case 'accepted':
          return ['Đạt yêu cầu', 'Đã nhận việc'].includes(app.Status);
        case 'rejected':
          return app.Status === 'Không đạt';
        default:
          return true;
      }
    });
  };

  const renderCardView = () => {
    return (
      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredApplications().map((application) => (
          <Col key={`${application.CandidateID}-${application.JobID}`}>
            <Card className="h-100 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <Badge bg={getStatusBadgeColor(application.Status)}>
                  {getStatusIcon(application.Status)} {application.Status}
                </Badge>
                <small className="text-muted">{formatDate(application.Date)}</small>
              </Card.Header>
              <Card.Body>
                <Card.Title>{application.JobName || 'Không có tên'}</Card.Title>
                <Card.Text>
                  <div className="mb-2">
                    <FaBriefcase className="me-2 text-primary" />
                    <strong>Công việc ID:</strong> {application.JobID}
                  </div>
                  <div className="mb-2">
                    <FaCalendarAlt className="me-2 text-primary" />
                    <strong>Ngày ứng tuyển:</strong> {formatDate(application.Date)}
                  </div>
                  {application.CoverLetter && (
                    <div className="mt-3">
                      <small className="text-muted">
                        {application.CoverLetter.length > 100 
                          ? application.CoverLetter.substring(0, 100) + '...' 
                          : application.CoverLetter}
                      </small>
                    </div>
                  )}
                </Card.Text>
              </Card.Body>
              <Card.Footer className="bg-white">
                <div className="d-flex justify-content-between">
                  <Link to={`/applications/view/${application.CandidateID}/${application.JobID}`}>
                    <Button variant="outline-primary" size="sm">
                      <FaEye className="me-1" /> Chi tiết
                    </Button>
                  </Link>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={() => handleDelete(application.CandidateID, application.JobID)}
                  >
                    <FaTrashAlt className="me-1" /> Xóa
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderTableView = () => {
    return (
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Công việc</th>
            <th>Ngày ứng tuyển</th>
            <th>Trạng thái</th>
            <th>CV</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredApplications().map((application) => (
            <tr key={`${application.CandidateID}-${application.JobID}`}>
              <td>{application.JobID}</td>
              <td>{application.JobName || 'N/A'}</td>
              <td>{formatDate(application.Date)}</td>
              <td>
                <Badge bg={getStatusBadgeColor(application.Status)}>
                  {application.Status}
                </Badge>
              </td>
              <td>{application.UploadCV ? 'Có' : 'Không'}</td>
              <td>
                <Link to={`/applications/view/${application.CandidateID}/${application.JobID}`}>
                  <Button variant="outline-primary" size="sm" className="me-2">
                    <FaEye className="me-1" /> Chi tiết
                  </Button>
                </Link>
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={() => handleDelete(application.CandidateID, application.JobID)}
                >
                  <FaTrashAlt className="me-1" /> Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <Container className="mt-4">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Trang chủ</Breadcrumb.Item>
        <Breadcrumb.Item active>Đơn ứng tuyển của tôi</Breadcrumb.Item>
      </Breadcrumb>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Row className="mb-3">
            <Col>
              <h2 className="mb-4">Đơn ứng tuyển của tôi</h2>
            </Col>
            <Col className="text-end">
              <Link to="/jobs">
                <Button variant="primary">
                  <FaBriefcase className="me-2" />
                  Tìm việc mới
                </Button>
              </Link>
            </Col>
          </Row>

          {error && <Alert variant="danger">{error}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}

          {loading ? (
            <div className="text-center my-5">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : applications.length === 0 ? (
            <Alert variant="info">
              Bạn chưa có đơn ứng tuyển nào. Hãy tìm việc mới và bắt đầu ứng tuyển.
            </Alert>
          ) : (
            <>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
              >
                <Tab eventKey="all" title="Tất cả" />
                <Tab eventKey="pending" title="Đang chờ" />
                <Tab eventKey="accepted" title="Đã chấp nhận" />
                <Tab eventKey="rejected" title="Đã từ chối" />
              </Tabs>
              
              <div className="d-none d-md-block">
                {renderTableView()}
              </div>
              
              <div className="d-md-none">
                {renderCardView()}
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ApplicationList; 