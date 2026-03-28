export type LocationDetails = {
  lat: number;
  lng: number;
  area: string;
  city: string;
  state: string;
  pincode: string;
  displayLocation: string;
  fullAddress: string;
};

const cleanLocationValue = (value?: string | null) => value?.trim() || "";

const getUniqueLocationParts = (values: Array<string | undefined | null>) => {
  const seenValues = new Set<string>();

  return values.reduce<string[]>((parts, value) => {
    const cleanedValue = cleanLocationValue(value);
    const normalizedValue = cleanedValue.toLowerCase();

    if (!cleanedValue || seenValues.has(normalizedValue)) {
      return parts;
    }

    seenValues.add(normalizedValue);
    parts.push(cleanedValue);
    return parts;
  }, []);
};

export const formatLocationSummary = ({
  area,
  city,
  state,
  pincode
}: Partial<Pick<LocationDetails, "area" | "city" | "state" | "pincode">>) => {
  const placeLabel = getUniqueLocationParts([area, city, state]).join(", ");
  const trimmedPincode = cleanLocationValue(pincode);

  if (placeLabel && trimmedPincode) {
    return `${placeLabel} - ${trimmedPincode}`;
  }

  return placeLabel || trimmedPincode;
};

export const buildFullAddress = (
  buildingLabel: string,
  location?: Partial<Pick<LocationDetails, "area" | "city" | "state" | "pincode">> | null
) =>
  getUniqueLocationParts([
    buildingLabel,
    location?.area,
    location?.city,
    location?.state,
    location?.pincode
  ]).join(", ");

export const formatCoordinateLabel = (lat: number, lng: number) =>
  `Coordinates detected (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

export const createFallbackLocationDetails = (
  lat: number,
  lng: number,
  partialLocation?: Partial<LocationDetails> | null
): LocationDetails => {
  const fullAddress =
    cleanLocationValue(partialLocation?.fullAddress) || `Latitude ${lat.toFixed(6)}, Longitude ${lng.toFixed(6)}`;
  const displayLocation =
    cleanLocationValue(partialLocation?.displayLocation) ||
    fullAddress ||
    formatCoordinateLabel(lat, lng);

  return {
    lat,
    lng,
    area: cleanLocationValue(partialLocation?.area),
    city: cleanLocationValue(partialLocation?.city),
    state: cleanLocationValue(partialLocation?.state),
    pincode: cleanLocationValue(partialLocation?.pincode),
    displayLocation,
    fullAddress
  };
};

export const getLocationSearchQuery = (location?: Partial<LocationDetails> | null) =>
  cleanLocationValue(location?.pincode) ||
  cleanLocationValue(location?.area) ||
  cleanLocationValue(location?.city) ||
  cleanLocationValue(location?.state);

export const hasCoordinates = (lat?: number | null, lng?: number | null) =>
  typeof lat === "number" &&
  Number.isFinite(lat) &&
  typeof lng === "number" &&
  Number.isFinite(lng);

export const fetchForwardGeocode = async (address: string): Promise<LocationDetails | null> => {
  if (!address.trim()) return null;

  const response = await fetch(`/api/location/forward?address=${encodeURIComponent(address.trim())}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errorBody?.error || "Unable to geocode the address.");
  }

  return (await response.json()) as LocationDetails;
};

export const getMapLink = (lat: number, lng: number) =>
  `https://www.google.com/maps?q=${lat},${lng}`;

export const getOpenStreetMapEmbedUrl = (lat: number, lng: number) => {
  const latDelta = 0.008;
  const lngDelta = 0.008;
  const bbox = [lng - lngDelta, lat - latDelta, lng + lngDelta, lat + latDelta].join(",");

  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox
  )}&layer=mapnik&marker=${lat}%2C${lng}`;
};

export const fetchReverseGeocode = async (lat: number, lng: number) => {
  try {
    const response = await fetch(`/api/location/reverse?lat=${lat}&lng=${lng}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return createFallbackLocationDetails(lat, lng);
    }

    const nextLocation = (await response.json()) as Partial<LocationDetails>;
    return createFallbackLocationDetails(lat, lng, nextLocation);
  } catch {
    return createFallbackLocationDetails(lat, lng);
  }
};
