import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaLinkedin, FaGithub, FaEnvelope, FaPhone } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <Row>
          <Col md={4} className="mb-3 mb-md-0">
            <h5>ITWorks</h5>
            <p className="text-muted">
              Nền tảng kết nối nhà tuyển dụng với ứng viên trong lĩnh vực Công nghệ thông tin.
            </p>
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
            <h5>Liên kết</h5>
            <ul className="list-unstyled">
              <li><a href="/jobs" className="text-decoration-none text-light">Việc làm</a></li>
              <li><a href="/applications" className="text-decoration-none text-light">Đơn ứng tuyển</a></li>
              <li><a href="/employer/jobs" className="text-decoration-none text-light">Dành cho nhà tuyển dụng</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Liên hệ</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <FaEnvelope className="me-2" /> support@itworks.com
              </li>
              <li className="mb-2">
                <FaPhone className="me-2" /> +84 123 456 789
              </li>
              <li className="d-flex">
                <a href="https://linkedin.com" className="text-light me-3" target="_blank" rel="noreferrer">
                  <FaLinkedin size={24} />
                </a>
                <a href="https://github.com" className="text-light" target="_blank" rel="noreferrer">
                  <FaGithub size={24} />
                </a>
              </li>
            </ul>
          </Col>
        </Row>
        <hr className="my-4" />
        <div className="text-center">
          <p className="mb-0">© {currentYear} ITWorks. Tất cả các quyền được bảo lưu.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer; 