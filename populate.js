const prisma = require("./prisma/client");
const fs = require("fs");

(async () => {
	try {
		const data = await fs.readFile("./job.json", "utf8");
		const jsData = JSON.parse(data);
		const empId = "71350b20-5624-4d9b-a885-7b241061844b";

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
