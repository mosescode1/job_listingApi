const AppError = require("../utils/AppError");

const onlyPermit = (...roles) => {
	return (req, _, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError(
					"You do not have permission to perform this operation",
					403
				)
			);
		}
		next();
	};
};

module.exports = {
	onlyPermit,
};
