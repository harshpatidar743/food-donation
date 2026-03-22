"use client";

import Image from "next/image";
import { Donation } from "../types";
import {
  formatPostedAgo,
  formatQuantityDisplay,
  formatRemainingQuantityDisplay,
  getDonationAddress,
  getDonationStatus,
  getDonationTitle,
  getExpiryMeta,
  getPhoneHref,
  getQuantityProgress,
  getRemainingQuantity,
  normalizeText
} from "../utils";

type DonationCardProps = {
  donation: Donation;
  showDonorName?: boolean;
};

export default function DonationCard({
  donation,
  showDonorName = false
}: DonationCardProps) {
  const expiryMeta = getExpiryMeta(donation.availableUntil);
  const phoneHref = getPhoneHref(donation.contactNumber);
  const donorName =
    donation.donorId && typeof donation.donorId === "object" && donation.donorId.name
      ? normalizeText(donation.donorId.name)
      : "";
  const donationStatus = getDonationStatus(donation);
  const progressPercent = getQuantityProgress(donation);
  const remainingQuantity = getRemainingQuantity(donation);

  return (
    <article className={`donation-item donation-item--${expiryMeta.tone}`}>
      {donation.foodImage?.dataUrl && (
        <div className="donation-image-wrap">
          <Image
            className="donation-image"
            src={donation.foodImage.dataUrl}
            alt={getDonationTitle(donation)}
            fill
            sizes="(max-width: 900px) 100vw, 150px"
            unoptimized
          />
        </div>
      )}

      <div className="donation-item-content donation-item-content--spacious">
        <div className="donation-item-header">
          <div className="donation-heading-stack">
            <p className="donation-posted-time">{formatPostedAgo(donation.createdAt)}</p>
            {showDonorName && donorName && (
              <p className="donation-shared-by">Shared by {donorName}</p>
            )}
            <h3 className="donation-title">🍽️ {getDonationTitle(donation)}</h3>
          </div>

          <div className="donation-badges">
            <span className={`status-badge status-badge--${donationStatus}`}>
              {donationStatus === "expired"
                ? "🔴 Expired"
                : donationStatus === "completed"
                  ? "⚪ Completed"
                  : "🟢 Available"}
            </span>
            <span className="donation-badge">{donation.foodCategory || "Food"}</span>
          </div>
        </div>

        <div className="donation-body">
          <div className="donation-details-grid">
            {/* <p className="donation-detail-row donation-detail-row--spacious">
              <span className="donation-icon">🍽️</span>
              <span>{formatQuantityDisplay(remainingQuantity, donation.quantityUnit)}</span>
            </p> */}

            <p className="donation-detail-row donation-detail-row--spacious">
              <span className="donation-icon">📍</span>
              <span>{getDonationAddress(donation)}</span>
            </p>

            <p
              className={`donation-detail-row donation-detail-row--spacious expiry-row expiry-row--${expiryMeta.tone}`}
            >
              <span className="donation-icon">⏳</span>
              <span>{expiryMeta.label}</span>
            </p>
          </div>

          <div className="donation-progress-block">
            <div className="donation-progress-copy">
              <span className="donation-progress-label">
                {formatRemainingQuantityDisplay(donation)}
              </span>
              <span className="donation-progress-percent">{progressPercent}% left</span>
            </div>
            <div className="donation-progress-track" aria-hidden="true">
              <div
                className="donation-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {donation.additionalNotes && (
            <p className="donation-note">{donation.additionalNotes}</p>
          )}
        </div>

        <div className="donation-actions donation-actions--spaced">
          {phoneHref ? (
            <a className="call-button" href={phoneHref}>
              📞 Call Now
            </a>
          ) : (
            <span className="call-button call-button--disabled">📞 Contact unavailable</span>
          )}
        </div>
      </div>
    </article>
  );
}
