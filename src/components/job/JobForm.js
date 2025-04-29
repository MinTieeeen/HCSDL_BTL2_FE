import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { employerService, jobService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const JobForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    jobType: "",
    contractType: "",
    level: "",
    quantity: 1,
    salaryFrom: 0,
    salaryTo: 0,
    requireExpYear: 0,
    location: "",
    jobDescription: "",
    jobName: "",
    expireDate: "",
    employerId: "",
    taxNumber: "",
    jobStatus: "Đang mở",
  });

  const [fieldErrors, setFieldErrors] = useState({
    jobType: "",
    contractType: "",
    level: "",
    quantity: "",
    salaryFrom: "",
    salaryTo: "",
    requireExpYear: "",
    location: "",
    jobDescription: "",
    jobName: "",
    expireDate: "",
    taxNumber: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchJobDetails();
    }
  }, [id]);

  useEffect(() => {
    if (currentUser && currentUser.typeId) {
      setFormData((prev) => ({
        ...prev,
        employerId: currentUser.typeId,
      }));
    }
  }, [currentUser]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await jobService.getJobById(id);
      const jobData = response.data;

      const expireDate = new Date(jobData.expireDate);
      const formattedExpireDate = expireDate.toISOString().split("T")[0];

      setFormData({
        ...jobData,
        expireDate: formattedExpireDate,
      });
    } catch (err) {
      setError("Failed to fetch job details. Please try again.");
      console.error("Error fetching job details:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value) => {
    let errorMessage = "";

    switch (name) {
      case "jobName":
        if (!value.trim()) {
          errorMessage = "Job name is required";
        }
        break;
      case "jobType":
        if (!value.trim()) {
          errorMessage = "Job type is required";
        }
        break;
      case "contractType":
        if (!value.trim()) {
          errorMessage = "Contract type is required";
        }
        break;
      case "level":
        if (!value.trim()) {
          errorMessage = "Level is required";
        }
        break;
      case "quantity":
        if (Number(value) <= 0) {
          errorMessage = "Quantity must be greater than 0";
        }
        break;
      case "salaryFrom":
        if (Number(value) < 0) {
          errorMessage = "Salary cannot be negative";
        }
        break;
      case "salaryTo":
        if (Number(value) <= 0) {
          errorMessage = "Salary must be greater than 0";
        } else if (Number(value) < Number(formData.salaryFrom)) {
          errorMessage =
            "Maximum salary must be greater than or equal to minimum salary";
        }
        break;
      case "requireExpYear":
        if (Number(value) < 0) {
          errorMessage = "Experience years cannot be negative";
        }
        break;
      case "location":
        if (!value.trim()) {
          errorMessage = "Location is required";
        }
        break;
      case "jobDescription":
        if (!value.trim()) {
          errorMessage = "Job description is required";
        }
        break;
      case "expireDate":
        const currentDate = new Date();
        const selectedDate = new Date(value);
        if (!value) {
          errorMessage = "Expire date is required";
        } else if (selectedDate <= currentDate) {
          errorMessage = "Expire date must be in the future";
        }
        break;
      case "taxNumber":
        if (!value.trim()) {
          errorMessage = "Tax number is required";
        } else if (!/^[0-9]{10,13}$/.test(value)) {
          errorMessage = "Tax number must be 10 or 13 digits";
        }
        break;
      default:
        break;
    }

    return errorMessage;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      ["quantity", "salaryFrom", "salaryTo", "requireExpYear"].includes(name)
    ) {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    const errorMessage = validateField(name, value);
    setFieldErrors({
      ...fieldErrors,
      [name]: errorMessage,
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const errorMessage = validateField(name, value);
    setFieldErrors({
      ...fieldErrors,
      [name]: errorMessage,
    });
  };

  const validateForm = () => {
    let isValid = true;
    let newFieldErrors = { ...fieldErrors };

    Object.keys(formData).forEach((key) => {
      if (
        [
          "jobType",
          "contractType",
          "level",
          "quantity",
          "salaryFrom",
          "salaryTo",
          "requireExpYear",
          "location",
          "jobDescription",
          "jobName",
          "expireDate",
          "taxNumber",
        ].includes(key)
      ) {
        const errorMessage = validateField(key, formData[key]);
        newFieldErrors[key] = errorMessage;
        if (errorMessage) {
          isValid = false;
        }
      }
    });

    setFieldErrors(newFieldErrors);

    if (!isValid) {
      setError("Please correct the errors in the form before submitting.");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        expireDate: formData.expireDate
          ? `${formData.expireDate}T00:00:00`
          : "",
      };

      console.log("Dữ liệu gửi lên:", submitData);

      if (isEditMode) {
        await employerService.updateJob(id, submitData);
        alert("Job updated successfully!");
      } else {
        await employerService.createJob(submitData);
        alert("Job created successfully!");
      }

      navigate("/jobs");
    } catch (err) {
      setError(
        `Failed to ${
          isEditMode ? "update" : "create"
        } job. Please check your input and try again.`
      );
      console.error(`Error ${isEditMode ? "updating" : "creating"} job:`, err);
      if (err.response && err.response.data) {
        console.error("Backend trả về:", err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Row className="mb-3">
        <Col>
          <h2>{isEditMode ? "Edit Job" : "Create New Job"}</h2>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Job Name*</Form.Label>
              <Form.Control
                type="text"
                name="jobName"
                value={formData.jobName}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!fieldErrors.jobName}
                required
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.jobName}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Job Type*</Form.Label>
              <Form.Control
                type="text"
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!fieldErrors.jobType}
                required
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.jobType}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Contract Type*</Form.Label>
              <Form.Control
                type="text"
                name="contractType"
                value={formData.contractType}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!fieldErrors.contractType}
                required
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.contractType}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Level*</Form.Label>
              <Form.Control
                type="text"
                name="level"
                value={formData.level}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!fieldErrors.level}
                required
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.level}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Quantity*</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!fieldErrors.quantity}
                min="1"
                required
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.quantity}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Location*</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!fieldErrors.location}
                required
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.location}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Salary From*</Form.Label>
              <Form.Control
                type="number"
                name="salaryFrom"
                value={formData.salaryFrom}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!fieldErrors.salaryFrom}
                min="0"
                required
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.salaryFrom}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Salary To*</Form.Label>
              <Form.Control
                type="number"
                name="salaryTo"
                value={formData.salaryTo}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!fieldErrors.salaryTo}
                min="0"
                required
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.salaryTo}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Required Experience Years</Form.Label>
              <Form.Control
                type="number"
                name="requireExpYear"
                value={formData.requireExpYear}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!fieldErrors.requireExpYear}
                min="0"
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.requireExpYear}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Expire Date*</Form.Label>
              <Form.Control
                type="date"
                name="expireDate"
                value={formData.expireDate}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!fieldErrors.expireDate}
                required
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.expireDate}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Tax Number*</Form.Label>
              <Form.Control
                type="text"
                name="taxNumber"
                value={formData.taxNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={!!fieldErrors.taxNumber}
                required
                pattern="[0-9]{10,13}"
                title="Tax number must be 10 or 13 digits"
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.taxNumber}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Must be 10 or 13 digits and start with a number
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="jobStatus"
                value={formData.jobStatus}
                onChange={handleChange}
              >
                <option value="Đang mở">Đang mở</option>
                <option value="Đã đóng">Đã đóng</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Job Description*</Form.Label>
          <Form.Control
            as="textarea"
            name="jobDescription"
            value={formData.jobDescription}
            onChange={handleChange}
            onBlur={handleBlur}
            isInvalid={!!fieldErrors.jobDescription}
            rows={5}
            required
          />
          <Form.Control.Feedback type="invalid">
            {fieldErrors.jobDescription}
          </Form.Control.Feedback>
        </Form.Group>

        <div className="d-flex justify-content-between mt-4">
          <Button variant="secondary" onClick={() => navigate("/jobs")}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : isEditMode ? "Update Job" : "Create Job"}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default JobForm;
