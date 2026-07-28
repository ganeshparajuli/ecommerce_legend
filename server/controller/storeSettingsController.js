const crypto = require("crypto");
const { StoreSettings } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, ApiError } = require("../utils/apiResponse");

const EMAIL_RE = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const DEFAULTS = {
  storeName: "Joy Store",
  storeEmail: "contact@joystore.com",
  storePhone: "+977-01-4123456",
  storeAddress: "Kathmandu, Nepal",
};

async function getOrCreateSettings() {
  const [settings] = await StoreSettings.findOrCreate({ where: {}, defaults: DEFAULTS });
  return settings;
}

exports.getStoreSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  sendSuccess(res, { data: settings });
});

exports.updateStoreSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  const updates = { ...req.body };

  if (updates.subStoreLocations !== undefined) {
    try {
      if (typeof updates.subStoreLocations === "string") {
        updates.subStoreLocations = JSON.parse(updates.subStoreLocations);
      }
      if (!Array.isArray(updates.subStoreLocations)) updates.subStoreLocations = [];
    } catch {
      updates.subStoreLocations = [];
    }
  }

  if (req.files?.logo) updates.logo = `uploads/${req.files.logo[0].filename}`;
  if (req.files?.footerLogo) updates.footerLogo = `uploads/${req.files.footerLogo[0].filename}`;

  if (updates.storeEmail && !EMAIL_RE.test(updates.storeEmail)) {
    throw new ApiError(400, "Invalid email format");
  }

  await settings.update(updates);
  sendSuccess(res, { message: "Store settings updated successfully", data: settings });
});

exports.updateStoreLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No logo file provided");
  const settings = await getOrCreateSettings();
  await settings.update({ logo: `uploads/${req.file.filename}` });
  sendSuccess(res, { message: "Store logo updated successfully", data: settings });
});

exports.updateFooterLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No footer logo file provided");
  const settings = await getOrCreateSettings();
  await settings.update({ footerLogo: `uploads/${req.file.filename}` });
  sendSuccess(res, { message: "Footer logo updated successfully", data: settings });
});

exports.removeStoreLogo = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  await settings.update({ logo: null });
  sendSuccess(res, { message: "Store logo removed successfully", data: settings });
});

exports.removeFooterLogo = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  await settings.update({ footerLogo: null });
  sendSuccess(res, { message: "Footer logo removed successfully", data: settings });
});

// ---- Sub-store locations (stored as a JSONB array on the settings row) ----

exports.getSubStoreLocations = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  const locations = req.query.activeOnly === "true"
    ? settings.subStoreLocations.filter((l) => l.isActive)
    : settings.subStoreLocations;
  sendSuccess(res, { data: locations, meta: { count: locations.length } });
});

exports.getSubStoreLocationById = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  const location = settings.subStoreLocations.find((l) => l.id === req.params.locationId);
  if (!location) throw new ApiError(404, "Sub-store location not found");
  sendSuccess(res, { data: location });
});

exports.addSubStoreLocation = asyncHandler(async (req, res) => {
  const { locationName, address, phone, email, isActive } = req.body;
  if (!locationName || !address || !phone) {
    throw new ApiError(400, "Location name, address, and phone are required");
  }
  if (email && !EMAIL_RE.test(email)) throw new ApiError(400, "Invalid email format");

  const settings = await getOrCreateSettings();
  const newLocation = {
    id: `loc_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
    locationName: locationName.trim(),
    address: address.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : "",
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const locations = [...settings.subStoreLocations, newLocation];
  await settings.update({ subStoreLocations: locations });
  sendSuccess(res, { status: 201, message: "Sub-store location added successfully", data: newLocation });
});

exports.updateSubStoreLocation = asyncHandler(async (req, res) => {
  if (req.body.email && !EMAIL_RE.test(req.body.email)) throw new ApiError(400, "Invalid email format");

  const settings = await getOrCreateSettings();
  const index = settings.subStoreLocations.findIndex((l) => l.id === req.params.locationId);
  if (index === -1) throw new ApiError(404, "Sub-store location not found");

  const current = settings.subStoreLocations[index];
  const updated = { ...current, updatedAt: new Date().toISOString() };
  if (req.body.locationName) updated.locationName = req.body.locationName.trim();
  if (req.body.address) updated.address = req.body.address.trim();
  if (req.body.phone) updated.phone = req.body.phone.trim();
  if (req.body.email !== undefined) updated.email = req.body.email ? req.body.email.trim() : "";
  if (req.body.isActive !== undefined) updated.isActive = Boolean(req.body.isActive);

  const locations = [...settings.subStoreLocations];
  locations[index] = updated;
  await settings.update({ subStoreLocations: locations });
  sendSuccess(res, { message: "Sub-store location updated successfully", data: updated });
});

exports.deleteSubStoreLocation = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  const exists = settings.subStoreLocations.some((l) => l.id === req.params.locationId);
  if (!exists) throw new ApiError(404, "Sub-store location not found");

  const locations = settings.subStoreLocations.filter((l) => l.id !== req.params.locationId);
  await settings.update({ subStoreLocations: locations });
  sendSuccess(res, { message: "Sub-store location deleted successfully" });
});

exports.toggleSubStoreLocationStatus = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  const index = settings.subStoreLocations.findIndex((l) => l.id === req.params.locationId);
  if (index === -1) throw new ApiError(404, "Sub-store location not found");

  const locations = [...settings.subStoreLocations];
  locations[index] = { ...locations[index], isActive: !locations[index].isActive, updatedAt: new Date().toISOString() };
  await settings.update({ subStoreLocations: locations });
  sendSuccess(res, {
    message: `Sub-store location ${locations[index].isActive ? "activated" : "deactivated"} successfully`,
    data: locations[index],
  });
});

exports.bulkUpdateSubStoreLocations = asyncHandler(async (req, res) => {
  const { locations } = req.body;
  if (!Array.isArray(locations)) throw new ApiError(400, "Locations must be an array");

  for (const [i, location] of locations.entries()) {
    if (!location.locationName || !location.address || !location.phone) {
      throw new ApiError(400, `Location ${i + 1}: Name, address, and phone are required`);
    }
    if (location.email && !EMAIL_RE.test(location.email)) {
      throw new ApiError(400, `Location ${i + 1}: Invalid email format`);
    }
  }

  const settings = await getOrCreateSettings();
  await settings.update({ subStoreLocations: locations });
  sendSuccess(res, { message: "Sub-store locations updated successfully", data: settings.subStoreLocations });
});
