import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { candidateService, jobService } from '../../services/api';

const ApplicationDetail = () => {
  const { candidateId, jobId } = useParams();
  const navigate = useNavigate();
  
  const [application, setApplication] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplicationDetails();
  }, [candidateId, jobId]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const appResponse = await candidateService.getApplicationById(candidateId, jobId);
      setApplication(appResponse.data);
      
      // Fetch job details as well
      try {
        const jobResponse = await jobService.getJobById(jobId);
        setJob(jobResponse.data);
      } catch (err) {
        console.error('Error fetching job details:', err);
        // Continue even if job details can't be fetched
      }
    } catch (err) {
      setError('Failed to fetch application details. Please try again.');
      console.error('Error fetching application details:', err);
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

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <p>Loading application details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate('/applications')}>
          Back to Applications
        </Button>
      </Container>
    );
  }

  if (!application) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Application not found.</Alert>
        <Button variant="secondary" onClick={() => navigate('/applications')}>
          Back to Applications
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Application Details</h2>
            <div>
              <Link to={`/applications/edit/${candidateId}/${jobId}`} className="me-2">
                <Button variant="warning">Edit Application</Button>
              </Link>
              <Button variant="secondary" onClick={() => navigate('/applications')}>
                Back to List
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={7}>
          <Card className="mb-4">
            <Card.Header as="h5">Application Information</Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Badge bg={getStatusBadgeColor(application.Status)} className="mb-2">
                  {application.Status}
                </Badge>
              </div>
              
              <div className="mb-3">
                <h6>Candidate ID:</h6>
                <p>{application.CandidateID}</p>
              </div>
              
              <div className="mb-3">
                <h6>Application Date:</h6>
                <p>{formatDate(application.Date)}</p>
              </div>
              
              {application.UploadCV && (
                <div className="mb-3">
                  <h6>CV:</h6>
                  <p>
                    <a href={application.UploadCV} target="_blank" rel="noopener noreferrer">
                      View CV
                    </a>
                  </p>
                </div>
              )}
              
              {application.CoverLetter && (
                <div className="mb-4">
                  <h6>Cover Letter:</h6>
                  <div style={{ whiteSpace: 'pre-line' }}>
                    {application.CoverLetter}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={5}>
          {job && (
            <Card>
              <Card.Header as="h5">Job Information</Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <h6>Job Name:</h6>
                  <p>{job.JobName}</p>
                </div>
                
                <div className="mb-3">
                  <h6>Job Type:</h6>
                  <p>{job.JobType}</p>
                </div>
                
                <div className="mb-3">
                  <h6>Contract Type:</h6>
                  <p>{job.ContractType}</p>
                </div>
                
                <div className="mb-3">
                  <h6>Level:</h6>
                  <p>{job.Level}</p>
                </div>
                
                <div className="mb-3">
                  <h6>Location:</h6>
                  <p>{job.Location}</p>
                </div>
                
                <div className="mb-3">
                  <h6>Salary Range:</h6>
                  <p>{job.SalaryFrom?.toLocaleString()} - {job.SalaryTo?.toLocaleString()} VND</p>
                </div>
                
                <div className="mb-3">
                  <Link to={`/jobs/view/${job.JobID}`}>
                    <Button variant="outline-primary" size="sm">View Full Job Details</Button>
                  </Link>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ApplicationDetail; 