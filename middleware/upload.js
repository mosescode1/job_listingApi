const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require("../utils/helpers/coudinary");

const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: 'files', // You can specify a folder for files
		resource_type: 'auto', // This allows all file types (images, documents, etc.)
		allowed_formats: ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'], // Add supported file formats here
	},
});

const upload = multer({ storage });

module.exports = upload;
