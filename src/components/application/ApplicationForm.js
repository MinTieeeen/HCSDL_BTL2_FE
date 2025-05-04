import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card, Breadcrumb } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { candidateService, jobService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaFileAlt, FaPaperPlane, FaUser, FaBriefcase } from 'react-icons/fa';

const ApplicationForm = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const candidateId = currentUser?.id;
  
  const [formData, setFormData] = useState({
    candidateId: candidateId || '',
    jobId: jobId || '',
    coverLetter: '',
    cvLink: '',
    skills: '',
    experience: '',
    education: '',
    expectedSalary: ''
  });

  // Add field-specific validation errors
  const [fieldErrors, setFieldErrors] = useState({
    candidateId: '',
    jobId: '',
    coverLetter: '',
    cvLink: '',
    skills: '',
    experience: ''
  });

  const [job, setJob] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
    
    if (candidateId) {
      setFormData(prev => ({
        ...prev,
        candidateId
      }));
    }
  }, [jobId, candidateId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await jobService.getJobById(jobId);
      setJob(response.data);
      setFormData(prev => ({
        ...prev,
        jobId: Number(jobId)
      }));
    } catch (err) {
      setError('Không thể tải thông tin công việc. Vui lòng thử lại.');
      console.error('Error fetching job details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Validate individual field
  const validateField = (name, value) => {
    let errorMessage = '';

    switch (name) {
      case 'candidateId':
        if (!value) {
          errorMessage = 'ID ứng viên là bắt buộc';
        }
        break;
      case 'jobId':
        if (!value) {
          errorMessage = 'Vui lòng chọn công việc';
        }
        break;
      case 'coverLetter':
        if (!value || value.trim().length < 10) {
          errorMessage = 'Thư xin việc cần ít nhất 10 ký tự';
        }
        break;
      case 'cvLink':
        if (!value) {
          errorMessage = 'Vui lòng nhập đường dẫn CV của bạn';
        } else if (!isValidUrl(value)) {
          errorMessage = 'Vui lòng nhập đường dẫn hợp lệ';
        }
        break;
      case 'skills':
        if (!value || value.trim().length < 5) {
          errorMessage = 'Vui lòng liệt kê ít nhất một vài kỹ năng';
        }
        break;
      case 'experience':
        if (!value || value.trim().length < 10) {
          errorMessage = 'Vui lòng nhập thông tin kinh nghiệm của bạn';
        }
        break;
      default:
        break;
    }

    return errorMessage;
  };

  // Helper function to validate URL format
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'jobId') {
      setFormData({ ...formData, [name]: Number(value) });
    } else if (name === 'candidateId') {
      setFormData({ ...formData, [name]: Number(value) });
    } else if (name === 'expectedSalary') {
      // Allow only numbers
      if (/^\d*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Validate field in real-time
    const errorMessage = validateField(name, value);
    setFieldErrors({
      ...fieldErrors,
      [name]: errorMessage
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Revalidate on blur for good measure
    const errorMessage = validateField(name, value);
    setFieldErrors({
      ...fieldErrors,
      [name]: errorMessage
    });
  };

  const validateForm = () => {
    let isValid = true;
    let newFieldErrors = { ...fieldErrors };
    
    // Validate all required fields
    const requiredFields = ['candidateId', 'jobId', 'coverLetter', 'cvLink', 'skills', 'experience'];
    
    requiredFields.forEach(key => {
      const errorMessage = validateField(key, formData[key]);
      newFieldErrors[key] = errorMessage;
      if (errorMessage) {
        isValid = false;
      }
    });
    
    setFieldErrors(newFieldErrors);
    
    if (!isValid) {
      setError('Vui lòng sửa lỗi trong biểu mẫu trước khi gửi.');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      await candidateService.createApplication(formData);
      setSuccessMessage('Đơn ứng tuyển đã được gửi thành công!');
      
      // Clear success message after 3 seconds and navigate
      setTimeout(() => {
        navigate('/applications');
      }, 3000);
    } catch (err) {
      setError('Không thể gửi đơn ứng tuyển. Vui lòng kiểm tra thông tin và thử lại.');
      console.error('Error submitting application:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Trang chủ</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/jobs" }}>Công việc</Breadcrumb.Item>
        {job && (
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/jobs/view/${jobId}` }}>
            {job.JobName}
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item active>Ứng tuyển</Breadcrumb.Item>
      </Breadcrumb>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Row className="mb-4">
            <Col>
              <h2 className="mb-4">
                <FaPaperPlane className="me-2 text-primary" />
                Gửi đơn ứng tuyển
              </h2>
              {job && (
                <Alert variant="info">
                  <strong>Công việc:</strong> {job.JobName} {job.location && `(${job.location})`}
                </Alert>
              )}
            </Col>
          </Row>

          {error && <Alert variant="danger">{error}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <FaUser className="me-2" />
                  Thông tin cá nhân
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Họ và tên</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={currentUser?.fullName || ""}
                        disabled
                      />
                      <Form.Text className="text-muted">
                        Thông tin này được lấy từ tài khoản của bạn
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={currentUser?.email || ""}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <FaBriefcase className="me-2" />
                  Thông tin ứng tuyển
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Đường dẫn đến CV của bạn</Form.Label>
                      <Form.Control
                        type="url"
                        name="cvLink"
                        value={formData.cvLink}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={!!fieldErrors.cvLink}
                        placeholder="https://example.com/your-cv.pdf"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {fieldErrors.cvLink}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Nhập URL tới CV của bạn (Google Drive, Dropbox, OneDrive,...)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Các kỹ năng của bạn</Form.Label>
                      <Form.Control
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={!!fieldErrors.skills}
                        placeholder="Ví dụ: Java, SQL, Spring Boot, React,..."
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {fieldErrors.skills}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Kinh nghiệm làm việc</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={!!fieldErrors.experience}
                        placeholder="Mô tả ngắn gọn kinh nghiệm làm việc của bạn"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {fieldErrors.experience}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Học vấn</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="education"
                        value={formData.education}
                        onChange={handleChange}
                        placeholder="Ví dụ: Đại học Bách Khoa Hà Nội, Ngành Công nghệ thông tin, 2019-2023"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mức lương mong muốn (VND)</Form.Label>
                      <Form.Control
                        type="text"
                        name="expectedSalary"
                        value={formData.expectedSalary}
                        onChange={handleChange}
                        placeholder="Ví dụ: 15000000"
                      />
                      <Form.Text className="text-muted">
                        Nhập số tiền, không cần dấu phẩy hay dấu chấm
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <FaFileAlt className="me-2" />
                  Thư xin việc
                </h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={6}
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={!!fieldErrors.coverLetter}
                    placeholder="Viết thư xin việc của bạn tại đây..."
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.coverLetter}
                  </Form.Control.Feedback>
                </Form.Group>
              </Card.Body>
            </Card>

            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <Button variant="secondary" onClick={() => navigate(-1)} className="me-md-2">
                Hủy
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
                className="d-flex align-items-center"
              >
                <FaPaperPlane className="me-2" />
                {loading ? 'Đang gửi...' : 'Gửi đơn ứng tuyển'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ApplicationForm; 