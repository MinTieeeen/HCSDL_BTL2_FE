import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobService } from '../../services/api';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
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
      setError('Failed to fetch job details. Please try again.');
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
        <p>Loading job details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate('/jobs')}>
          Back to Jobs
        </Button>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Job not found.</Alert>
        <Button variant="secondary" onClick={() => navigate('/jobs')}>
          Back to Jobs
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>{job.JobName}</h2>
            <div>
              <Link to={`/jobs/edit/${job.JobID}`} className="me-2">
                <Button variant="warning">Edit Job</Button>
              </Link>
              <Button variant="secondary" onClick={() => navigate('/jobs')}>
                Back to List
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header as="h5">Job Description</Card.Header>
            <Card.Body>
              <div className="mb-4">
                <h6>Job Description:</h6>
                <div style={{ whiteSpace: 'pre-line' }}>{job.JD}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header as="h5">Job Details</Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Badge bg={job.JobStatus === 'Đang mở' ? 'success' : 'secondary'} className="mb-2">
                  {job.JobStatus}
                </Badge>
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
                <p>{job.SalaryFrom.toLocaleString()} - {job.SalaryTo.toLocaleString()} VND</p>
              </div>
              
              <div className="mb-3">
                <h6>Required Experience:</h6>
                <p>{job.RequireExpYear || 0} years</p>
              </div>
              
              <div className="mb-3">
                <h6>Number of Positions:</h6>
                <p>{job.Quantity}</p>
              </div>
              
              <div className="mb-3">
                <h6>Posting Date:</h6>
                <p>{formatDate(job.postDate)}</p>
              </div>
              
              <div className="mb-3">
                <h6>Expire Date:</h6>
                <p>{formatDate(job.expireDate)}</p>
              </div>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header as="h5">Company Info</Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6>Tax Number:</h6>
                <p>{job.TaxNumber}</p>
              </div>
              
              <div className="mb-3">
                <h6>Employer ID:</h6>
                <p>{job.EmployerID}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default JobDetail; 