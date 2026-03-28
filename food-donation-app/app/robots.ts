import { MetadataRoute } from "next";

const baseUrl = "https://foodmatch.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/donor/dashboard",
          "/donor/myDonations",
          "/api/"
        ]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}
