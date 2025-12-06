-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_employerId_idx" ON "Job"("employerId");

-- CreateIndex
CREATE INDEX "Job_posted_idx" ON "Job"("posted");

-- CreateIndex
CREATE INDEX "Job_status_posted_idx" ON "Job"("status", "posted");

-- CreateIndex
CREATE INDEX "Application_jobSeekerId_idx" ON "Application"("jobSeekerId");

-- CreateIndex
CREATE INDEX "Application_jobId_idx" ON "Application"("jobId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_createdAt_idx" ON "Application"("createdAt");

-- CreateIndex
CREATE INDEX "Application_jobSeekerId_jobId_idx" ON "Application"("jobSeekerId", "jobId");
