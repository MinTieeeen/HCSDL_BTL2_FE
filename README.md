# Job Application Manager

A React application for managing jobs and job applications using SQL stored procedures.

## Features

- **Job Management**: Create, view, edit, and delete job listings
- **Application Management**: Submit, update, and track job applications

## Prerequisites

- Node.js and npm
- SQL Server (or another SQL database) with the provided stored procedures installed

## Project Setup

1. Clone this repository
2. Install dependencies:
   ```
   cd job-application-manager
   npm install
   ```
3. Configure the backend:
   - The application expects a backend API running at `http://localhost:5000/api`
   - Make sure to implement a backend API that connects to the SQL database and uses the stored procedures in the HCSDL_1.2.1.sql file

## Running the Application

Start the development server:
```
npm start
```

The application will be available at http://localhost:3000

## Project Structure

```
job-application-manager/
│
├── public/                 # Static files
├── src/                    # Source code
│   ├── components/         # React components
│   │   ├── job/            # Job-related components
│   │   │   ├── JobList.js
│   │   │   ├── JobForm.js
│   │   │   └── JobDetail.js
│   │   │
│   │   └── application/    # Application-related components
│   │       ├── ApplicationList.js
│   │       ├── ApplicationForm.js
│   │       └── ApplicationDetail.js
│   │
│   ├── services/           # API services
│   │   └── api.js          # API calls to the backend
│   │
│   ├── App.js              # Main App component with routing
│   └── index.js            # Entry point
│
└── package.json            # Dependencies and scripts
```

## Backend Implementation

The front-end expects the following API endpoints:

### Jobs
- GET `/api/jobs` - Get all jobs
- GET `/api/jobs/:id` - Get job by ID
- POST `/api/jobs` - Create a new job
- PUT `/api/jobs/:id` - Update a job
- DELETE `/api/jobs/:id` - Delete a job

### Applications
- GET `/api/applications` - Get all applications
- GET `/api/applications/:candidateId/:jobId` - Get application by candidate and job IDs
- POST `/api/applications` - Create a new application
- PUT `/api/applications/:candidateId/:jobId` - Update an application
- DELETE `/api/applications/:candidateId/:jobId` - Delete an application

## Stored Procedures

This application uses the following SQL stored procedures:

- `InsertJob` - Add a new job
- `UpdateJob` - Update an existing job
- `DeleteJob` - Delete a job
- `InsertApplication` - Submit a new job application
- `UpdateApplication` - Update an existing application
- `DeleteApplication` - Delete an application
