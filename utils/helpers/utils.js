const monthlyApplicantData = (applicant, monthNames) => {
	return applicant.map((item) => {
		const month = monthNames[item.createdAt.getMonth()]
		return {
			// month: `${year}-${month < 10 ? '0' + month : month}`,
			month,
			count: item._count.id,
		};
	}).reduce((acc, item) => {
		const existingMonth = acc.find((i) => i.month === item.month);
		if (existingMonth) {
			existingMonth.count += item.count;
		} else {
			acc.push(item);
		}
		return acc;
	}, []);
}



const averageSalary = (average, monthNames) => {

	return average.map((item) => {
		item._max.averagePay = item._max.averagePay.replace('$', '');
		item._max.averagePay = parseInt(item._max.averagePay.replace(',', ''));

		const month = monthNames[item.posted.getMonth()]
		return {
			month,
			count: item._count,
			averagePay: item._max.averagePay,
		}
	}).reduce((acc, item) => {
		const existingMonth = acc.find((i) => i.month === item.month);
		if (existingMonth) {
			existingMonth.count += item.count;
			existingMonth.averagePay += item.averagePay;
		} else {
			acc.push(item);
		}
		return acc;
	}, []).map((item) => {
		item.averagePay = item.averagePay / item.count;
		return {
			month: item.month,
			count: item.count,
			averagePay: `$${item.averagePay}`,
		}
	});
}



module.exports = {
	monthlyApplicantData,
	averageSalary
}