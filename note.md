model JobSeeker {
id Int @id @default(autoincrement())
email String @unique
password String
firstName String
lastName String
phone String?
location String?
bio String? // A brief bio or resume summary
resumeUrl String? // URL to the resume file
avatarUrl String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
applications Application[]
}

model Employer {
id Int @id @default(autoincrement())
email String @unique
password String
companyName String // Name of the company posting jobs
companyWebsite String?
location String?
phone String?
bio String? // Company description
avatarUrl String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
jobsPosted Job[] @relation("JobsPostedByEmployer")
}

model Job {
id Int @id @default(autoincrement())
title String
description String
category String // e.g., "Software", "Marketing"
jobType JobType // Full-time, Part-time, etc.
salaryRange String?
location String // Physical location or "Remote"
isRemote Boolean @default(false)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
status JobStatus // Active or Closed
employerId Int
employer Employer @relation("JobsPostedByEmployer", fields: [employerId], references: [id])
applications Application[]
}

model Application {
id Int @id @default(autoincrement())
coverLetter String? // Optional cover letter text
resumeUrl String? // URL to the resume submitted with the application
status ApplicationStatus @default(Pending)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Relation to the JobSeeker (who applied)
jobSeekerId Int
jobSeeker JobSeeker @relation(fields: [jobSeekerId], references: [id])

// Relation to the Job (being applied for)
jobId Int
job Job @relation(fields: [jobId], references: [id])
}

model Admin {
id Int @id @default(autoincrement())
email String @unique
password String
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

// OPTIONAL: Job Category Model (for structured job categorization)
model JobCategory {
id Int @id @default(autoincrement())
name String @unique // e.g., "Software", "Marketing", "Design"
jobs Job[]
}

// OPTIONAL: Notifications Model (for sending job updates or reminders to job seekers)
model Notification {
id Int @id @default(autoincrement())
message String
isRead Boolean @default(false)
createdAt DateTime @default(now())
userId Int
jobSeeker JobSeeker @relation(fields: [userId], references: [id])
}

// OPTIONAL: Saved Jobs Model (for job seekers to save jobs they are interested in)
model SavedJob {
id Int @id @default(autoincrement())
createdAt DateTime @default(now())
jobSeekerId Int
jobSeeker JobSeeker @relation(fields: [jobSeekerId], references: [id])
jobId Int
job Job @relation(fields: [jobId], references: [id])
}

enum JobType {
FullTime
PartTime
Freelance
Contract
Internship
}

enum JobStatus {
Active
Closed
}

enum ApplicationStatus {
Pending
Accepted
Rejected
}
