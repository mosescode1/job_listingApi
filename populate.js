const prisma = require("./prisma/client");
const fs = require("fs");

(async () => {
	try {
		const data = fs.readFileSync("./job.json", "utf8");
		const jsData = JSON.parse(data);
		const empId = "72c76aa8-cd93-4ace-9491-ddd445c61fff";

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
