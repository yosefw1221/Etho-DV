'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

const Footer: React.FC = () => {
  const t = useTranslations();

  return (
    <footer className="bg-gray-900 text-white py-8 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-gray-300">
          {t('footer.copyright')}
        </p>
        <div className="mt-4 flex justify-center space-x-6 text-sm">
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;