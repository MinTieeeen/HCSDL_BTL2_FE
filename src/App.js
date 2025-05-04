import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { Container, Navbar, Nav, Button, NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Auth components
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Job components
import JobList from "./components/job/JobList";
import JobForm from "./components/job/JobForm";
import JobDetail from "./components/job/JobDetail";
import JobEditForm from "./components/job/JobEditForm";
import JobStats from "./components/job/JobStats";

// Application components
import ApplicationList from "./components/application/ApplicationList";
import ApplicationForm from "./components/application/ApplicationForm";
import ApplicationDetail from "./components/application/ApplicationDetail";

// Layout components
import Footer from "./components/layout/Footer";

// Navigation component with authentication
const Navigation = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [activeLink, setActiveLink] = React.useState("jobs");

  // Set active link based on current path
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("/employer/jobs")) {
      setActiveLink("employer-jobs");
    } else if (path.includes("/employer/stats")) {
      setActiveLink("employer-stats");
    } else if (path.includes("/applications")) {
      setActiveLink("applications");
    } else {
      setActiveLink("jobs");
    }
  }, []);

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="flex-column align-items-start">
        <Container fluid className="flex-column align-items-start p-0">
          <Navbar.Brand as={Link} to="/" className="w-100 text-center mb-4">
            <span className="fw-bold">IT</span>Works
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="mb-2" />
          <Navbar.Collapse id="basic-navbar-nav" className="w-100">
            <Nav className="flex-column w-100">
              {/* Public job link is commented out
              <Nav.Link 
                as={Link} 
                to="/jobs" 
                className={activeLink === "jobs" ? "active" : ""}
                onClick={() => setActiveLink("jobs")}
              >
                Công việc
              </Nav.Link>
              */}

              {isAuthenticated && currentUser?.userType === "EMPLOYER" && (
                <>
                  <Nav.Link 
                    as={Link} 
                    to="/employer/jobs" 
                    className={activeLink === "employer-jobs" ? "active" : ""}
                    onClick={() => setActiveLink("employer-jobs")}
                  >
                    Việc của tôi
                  </Nav.Link>
                  <Nav.Link 
                    as={Link} 
                    to="/employer/jobs/new" 
                    className={activeLink === "new-job" ? "active" : ""}
                    onClick={() => setActiveLink("new-job")}
                  >
                    Tạo công việc
                  </Nav.Link>
                  <Nav.Link 
                    as={Link} 
                    to="/employer/stats" 
                    className={activeLink === "employer-stats" ? "active" : ""}
                    onClick={() => setActiveLink("employer-stats")}
                  >
                    Thống kê ứng tuyển
                  </Nav.Link>
                </>
              )}

              {isAuthenticated && currentUser?.userType === "CANDIDATE" && (
                <>
                  <Nav.Link 
                    as={Link} 
                    to="/jobs" 
                    className={activeLink === "jobs" ? "active" : ""}
                    onClick={() => setActiveLink("jobs")}
                  >
                    Tìm kiếm công việc
                  </Nav.Link>
                  <Nav.Link 
                    as={Link} 
                    to="/applications" 
                    className={activeLink === "applications" ? "active" : ""}
                    onClick={() => setActiveLink("applications")}
                  >
                    Đơn ứng tuyển của tôi
                  </Nav.Link>
                </>
              )}
              
              <div className="mt-auto"></div>
              
              {isAuthenticated && (
                <>
                  <Navbar.Text className="text-light mt-4 mb-2">
                    Xin chào, {currentUser?.username || "User"}
                  </Navbar.Text>
                  <Button 
                    variant="outline-light" 
                    onClick={logout}
                    className="w-100 mt-2"
                  >
                    Đăng xuất
                  </Button>
                </>
              )}
              
              {!isAuthenticated && (
                <Nav.Link 
                  as={Link} 
                  to="/login" 
                  className="mt-4"
                >
                  Đăng nhập
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <div className="navbar-divider"/>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App d-flex">
          <div className="sidebar-container">
            <Navigation />
          </div>
          <div className="content-container">
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
                  <Route path="/employer/stats" element={<JobStats />} />
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

            <Footer />
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
