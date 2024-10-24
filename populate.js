const prisma = require("./prisma/client");
const fs = require("fs").promises;

(async () => {
	try {
		const data = await fs.readFile("./job.json", "utf8");
		const jsData = JSON.parse(data);
		const empId = "844e576a-1f6c-4b29-8fa3-52c023813a67";

		// Insert each job into the database
		for (const element of jsData) {
			// Check if JobCategory already exists
			if (element.JobCategory) {
				await prisma.jobCategory.findUnique({
					where: { name: element.JobCategory },
				});
			}

			await prisma.job.create({
				data: {
					employerId: empId,
					...element,
					JobCategory: {
						connectOrCreate: {
							where: { name: element.JobCategory },
							create: { name: element.JobCategory },
						},
					},
				},
			});
		}

		console.log("Data insertion complete");
	} catch (error) {
		console.error("Error inserting data:", error);
	} finally {
		await prisma.$disconnect();
	}
})();
