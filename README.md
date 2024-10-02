# ENDPOINTS

### **ServerStatus**

- **GET /status:** Returns the Server Connection Status

### **User Enpoint**

- **POST /users/register:** Register a new user (job seeker).
- **POST /users/login:** User login. (create jwt)
- **GET /users/profile:** Fetch the user's profile (requires authentication).
- **PUT /users/profile:** Update the user's profile (requires authentication).
- **DELETE /users/profile:** Users Deletes his/her profile (requires authentication).
- **GET /employers/jobs/{job_id}/applications:** List all applicants for a specific job (authenticated employer).
- **GET /employers/jobs/{job_id}/applications/count:** Get the number of applications for a specific job.

### **Employer Endpoints**

- **POST /employers/register:** Register a new employer.
- **POST /employers/login:** Employer login.
- **GET /employers/profile:** Fetch the employer's profile (requires authentication).
- **PUT /employers/profile:** Update the employer's profile (requires authentication).
- **POST /employers/jobs**: Create a new job posting (requires authentication).
- **GET /employers/jobs:** List jobs posted by the employer (requires authentication).

### **Job Search Endpoints**

- **GET /jobs:** Search for available jobs with filters (e.g., title, location, salary range).
- **GET /jobs/{id}:** Get details of a specific job posting.
- **PUT /jobs/{id}:** Update a job posting (employer only).
- **DELETE /jobs/{id}:** Delete a job posting (employer only)

### **Job Seeker Endpoints**

- **POST /jobs/{job_id}/apply:** Apply for a specific job (authenticated user).
- **GET /users/applications:** List jobs the user has applied to (authenticated user).
