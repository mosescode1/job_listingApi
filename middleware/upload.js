const multer = require('multer');
const cloudinary = require("../utils/helpers/coudinary");
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: 'uploads', // You can specify a folder for files
		resource_type: 'auto', // This allows all file types (images, documents, etc.)
		aspect_ratio: "1.5", width: 250, crop: "fill",
		radius: "max",
		fetch_format: "auto",
		allowed_formats: ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'], // Add supported file formats here
	},
});



const upload = multer({ storage: storage });

module.exports = upload;
