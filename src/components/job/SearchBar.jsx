import React, { useState } from "react";
import { InputGroup, Form, Button, Spinner, Dropdown } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { searchJCByKeyword } from "../../services/api";
import "./Job.css";

const SearchBar = ({ onSearch }) => {
  const [selectedJC, setSelectedJC] = useState("");
  const [loading, setLoading] = useState(false);

  const jobCategories = [
    { id: 1, name: "An ninh mạng", value: "An ninh mạng" },
    { id: 2, name: "AR/VR", value: "AR/VR" },
    { id: 3, name: "Blockchain", value: "Blockchain" },
    { id: 4, name: "DevOps & SRE", value: "DevOps & SRE" },
    { id: 5, name: "Điện toán đám mây", value: "Điện toán đám mây" },
    { id: 6, name: "Internet vạn vật (IoT)", value: "Internet vạn vật (IoT)" },
    { id: 7, name: "Kiểm thử phần mềm", value: "Kiểm thử phần mềm" },
    { id: 8, name: "Kỹ thuật dữ liệu", value: "Kỹ thuật dữ liệu" },
    { id: 9, name: "Khoa học dữ liệu", value: "Khoa học dữ liệu" },
    { id: 10, name: "Lập trình Backend", value: "Lập trình Backend" },
    { id: 11, name: "Lập trình Frontend", value: "Lập trình Frontend" },
    { id: 12, name: "Phát triển game", value: "Phát triển game" },
    { id: 13, name: "Phát triển ứng dụng di động", value: "Phát triển ứng dụng di động" },
    { id: 14, name: "Phát triển Web", value: "Phát triển Web" },
    { id: 15, name: "Phân tích nghiệp vụ", value: "Phân tích nghiệp vụ" },
    { id: 16, name: "Quản lý dự án CNTT", value: "Quản lý dự án CNTT" },
    { id: 17, name: "Quản trị hệ thống", value: "Quản trị hệ thống" },
    { id: 18, name: "Thiết kế đồ họa", value: "Thiết kế đồ họa" },
    { id: 19, name: "Thiết kế UX/UI", value: "Thiết kế UX/UI" },
    { id: 20, name: "Trí tuệ nhân tạo", value: "Trí tuệ nhân tạo" },
  ];

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (selectedJC) {
      console.log("Tìm kiếm theo danh mục công việc:", selectedJC);
      setLoading(true);
      
      // Call onSearch with the selected category
      onSearch(selectedJC);
      setLoading(false);
    }
  };

  const handleSelect = (jcName) => {
    setSelectedJC(jcName);
    // Auto-submit after selection
    setTimeout(() => {
      handleSubmit();
    }, 100);
  };

  return (
    <Form onSubmit={handleSubmit} className="search-bar">
      <div className="search-container">
        <Dropdown className="search-dropdown">
          <Dropdown.Toggle variant="light" id="dropdown-job-categories" className="w-100 text-start" disabled={loading}>
            <span>{selectedJC || "Chọn danh mục công việc..."}</span>
          </Dropdown.Toggle>

          <Dropdown.Menu className="w-100">
            {jobCategories.map((category) => (
              <Dropdown.Item 
                key={category.id} 
                onClick={() => handleSelect(category.value)}
              >
                {category.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <Button 
          type="submit" 
          className="search-button" 
          disabled={loading || !selectedJC}
          aria-label="Tìm kiếm"
        >
          {loading ? <Spinner animation="border" size="sm" /> : <FaSearch className="search-icon" />}
        </Button>
      </div>
    </Form>
  );
};

export default SearchBar; 