const prisma = require("../prisma/client");


const empId = "bfb10017-0fae-4901-91d1-786455e1bcb2";


const insertData = async (data, jobCategoryIds) => {
	try {
		await prisma.job.create({
			data: {
				employerId: empId,
				...data,
				jobCategory: {
					connect: { id: jobCategoryIds }
				},
			},
		});

		console.log("Data insertion complete");
	} catch (error) {
		console.error("Error inserting data:", error);
	} finally {
		await prisma.$disconnect();
	}

}
const jsData = [
	{
		"title": "Data Analyst",
		"company": "InsightGen",
		"pay": "$85,000 - $110,000",
		"type": "FullTime",
		"averagePay": "$97,500",
		"jobCategoryIds": "f3fad9d4-3178-4aa0-a006-a6725893f30a",
		"aboutCompany": "InsightGen provides data-driven solutions for businesses.",
		"location": "San Diego, CA",
		"shortRoleDescription": "Analyze and interpret complex data sets.",
		"fullRoleDescription": "As a Data Analyst, you will gather insights from data to help guide business decisions.",
		"keyResponsibility": "Create reports and dashboards to present findings.",
		"qualificationAndExperience": "Bachelor’s degree in Data Science or related field, 2+ years of experience.",
		"methodOfApplication": "Apply through insightgen.com/careers.",
		"deadline": "March 30, 2025",
		"status": "Active"
	},
	{
		"title": "Marketing Specialist",
		"company": "BrandBoost",
		"pay": "$70,000 - $90,000",
		"type": "FullTime",
		"averagePay": "$80,000",
		"jobCategoryIds": "bf56ebc3-a1dd-42d8-8cb3-b982de367004",
		"aboutCompany": "BrandBoost specializes in digital marketing solutions.",
		"location": "Los Angeles, CA",
		"shortRoleDescription": "Develop and implement marketing strategies.",
		"fullRoleDescription": "As a Marketing Specialist, you will create and execute marketing campaigns to promote products and services.",
		"keyResponsibility": "Analyze market trends and customer behavior.",
		"qualificationAndExperience": "Bachelor’s degree in Marketing or related field, 2+ years of experience.",
		"methodOfApplication": "Apply through brandboost.com/careers.",
		"deadline": "May 10, 2025",
		"status": "Active"
	},
	{
		"title": "HR Manager",
		"company": "PeopleFirst",
		"pay": "$80,000 - $100,000",
		"type": "FullTime",
		"averagePay": "$90,000",
		"jobCategoryIds": "b43259b2-7b72-4e78-b4a5-a0a5ef8f4e54",
		"aboutCompany": "PeopleFirst is a human resources consulting firm.",
		"location": "Chicago, IL",
		"shortRoleDescription": "Manage HR operations.",
		"fullRoleDescription": "As an HR Manager, you will oversee recruitment, employee relations, and compliance.",
		"keyResponsibility": "Develop and implement HR policies.",
		"qualificationAndExperience": "Bachelor’s degree in Human Resources or related field, 4+ years of experience.",
		"methodOfApplication": "Apply through peoplefirst.com/careers.",
		"deadline": "June 1, 2025",
		"status": "Active"
	},
	{
		"title": "Graphic Designer",
		"company": "CreativeWorks",
		"pay": "$60,000 - $80,000",
		"type": "FullTime",
		"averagePay": "$70,000",
		"jobCategoryIds": "d77828e7-cad4-41ed-b832-a905f70ba306",
		"aboutCompany": "CreativeWorks is a design agency.",
		"location": "Austin, TX",
		"shortRoleDescription": "Create visual content.",
		"fullRoleDescription": "As a Graphic Designer, you will design graphics for various media.",
		"keyResponsibility": "Develop creative concepts and layouts.",
		"qualificationAndExperience": "Bachelor’s degree in Graphic Design or related field, 3+ years of experience.",
		"methodOfApplication": "Apply through creativeworks.com/careers.",
		"deadline": "May 20, 2025",
		"status": "Active"
	},
	{
		"title": "Sales Manager",
		"company": "SalesForce",
		"pay": "$90,000 - $120,000",
		"type": "FullTime",
		"averagePay": "$105,000",
		"jobCategoryIds": "2e877657-722b-4964-ae79-1b82d3267a25",
		"aboutCompany": "SalesForce is a sales and marketing company.",
		"location": "Seattle, WA",
		"shortRoleDescription": "Lead the sales team.",
		"fullRoleDescription": "As a Sales Manager, you will manage the sales team and develop sales strategies.",
		"keyResponsibility": "Achieve sales targets and expand customer base.",
		"qualificationAndExperience": "Bachelor’s degree in Business or related field, 5+ years of experience.",
		"methodOfApplication": "Apply through salesforce.com/careers.",
		"deadline": "June 15, 2025",
		"status": "Active"
	},
	{
		"title": "Customer Support Specialist",
		"company": "HelpDesk",
		"pay": "$50,000 - $70,000",
		"type": "FullTime",
		"averagePay": "$60,000",
		"jobCategoryIds": "0e190f8d-90d8-4da3-97b3-ffd6e07090e3",
		"aboutCompany": "HelpDesk provides customer support solutions.",
		"location": "Denver, CO",
		"shortRoleDescription": "Provide customer support.",
		"fullRoleDescription": "As a Customer Support Specialist, you will assist customers with inquiries and issues.",
		"keyResponsibility": "Resolve customer complaints and provide technical support.",
		"qualificationAndExperience": "Bachelor’s degree in any field, 1+ years of experience in customer support.",
		"methodOfApplication": "Apply through helpdesk.com/careers.",
		"deadline": "July 1, 2025",
		"status": "Active"
	},
	{
		"title": "Software Engineer",
		"company": "TechSolutions",
		"pay": "$90,000 - $120,000",
		"type": "FullTime",
		"averagePay": "$105,000",
		"jobCategoryIds": "10426558-96c4-4ef8-ab6c-6cdedd3e6e17",
		"aboutCompany": "TechSolutions is a software development company.",
		"location": "San Francisco, CA",
		"shortRoleDescription": "Develop software solutions.",
		"fullRoleDescription": "As a Software Engineer, you will design and develop software applications.",
		"keyResponsibility": "Write clean, maintainable code.",
		"qualificationAndExperience": "Bachelor’s degree in Computer Science or related field, 3+ years of experience.",
		"methodOfApplication": "Apply through techsolutions.com/careers.",
		"deadline": "April 15, 2025",
		"status": "Active"
	},
	{
		"title": "Product Manager",
		"company": "InnovateNow",
		"pay": "$100,000 - $130,000",
		"type": "FullTime",
		"averagePay": "$115,000",
		"jobCategoryIds": "308ce759-4bde-46f2-b1ac-c84d27b7dabe",
		"aboutCompany": "InnovateNow is a technology company.",
		"location": "New York, NY",
		"shortRoleDescription": "Manage product development.",
		"fullRoleDescription": "As a Product Manager, you will oversee the development of new products.",
		"keyResponsibility": "Define product requirements and roadmap.",
		"qualificationAndExperience": "Bachelor’s degree in Business or related field, 5+ years of experience.",
		"methodOfApplication": "Apply through innovatenow.com/careers.",
		"deadline": "April 30, 2025",
		"status": "Active"
	}
	,
	{
		"title": "Network Administrator",
		"company": "NetSecure",
		"pay": "$75,000 - $95,000",
		"type": "FullTime",
		"averagePay": "$85,000",
		"jobCategoryIds": "a1234567-89ab-cdef-0123-456789abcdef",
		"aboutCompany": "NetSecure provides network security solutions.",
		"location": "Boston, MA",
		"shortRoleDescription": "Manage and secure network infrastructure.",
		"fullRoleDescription": "As a Network Administrator, you will ensure the security and efficiency of network operations.",
		"keyResponsibility": "Monitor network performance and troubleshoot issues.",
		"qualificationAndExperience": "Bachelor’s degree in Information Technology or related field, 3+ years of experience.",
		"methodOfApplication": "Apply through netsecure.com/careers.",
		"deadline": "August 1, 2025",
		"status": "Active"
	}
]

// Insert each job into the database
for (const element of jsData) {

	const { jobCategoryIds, ...data } = element;
	insertData(data, jobCategoryIds);

}



