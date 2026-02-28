// utilis/cloudinary.js
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



// Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: "astrologers",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: "auto",
    public_id: `file_${Date.now()}_${file.originalname.split(".")[0]}`
  })
});

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => ({
//     folder: "products",
//     resource_type: "auto",
//   }),
// });

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Accept any files (prevents Unexpected field). We'll map later.
// const astrologerUploads = upload.any();

module.exports = {
  upload,
  astrologerUploads: upload.any() // For astrologer profile uploads (multiple fields)
};
