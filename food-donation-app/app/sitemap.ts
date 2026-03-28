import { MetadataRoute } from "next";
import { fetchActiveDonations, buildDonationDetailUrl, SITE_URL } from "@/app/lib/publicDonations";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date("2026-03-28");
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${SITE_URL}/Donation`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${SITE_URL}/GetFood`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${SITE_URL}/AboutUs`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${SITE_URL}/ContactUs`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5
    }
  ];

  const activeDonations = await fetchActiveDonations();
  const donationRoutes: MetadataRoute.Sitemap = activeDonations.map((donation) => ({
    url: buildDonationDetailUrl(donation._id),
    lastModified: new Date(donation.updatedAt || donation.createdAt || lastModified),
    changeFrequency: "daily",
    priority: 0.8
  }));

  return [...staticRoutes, ...donationRoutes];
}
