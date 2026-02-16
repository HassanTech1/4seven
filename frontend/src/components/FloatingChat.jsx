import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

const FloatingChat = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show chat button after scrolling past hero section (100vh)
      setIsVisible(window.scrollY > window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWhatsAppClick = () => {
    // Open WhatsApp in new tab (replace with actual number)
    window.open('https://wa.me/966500000000', '_blank');
  };

  return (
    <div 
      className={`fixed bottom-8 left-8 z-50 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'
      }`}
    >
      <button
        onClick={handleWhatsAppClick}
        className="floating-chat-button group"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-full mr-4 whitespace-nowrap bg-black text-white px-4 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          تواصل معنا عبر واتساب
        </span>
      </button>
    </div>
  );
};

export default FloatingChat;
