import React, { useState } from "react";
import { InputGroup, Form, Button } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import "./Job.css";

const SearchBar = ({ onSearch }) => {
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(keyword);
  };

  return (
    <Form onSubmit={handleSubmit} className="search-bar">
      <InputGroup>
        <Form.Control
          type="text"
          placeholder="Tìm kiếm công việc..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button type="submit" className="btn-job-primary">
          <FaSearch />
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SearchBar; 