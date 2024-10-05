# ENDPOINTS

### **ServerStatus**

- **GET /status:** Returns the Server Connection Status

### **Job Seeker Enpoint**

- **POST /user/signup:** Register a new user (job seeker).
- **POST /user/login:** User login. (create jwt)
- **POST /user/forgottenPassword:** Creates a Token for Create a new Password
- **Post /user/resetPassword:** application to Create a new password and return a new jwt
- **GET /user/profile:** Fetch the user's profile (requires authentication).
- **PATCH /user/profile:** Update the user's profile (requires authentication).
- **DELETE /user/profile:** Users Deletes his/her profile (requires authentication).
- **POST user/jobs/{job_id}/apply:** Apply for a specific job (authenticated user).
- **GET /user/applications:** List jobs the user has applied to (authenticated user).

### **Employer Endpoints**

- **POST /employer/signup:** Register a new employer.
- **POST /employer/login:** Employer login.
- **GET /employer/profile:** Fetch the employer's profile (requires authentication).
- **PUT /employer/profile:** Update the employer's profile (requires authentication).
- **POST /employer/job**: Create a new job posting (requires authentication).
- **GET /employer/job:** List jobs posted by the employer (requires authentication)
- **PUT /employer/jobs/{id}:** Update a job posting (employer only).
- **DELETE /employer/jobs/{id}:** Delete a job posting (employer only)
- **GET /employer/job/{job_id}/applications:** List all applicants for a specific job (authenticated employer).
- **GET /employer/job/{job_id}/applications/count:** Get the number of applications for a specific job.

### **Job Search Endpoints**

- **GET /job:** Search for available jobs with filters (e.g., title, location, salary range, pagination).
- **GET /job/{id}:** Get details of a specific job posting.
