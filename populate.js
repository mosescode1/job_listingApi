const prisma = require("./prisma/client");
const fs = require("fs");

(async () => {
	try {
		const data = fs.readFileSync("./job.json", "utf8");
		const jsData = JSON.parse(data);
		const empId = "b8380e56-ab05-4b5a-8eb6-aeed1eef18e5";

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
