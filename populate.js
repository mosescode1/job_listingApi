const prisma = require("./prisma/client");
const fs = require("fs");

(async () => {
	try {
		const data = fs.readFileSync("./job.json", "utf8");
		const jsData = JSON.parse(data);
		const empId = "de4857b7-d1ce-4fea-8347-e0c133e2c1f5";

		for (const element of jsData) {
			await prisma.job.create({
				data: {
					employerId: empId,
					...element,
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
