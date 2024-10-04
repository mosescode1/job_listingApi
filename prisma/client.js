const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient(
	{
		omit: {
			jobSeeker: {
				password: true
			},
			admin: {
				password: true
			},
			employer: {
				password: true
			}
		}
	}
);

module.exports = prisma;