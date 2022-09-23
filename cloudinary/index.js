const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
	cloud_name: process.env.Cloudinary_Cloud_Name,
	api_key: process.env.Cloudinary_API_Key,
	api_secret: process.env.Cloudinary_API_Secret
});

const storage = new CloudinaryStorage({
	cloudinary,
	params: {
		folder: 'YelpCamp',
		format: async (req, file) => {
			return 'jpeg', 'png', 'jpg';
		}
		// public_id: (req, file) => 'computed-filename-using-request'
	}
});

module.exports = { cloudinary, storage };
