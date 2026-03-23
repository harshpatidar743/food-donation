const Donor = require('../models/donor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { jwtSecret } = require('../config/env');

const ROLE_MAP = {
  admin: 'admin',
  individual: 'individual',
  organization: 'organization',
  ngo: 'organization',
  business: 'business/restaurant',
  restaurant: 'business/restaurant',
  'business/restaurant': 'business/restaurant'
};

const normalizeText = (value) => typeof value === 'string' ? value.trim() : '';
const normalizeEmail = (value) => normalizeText(value).toLowerCase();
const normalizeRole = (value) => ROLE_MAP[normalizeText(value).toLowerCase()];
const getRegistrationRole = (value) => normalizeRole(value) || 'individual';
const getStoredRole = (donor) => normalizeRole(donor.role) || normalizeRole(donor.userType) || 'individual';
const isBcryptHash = (value) => typeof value === 'string' && /^\$2[aby]\$/.test(value);
const assignIfPresent = (target, key, value) => {
  const normalizedValue = normalizeText(value);

  if (normalizedValue) {
    target[key] = normalizedValue;
  }
};

const generateToken = () => crypto.randomBytes(32).toString('hex');
const generateJWT = (donorId) => jwt.sign({ id: donorId }, jwtSecret, { expiresIn: '30d' });

exports.registerUser = async (data) => {
  const {
    name,
    email,
    password,
    phone,
    userType,
    accountType,
    role,
    address,
    city,
    organizationName,
    registrationNumber,
    organizationAddress,
    organizationCertificateName,
    businessName,
    businessType,
    ownerName,
    businessAddress,
    gstNumber
  } = data;
  const normalizedName = normalizeText(name);
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizeText(phone);

  if (!normalizedName || !normalizedEmail || !password || !normalizedPhone) {
    const error = new Error('Name, email, password, and phone are required');
    error.statusCode = 400;
    throw error;
  }

  const existingDonor = await Donor.findOne({ email: normalizedEmail });
  if (existingDonor) {
    const error = new Error('Email is already registered');
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  const token = generateToken();
  const assignedRole = getRegistrationRole(accountType || role || userType);
  const donorData = {
    name: normalizedName,
    email: normalizedEmail,
    password: hashedPassword,
    phone: normalizedPhone,
    userType: assignedRole,
    role: assignedRole,
    isVerified: true,
    verificationToken: token
  };

  if (assignedRole === 'individual') {
    assignIfPresent(donorData, 'address', address);
  }

  if (assignedRole === 'organization') {
    assignIfPresent(donorData, 'city', city);
    assignIfPresent(donorData, 'organizationName', organizationName);
    assignIfPresent(donorData, 'registrationNumber', registrationNumber);
    assignIfPresent(donorData, 'organizationAddress', organizationAddress);
    assignIfPresent(donorData, 'organizationCertificateName', organizationCertificateName);
  }

  if (assignedRole === 'business/restaurant') {
    assignIfPresent(donorData, 'city', city);
    assignIfPresent(donorData, 'businessName', businessName);
    assignIfPresent(donorData, 'businessType', businessType);
    assignIfPresent(donorData, 'ownerName', ownerName);
    assignIfPresent(donorData, 'businessAddress', businessAddress);
    assignIfPresent(donorData, 'gstNumber', gstNumber);
  }

  const donor = new Donor(donorData);

  await donor.save();

  const jwtToken = generateJWT(donor._id);

  return {
    message: 'Donor registered successfully',
    verificationToken: token,
    token: jwtToken,
    donor: {
      donorId: donor._id,
      name: donor.name,
      email: donor.email,
      role: donor.role
    }
  };
};

exports.loginUser = async (data) => {
  const { email, password } = data;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const donor = await Donor.findOne({ email: normalizedEmail });
  if (!donor) {
    const error = new Error('Donor not found');
    error.statusCode = 400;
    throw error;
  }

  const storedPassword = donor.password;
  const isLegacyPassword = !isBcryptHash(storedPassword);
  const isMatch = isLegacyPassword
    ? password === storedPassword
    : await bcrypt.compare(password, storedPassword);

  if (!isMatch) {
    const error = new Error('Invalid password');
    error.statusCode = 400;
    throw error;
  }

  if (!donor.isVerified) {
    const error = new Error('Email not verified yet');
    error.statusCode = 400;
    throw error;
  }

  const role = getStoredRole(donor);
  let shouldSave = false;

  if (donor.role !== role) {
    donor.role = role;
    shouldSave = true;
  }

  // Migrate older donor records that were stored with plain-text passwords.
  if (isLegacyPassword) {
    const salt = await bcrypt.genSalt(12);
    donor.password = await bcrypt.hash(password, salt);
    shouldSave = true;
  }

  if (shouldSave) {
    await donor.save();
  }

  const token = generateJWT(donor._id);

  return {
    message: 'Login successful',
    donorId: donor._id,
    name: donor.name,
    role,
    token
  };
};
