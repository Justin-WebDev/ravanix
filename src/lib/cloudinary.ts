import { v2 as cloudinary } from 'cloudinary';

if (
  !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET ||
  !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
) {
  throw new Error(
    'Cloudinary environment variables are not set. Please check your .env.local file.'
  );
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };
