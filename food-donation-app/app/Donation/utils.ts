import { Donation, DonationStatus, QuantityUnit } from "./types";

const shortDateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit"
});

const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit"
});

const titleCaseSmallWords = new Set([
  "a",
  "an",
  "and",
  "at",
  "by",
  "for",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with"
]);

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const formatWord = (word: string, index: number) => {
  if (!word) {
    return word;
  }

  if (/^[0-9]+$/.test(word)) {
    return word;
  }

  if (/^[A-Z0-9]{2,4}$/.test(word)) {
    return word;
  }

  const lowerCasedWord = word.toLowerCase();

  if (index > 0 && titleCaseSmallWords.has(lowerCasedWord)) {
    return lowerCasedWord;
  }

  return lowerCasedWord.charAt(0).toUpperCase() + lowerCasedWord.slice(1);
};

const normalizeChunk = (chunk: string, index: number) =>
  chunk
    .split("-")
    .map((piece, pieceIndex) => formatWord(piece, index + pieceIndex))
    .join("-");

export const normalizeText = (value?: string) => {
  if (!value) {
    return "";
  }

  return value
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((chunk, index) => normalizeChunk(chunk, index))
    .join(" ");
};

export const getDonationTitle = (donation: Donation) =>
  normalizeText(donation.foodName || donation.foodType || "Food donation");

export const getDonationAddress = (donation: Donation) =>
  normalizeText(donation.fullAddress || donation.location || "Address not available");

export const getPhoneHref = (phoneNumber?: string) => {
  if (!phoneNumber) {
    return "";
  }

  const sanitizedPhone = phoneNumber.replace(/(?!^\+)[^\d]/g, "");

  return sanitizedPhone ? `tel:${sanitizedPhone}` : "";
};

// export const formatQuantityDisplay = (
//   quantity: number,
//   quantityUnit: QuantityUnit | undefined = "plates"
// ) => {
//   if (quantityUnit === "people") {
//     return `Available: ${quantity} ${quantity === 1 ? "person" : "people"}`;
//   }

//   return `Quantity: ${quantity} ${quantity === 1 ? "plate" : "plates"}`;
// };

export const getRemainingQuantity = (donation: Donation) =>
  typeof donation.remainingQuantity === "number"
    ? donation.remainingQuantity
    : donation.quantity;

export const getTotalQuantity = (donation: Donation) =>
  typeof donation.totalQuantity === "number" ? donation.totalQuantity : donation.quantity;

export const getDonationStatus = (donation: Donation): DonationStatus => {
  const remainingQuantity = getRemainingQuantity(donation);

  if (remainingQuantity <= 0) {
    return "completed";
  }

  if (!isDonationActive(donation.availableUntil)) {
    return "expired";
  }

  return donation.status === "completed" || donation.status === "expired"
    ? donation.status
    : "active";
};

export const isDonationAvailable = (donation: Donation) =>
  getDonationStatus(donation) === "active" && getRemainingQuantity(donation) > 0;

export const formatRemainingQuantityDisplay = (donation: Donation) => {
  const remainingQuantity = getRemainingQuantity(donation);
  const totalQuantity = getTotalQuantity(donation);
  const quantityUnit = donation.quantityUnit || "plates";

  if (quantityUnit === "people") {
    return `Remaining: ${remainingQuantity} / ${totalQuantity} people`;
  }

  return `Remaining: ${remainingQuantity} / ${totalQuantity} plates`;
};

export const getQuantityProgress = (donation: Donation) => {
  const totalQuantity = getTotalQuantity(donation);
  const remainingQuantity = getRemainingQuantity(donation);

  if (totalQuantity <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round((remainingQuantity / totalQuantity) * 100)));
};

export const formatPostedAgo = (value?: string) => {
  if (!value) {
    return "Posted recently";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Posted recently";
  }

  const diffInMs = Date.now() - parsedDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return "Posted just now";
  }

  if (diffInMinutes < 60) {
    return `Posted ${diffInMinutes} min ago`;
  }

  if (diffInHours < 24) {
    return `Posted ${diffInHours} hr ago`;
  }

  if (diffInDays < 7) {
    return `Posted ${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  }

  return `Posted ${shortDateTimeFormatter.format(parsedDate)}`;
};

export const isDonationActive = (value?: string) => {
  if (!value) {
    return true;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  return parsedDate.getTime() > Date.now();
};

export const getExpiryMeta = (value?: string) => {
  if (!value) {
    return {
      label: "Expiry not provided",
      tone: "neutral" as const,
      status: "Available" as const
    };
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      label: "Expiry not provided",
      tone: "neutral" as const,
      status: "Available" as const
    };
  }

  const now = new Date();
  const diffInMs = parsedDate.getTime() - now.getTime();

  if (diffInMs <= 0) {
    return {
      label: `Expired ${shortDateTimeFormatter.format(parsedDate)}`,
      tone: "danger" as const,
      status: "Expired" as const
    };
  }

  if (isSameDay(parsedDate, now)) {
    return {
      label: `Expires Today, ${timeFormatter.format(parsedDate)}`,
      tone: diffInMs <= 2 * 60 * 60 * 1000 ? "danger" : "warning",
      status: "Available" as const
    };
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isSameDay(parsedDate, tomorrow)) {
    return {
      label: `Expires Tomorrow, ${timeFormatter.format(parsedDate)}`,
      tone: "warning" as const,
      status: "Available" as const
    };
  }

  return {
    label: shortDateTimeFormatter.format(parsedDate),
    tone: "neutral" as const,
    status: "Available" as const
  };
};
