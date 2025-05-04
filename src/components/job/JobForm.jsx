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
          errorMessage = "Loại công việc là bắt buộc";
        }
        break;
      case "contractType":
        if (!value.trim()) {
          errorMessage = "Loại hợp đồng là bắt buộc";
        }
        break;
      case "level":
        if (!value.trim()) {
          errorMessage = "Cấp bậc là bắt buộc";
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
                        isInvalid={!!fieldErrors.jobName}
                        placeholder="Ví dụ: Kỹ sư phần mềm"
                        required
                      />
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.jobName}
                    </Form.Control.Feedback>
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
                        isInvalid={!!fieldErrors.jobType}
                        required
                      >
                        <option value="">Chọn loại công việc</option>
                        <option value="IT_SOFTWARE">IT & Phần mềm</option>
                        <option value="FINANCE_BANKING">Tài chính & Ngân hàng</option>
                        <option value="MARKETING">Marketing</option>
                        <option value="SALES">Bán hàng</option>
                        <option value="CUSTOMER_SERVICE">Dịch vụ khách hàng</option>
                        <option value="ADMINISTRATION">Hành chính</option>
                        <option value="HUMAN_RESOURCES">Nhân sự</option>
                        <option value="ACCOUNTING">Kế toán</option>
                        <option value="ENGINEERING">Kỹ thuật</option>
                        <option value="MANUFACTURING">Sản xuất</option>
                        <option value="OTHER">Khác</option>
                      </Form.Select>
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.jobType}
                    </Form.Control.Feedback>
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
                        isInvalid={!!fieldErrors.contractType}
                        required
                      >
                        <option value="">Chọn loại hợp đồng</option>
                        <option value="FULL_TIME">Toàn thời gian</option>
                        <option value="PART_TIME">Bán thời gian</option>
                        <option value="CONTRACT">Hợp đồng</option>
                        <option value="TEMPORARY">Tạm thời</option>
                        <option value="INTERNSHIP">Thực tập</option>
                      </Form.Select>
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.contractType}
                    </Form.Control.Feedback>
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
                        isInvalid={!!fieldErrors.level}
                        required
                      >
                        <option value="">Chọn cấp bậc</option>
                        <option value="INTERN">Thực tập sinh</option>
                        <option value="FRESHER">Mới đi làm</option>
                        <option value="JUNIOR">Nhân viên</option>
                        <option value="MIDDLE">Chuyên viên</option>
                        <option value="SENIOR">Chuyên viên cao cấp</option>
                        <option value="LEADER">Trưởng nhóm</option>
                        <option value="MANAGER">Quản lý</option>
                        <option value="DIRECTOR">Giám đốc</option>
                      </Form.Select>
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.level}
                    </Form.Control.Feedback>
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
                        isInvalid={!!fieldErrors.quantity}
                        min="1"
                        required
                      />
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.quantity}
                    </Form.Control.Feedback>
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
                        isInvalid={!!fieldErrors.salaryFrom}
                        min="0"
                        required
                      />
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.salaryFrom}
                    </Form.Control.Feedback>
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
                        isInvalid={!!fieldErrors.salaryTo}
                        min="0"
                        required
                      />
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.salaryTo}
                    </Form.Control.Feedback>
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
                        isInvalid={!!fieldErrors.requireExpYear}
                        min="0"
                        required
                      />
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.requireExpYear}
                    </Form.Control.Feedback>
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
                        isInvalid={!!fieldErrors.location}
                        placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh"
                        required
                      />
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.location}
                    </Form.Control.Feedback>
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
                  isInvalid={!!fieldErrors.jobDescription}
                  rows={5}
                  placeholder="Mô tả chi tiết về công việc, trách nhiệm, yêu cầu, quyền lợi..."
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.jobDescription}
                </Form.Control.Feedback>
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
                    isInvalid={!!fieldErrors.expireDate}
                    required
                  />
                </div>
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.expireDate}
                </Form.Control.Feedback>
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