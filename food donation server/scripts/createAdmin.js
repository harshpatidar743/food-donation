const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const parseArgs = (argv) => {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (!current.startsWith("--")) {
      continue;
    }

    const key = current.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      args[key] = "true";
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
};

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");
const normalizeEmail = (value) => normalizeText(value).toLowerCase();
const normalizeAccountType = (value) => {
  const normalized = normalizeText(value).toLowerCase();

  if (normalized === "organization" || normalized === "ngo") {
    return "organization";
  }

  if (
    normalized === "business"
    || normalized === "restaurant"
    || normalized === "business/restaurant"
  ) {
    return "business/restaurant";
  }

  return "individual";
};

const printUsage = () => {
  console.log("");
  console.log("Create or promote an admin user");
  console.log("");
  console.log("Usage:");
  console.log("  npm run create-admin -- --email admin@example.com");
  console.log("  npm run create-admin -- --email admin@example.com --name \"Admin User\" --phone \"9999999999\" --password \"StrongPass123\"");
  console.log("");
  console.log("Behavior:");
  console.log("  1. If the donor already exists, they are promoted to role=admin.");
  console.log("  2. If the donor does not exist, name, phone, and password are required.");
  console.log("  3. New admins are created as verified accounts.");
  console.log("");
  console.log("Optional flags for new admins:");
  console.log("  --userType individual|organization|business/restaurant");
  console.log("  --address \"Street address\"");
  console.log("  --city \"Indore\"");
  console.log("");
};

const createAdmin = async () => {
  const args = parseArgs(process.argv.slice(2));
  const wantsHelp = args.help === "true";
  const email = normalizeEmail(args.email);

  if (wantsHelp) {
    printUsage();
    process.exit(0);
  }

  if (!email) {
    printUsage();
    process.exit(1);
  }

  const connectDB = require("../config/db");
  const Donor = require("../models/donor");

  await connectDB();

  const existingDonor = await Donor.findOne({ email });

  if (existingDonor) {
    existingDonor.role = "admin";

    if (!existingDonor.isVerified) {
      existingDonor.isVerified = true;
    }

    await existingDonor.save();

    console.log(`Promoted existing donor to admin: ${email}`);
    return;
  }

  const name = normalizeText(args.name);
  const phone = normalizeText(args.phone);
  const password = args.password;

  if (!name || !phone || !password) {
    console.error("New admin creation requires --name, --phone, and --password.");
    printUsage();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userType = normalizeAccountType(args.userType);

  const donor = new Donor({
    name,
    email,
    phone,
    password: passwordHash,
    userType,
    role: "admin",
    isVerified: true,
    address: normalizeText(args.address) || undefined,
    city: normalizeText(args.city) || undefined,
    organizationName: normalizeText(args.organizationName) || undefined,
    registrationNumber: normalizeText(args.registrationNumber) || undefined,
    organizationAddress: normalizeText(args.organizationAddress) || undefined,
    organizationCertificateName: normalizeText(args.organizationCertificateName) || undefined,
    businessName: normalizeText(args.businessName) || undefined,
    businessType: normalizeText(args.businessType) || undefined,
    ownerName: normalizeText(args.ownerName) || undefined,
    businessAddress: normalizeText(args.businessAddress) || undefined,
    gstNumber: normalizeText(args.gstNumber) || undefined
  });

  await donor.save();

  console.log(`Created new admin user: ${email}`);
};

createAdmin()
  .catch((error) => {
    console.error("Failed to create admin user.");
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
