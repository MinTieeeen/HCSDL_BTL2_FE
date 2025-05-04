import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { FaFilter, FaCalendarAlt } from "react-icons/fa";
import "./Job.css";

const FilterModal = ({ show, onHide, onFilter }) => {
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const [postDate, setPostDate] = useState("");
  const [onlyOpenJobs, setOnlyOpenJobs] = useState(false);

  const handleFilter = () => {
    // Create filter parameters object to match exactly the btl2-1.5b format
    const filterParams = {
      action: "get",
      sortOrder: "DESC"
    };
    
    // Add filter parameters only if they have values - using the exact same format as btl2-1.5b
    // Important: Convert numeric values to strings to avoid Integer to String casting errors in backend
    if (salaryFrom !== "") {
      filterParams.salaryFrom = String(Number(salaryFrom));
    }
    
    if (salaryTo !== "") {
      filterParams.salaryTo = String(Number(salaryTo));
    }
    
    // Format the date exactly like btl2-1.5b if present
    if (postDate) {
      const formattedDate = `${postDate}T01:37:03.773Z`;
      filterParams.postDate = formattedDate;
    }
    
    // Set filter flag as a string "0" or "1" instead of boolean
    filterParams.filter = onlyOpenJobs ? "1" : "0";
    
    // If only open jobs is selected, set the job status as a string
    if (onlyOpenJobs) {
      filterParams.jobStatus = "Đang mở";
    }
    
    console.log("Sending filter parameters:", filterParams);
    console.log("Payload gửi đi:", JSON.stringify(filterParams, null, 2));
    
    // Call parent filter function
    onFilter(filterParams);
    
    // Close modal
    onHide();
  };

  const resetForm = () => {
    setSalaryFrom("");
    setSalaryTo("");
    setPostDate("");
    setOnlyOpenJobs(false);
  };

  const handleClearFilter = () => {
    resetForm();
    // Apply default filters matching the btl2-1.5b schema
    const defaultFilters = {
      action: "get",
      sortOrder: "DESC",
      postDate: new Date("2000-01-01").toISOString(),
      filter: false
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
          
          <Form.Group className="mb-3">
            <Form.Check 
              type="checkbox"
              id="open-jobs-check"
              label="Chỉ hiển thị việc đang mở"
              checked={onlyOpenJobs}
              onChange={() => setOnlyOpenJobs(!onlyOpenJobs)}
              className="filter-checkbox"
            />
          </Form.Group>
          
          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={() => {
              resetForm();
              onHide();
            }} className="me-2">
              Hủy
            </Button>
            <Button variant="danger" className="me-2" onClick={handleClearFilter}>
              Xóa bộ lọc
            </Button>
            <Button className="btn-job-primary" onClick={handleFilter}>
              Áp dụng
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default FilterModal; 