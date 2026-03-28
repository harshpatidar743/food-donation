import { NextRequest, NextResponse } from "next/server";
import { formatLocationSummary } from "@/app/lib/location";

export const runtime = "nodejs";

type NominatimSearchResponse = {
  lat: string;
  lon: string;
  display_name: string;
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
  const addressQuery = request.nextUrl.searchParams.get("address");
  
  if (!addressQuery || addressQuery.trim().length === 0) {
    return NextResponse.json(
      { error: "Address query parameter is required." },
      { status: 400 }
    );
  }

  const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
  nominatimUrl.searchParams.set("format", "json");
  nominatimUrl.searchParams.set("q", addressQuery.trim());
  nominatimUrl.searchParams.set("addressdetails", "1");
  nominatimUrl.searchParams.set("limit", "1");

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
      return NextResponse.json(
        { error: "Unable to search for the address." },
        { status: 502 }
      );
    }

    const data = (await response.json()) as NominatimSearchResponse[];
    
    if (data.length === 0) {
      return NextResponse.json(
        { error: "No results found for the given address." },
        { status: 404 }
      );
    }

    const firstResult = data[0];
    const address = firstResult.address || {};
    
    const lat = parseFloat(firstResult.lat);
    const lng = parseFloat(firstResult.lon);
    
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { error: "Invalid coordinates returned from geocoding service." },
        { status: 502 }
      );
    }

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

    return NextResponse.json({
      lat,
      lng,
      area,
      city,
      state,
      pincode,
      fullAddress: firstResult.display_name,
      displayLocation: formatLocationSummary({ area, city, state, pincode })
    });
  } catch {
    return NextResponse.json(
      { error: "Forward geocoding failed. Please try again." },
      { status: 500 }
    );
  }
}

