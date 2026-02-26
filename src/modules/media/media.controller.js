import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary.helper.js';
import fs from 'fs';

export const uploadMultipleImages = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const uploadedImages = [];
    for (const file of files) {
      const result = await uploadToCloudinary(file.path);
      // Delete local file after upload
      if (fs.existsSync(file.path)) await fs.promises.unlink(file.path);

      uploadedImages.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }

    res.status(200).json({ success: true, data: uploadedImages });
  } catch (error) {
    console.error('Cloudinary Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteImageByPublicId = async (publicId) => {
  return deleteFromCloudinary(publicId);
};
