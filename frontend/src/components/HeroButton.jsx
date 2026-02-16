import React from 'react';

const HeroButton = React.forwardRef(({ children, className, style, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`${className} relative px-8 py-3 text-lg font-bold text-white bg-transparent border-2 border-white rounded-[50px] cursor-pointer overflow-hidden transition-all duration-400 backdrop-blur-sm z-10 hover:text-black hover:bg-white hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md group`}
      style={{
        fontFamily: '"Cairo", sans-serif',
        ...style
      }}
      {...props}
    >
      <div className="relative z-20">
        {children}
      </div>
      <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-400 z-10" />
    </button>
  );
});

HeroButton.displayName = "HeroButton";

export default HeroButton;
