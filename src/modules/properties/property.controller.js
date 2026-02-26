import Property from './property.model.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { uploadMultipleImages, deleteImageByPublicId } from '../media/media.service.js';

export const createProperty = asyncHandler(async (req, res) => {
  const { title, description, price, location, type, bedrooms, bathrooms, area } = req.body;

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'At least one image is required');
  }

  const uploadedImages = await uploadMultipleImages(req.files);

  const property = await Property.create({
    title,
    description,
    price,
    location,
    type,
    bedrooms,
    bathrooms,
    area,
    images: uploadedImages,
    owner: req.user._id,
  });

  return res.status(201).json(new ApiResponse(201, property, 'Property created successfully'));
});
export const getAllProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find().populate('owner', 'name email');

  return res.status(200).json(new ApiResponse(200, properties));
});
export const getMyProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({
    owner: req.user._id,
  });

  return res.status(200).json(new ApiResponse(200, properties));
});

export const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  if (property.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to update this property');
  }

  // Update text fields
  Object.assign(property, req.body);

  // Handle new images
  if (req.files && req.files.length > 0) {
    if (property.images.length + req.files.length > 6) {
      throw new ApiError(400, 'Maximum 6 images allowed');
    }

    const uploadedImages = await uploadMultipleImages(req.files);
    property.images.push(...uploadedImages);
  }

  await property.save();

  return res.status(200).json(new ApiResponse(200, property, 'Property updated successfully'));
});

export const deletePropertyImage = asyncHandler(async (req, res) => {
  const { propertyId, publicId } = req.body;

  const property = await Property.findById(propertyId);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  if (property.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  // Delete from Cloudinary
  await deleteImageByPublicId(publicId);

  // Remove from DB
  property.images = property.images.filter((img) => img.public_id !== publicId);

  await property.save();

  return res.status(200).json(new ApiResponse(200, null, 'Image deleted successfully'));
});

export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  if (property.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to delete this property');
  }

  // Delete all images from Cloudinary
  for (const img of property.images) {
    await deleteImageByPublicId(img.public_id);
  }

  await property.deleteOne();

  return res.status(200).json(new ApiResponse(200, null, 'Property deleted successfully'));
});

export const showInterest = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  if (property.owner.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot show interest in your own property');
  }

  if (property.interestedUsers.some((id) => id.toString() === req.user._id.toString())) {
    throw new ApiError(400, 'You have already shown interest');
  }

  property.interestedUsers.push(req.user._id);
  await property.save();

  return res.status(200).json(new ApiResponse(200, null, 'Interest recorded'));
});

export const getInterestedUsers = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate('interestedUsers', 'name email');

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  if (property.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized: Only the property owner can view these leads');
  }

  const leads = property.interestedUsers.filter(
    (u) => u._id.toString() !== req.user._id.toString(),
  );

  console.log(`Leads found for property ${property.title}:`, leads.length);

  return res.status(200).json(new ApiResponse(200, leads, 'Interested users fetched successfully'));
});
