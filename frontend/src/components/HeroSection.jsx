import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroButton from './HeroButton';
import hero1 from './hero_1.png';
import { color } from 'three/tsl';

gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
  const heroRef = useRef(null);
  const leftButtonRef = useRef(null);
  const rightButtonRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    const leftButton = leftButtonRef.current;
    const rightButton = rightButtonRef.current;

    // Simple fade on scroll - NO drag effect
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=100%',
        scrub: 1,
        pin: false,
      }
    });

    // Just fade out, no movement
    tl.to([leftButton, rightButton], {
      opacity: 0,
      duration: 1,
    }, 0);

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div 
      ref={heroRef}
      className="hero-section relative w-full flex flex-col md:flex-row"
      style={{ minHeight: '100vh' }}
    >
      {/* Background Images Layer (Revealed after animation) */}
      <div className="absolute inset-0 z-0 flex flex-col md:flex-row">
        {/* Left Side: Image + Ad (Static) */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden bg-red-800">
          <img 
            src={hero1} 
            alt="Woman Fashion" 
            className="w-full h-full object-cover opacity-80 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-black/20"></div> {/* Overlay for text readability */}
          
          {/* The "Ad" Content */}
          
        </div>

        {/* Right Side: Image (Static or revealed?) - Keeping Black cover but putting image behind just in case */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden bg-black">
           {/* Image Removed as per request */}
        </div>
      </div>

      {/* Static Right Side Panel (Covers the right background image layer on desktop) */}
      <div className="hidden md:flex relative md:absolute right-0 top-0 w-full md:w-1/2 h-full bg-black z-20 flex-col justify-center items-center text-center p-8 md:p-12">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 md:mb-6 tracking-widest font-serif leading-tight" style={{ fontFamily: '"Dancing Script", cursive' }}>
              7777 <br/> 
            </h2>
            <p className="text-base md:text-lg text-gray-400 mb-8 md:mb-10 max-w-md leading-relaxed">
              Discover the new standards of elegance. 
              Meticulously crafted for the modern individual.
            </p>
            <button className="px-8 md:px-10 py-3 md:py-4 border border-white/30 bg-white/5 backdrop-blur-sm text-white hover:bg-white hover:text-black transition-all duration-500 uppercase tracking-widest text-xs md:text-sm pointer-events-auto">
              Shop Collection
            </button>
      </div>

      {/* Center Branding - Raised Higher */}



      {/* Split Buttons - Fixed Position, Bottom of Screen */}
      <div className="absolute bottom-20 left-0 right-0 flex items-center justify-center z-40 gap-4 md:gap-8 pointer-events-auto">
        {/* Large Outlined Text Background */}
         <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 -z-10 whitespace-nowrap select-none pointer-events-none hidden md:block">
          <h1 
            className="text-[10rem] font-bold leading-none tracking-tighter"
            style={{
              fontFamily: '"Dancing Script", cursive',
              WebkitTextStroke: '1px rgba(255, 255, 255, 0.3)',
              color: 'transparent'
            }}
          >
            ٧٧<span style={{ color: 'red' }}>٧٧</span>
          </h1>
        </div>

        {/* Left Button - "For Her" */}
        <HeroButton ref={leftButtonRef} style={{ opacity: 1, minWidth: '120px', padding: '10px 20px' }} className="text-sm md:text-base md:min-w-[160px]">
          For Her
        </HeroButton>

        {/* Right Button - "For Him" */}
        <HeroButton ref={rightButtonRef} style={{ opacity: 1, minWidth: '120px', padding: '10px 20px' }} className="text-sm md:text-base md:min-w-[160px]">
          For Him
        </HeroButton>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-10">
        {/* Left side (red) decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-64 md:h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-24 h-24 md:w-48 md:h-48 bg-black/20 rounded-full blur-2xl" style={{ animationDelay: '1s' }}></div>
        
        {/* Right side (black) decorative elements */}
        <div className="absolute top-1/3 right-1/4 w-28 h-28 md:w-56 md:h-56 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-36 h-36 md:w-72 md:h-72 bg-red-600/10 rounded-full blur-3xl"></div>
        
        {/* Center glow */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[800px] md:h-[800px] bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Bottom Text */}
      <div className="absolute bottom-8 left-0 right-0 z-40 flex justify-center px-4">
        <div className="text-center">
          <p className="text-xs md:text-lg lg:text-xl text-white/70 tracking-widest uppercase">
            Fall/Winter 2026 Collection | Exclusive Access Ends in 47 Hours
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
