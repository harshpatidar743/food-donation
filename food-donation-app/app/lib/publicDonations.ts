import type { Donation } from "@/app/Donation/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:5000";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://foodmatch.in";

export const buildDonationDetailPath = (id: string) => `/Donation/${id}`;

export const buildDonationDetailUrl = (id: string) => `${SITE_URL}${buildDonationDetailPath(id)}`;

const normalizeDonationResponse = async (response: Response) => {
  if (!response.ok) {
    return null;
  }

  return (await response.json()) as Donation;
};

export const fetchPublicDonationById = async (id: string): Promise<Donation | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/donation/${id}`, {
      next: { revalidate: 60 }
    });

    return normalizeDonationResponse(response);
  } catch {
    return null;
  }
};

export const fetchActiveDonations = async (): Promise<Donation[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/donations`, {
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as Donation[];
  } catch {
    return [];
  }
};
