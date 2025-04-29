import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { candidateService } from '../../services/api';

const ApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);

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
      setError('Failed to fetch applications. Please try again later.');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (candidateId, jobId) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await candidateService.deleteApplication(candidateId, jobId);
        setSuccessMessage('Application deleted successfully!');
        // Remove the deleted application from the state
        setApplications(applications.filter(
          app => !(app.CandidateID === candidateId && app.JobID === jobId)
        ));
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        setError('Failed to delete application. Please try again.');
        console.error('Error deleting application:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <Container className="mt-4">
      <Row className="mb-3">
        <Col>
          <h2>Job Applications</h2>
        </Col>
        <Col className="text-end">
          <Link to="/applications/new">
            <Button variant="primary">Submit New Application</Button>
          </Link>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {loading ? (
        <div className="text-center">
          <p>Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <Alert variant="info">No applications found. Submit a new application to get started.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Candidate ID</th>
              <th>Job ID</th>
              <th>Job Name</th>
              <th>Application Date</th>
              <th>Status</th>
              <th>Has CV</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={`${application.CandidateID}-${application.JobID}`}>
                <td>{application.CandidateID}</td>
                <td>{application.JobID}</td>
                <td>{application.JobName || 'N/A'}</td>
                <td>{formatDate(application.Date)}</td>
                <td>
                  <span className={`badge bg-${getStatusBadgeColor(application.Status)}`}>
                    {application.Status}
                  </span>
                </td>
                <td>{application.UploadCV ? 'Yes' : 'No'}</td>
                <td>
                  <Link to={`/applications/view/${application.CandidateID}/${application.JobID}`}>
                    <Button variant="info" size="sm" className="me-2">View</Button>
                  </Link>
                  <Link to={`/applications/edit/${application.CandidateID}/${application.JobID}`}>
                    <Button variant="warning" size="sm" className="me-2">Edit</Button>
                  </Link>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => handleDelete(application.CandidateID, application.JobID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
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

export default ApplicationList; 