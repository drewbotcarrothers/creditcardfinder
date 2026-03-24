'use client';

import { useState } from 'react';

interface YouTubeEmbedProps {
  embedUrl: string;
  title: string;
}

export default function YouTubeEmbed({ embedUrl, title }: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (!embedUrl) return null;

  return (
    <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600 text-lg">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </span>
        Video Review
      </h2>
      
      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 shadow-lg">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p className="text-gray-400 text-sm">Loading video...</p>
            </div>
          </div>
        )}
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoaded(true)}
          className="absolute inset-0 w-full h-full"
        />
      </div>
      
      <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        Watch our detailed video review for the full breakdown and honest opinions
      </p>
    </div>
  );
}
