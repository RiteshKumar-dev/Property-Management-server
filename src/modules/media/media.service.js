import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary.helper.js';
import fs from 'fs';

export const uploadMultipleImages = async (files) => {
  const uploadedImages = [];

  for (const file of files) {
    const result = await uploadToCloudinary(file.path);
    await fs.promises.unlink(file.path);
    uploadedImages.push({
      url: result.secure_url,
      public_id: result.public_id,
    });
  }

  return uploadedImages;
};

export const deleteImageByPublicId = async (publicId) => {
  return deleteFromCloudinary(publicId);
};
