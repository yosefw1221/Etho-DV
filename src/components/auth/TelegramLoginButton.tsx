'use client';

import React, { useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';

interface TelegramLoginButtonProps {
  locale: string;
  className?: string;
}

// Telegram auth data type
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

// Extend window object to include Telegram callback
declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void;
  }
}

const TelegramLoginButton: React.FC<TelegramLoginButtonProps> = ({
  locale,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Define the callback function that Telegram widget will call
    window.onTelegramAuth = async (user: TelegramUser) => {
      try {
        // Sign in using NextAuth with credentials provider
        const result = await signIn('telegram', {
          redirect: true,
          callbackUrl: `/${locale}/dashboard`,
          id: user.id.toString(),
          first_name: user.first_name,
          last_name: user.last_name || '',
          username: user.username || '',
          photo_url: user.photo_url || '',
          auth_date: user.auth_date.toString(),
          hash: user.hash,
        });

        if (result?.error) {
          console.error('Telegram authentication failed:', result.error);
          alert('Authentication failed. Please try again.');
        }
      } catch (error) {
        console.error('Telegram authentication error:', error);
        alert('An error occurred during authentication.');
      }
    };

    // Load Telegram widget script if not already loaded
    if (!document.getElementById('telegram-login-script')) {
      const script = document.createElement('script');
      script.id = 'telegram-login-script';
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.async = true;
      script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'YourBotUsername');
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');

      if (containerRef.current) {
        containerRef.current.appendChild(script);
      }
    }

    // Cleanup
    return () => {
      delete window.onTelegramAuth;
    };
  }, [locale]);

  return (
    <div ref={containerRef} className={className}>
      {/* Telegram widget will be inserted here */}
      <noscript>
        You need to enable JavaScript to use Telegram Login.
      </noscript>
    </div>
  );
};

export default TelegramLoginButton;
