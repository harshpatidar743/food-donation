import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type OsrmRouteResponse = {
  code?: string;
  routes?: Array<{
    distance: number;
    duration: number;
  }>;
};

type ProfileName = "driving" | "walking" | "foot";
type RouteSummary = {
  distanceKm: number;
  durationMin: number;
};

const toRoundedMinutes = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return 0;
  }

  return Math.max(1, Math.round(seconds / 60));
};

const estimateDrivingMinutesFromDistance = (distanceKm: number) => {
  const averageSpeedKmh =
    distanceKm <= 2 ? 16 :
    distanceKm <= 5 ? 20 :
    distanceKm <= 10 ? 24 :
    30;

  return Math.max(1, Math.round((distanceKm / averageSpeedKmh) * 60));
};

const estimateWalkingMinutesFromDistance = (distanceKm: number) => {
  const walkingSpeedKmh = 4.8;
  return Math.max(1, Math.round((distanceKm / walkingSpeedKmh) * 60));
};

const haversineDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const earthRadiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

const fetchOsrmRoute = async (
  profile: ProfileName,
  originLat: number,
  originLng: number,
  destinationLat: number,
  destinationLng: number
) : Promise<RouteSummary | null> => {
  const url = new URL(
    `https://router.project-osrm.org/route/v1/${profile}/${originLng},${originLat};${destinationLng},${destinationLat}`
  );
  url.searchParams.set("overview", "false");
  url.searchParams.set("alternatives", "false");
  url.searchParams.set("steps", "false");
  url.searchParams.set("annotations", "false");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "food-donation-platform/1.0"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as OsrmRouteResponse;
  const route = data.routes?.[0];

  if (!route) {
    return null;
  }

  return {
    distanceKm: Number((route.distance / 1000).toFixed(2)),
    durationMin: toRoundedMinutes(route.duration)
  };
};

export async function GET(request: NextRequest) {
  const originLat = Number(request.nextUrl.searchParams.get("originLat"));
  const originLng = Number(request.nextUrl.searchParams.get("originLng"));
  const destinationLat = Number(request.nextUrl.searchParams.get("destinationLat"));
  const destinationLng = Number(request.nextUrl.searchParams.get("destinationLng"));

  if (
    !Number.isFinite(originLat) ||
    !Number.isFinite(originLng) ||
    !Number.isFinite(destinationLat) ||
    !Number.isFinite(destinationLng)
  ) {
    return NextResponse.json(
      { error: "Valid origin and destination coordinates are required." },
      { status: 400 }
    );
  }

  const straightDistanceKm = haversineDistanceKm(
    originLat,
    originLng,
    destinationLat,
    destinationLng
  );

  try {
    const [drivingRoute, walkingRoute] = await Promise.all([
      fetchOsrmRoute("driving", originLat, originLng, destinationLat, destinationLng),
      (async () => {
        const walkingProfileRoute = await fetchOsrmRoute(
          "walking",
          originLat,
          originLng,
          destinationLat,
          destinationLng
        );

        if (walkingProfileRoute) {
          return walkingProfileRoute;
        }

        return fetchOsrmRoute("foot", originLat, originLng, destinationLat, destinationLng);
      })()
    ]);

    const drivingDistanceKm = drivingRoute
      ? drivingRoute.distanceKm
      : Number((straightDistanceKm * 1.15).toFixed(2));
    const walkingDistanceKm = walkingRoute
      ? walkingRoute.distanceKm
      : Number((straightDistanceKm * 1.18).toFixed(2));
    const routeTimeMin = drivingRoute
      ? Math.max(
          drivingRoute.durationMin,
          estimateDrivingMinutesFromDistance(drivingDistanceKm)
        )
      : estimateDrivingMinutesFromDistance(drivingDistanceKm);
    const walkingTimeMin = walkingRoute
      ? estimateWalkingMinutesFromDistance(walkingDistanceKm)
      : estimateWalkingMinutesFromDistance(walkingDistanceKm);
    const error =
      !drivingRoute || !walkingRoute
        ? "Some route details are estimated because the live routing service was unavailable."
        : undefined;

    return NextResponse.json({
      routeTimeMin,
      routeDistanceKm: drivingDistanceKm,
      walkingTimeMin,
      walkingDistanceKm,
      error
    });
  } catch {
    const routeDistanceKm = Number((straightDistanceKm * 1.15).toFixed(2));
    const walkingDistanceKm = Number((straightDistanceKm * 1.18).toFixed(2));

    return NextResponse.json({
      routeTimeMin: estimateDrivingMinutesFromDistance(routeDistanceKm),
      routeDistanceKm,
      walkingTimeMin: estimateWalkingMinutesFromDistance(walkingDistanceKm),
      walkingDistanceKm,
      error: "Live routing failed, so travel details are estimated."
    });
  }
}
