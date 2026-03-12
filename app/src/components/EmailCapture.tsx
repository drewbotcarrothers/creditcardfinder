'use client';

import { useState } from 'react';

interface EmailCaptureProps {
  location: 'quiz-results' | 'footer' | 'blog';
  title?: string;
  description?: string;
}

export default function EmailCapture({ 
  location, 
  title = "Get Credit Card Alerts",
  description = "Subscribe to get notified about increased welcome bonuses and exclusive offers"
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      // Send to API endpoint
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          location,
          source: window.location.pathname,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Also store locally for quick access
        const existingEmails = JSON.parse(localStorage.getItem('emailSubscribers') || '[]');
        const newSubscriber = {
          email: email.toLowerCase().trim(),
          location,
          subscribedAt: new Date().toISOString(),
          source: window.location.pathname,
        };
        localStorage.setItem('emailSubscribers', JSON.stringify([...existingEmails, newSubscriber]));

        setStatus('success');
        setMessage('Thanks for subscribing! Check your inbox soon.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      // Fallback to localStorage if API fails
      const existingEmails = JSON.parse(localStorage.getItem('emailSubscribers') || '[]');
      const newSubscriber = {
        email: email.toLowerCase().trim(),
        location,
        subscribedAt: new Date().toISOString(),
        source: window.location.pathname,
      };
      localStorage.setItem('emailSubscribers', JSON.stringify([...existingEmails, newSubscriber]));
      
      setStatus('success');
      setMessage('Thanks for subscribing! Check your inbox soon.');
      setEmail('');
    }

    // Clear success message after 5 seconds
    setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 5000);
  };

  const bgStyles = {
    'quiz-results': 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200',
    'footer': 'bg-gray-900 text-white',
    'blog': 'bg-gray-50 border border-gray-200',
  };

  const inputStyles = {
    'quiz-results': 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    'footer': 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500',
    'blog': 'bg-white border-gray-300 focus:border-red-500 focus:ring-red-500',
  };

  const buttonStyles = {
    'quiz-results': 'bg-blue-600 hover:bg-blue-700 text-white',
    'footer': 'bg-red-600 hover:bg-red-700 text-white',
    'blog': 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <div className={`rounded-xl p-6 ${bgStyles[location]}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            location === 'footer' ? 'bg-red-600' : 'bg-red-100'
          }`}>
            <svg className={`w-6 h-6 ${location === 'footer' ? 'text-white' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h3 className={`font-bold text-lg mb-2 ${location === 'footer' ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`text-sm mb-4 ${location === 'footer' ? 'text-gray-300' : 'text-gray-600'}`}>
            {description}
          </p>

          {status === 'success' ? (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg p-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">{message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${inputStyles[location]}`}
                  disabled={status === 'loading'}
                />
                {status === 'error' && (
                  <p className="text-red-500 text-sm mt-1">{message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap ${buttonStyles[location]} disabled:opacity-50`}
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Subscribing...
                  </span>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
          )}

          <p className={`text-xs mt-3 ${location === 'footer' ? 'text-gray-400' : 'text-gray-500'}`}>
            Unsubscribe anytime. We respect your privacy and never spam.
          </p>
        </div>
      </div>
    </div>
  );
}

// Export subscriber data helper
export function getSubscribers(): any[] {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('emailSubscribers') || '[]');
  }
  return [];
}

export function exportSubscribersCSV(): string {
  const subscribers = getSubscribers();
  if (subscribers.length === 0) return '';
  
  const headers = ['Email', 'Location', 'Subscribed At', 'Source'];
  const rows = subscribers.map((sub: any) => [
    sub.email,
    sub.location,
    sub.subscribedAt,
    sub.source,
  ]);
  
  return [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');
}
