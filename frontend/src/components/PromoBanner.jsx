import React from 'react';
import newBg from '../assest/preview/new-background.jpg';

const PromoBanner = () => {
  return (
    <section className="relative h-[500px] lg:h-[600px] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${newBg})`,
        }}
      />
      
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center px-8">
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight promo-text">
              Elevate Your Style<br />With Premium Essentials
          </h2>
          <p className="text-2xl lg:text-3xl text-gold font-light mb-8" style={{ color: '#FFFFFF' }}>
            Complete your summer ensemble with our latest collection
          </p>
          <button className="cta-button">
            Discover Collection
          </button>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
