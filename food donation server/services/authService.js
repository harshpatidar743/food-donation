const Donor = require('../models/donor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { jwtSecret } = require('../config/env');

const ACCOUNT_TYPE_MAP = {
  individual: 'individual',
  organization: 'organization',
  ngo: 'organization',
  business: 'business/restaurant',
  restaurant: 'business/restaurant',
  'business/restaurant': 'business/restaurant'
};
const ACCESS_ROLE_MAP = {
  admin: 'admin',
  user: 'user'
};

const normalizeText = (value) => typeof value === 'string' ? value.trim() : '';
const normalizeEmail = (value) => normalizeText(value).toLowerCase();
const normalizeAccountType = (value) => ACCOUNT_TYPE_MAP[normalizeText(value).toLowerCase()];
const normalizeAccessRole = (value) => ACCESS_ROLE_MAP[normalizeText(value).toLowerCase()] || 'user';
const getRegistrationAccountType = (value) => normalizeAccountType(value) || 'individual';
const isBcryptHash = (value) => typeof value === 'string' && /^\$2[aby]\$/.test(value);
const assignIfPresent = (target, key, value) => {
  const normalizedValue = normalizeText(value);

  if (normalizedValue) {
    target[key] = normalizedValue;
  }
};

const generateToken = () => crypto.randomBytes(32).toString('hex');
const generateJWT = (donor) =>
  jwt.sign(
    {
      id: donor._id,
      role: normalizeAccessRole(donor.role)
    },
    jwtSecret,
    { expiresIn: '30d' }
  );

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

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const token = generateToken();
  const assignedUserType = getRegistrationAccountType(accountType || userType || role);
  const donorData = {
    name: normalizedName,
    email: normalizedEmail,
    password: hashedPassword,
    phone: normalizedPhone,
    userType: assignedUserType,
    role: 'user',
    isVerified: true,
    verificationToken: token
  };

  if (assignedUserType === 'individual') {
    assignIfPresent(donorData, 'address', address);
  }

  if (assignedUserType === 'organization') {
    assignIfPresent(donorData, 'city', city);
    assignIfPresent(donorData, 'organizationName', organizationName);
    assignIfPresent(donorData, 'registrationNumber', registrationNumber);
    assignIfPresent(donorData, 'organizationAddress', organizationAddress);
    assignIfPresent(donorData, 'organizationCertificateName', organizationCertificateName);
  }

  if (assignedUserType === 'business/restaurant') {
    assignIfPresent(donorData, 'city', city);
    assignIfPresent(donorData, 'businessName', businessName);
    assignIfPresent(donorData, 'businessType', businessType);
    assignIfPresent(donorData, 'ownerName', ownerName);
    assignIfPresent(donorData, 'businessAddress', businessAddress);
    assignIfPresent(donorData, 'gstNumber', gstNumber);
  }

  const donor = new Donor(donorData);

  await donor.save();

  const jwtToken = generateJWT(donor);

  return {
    message: 'Donor registered successfully',
    verificationToken: token,
    token: jwtToken,
    donor: {
      donorId: donor._id,
      name: donor.name,
      email: donor.email,
      role: normalizeAccessRole(donor.role),
      userType: donor.userType
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

  const donor = await Donor.findOne(
    { email: normalizedEmail },
    "password name email role userType isVerified"
  );

  if (!donor) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, donor.password);

  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  if (!donor.isVerified) {
    const error = new Error('Email not verified yet');
    error.statusCode = 400;
    throw error;
  }

  donor.role = normalizeAccessRole(donor.role);
  const token = generateJWT(donor);

  return {
    message: 'Login successful',
    donorId: donor._id,
    name: donor.name,
    role: donor.role,
    userType: donor.userType,
    token
  };
};
