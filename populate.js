const prisma = require("./prisma/client");
const fs = require("fs").promises;

(async () => {
	try {
		const data = await fs.readFile("./job.json", "utf8");
		const jsData = JSON.parse(data);
		const empId = "69f8efb3-ff91-4ea0-8015-247b458cbac2";

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
