const prisma = require("../prisma/client");
const fs = require("fs").promises;

(async () => {
	try {
		const data = await fs.readFile("./populateData/job.json", "utf8");
		const jsData = JSON.parse(data);
		const empId = "fdb2bed0-cac2-40a0-816a-7c279de7eea9";

		// Insert each job into the database
		for (const element of jsData) {

			const { jobCategoryIds, ...data } = element;
			await prisma.job.create({
				data: {
					employerId: empId,
					...data,
					jobCategory: {
						connect: { id: jobCategoryIds }
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
