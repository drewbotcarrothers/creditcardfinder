"use client";

import { buildAffiliateLink, AFFILIATE_DISCLOSURE } from "@/lib/affiliate";

interface ApplyButtonProps {
  productLink: string;
  issuer: string;
  cardName: string;
  location: string;
}

export default function ApplyButton({ productLink, issuer, cardName, location }: ApplyButtonProps) {
  const handleClick = () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "apply_click", {
        event_category: "affiliate",
        event_label: cardName,
        issuer: issuer,
        location: location,
      });
    }
  };

  if (!productLink || productLink === "#") {
    return (
      <div className="w-full bg-gray-300 text-gray-600 font-bold py-4 px-6 rounded-xl text-center cursor-not-allowed">
        Apply Link Unavailable
      </div>
    );
  }

  return (
    <>
      <a
        href={buildAffiliateLink(productLink, issuer)}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl text-center transition-colors flex items-center justify-center gap-2"
        onClick={handleClick}
      >
        Apply Now
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-semibold">Disclosure: </span>
          {AFFILIATE_DISCLOSURE}
        </p>
      </div>
    </>
  );
}
