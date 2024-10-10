const prisma = require("./prisma/client");
const fs = require("fs");

(async () => {
	try {
		const data = fs.readFileSync("./job.json", "utf8");
		const jsData = JSON.parse(data);
		const empId = "0276b813-b301-404f-a659-159883698214";

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
