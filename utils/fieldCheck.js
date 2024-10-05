function checkFieldsProvided(jobData, requiredFields) {
	for (let field of requiredFields) {
		if (!jobData.hasOwnProperty(field) || jobData[field] === "" || jobData[field] === undefined) {
			return false; // Missing or empty field
		}
	}
	return true; // All fields are provided
}


module.exports = checkFieldsProvided;