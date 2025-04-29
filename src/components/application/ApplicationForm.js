import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { candidateService, jobService } from '../../services/api';

const ApplicationForm = () => {
  const { candidateId, jobId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!(candidateId && jobId);

  const [formData, setFormData] = useState({
    CandidateID: 1, // Default value, in a real app this would come from user context
    JobID: '',
    CoverLetter: '',
    UploadCV: '' // In a real app, this would be file handling logic
  });

  // Add field-specific validation errors
  const [fieldErrors, setFieldErrors] = useState({
    CandidateID: '',
    JobID: '',
    CoverLetter: '',
    UploadCV: ''
  });

  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
    
    if (isEditMode) {
      fetchApplicationDetails();
    }
  }, [candidateId, jobId]);

  const fetchJobs = async () => {
    try {
      const response = await jobService.getAllJobs();
      setJobs(response.data);
    } catch (err) {
      setError('Failed to fetch available jobs. Please try again later.');
      console.error('Error fetching jobs:', err);
    }
  };

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const response = await candidateService.getApplicationById(candidateId, jobId);
      setFormData(response.data);
    } catch (err) {
      setError('Failed to fetch application details. Please try again.');
      console.error('Error fetching application details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Validate individual field
  const validateField = (name, value) => {
    let errorMessage = '';

    switch (name) {
      case 'CandidateID':
        if (!value) {
          errorMessage = 'Candidate ID is required';
        } else if (value <= 0) {
          errorMessage = 'Candidate ID must be a positive number';
        }
        break;
      case 'JobID':
        if (!value) {
          errorMessage = 'Please select a job';
        }
        break;
      case 'CoverLetter':
        // Optional, but if provided should have some minimum length
        if (value && value.trim().length < 10) {
          errorMessage = 'Cover letter should be at least 10 characters';
        }
        break;
      case 'UploadCV':
        // Optional, but if provided should have a valid URL format
        if (value && !isValidUrl(value)) {
          errorMessage = 'Please enter a valid URL for CV';
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
    
    if (name === 'JobID') {
      setFormData({ ...formData, [name]: Number(value) });
    } else if (name === 'CandidateID') {
      setFormData({ ...formData, [name]: Number(value) });
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
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      if (['CandidateID', 'JobID', 'CoverLetter', 'UploadCV'].includes(key)) {
        const errorMessage = validateField(key, formData[key]);
        newFieldErrors[key] = errorMessage;
        if (errorMessage) {
          isValid = false;
        }
      }
    });
    
    setFieldErrors(newFieldErrors);
    
    if (!isValid) {
      setError('Please correct the errors in the form before submitting.');
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
      
      if (isEditMode) {
        await candidateService.updateApplication(candidateId, jobId, formData);
        alert('Application updated successfully!');
      } else {
        await candidateService.createApplication(formData);
        alert('Application submitted successfully!');
      }
      
      navigate('/applications');
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'submit'} application. Please check your input and try again.`);
      console.error(`Error ${isEditMode ? 'updating' : 'submitting'} application:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Row className="mb-3">
        <Col>
          <h2>{isEditMode ? 'Edit Application' : 'Submit New Application'}</h2>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Candidate ID</Form.Label>
              <Form.Control
                type="number"
                name="CandidateID"
                value={formData.CandidateID}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!fieldErrors.CandidateID}
                required
                disabled={isEditMode}
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.CandidateID}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                This would typically be handled by user authentication in a real app
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Select Job</Form.Label>
              <Form.Select
                name="JobID"
                value={formData.JobID}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!fieldErrors.JobID}
                required
                disabled={isEditMode}
              >
                <option value="">-- Select a Job --</option>
                {jobs.map((job) => (
                  <option key={job.JobID} value={job.JobID}>
                    {job.JobName} - {job.JobType} ({job.Location})
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {fieldErrors.JobID}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Cover Letter</Form.Label>
              <Form.Control
                as="textarea"
                name="CoverLetter"
                value={formData.CoverLetter || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!fieldErrors.CoverLetter}
                rows={7}
                placeholder="Write a cover letter explaining why you are a good fit for this position..."
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.CoverLetter}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Upload CV (URL)</Form.Label>
              <Form.Control
                type="text"
                name="UploadCV"
                value={formData.UploadCV || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!fieldErrors.UploadCV}
                placeholder="In a real app, this would be a file upload component"
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.UploadCV}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Enter a URL to your CV. In a real application, this would be a file upload.
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-between mt-4">
          <Button variant="secondary" onClick={() => navigate('/applications')}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : (isEditMode ? 'Update Application' : 'Submit Application')}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default ApplicationForm; 