import React from 'react';
import { ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import parisImage from '../assest/preview/p-15.png';

const LifestyleSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-black">
             About 4seven's
            </h2>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
             We are a store specializing in offering the finest selection of modern and elegant hoodies. We believe that fashion should be both comfortable and practical at the same time.
            </p>
            <p className="text-gray-600 text-lg mb-12 leading-relaxed">
             All our products are made from the highest quality premium cotton fabrics, with attention to the finest details to ensure your comfort and complete satisfaction.
            </p>
            
            {/* Features Icons */}
            <div className="flex flex-wrap gap-8 lg:gap-16">
                {/* Feature 1 */}
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-[#0f172a] rounded-lg flex items-center justify-center mb-4 shadow-lg">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">High Quality</h3>
                    <p className="text-gray-500 text-sm">Premium fabrics</p>
                </div>

                {/* Feature 2 */}
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-[#0f172a] rounded-lg flex items-center justify-center mb-4 shadow-lg">
                        <Truck className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">Fast Shipping</h3>
                    <p className="text-gray-500 text-sm">Free delivery</p>
                </div>

                {/* Feature 3 */}
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-[#0f172a] rounded-lg flex items-center justify-center mb-4 shadow-lg">
                        <RotateCcw className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">Easy Returns</h3>
                    <p className="text-gray-500 text-sm">Within 14 days</p>
                </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="order-1 lg:order-2">
            <div className="relative h-[500px] lg:h-[600px] overflow-hidden rounded-2xl shadow-xl">
              <img
                src={parisImage}
                alt="About 4Seven"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default LifestyleSection;
