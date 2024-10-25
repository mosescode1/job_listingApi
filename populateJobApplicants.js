const prisma = require("./prisma/client");
const fs = require("fs").promises;

(async () => {
  try {
    const data = await fs.readFile('./applicants.json', "utf8");
    const applicationsData = JSON.parse(data);

    for (const application of applicationsData) {
      await prisma.application.create({
        data: {
          firstName: application.firstName,
          lastName: application.lastName,
          email: application.email,
          phone: application.phone,
          proposal: application.proposal,
          resumeUrl: application.resumeUrl,
          jobSeekerId: application.userId,
          jobId: "c9a7d752-92ef-48c6-b5ec-7919f61b7a84",
        },
      });
    }

    console.log("Job applications successfully populated.");
  } catch (error) {
    console.error("Error populating job applications:", error);
  } finally {
    await prisma.$disconnect();
  }
})();

// Example usage:
