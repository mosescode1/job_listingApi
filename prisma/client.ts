import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
	// omit: {
	// 	jobSeeker: {
	// 		password: true,
	// 	},
	// 	admin: {
	// 		password: true,
	// 	},
	// 	employer: {
	// 		password: true,
	// 		refreshToken: true,
	// 	},
	// },
});
