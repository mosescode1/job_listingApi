const prisma = require("./prisma/client");

(async () => {
	try {
		const categories = [
			{ name: "Junior Frontend Developer" },
			{ name: "Senior Frontend Developer" },
			{ name: "Junior Backend Developer" },
			{ name: "Senior Backend Developer" },
			{ name: "Technology" },
			{ name: "Software Development" },
			{ name: "IT Support" },
			{ name: "Data Science" },
			{ name: "Cybersecurity" },
			{ name: "Web Development" },
			{ name: "Healthcare" },
			{ name: "Nursing" },
			{ name: "Medicine" },
			{ name: "Pharmacy" },
			{ name: "Physical Therapy" },
			{ name: "Healthcare Administration" },
			{ name: "Finance" },
			{ name: "Accounting" },
			{ name: "Financial Analysis" },
			{ name: "Investment Banking" },
			{ name: "Insurance" },
			{ name: "Auditing" },
			{ name: "Education" },
			{ name: "Teaching" },
			{ name: "Administration" },
			{ name: "Curriculum Development" },
			{ name: "Educational Technology" },
			{ name: "Special Education" },
			{ name: "Engineering" },
			{ name: "Civil Engineering" },
			{ name: "Mechanical Engineering" },
			{ name: "Electrical Engineering" },
			{ name: "Chemical Engineering" },
			{ name: "Aerospace Engineering" },
			{ name: "Marketing" },
			{ name: "Digital Marketing" },
			{ name: "Brand Management" },
			{ name: "Market Research" },
			{ name: "Content Creation" },
			{ name: "Social Media Management" },
			{ name: "Sales" },
			{ name: "Business Development" },
			{ name: "Account Management" },
			{ name: "Retail Sales" },
			{ name: "Inside Sales" },
			{ name: "Outside Sales" },
			{ name: "Human Resources" },
			{ name: "Recruitment" },
			{ name: "Employee Relations" },
			{ name: "Compensation and Benefits" },
			{ name: "Training and Development" },
			{ name: "HR Administration" },
			{ name: "Manufacturing" },
			{ name: "Production Management" },
			{ name: "Quality Control" },
			{ name: "Supply Chain Management" },
			{ name: "Logistics" },
			{ name: "Assembly Line Work" },
			{ name: "Creative Arts" },
			{ name: "Graphic Design" },
			{ name: "Photography" },
			{ name: "Film and Video Production" },
			{ name: "Music" },
			{ name: "Writing and Editing" },
			{ name: "Hospitality" },
			{ name: "Hotel Management" },
			{ name: "Food and Beverage Service" },
			{ name: "Event Planning" },
			{ name: "Travel and Tourism" },
			{ name: "Customer Service" },
			{ name: "Construction" },
			{ name: "Project Management" },
			{ name: "Site Management" },
			{ name: "Skilled Trades" },
			{ name: "Safety Management" },
			{ name: "Estimation and Costing" },
			{ name: "Legal" },
			{ name: "Law Practice" },
			{ name: "Paralegal Services" },
			{ name: "Compliance" },
			{ name: "Contract Management" },
			{ name: "Legal Research" },
			{ name: "Research and Development" },
			{ name: "Scientific Research" },
			{ name: "Product Development" },
			{ name: "Market Research" },
			{ name: "Clinical Trials" },
			{ name: "Innovation Management" },
			{ name: "Public Sector" },
			{ name: "Government Administration" },
			{ name: "Policy Analysis" },
			{ name: "Public Health" },
			{ name: "Nonprofit Management" },
			{ name: "Community Services" }
		];

		await prisma.jobCategory.createMany({
			data: categories,
			skipDuplicates: true // Optional, if you want to avoid duplicates
		});

		console.log("Job categories inserted successfully.");
	} catch (error) {
		console.error("Error inserting job categories:", error);
	} finally {
		await prisma.$disconnect();
	}
})();