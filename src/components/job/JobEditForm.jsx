import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { employerService, jobService } from "../../services/api";
import { FaBriefcase, FaUser, FaMoneyBillWave, FaMapMarkerAlt, FaCalendarAlt, FaEdit, FaFileAlt } from "react-icons/fa";
import "./Job.css";

const JobEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    jobName: "",
    jobType: "",
    contractType: "",
    level: "",
    quantity: 1,
    salaryFrom: 0,
    salaryTo: 0,
    requireExpYear: 0,
    location: "",
    jobDescription: "",
    expireDate: "",
    jobStatus: "Đang mở",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Kiểm tra id hợp lệ (không undefined, không null, không rỗng, không phải "undefined")
    if (!id || id === "undefined" || id === null || id === "") {
      setError("Job ID is missing or invalid. Cannot fetch job details.");
      return;
    }
    fetchJobDetails();
    // eslint-disable-next-line
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      // Sử dụng employerService.getMyJobs() để lấy danh sách job của employer, sau đó tìm job theo id
      // hoặc nếu backend có endpoint riêng cho employer lấy job theo id, hãy dùng endpoint đó.
      // Nếu không, kiểm tra quyền truy cập hoặc token.
      const response = await jobService.getJobById(id);
      const jobData = response.data;
      // Format expireDate for input[type="date"]
      const expireDate = jobData.expireDate
        ? new Date(jobData.expireDate).toISOString().split("T")[0]
        : "";
      setFormData({
        ...jobData,
        expireDate,
      });
    } catch (err) {
      setError(
        "Không thể tải thông tin công việc. Vui lòng kiểm tra quyền của bạn hoặc trạng thái đăng nhập."
      );
      console.error("Error fetching job details:", err);
      if (err.response && err.response.data) {
        console.error("Backend trả về:", err.response.data);
        // Nếu lỗi 403, gợi ý người dùng kiểm tra quyền hoặc đăng nhập lại
        if (err.response.status === 403) {
          setError(
            "Bạn không có quyền truy cập công việc này. Vui lòng kiểm tra lại quyền hoặc đăng nhập lại."
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value) => {
    let errorMessage = "";
    switch (name) {
      case "jobName":
        if (!value.trim()) errorMessage = "Tên công việc là bắt buộc";
        break;
      case "jobType":
        if (!value.trim()) errorMessage = "Loại công việc là bắt buộc";
        break;
      case "contractType":
        if (!value.trim()) errorMessage = "Loại hợp đồng là bắt buộc";
        break;
      case "level":
        if (!value.trim()) errorMessage = "Cấp bậc là bắt buộc";
        break;
      case "quantity":
        if (Number(value) <= 0)
          errorMessage = "Số lượng phải lớn hơn 0";
        break;
      case "salaryFrom":
        if (Number(value) < 0) errorMessage = "Lương không thể âm";
        break;
      case "salaryTo":
        if (Number(value) <= 0) errorMessage = "Lương phải lớn hơn 0";
        else if (Number(value) < Number(formData.salaryFrom))
          errorMessage =
            "Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu";
        break;
      case "requireExpYear":
        if (Number(value) < 0)
          errorMessage = "Kinh nghiệm không thể âm";
        break;
      case "location":
        if (!value.trim()) errorMessage = "Địa điểm là bắt buộc";
        break;
      case "jobDescription":
        if (!value.trim()) errorMessage = "Mô tả công việc là bắt buộc";
        break;
      case "expireDate":
        const currentDate = new Date();
        const selectedDate = new Date(value);
        if (!value) errorMessage = "Ngày hết hạn là bắt buộc";
        else if (selectedDate <= currentDate)
          errorMessage = "Ngày hết hạn phải trong tương lai";
        break;
      case "jobStatus":
        if (!["Đang mở", "Đã đóng", "Đã hết hạn"].includes(value))
          errorMessage = "Trạng thái công việc không hợp lệ";
        break;
      default:
        break;
    }
    return errorMessage;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["quantity", "salaryFrom", "salaryTo", "requireExpYear"].includes(
        name
      )
        ? Number(value)
        : value,
    }));
    setFieldErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setFieldErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const validateForm = () => {
    let isValid = true;
    let newFieldErrors = {};
    Object.keys(formData).forEach((key) => {
      const errorMessage = validateField(key, formData[key]);
      newFieldErrors[key] = errorMessage;
      if (errorMessage) isValid = false;
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
    if (!validateForm()) return;
    try {
      setLoading(true);
      const submitData = {
        ...formData,
        expireDate: formData.expireDate
          ? `${formData.expireDate}T00:00:00`
          : "",
      };
      await employerService.updateJob(id, submitData);
      alert("Cập nhật công việc thành công!");
      navigate("/employer/jobs");
    } catch (err) {
      setError("Cập nhật công việc thất bại. Vui lòng kiểm tra đầu vào và thử lại.");
      console.error("Error updating job:", err);
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
          <FaEdit className="me-2" />
          Chỉnh sửa công việc
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
              {loading ? "Đang cập nhật..." : "Cập nhật công việc"}
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default JobEditForm; 