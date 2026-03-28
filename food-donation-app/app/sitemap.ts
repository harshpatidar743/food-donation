import { MetadataRoute } from "next";

const baseUrl = "https://foodmatch.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-03-28");

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${baseUrl}/Donation`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${baseUrl}/GetFood`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${baseUrl}/AboutUs`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      url: `${baseUrl}/ContactUs`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      url: `${baseUrl}/donor/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4
    },
    {
      url: `${baseUrl}/donor/register`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5
    }
  ];
}
