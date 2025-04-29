import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { Container, Navbar, Nav, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// Auth components
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Job components
import JobList from "./components/job/JobList";
import JobForm from "./components/job/JobForm";
import JobDetail from "./components/job/JobDetail";
import JobEditForm from "./components/job/JobEditForm";

// Application components
import ApplicationList from "./components/application/ApplicationList";
import ApplicationForm from "./components/application/ApplicationForm";
import ApplicationDetail from "./components/application/ApplicationDetail";

// Navigation component with authentication
const Navigation = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          ITWorks
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/jobs">
              Công việc
            </Nav.Link>

            {isAuthenticated && currentUser?.userType === "EMPLOYER" && (
              <>
                <Nav.Link as={Link} to="/employer/jobs">
                  Việc của tôi
                </Nav.Link>
                <Nav.Link as={Link} to="/employer/jobs/new">
                  Tạo công việc
                </Nav.Link>
              </>
            )}

            {isAuthenticated && currentUser?.userType === "CANDIDATE" && (
              <Nav.Link as={Link} to="/applications">
                Đơn ứng tuyển của tôi
              </Nav.Link>
            )}
          </Nav>

          <Nav>
            {isAuthenticated ? (
              <Button variant="outline-light" onClick={logout}>
                Đăng xuất
              </Button>
            ) : (
              <Nav.Link as={Link} to="/login">
                Đăng nhập
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />

          <Container className="mt-4">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/jobs" replace />} />
              <Route path="/jobs" element={<JobList />} />
              <Route path="/jobs/view/:id" element={<JobDetail />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Employer routes */}
              <Route element={<ProtectedRoute userType="EMPLOYER" />}>
                <Route
                  path="/employer/jobs"
                  element={<JobList employerOnly={true} />}
                />
                <Route path="/employer/jobs/new" element={<JobForm />} />
                <Route
                  path="/employer/jobs/edit/:id"
                  element={<JobEditForm />}
                />
              </Route>

              {/* Protected Candidate routes */}
              <Route element={<ProtectedRoute userType="CANDIDATE" />}>
                <Route path="/applications" element={<ApplicationList />} />
                <Route
                  path="/applications/new/:jobId"
                  element={<ApplicationForm />}
                />
                <Route
                  path="/applications/view/:candidateId/:jobId"
                  element={<ApplicationDetail />}
                />
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/jobs" replace />} />
            </Routes>
          </Container>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
