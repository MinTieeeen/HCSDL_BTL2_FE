import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import ErrorHandler from '../common/ErrorHandler';

const PageLayout = ({ title, children, error, action, loading }) => {
  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col>
              <h2 className="mb-0">{title}</h2>
            </Col>
            {action && (
              <Col xs="auto">
                {action}
              </Col>
            )}
          </Row>
        </Card.Header>
        <Card.Body>
          {error && <ErrorHandler error={error} />}
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading...</p>
            </div>
          ) : (
            children
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PageLayout; 