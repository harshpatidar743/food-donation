import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import LocationMapPreview from "@/app/components/LocationMapPreview";
import ShareDonationButton from "@/app/components/ShareDonationButton";
import type { Donation } from "@/app/Donation/types";
import {
  formatAvailableQuantityDisplay,
  getDonationAddress,
  getDonationLocationLabel,
  getDonationTitle,
  getPhoneHref
} from "@/app/Donation/utils";
import {
  buildDonationDetailUrl,
  fetchPublicDonationById,
  SITE_URL
} from "@/app/lib/publicDonations";
import styles from "./page.module.css";

export const revalidate = 60;

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const getDonationById = cache(async (id: string) => fetchPublicDonationById(id));

const buildMetadataDescription = (donation: Donation) => {
  const locationLabel = getDonationLocationLabel(donation);
  const expiryLabel = new Date(donation.availableUntil).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  return `${formatAvailableQuantityDisplay(donation)} of ${donation.foodName} (${donation.foodCategory}) available in ${locationLabel}. Pickup before ${expiryLabel}.`;
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });

const getDonorName = (donation: Donation) =>
  donation.donorId && typeof donation.donorId === "object" && donation.donorId.name
    ? donation.donorId.name
    : "Verified donor";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const donation = await getDonationById(id);

  if (!donation) {
    return {
      title: "Donation Not Found | Food Donation Platform",
      robots: {
        index: false,
        follow: false
      }
    };
  }

  const title = `${getDonationTitle(donation)} in ${getDonationLocationLabel(donation)} | Food Donation Platform`;
  const description = buildMetadataDescription(donation);
  const url = buildDonationDetailUrl(id);

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Food Donation Platform",
      type: "article",
      images: donation.foodImage?.dataUrl
        ? [
            {
              url: donation.foodImage.dataUrl,
              alt: getDonationTitle(donation)
            }
          ]
        : undefined
    },
    twitter: {
      card: donation.foodImage?.dataUrl ? "summary_large_image" : "summary",
      title,
      description
    }
  };
}

export default async function DonationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const donation = await getDonationById(id);

  if (!donation) {
    notFound();
  }

  const locationLabel = getDonationLocationLabel(donation);
  const pickupAddress = getDonationAddress(donation);
  const donorName = getDonorName(donation);
  const phoneHref = getPhoneHref(donation.contactNumber);
  const pageUrl = buildDonationDetailUrl(id);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: getDonationTitle(donation),
    description: buildMetadataDescription(donation),
    mainEntityOfPage: pageUrl,
    image: donation.foodImage?.dataUrl ? [donation.foodImage.dataUrl] : undefined,
    dateModified: donation.updatedAt,
    author: {
      "@type": "Organization",
      name: "Food Donation Platform"
    }
  };

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Live Donation Listing</span>
          <h1 className={styles.title}>{getDonationTitle(donation)}</h1>
          <p className={styles.subtitle}>
            {formatAvailableQuantityDisplay(donation)} available for pickup in {locationLabel}.
          </p>
        </div>
      </header>

      <main className={styles.content}>
        <Link href="/GetFood" className={styles.backLink}>
          Back to Available Donations
        </Link>

        <div className={styles.grid}>
          <article className={`${styles.card} ${styles.primaryCard}`}>
            <div className={styles.imageWrap}>
              {donation.foodImage?.dataUrl ? (
                <Image
                  src={donation.foodImage.dataUrl}
                  alt={getDonationTitle(donation)}
                  fill
                  className={styles.image}
                  unoptimized
                />
              ) : (
                <div className={styles.imagePlaceholder}>No Image Available</div>
              )}
            </div>

            <div className={styles.body}>
              <div className={styles.headerRow}>
                <h2 className={styles.heading}>{donation.foodName}</h2>
                <span className={styles.status}>Available</span>
              </div>

              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Food Type</span>
                  <div className={styles.metaValue}>{donation.foodCategory}</div>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Available Quantity</span>
                  <div className={styles.metaValue}>
                    {formatAvailableQuantityDisplay(donation)}
                  </div>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Prepared</span>
                  <div className={styles.metaValue}>
                    {formatDateTime(donation.foodPreparedTime)}
                  </div>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Pickup Before</span>
                  <div className={styles.metaValue}>
                    {formatDateTime(donation.availableUntil)}
                  </div>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Pickup Area</span>
                  <div className={styles.metaValue}>{locationLabel}</div>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Pickup Address</span>
                  <div className={styles.metaValue}>{pickupAddress}</div>
                </div>
              </div>

              {donation.additionalNotes ? (
                <section className={styles.notes}>
                  <h2>Additional Notes</h2>
                  <p>{donation.additionalNotes}</p>
                </section>
              ) : null}
            </div>
          </article>

          <aside className={styles.sidebar}>
            <section className={`${styles.card} ${styles.sidebarCard}`}>
              <h2 className={styles.sidebarTitle}>Pickup Contact</h2>
              <p className={styles.sidebarCopy}>
                Donor: {donorName}
              </p>
              <p className={styles.sidebarCopy}>
                Call before pickup to confirm food readiness and collection details.
              </p>

              <div className={styles.actionStack}>
                <a href={phoneHref} className={styles.button}>
                  Call Donor
                </a>
                <ShareDonationButton
                  pathOrUrl={pageUrl}
                  title={getDonationTitle(donation)}
                  className={styles.secondaryButton}
                  idleLabel="Share Donation"
                  copiedLabel="Link Copied"
                />
                <Link href="/GetFood" className={styles.secondaryButton}>
                  Browse More Donations
                </Link>
              </div>
            </section>

            <section className={`${styles.card} ${styles.sidebarCard}`}>
              <h2 className={styles.sidebarTitle}>Pickup Location</h2>
              <p className={styles.sidebarCopy}>{pickupAddress}</p>
              <div className={styles.mapShell}>
                <LocationMapPreview
                  lat={donation.lat}
                  lng={donation.lng}
                  title={getDonationTitle(donation)}
                  buttonClassName={styles.button}
                  disabledButtonClassName={styles.secondaryButton}
                />
              </div>
              <p className={styles.routeNote}>
                This public page only shares pickup details for active food donations.
              </p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
