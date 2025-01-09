import { Prisma } from '@prisma/client';

type Average = (Prisma.PickEnumerable<Prisma.JobGroupByOutputType, 'posted'> & {
	_count: number;
	_max: { averagePay: string | null };
})[];

type Applicant = (Prisma.PickEnumerable<
	Prisma.ApplicationGroupByOutputType,
	'createdAt'[]
> & {
	_count: {
		id: number;
	};
})[];

const monthlyApplicantData = (applicant: Applicant, monthNames: string[]) => {
	return applicant
		.map((item: any) => {
			const month = monthNames[item.createdAt.getMonth()];
			return {
				// month: `${year}-${month < 10 ? '0' + month : month}`,
				month,
				count: item._count.id,
			};
		})
		.reduce(
			(acc: { month: string; count: number; averagePay?: number }[], item) => {
				const existingMonth = acc.find((i: any) => i.month === item.month);
				if (existingMonth) {
					existingMonth.count += item.count;
				} else {
					acc.push({
						month: item.month,
						count: item.count,
						// averagePay: item.averagePay,
					});
				}
				return acc;
			},
			[]
		);
};

const averageSalary = (average: Average, monthNames: string[]) => {
	return average
		.map((item: any) => {
			item._max.averagePay = item._max.averagePay.replace('$', '');
			item._max.averagePay = parseInt(item._max.averagePay.replace(',', ''));

			const month = monthNames[item.posted.getMonth()];
			return {
				month,
				count: item._count,
				averagePay: item._max.averagePay,
			};
		})
		.reduce(
			(
				acc: { count: number; averagePay: number; month: string }[],
				item: any
			) => {
				const existingMonth = acc.find((i: any) => i.month === item.month);
				if (existingMonth) {
					existingMonth.count += item.count;
					// existingMonth.averagePay += item.averagePay;
				} else {
					acc.push(item);
				}
				return acc;
			},
			[]
		)
		.map((item: { averagePay: number; count: number; month: string }) => {
			item.averagePay = item.averagePay / item.count;
			return {
				month: item.month,
				count: item.count,
				averagePay: `$${item.averagePay}`,
			};
		});
};

export { monthlyApplicantData, averageSalary };
