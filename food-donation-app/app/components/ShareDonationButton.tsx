"use client";

import { useState } from "react";

type ShareDonationButtonProps = {
  pathOrUrl: string;
  title: string;
  text?: string;
  className: string;
  idleLabel?: string;
  copiedLabel?: string;
};

const buildShareUrl = (pathOrUrl: string) => {
  if (typeof window === "undefined") {
    return pathOrUrl;
  }

  try {
    return new URL(pathOrUrl, window.location.origin).toString();
  } catch {
    return pathOrUrl;
  }
};

export default function ShareDonationButton({
  pathOrUrl,
  title,
  text = "Check out this active food donation listing.",
  className,
  idleLabel = "Share",
  copiedLabel = "Link Copied"
}: ShareDonationButtonProps) {
  const [label, setLabel] = useState(idleLabel);

  const handleShare = async () => {
    const shareUrl = buildShareUrl(pathOrUrl);

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url: shareUrl
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setLabel(copiedLabel);
      window.setTimeout(() => setLabel(idleLabel), 2000);
    } catch {
      // Ignore cancel/share errors to keep the interaction quiet.
    }
  };

  return (
    <button type="button" className={className} onClick={handleShare}>
      {label}
    </button>
  );
}
