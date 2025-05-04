import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { employerService, jobService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { FaBriefcase, FaUser, FaMoneyBillWave, FaMapMarkerAlt, FaCalendarAlt, FaBuilding, FaFileAlt } from "react-icons/fa";
import "./Job.css";

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

  const [touched, setTouched] = useState({});
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
      setError("Không thể tải thông tin công việc. Vui lòng thử lại.");
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
          errorMessage = "Tên công việc là bắt buộc";
        }
        break;
      case "jobType":
        if (!value.trim()) {
          errorMessage = "Vui lòng chọn loại công việc";
        }
        break;
      case "contractType":
        if (!value.trim()) {
          errorMessage = "Vui lòng chọn loại hợp đồng";
        }
        break;
      case "level":
        if (!value.trim()) {
          errorMessage = "Vui lòng chọn cấp bậc";
        }
        break;
      case "quantity":
        if (Number(value) <= 0) {
          errorMessage = "Số lượng phải lớn hơn 0";
        }
        break;
      case "salaryFrom":
        if (Number(value) < 0) {
          errorMessage = "Lương không thể âm";
        }
        break;
      case "salaryTo":
        if (Number(value) <= 0) {
          errorMessage = "Lương phải lớn hơn 0";
        } else if (Number(value) < Number(formData.salaryFrom)) {
          errorMessage =
            "Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu";
        }
        break;
      case "requireExpYear":
        if (Number(value) < 0) {
          errorMessage = "Kinh nghiệm không thể âm";
        }
        break;
      case "location":
        if (!value.trim()) {
          errorMessage = "Địa điểm là bắt buộc";
        }
        break;
      case "jobDescription":
        if (!value.trim()) {
          errorMessage = "Mô tả công việc là bắt buộc";
        } else if (value.trim().length < 50) {
          errorMessage = "Mô tả công việc phải có ít nhất 50 ký tự";
        }
        break;
      case "expireDate":
        const currentDate = new Date();
        const selectedDate = new Date(value);
        if (!value) {
          errorMessage = "Ngày hết hạn là bắt buộc";
        } else if (selectedDate <= currentDate) {
          errorMessage = "Ngày hết hạn phải trong tương lai";
        }
        break;
      case "taxNumber":
        if (!value.trim()) {
          errorMessage = "Mã số thuế là bắt buộc";
        } else if (!/^[0-9]{10,13}$/.test(value)) {
          errorMessage = "Mã số thuế phải có 10 hoặc 13 chữ số";
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

    setTouched({ ...touched, [name]: true });

    const errorMessage = validateField(name, value);
    setFieldErrors({
      ...fieldErrors,
      [name]: errorMessage,
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched({ ...touched, [name]: true });
    
    const errorMessage = validateField(name, value);
    setFieldErrors({
      ...fieldErrors,
      [name]: errorMessage,
    });
  };

  const validateForm = () => {
    let isValid = true;
    let newFieldErrors = { ...fieldErrors };
    let newTouched = { ...touched };

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
        ].includes(key)
      ) {
        newTouched[key] = true;
        
        const errorMessage = validateField(key, formData[key]);
        newFieldErrors[key] = errorMessage;
        if (errorMessage) {
          isValid = false;
        }
      }
    });

    setFieldErrors(newFieldErrors);
    setTouched(newTouched);

    if (!isValid) {
      setError("Vui lòng sửa các lỗi trong biểu mẫu trước khi gửi.");
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
        alert("Cập nhật công việc thành công!");
      } else {
        await employerService.createJob(submitData);
        alert("Tạo công việc thành công!");
      }

      navigate("/employer/jobs");
    } catch (err) {
      setError("Có lỗi xảy ra khi lưu công việc. Vui lòng thử lại.");
      console.error("Error saving job:", err);
      if (err.response && err.response.data) {
        console.error("Backend trả về:", err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4 mb-5">
      <div className="job-detail-header">
        <h2 className="text-white mb-0">
          {isEditMode ? "Chỉnh sửa công việc" : "Tạo công việc mới"}
        </h2>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="job-form-section">
        <Form onSubmit={handleSubmit}>
          <Row className="mb-4">
            <Col md={12}>
              <h3><FaFileAlt className="me-2" />Thông tin cơ bản</h3>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tên công việc</Form.Label>
                    <div className="d-flex align-items-center">
                      <FaBriefcase className="me-2 text-primary" />
                      <Form.Control
                        type="text"
                        name="jobName"
                        value={formData.jobName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.jobName && !!fieldErrors.jobName}
                        placeholder="Ví dụ: Kỹ sư phần mềm"
                        required
                      />
                    </div>
                    {touched.jobName && fieldErrors.jobName && (
                      <div className="text-danger mt-1">{fieldErrors.jobName}</div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Loại công việc</Form.Label>
                    <div className="d-flex align-items-center">
                      <FaBriefcase className="me-2 text-primary" />
                      <Form.Select
                        name="jobType"
                        value={formData.jobType}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.jobType && !!fieldErrors.jobType}
                        required
                      >
                        <option value="">Chọn loại công việc</option>
                        <option value="ON_SITE">On-site</option>
                        <option value="REMOTE">Remote</option>
                        <option value="HYBRID">Hybrid</option>
                        <option value="OTHER">Khác</option>
                      </Form.Select>
                    </div>
                    {touched.jobType && fieldErrors.jobType && (
                      <div className="text-danger mt-1">{fieldErrors.jobType}</div>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Loại hợp đồng</Form.Label>
                    <div className="d-flex align-items-center">
                      <FaFileAlt className="me-2 text-primary" />
                      <Form.Select
                        name="contractType"
                        value={formData.contractType}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.contractType && !!fieldErrors.contractType}
                        required
                      >
                        <option value="">Chọn loại hợp đồng</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Temporary">Temporary</option>
                        <option value="Internship">Internship</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </div>
                    {touched.contractType && fieldErrors.contractType && (
                      <div className="text-danger mt-1">{fieldErrors.contractType}</div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cấp bậc</Form.Label>
                    <div className="d-flex align-items-center">
                      <FaUser className="me-2 text-primary" />
                      <Form.Select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.level && !!fieldErrors.level}
                        required
                      >
                        <option value="">Chọn cấp bậc</option>
                        <option value="Intern">Intern</option>
                        <option value="Fresher">Fresher</option>
                        <option value="Junior">Junior</option>
                        <option value="Middle">Middle</option>
                        <option value="Senior">Senior</option>
                        <option value="Leader">Leader</option>
                        <option value="Manager">Manager</option>
                        <option value="Director">Director</option>
                      </Form.Select>
                    </div>
                    {touched.level && fieldErrors.level && (
                      <div className="text-danger mt-1">{fieldErrors.level}</div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={12}>
              <h3><FaMoneyBillWave className="me-2" />Thông tin lương và số lượng</h3>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Số lượng tuyển</Form.Label>
                    <div className="d-flex align-items-center">
                      <FaUser className="me-2 text-primary" />
                      <Form.Control
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.quantity && !!fieldErrors.quantity}
                        min="1"
                        required
                      />
                    </div>
                    {touched.quantity && fieldErrors.quantity && (
                      <div className="text-danger mt-1">{fieldErrors.quantity}</div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Lương từ (VND)</Form.Label>
                    <div className="d-flex align-items-center">
                      <FaMoneyBillWave className="me-2 text-primary" />
                      <Form.Control
                        type="number"
                        name="salaryFrom"
                        value={formData.salaryFrom}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.salaryFrom && !!fieldErrors.salaryFrom}
                        min="0"
                        required
                      />
                    </div>
                    {touched.salaryFrom && fieldErrors.salaryFrom && (
                      <div className="text-danger mt-1">{fieldErrors.salaryFrom}</div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Lương đến (VND)</Form.Label>
                    <div className="d-flex align-items-center">
                      <FaMoneyBillWave className="me-2 text-primary" />
                      <Form.Control
                        type="number"
                        name="salaryTo"
                        value={formData.salaryTo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.salaryTo && !!fieldErrors.salaryTo}
                        min="0"
                        required
                      />
                    </div>
                    {touched.salaryTo && fieldErrors.salaryTo && (
                      <div className="text-danger mt-1">{fieldErrors.salaryTo}</div>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Yêu cầu kinh nghiệm (năm)</Form.Label>
                    <div className="d-flex align-items-center">
                      <FaUser className="me-2 text-primary" />
                      <Form.Control
                        type="number"
                        name="requireExpYear"
                        value={formData.requireExpYear}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.requireExpYear && !!fieldErrors.requireExpYear}
                        min="0"
                        required
                      />
                    </div>
                    {touched.requireExpYear && fieldErrors.requireExpYear && (
                      <div className="text-danger mt-1">{fieldErrors.requireExpYear}</div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Địa điểm làm việc</Form.Label>
                    <div className="d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2 text-primary" />
                      <Form.Control
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.location && !!fieldErrors.location}
                        placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh"
                        required
                      />
                    </div>
                    {touched.location && fieldErrors.location && (
                      <div className="text-danger mt-1">{fieldErrors.location}</div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={12}>
              <h3><FaFileAlt className="me-2" />Thông tin chi tiết</h3>
              <Form.Group className="mb-3">
                <Form.Label>Mô tả công việc</Form.Label>
                <Form.Control
                  as="textarea"
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.jobDescription && !!fieldErrors.jobDescription}
                  rows={5}
                  placeholder="Mô tả chi tiết về công việc, trách nhiệm, yêu cầu, quyền lợi..."
                  required
                />
                {touched.jobDescription && fieldErrors.jobDescription && (
                  <div className="text-danger mt-1">{fieldErrors.jobDescription}</div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Ngày hết hạn</Form.Label>
                <div className="d-flex align-items-center">
                  <FaCalendarAlt className="me-2 text-primary" />
                  <Form.Control
                    type="date"
                    name="expireDate"
                    value={formData.expireDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.expireDate && !!fieldErrors.expireDate}
                    required
                  />
                </div>
                {touched.expireDate && fieldErrors.expireDate && (
                  <div className="text-danger mt-1">{fieldErrors.expireDate}</div>
                )}
              </Form.Group>
            </Col>

            {isEditMode && (
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Trạng thái công việc</Form.Label>
                  <div className="d-flex align-items-center">
                    <FaBriefcase className="me-2 text-primary" />
                    <Form.Select
                      name="jobStatus"
                      value={formData.jobStatus}
                      onChange={handleChange}
                    >
                      <option value="Đang mở">Đang mở</option>
                      <option value="Đã đóng">Đã đóng</option>
                    </Form.Select>
                  </div>
                </Form.Group>
              </Col>
            )}
          </Row>

          <div className="d-flex justify-content-end mt-4">
            <Button
              variant="secondary"
              className="me-2"
              onClick={() => navigate("/employer/jobs")}
            >
              Hủy bỏ
            </Button>
            <Button className="btn-job-primary" type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : isEditMode ? "Cập nhật" : "Tạo công việc"}
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default JobForm; 