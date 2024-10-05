class ApiFeatures {
	constructor(queryString) {
		this.queryString = queryString;
		this.queryOptions = {}; // Store Prisma query options (like where, orderBy, etc.)
	}

	filter() {
		const queryObj = { ...this.queryString };
		const excludedQuery = ['sort', 'limit', 'page', 'fields'];
		excludedQuery.forEach(excluded => delete queryObj[excluded]);

		// Prisma filtering: adjust this to match Prisma's operators
		// if (queryObj.salary) {
		// 	if (queryObj.salary.gte) this.queryOptions.where = { salary: { gte: queryObj.salary.gte } };
		// 	// Add more conditions as needed
		// }

		return this;
	}

	sorting() {
		if (this.queryString.sort) {
			const sorting = this.queryString.sort.split(",").map(field => ({
				[field]: 'asc' // or 'desc'
			}));
			this.queryOptions.orderBy = sorting;
		} else {
			this.queryOptions.orderBy = { posted: 'asc' }; // Default sorting
		}
		return this;
	}

	pagination() {
		const page = parseInt(this.queryString.page) || 1;
		const limit = parseInt(this.queryString.limit) || 5;
		const skip = (page - 1) * limit;

		this.queryOptions.skip = skip;
		this.queryOptions.take = limit;
		return this;
	}
}

module.exports = ApiFeatures;