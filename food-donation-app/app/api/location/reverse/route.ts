import { NextRequest, NextResponse } from "next/server";
import { formatLocationSummary } from "@/app/lib/location";

export const runtime = "nodejs";

type NominatimResponse = {
  display_name?: string;
  address?: {
    suburb?: string;
    neighbourhood?: string;
    city_district?: string;
    quarter?: string;
    residential?: string;
    city?: string;
    town?: string;
    municipality?: string;
    village?: string;
    county?: string;
    state?: string;
    state_district?: string;
    region?: string;
    postcode?: string;
  };
};

const pickFirstValue = (...values: Array<string | undefined>) =>
  values.find((value) => value?.trim())?.trim() || "";

export async function GET(request: NextRequest) {
  const latParam = Number(request.nextUrl.searchParams.get("lat"));
  const lngParam = Number(request.nextUrl.searchParams.get("lng"));

  if (!Number.isFinite(latParam) || !Number.isFinite(lngParam)) {
    return NextResponse.json(
      { error: "Valid latitude and longitude are required." },
      { status: 400 }
    );
  }

  const nominatimUrl = new URL("https://nominatim.openstreetmap.org/reverse");
  nominatimUrl.searchParams.set("format", "json");
  nominatimUrl.searchParams.set("lat", String(latParam));
  nominatimUrl.searchParams.set("lon", String(lngParam));
  nominatimUrl.searchParams.set("addressdetails", "1");

  try {
    const response = await fetch(nominatimUrl.toString(), {
      headers: {
        Accept: "application/json",
        "Accept-Language": "en",
        "User-Agent": "food-donation-platform/1.0"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json({
        lat: latParam,
        lng: lngParam,
        area: "",
        city: "",
        state: "",
        pincode: "",
        fullAddress: `Latitude ${latParam.toFixed(6)}, Longitude ${lngParam.toFixed(6)}`,
        displayLocation: `Coordinates detected (${latParam.toFixed(4)}, ${lngParam.toFixed(4)})`
      });
    }

    const data = (await response.json()) as NominatimResponse;
    const address = data.address || {};
    const area = pickFirstValue(
      address.suburb,
      address.neighbourhood,
      address.city_district,
      address.quarter,
      address.residential
    );
    const city = pickFirstValue(
      address.city,
      address.town,
      address.municipality,
      address.village,
      address.county
    );
    const state = pickFirstValue(address.state, address.state_district, address.region);
    const pincode = pickFirstValue(address.postcode);
    const displayLocation =
      formatLocationSummary({ area, city, state, pincode }) ||
      data.display_name ||
      `Coordinates detected (${latParam.toFixed(4)}, ${lngParam.toFixed(4)})`;
    const fullAddress =
      data.display_name ||
      displayLocation ||
      `Latitude ${latParam.toFixed(6)}, Longitude ${lngParam.toFixed(6)}`;

    return NextResponse.json({
      lat: latParam,
      lng: lngParam,
      area,
      city,
      state,
      pincode,
      fullAddress,
      displayLocation
    });
  } catch {
    return NextResponse.json({
      lat: latParam,
      lng: lngParam,
      area: "",
      city: "",
      state: "",
      pincode: "",
      fullAddress: `Latitude ${latParam.toFixed(6)}, Longitude ${lngParam.toFixed(6)}`,
      displayLocation: `Coordinates detected (${latParam.toFixed(4)}, ${lngParam.toFixed(4)})`
    });
  }
}
