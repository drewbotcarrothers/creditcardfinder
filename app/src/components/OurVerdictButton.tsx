"use client";

import { buildAffiliateLink } from "@/lib/affiliate";

interface OurVerdictButtonProps {
  productLink: string;
}

export default function OurVerdictButton({ productLink }: OurVerdictButtonProps) {
  if (!productLink || productLink === "#") {
    return null;
  }

  return (
    <a
      href={buildAffiliateLink(productLink, "")}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-white text-red-600 font-bold py-3 px-6 rounded-xl hover:bg-red-50 transition-colors"
    >
      Apply Now
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}
