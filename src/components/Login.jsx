import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { FaUser, FaLock, FaBuilding, FaUserTie, FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('EMPLOYER'); // Default to EMPLOYER
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await authService.login(username, password, userType);
      console.log('Login successful:', response);
      
      // Update auth context
      login(response.data);
      
      // Set a flag in session storage to indicate redirecting after reload
      sessionStorage.setItem('loginRedirect', userType);
      
      // Reload the page to ensure the app recognizes the user
      window.location.reload();
      
      // The redirect will happen in useEffect
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle redirect after page reload
  useEffect(() => {
    const redirectPath = sessionStorage.getItem('loginRedirect');
    if (redirectPath) {
      // Clear the redirect information
      sessionStorage.removeItem('loginRedirect');
      
      // Redirect based on user type
      if (redirectPath === 'EMPLOYER') {
        navigate('/employer/jobs');
      } else {
        navigate('/applications');
      }
    }
  }, [navigate]);

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="border-0 shadow-lg">
            <Card.Header className="bg-primary text-white text-center py-4">
              <h3 className="mb-0">Đăng nhập hệ thống</h3>
            </Card.Header>
            <Card.Body className="p-5">
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Tên đăng nhập</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaUser />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nhập tên đăng nhập"
                      required
                    />
                  </InputGroup>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Mật khẩu</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaLock />
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      required
                    />
                    <Button 
                      variant="outline-secondary"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Vai trò</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      {userType === 'EMPLOYER' ? <FaBuilding /> : <FaUserTie />}
                    </InputGroup.Text>
                    <Form.Select
                      value={userType}
                      onChange={(e) => setUserType(e.target.value)}
                      required
                    >
                      <option value="EMPLOYER">Nhà tuyển dụng</option>
                      <option value="CANDIDATE">Ứng viên</option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
                
                <div className="d-grid gap-2 mt-5">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>Đang đăng nhập...</>
                    ) : (
                      <>
                        <FaSignInAlt className="me-2" />
                        Đăng nhập
                      </>
                    )}
                  </Button>
                </div>
              </Form>
              
              <div className="mt-4 text-center">
                <p className="mb-0">
                  Chưa có tài khoản? <Link to="/register" className="text-primary">Đăng ký ngay</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login; 