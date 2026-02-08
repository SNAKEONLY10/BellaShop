import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bellashop',
    format: async (req, file) => {
      const ext = file.originalname.split('.').pop();
      return ext.toLowerCase();
    },
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e9);
      return `${timestamp}-${random}`;
    },
    resource_type: 'auto',
  },
});

function fileFilter(req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const isValidExt = allowedTypes.test(
    file.originalname.split('.').pop().toLowerCase()
  );
  const isValidMime = allowedTypes.test(file.mimetype);

  if (isValidExt && isValidMime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});

export default upload;