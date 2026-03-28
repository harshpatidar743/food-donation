"use client";

import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { Donation, SearchDonation } from '../Donation/types';
import ShareDonationButton from '@/app/components/ShareDonationButton';
import {
  formatAvailableQuantityDisplay,
  getCompactExpiryLabel,
  getDonationAddress,
  getDonationLocationLabel,
  getDonationStatus,
  getDonationTitle,
  getExpiryMeta,
  getPhoneHref,
  normalizeText
} from '../Donation/utils';
import { buildDonationDetailPath } from '@/app/lib/publicDonations';

// Dynamic import for SSR safety
const LocationMapPreview = dynamic(
  () => import('../components/LocationMapPreview').then((mod) => ({ default: mod.default })),
  { ssr: false }
);

type DonationCardProps = {
  donation: Donation | SearchDonation;
  showDonorName?: boolean;
  currentLat?: number;
  currentLng?: number;
} & Partial<SearchDonation>;

export default function DonationCard({
  donation,
  showDonorName = false,
  currentLat,
  currentLng
}: DonationCardProps) {
  const expiryMeta = getExpiryMeta(donation.availableUntil);
  const expiryLabel = getCompactExpiryLabel(donation.availableUntil);
  const phoneHref = getPhoneHref(donation.contactNumber);
  const donorName =
    'name' in (donation.donorId as any) 
      ? normalizeText((donation.donorId as any).name)
      : '';
  const donationStatus = getDonationStatus(donation);
  const locationLabel = getDonationLocationLabel(donation);
  const pickupAddress = getDonationAddress(donation);
  const showPickupAddress =
    pickupAddress &&
    pickupAddress.toLowerCase() !== locationLabel.toLowerCase();
  const detailPath = buildDonationDetailPath(donation._id);

  return (
    <article className={`donation-item donation-item--${expiryMeta.tone}`}>
      {donation.foodImage?.dataUrl ? (
        <div className="donation-image-wrap donation-image-wrap--compact">
          <Image
            className="donation-image donation-image--compact"
            src={donation.foodImage.dataUrl}
            alt={getDonationTitle(donation)}
            width={80}
            height={80}
            sizes="80px"
            unoptimized
          />
        </div>
      ) : (
        <div className="donation-image-wrap donation-image-wrap--compact donation-image-wrap--placeholder">
          <span>No image</span>
        </div>
      )}

      <div className="donation-item-content donation-item-content--compact">
        <div className="donation-item-topline">
          <h3 className="donation-title">{getDonationTitle(donation)}</h3>
          <span className={`status-badge status-badge--${donationStatus}`}>
            {donationStatus === 'expired'
              ? 'Expired'
              : donationStatus === 'completed'
                ? 'Completed'
                : 'Available'}
          </span>
        </div>

        {showDonorName && donorName && <p className="donation-donor">Donor: {donorName}</p>}
        {('routeInfo' in donation && donation.routeInfo) && (
          <p className="donation-distance">
            🚗 Driving: {donation.routeInfo.routeTimeMin} min ({donation.routeInfo.routeDistanceKm.toFixed(1)} km) | 🚶 Walking: {donation.routeInfo.walkingTimeMin} min ({donation.routeInfo.walkingDistanceKm.toFixed(1)} km)
            {donation.routeInfo.error && <span className="route-estimate"> (est)</span>}
          </p>
        )}
        <p className="donation-location">{locationLabel}</p>
        {showPickupAddress && (
          <p className="donation-location-detail">Pickup: {pickupAddress}</p>
        )}

        <div className="donation-inline-row">
          <span>{formatAvailableQuantityDisplay(donation)}</span>
          <span className={`donation-expiry donation-expiry--${expiryMeta.tone}`}>
            {expiryLabel}
          </span>
        </div>

        <div className="donation-actions">
          {phoneHref ? (
            <a className="call-button call-button--compact" href={phoneHref}>
              Call
            </a>
          ) : (
            <span className="call-button call-button--compact call-button--disabled">
              No contact
            </span>
          )}
          <Link
            className="call-button call-button--compact call-button--secondary"
            href={detailPath}
          >
            View Details
          </Link>
          <ShareDonationButton
            pathOrUrl={detailPath}
            title={getDonationTitle(donation)}
            className="call-button call-button--compact call-button--secondary"
          />
          <LocationMapPreview
            lat={donation.lat}
            lng={donation.lng}
            currentLat={currentLat}
            currentLng={currentLng}
            title={getDonationTitle(donation)}
            buttonClassName="call-button call-button--compact call-button--secondary"
            disabledButtonClassName="call-button call-button--compact call-button--disabled"
          />
        </div>
      </div>
    </article>
  );
}
