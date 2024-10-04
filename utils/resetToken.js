const crypto = require("crypto");

//! verify Reset token
function verifyResetToken(providedToken, storedHash) {
	const tokenHash = crypto
		.createHash("sha256")
		.update(providedToken)
		.digest("hex");

	// Compare the newly generated hash with the stored hash
	if (tokenHash === storedHash) {
		console.log("Token is valid!");
		return true; // Token is valid
	} else {
		console.log("Token is invalid!");
		return false; // Token is invalid
	}
}
//! generates Reset token
function generateResetToken(resetToken) {
	const tokenHash = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	// Store tokenHash in your database along with the user record
	console.log("Generated Hash:", tokenHash);
	return tokenHash;
}



module.exports = {
	verifyResetToken,
	generateResetToken
}