import React from 'react';
import { Alert } from 'react-bootstrap';

const ErrorHandler = ({ error }) => {
  if (!error) return null;
  
  let errorMessage = '';
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error.response) {
    // Server responded with a status other than 200 range
    if (error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    } else if (error.response.data && error.response.data.errors) {
      // For validation errors that return an array of errors
      errorMessage = Object.values(error.response.data.errors)
        .flat()
        .join(', ');
    } else {
      errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
    }
  } else if (error.request) {
    // Request was made but no response received
    errorMessage = 'No response received from server. Please check your connection.';
  } else {
    // Something else happened
    errorMessage = error.message || 'An unknown error occurred';
  }
  
  return (
    <Alert variant="danger">
      {errorMessage}
    </Alert>
  );
};

export default ErrorHandler; 