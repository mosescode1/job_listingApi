const AppError = require("../AppError");

function validateFields(req, fields) {
	for (const field of fields) {
		if (!req.body[field]) {
			throw new AppError(`Missing required field: ${field}`, 400);
		}
	}
}

module.exports = validateFields;
