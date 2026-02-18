import React, { useState } from 'react';
import { Facebook, Youtube, Instagram } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const [email, setEmail] = useState('');
  const { t, language, setLanguage } = useLanguage();

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
    alert(t('alertMessage'));
  };

  return (
    <footer className="bg-white border-t-2 border-black">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Newsletter Section */}
          <div>
            <h3 className="text-xl font-semibold mb-6 uppercase tracking-wide text-black">
              {t('newsletterTitle')}
            </h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              {t('newsletterDesc')}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 text-sm mb-4 focus:outline-none focus:border-black transition-colors"
                required
              />
              <button 
                type="submit"
                className="text-sm uppercase tracking-wider text-black hover:text-gray-600 transition-colors font-medium"
              >
                {t('subscribeBtn')}
              </button>
            </form>
            
            {/* Social Icons */}
            <div className="flex gap-4 mt-8">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-black hover:text-gray-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* About Column - Removed */}
          {/* Client Services Column - Removed */}
        </div>

        {/* Bottom Section */}
        <div className="border-t-2 border-black pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Country & Language Selectors */}
          <div className="flex gap-4">
            <select className="footer-select">
              <option>Saudi Arabia (SAR ر.س)</option>
              <option>United States (USD $)</option>
            </select>
            <select 
              className="footer-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Copyright */}
          <p className="text-gray-600 text-sm">
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
