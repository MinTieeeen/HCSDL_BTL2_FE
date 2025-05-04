import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { FaFilter, FaCalendarAlt, FaBriefcase } from "react-icons/fa";
import "./Job.css";

const FilterModal = ({ show, onHide, onFilter }) => {
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const [postDate, setPostDate] = useState("");
  const [jcName, setJcName] = useState("");

  const handleFilter = () => {
    // Create filter parameters object to match exactly the backend schema
    const filterParams = {
      // Required fields with default values
      action: "get",
      sortOrder: "DESC",
      filter: true
    };
    
    // Add salary filters as numbers (0 if empty)
    filterParams.salaryFrom = salaryFrom === "" ? 0 : Number(salaryFrom);
    filterParams.salaryTo = salaryTo === "" ? 0 : Number(salaryTo);
    
    // Add job category name if specified
    if (jcName) {
      filterParams.jcName = jcName;
    } else {
      filterParams.jcName = ""; // Set empty string as default
    }
    
    // Add post date in ISO format if specified
    if (postDate) {
      const selectedDate = new Date(postDate);
      filterParams.postDate = selectedDate.toISOString();
    }
    
    console.log("Sending filter parameters:", filterParams);
    
    // Call parent filter function
    onFilter(filterParams);
    
    // Close modal
    onHide();
  };

  const resetForm = () => {
    setSalaryFrom("");
    setSalaryTo("");
    setPostDate("");
    setJcName("");
  };

  const handleClearFilter = () => {
    resetForm();
    // Apply default filters matching the schema
    const defaultFilters = {
      action: "get",
      sortOrder: "DESC",
      salaryFrom: 0,
      salaryTo: 0,
      jcName: "",
      postDate: new Date("2000-01-01").toISOString(),
      filter: true
    };
    
    console.log("Clearing filters with:", defaultFilters);
    onFilter(defaultFilters);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="job-detail-header border-0">
        <Modal.Title className="text-white">
          <FaFilter className="me-2" /> Lọc công việc
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="px-4 py-3">
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>
              <FaBriefcase className="me-2" />
              Loại công việc
            </Form.Label>
            <Form.Select
              value={jcName}
              onChange={(e) => setJcName(e.target.value)}
            >
              <option value="">Tất cả loại công việc</option>
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
          </Form.Group>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Mức lương từ</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="VND"
                  value={salaryFrom}
                  onChange={(e) => setSalaryFrom(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Mức lương đến</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="VND"
                  value={salaryTo}
                  onChange={(e) => setSalaryTo(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>
              <FaCalendarAlt className="me-2" />
              Ngày đăng từ
            </Form.Label>
            <Form.Control
              type="date"
              value={postDate}
              onChange={(e) => setPostDate(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      
      <Modal.Footer className="border-0 px-4 pb-4">
        <Button variant="secondary" onClick={() => {
          resetForm();
          onHide();
        }}>
          Hủy
        </Button>
        <Button variant="danger" className="mx-2" onClick={handleClearFilter}>
          Xóa bộ lọc
        </Button>
        <Button className="btn-job-primary" onClick={handleFilter}>
          Áp dụng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FilterModal; 