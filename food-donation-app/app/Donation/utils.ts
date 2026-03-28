import type { Donation, SearchDonation } from './types';
import type { RouteInfo } from './types';

export const isDonationAvailable = (donation: Donation): boolean => {
  const now = new Date();
  const availableUntil = new Date(donation.availableUntil);
  return donation.status === 'active' && availableUntil > now && donation.remainingQuantity > 0;
};

export const normalizeText = (value: string): string => value.trim();

export const getExpiryMeta = (availableUntil: string) => {
  const expiry = new Date(availableUntil);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const tone = diffMin < 30 ? 'urgent' : diffMin < 120 ? 'warning' : 'normal';
  return { diffMin, tone };
};

export const getCompactExpiryLabel = (availableUntil: string): string => {
  const meta = getExpiryMeta(availableUntil);
  if (meta.diffMin < 60) return `${meta.diffMin}m`;
  const hours = Math.floor(meta.diffMin / 60);
  return `${hours}h`;
};

export const formatAvailableQuantityDisplay = (donation: Donation): string => {
  if (donation.remainingQuantity >= donation.totalQuantity) {
    return `${donation.totalQuantity} ${donation.quantityUnit}`;
  }
  return `${donation.remainingQuantity}/${donation.totalQuantity} ${donation.quantityUnit}`;
};

export const getDonationTitle = (donation: Donation): string => `${donation.foodName} - ${donation.foodCategory}`;

export const getDonationStatus = (donation: Donation): string => {
  const now = new Date();
  const availableUntil = new Date(donation.availableUntil);
  if (donation.remainingQuantity <= 0) return 'completed';
  if (availableUntil < now) return 'expired';
  return 'active';
};

export const getPhoneHref = (phone: string): string => `tel:${phone.replace(/[^\\d+]/g, '')}`;

export const getDonationLocationLabel = (donation: Donation): string => donation.location || donation.city || 'Location unavailable';

export const getDonationAddress = (donation: Donation): string => donation.fullAddress;

export function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

const ROUTE_CACHE_TTL_MS = 5 * 60 * 1000;

type CachedRouteInfo = {
  expiresAt: number;
  value: RouteInfo;
};

const routeInfoCache = new Map<string, CachedRouteInfo>();
const pendingRouteInfoRequests = new Map<string, Promise<RouteInfo>>();

const buildRouteCacheKey = (lat1: number, lng1: number, lat2: number, lng2: number) =>
  [lat1, lng1, lat2, lng2].map((value) => value.toFixed(6)).join(':');

const toRoundedMinutes = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return 0;
  }

  return Math.max(1, Math.round(seconds / 60));
};

const buildFallbackRouteInfo = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): RouteInfo => {
  const straightDistanceKm = getDistance(lat1, lng1, lat2, lng2);
  const drivingDistanceKm = straightDistanceKm * 1.15;
  const walkingDistanceKm = straightDistanceKm * 1.05;
  const drivingSeconds = (drivingDistanceKm / 32) * 3600;
  const walkingSeconds = (walkingDistanceKm / 4.8) * 3600;

  return {
    routeTimeMin: toRoundedMinutes(drivingSeconds),
    routeDistanceKm: Number(drivingDistanceKm.toFixed(2)),
    walkingTimeMin: toRoundedMinutes(walkingSeconds),
    walkingDistanceKm: Number(walkingDistanceKm.toFixed(2)),
    error: 'Route service unavailable, using estimated travel info'
  };
};

export async function getFullRouteInfoAsync(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): Promise<RouteInfo> {
  const cacheKey = buildRouteCacheKey(lat1, lng1, lat2, lng2);
  const now = Date.now();
  const cachedRouteInfo = routeInfoCache.get(cacheKey);

  if (cachedRouteInfo && cachedRouteInfo.expiresAt > now) {
    return cachedRouteInfo.value;
  }

  const pendingRouteInfo = pendingRouteInfoRequests.get(cacheKey);
  if (pendingRouteInfo) {
    return pendingRouteInfo;
  }

  const routeInfoPromise = (async () => {
    try {
      const response = await fetch(
        `/api/location/route?originLat=${lat1}&originLng=${lng1}&destinationLat=${lat2}&destinationLng=${lng2}`,
        {
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        throw new Error('Route API request failed');
      }

      const routeInfo = (await response.json()) as RouteInfo;
      routeInfoCache.set(cacheKey, {
        expiresAt: Date.now() + ROUTE_CACHE_TTL_MS,
        value: routeInfo
      });
      return routeInfo;
    } catch {
      const fallbackRouteInfo = buildFallbackRouteInfo(lat1, lng1, lat2, lng2);
      routeInfoCache.set(cacheKey, {
        expiresAt: Date.now() + ROUTE_CACHE_TTL_MS,
        value: fallbackRouteInfo
      });
      return fallbackRouteInfo;
    } finally {
      pendingRouteInfoRequests.delete(cacheKey);
    }
  })();

  pendingRouteInfoRequests.set(cacheKey, routeInfoPromise);
  return routeInfoPromise;
}
