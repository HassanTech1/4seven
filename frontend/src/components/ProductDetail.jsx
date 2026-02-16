import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { selectedProduct, closeProductDetail, addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('M');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isCareOpen, setIsCareOpen] = useState(false);

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Generate multiple images for carousel (in real app, these would come from product data)
  const productImages = selectedProduct ? [
    selectedProduct.image,
    selectedProduct.preview || selectedProduct.image, // Use preview if available
    selectedProduct.image,
  ] : [];

  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
      setCurrentImageIndex(0);
      setSelectedSize('M');
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleAddToCart = () => {
    addToCart(selectedProduct, selectedSize, 1);
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, selectedSize, 1);
    // Navigate to checkout (will be implemented with routing)
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-white overflow-y-auto"
      data-testid="product-detail-modal"
    >
      {/* Close Button */}
      <button
        onClick={closeProductDetail}
        className="fixed top-6 right-6 z-[110] w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
        data-testid="close-product-detail"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Image Gallery */}
        <div className="lg:w-1/2 relative bg-gray-50">
          {/* Badge */}
          <div className="absolute top-6 left-6 z-10">
            <span className="text-sm text-gray-500 tracking-wider">Unisex</span>
          </div>

          {/* Main Image */}
          <div className="relative h-[60vh] lg:h-screen flex items-center justify-center">
            <img
              src={productImages[currentImageIndex]}
              alt={selectedProduct.nameEn}
              className="max-h-full max-w-full object-contain"
              data-testid="product-main-image"
            />

            {/* Navigation Arrows */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
              data-testid="prev-image-btn"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
              data-testid="next-image-btn"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Thumbnails */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
            {productImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-16 h-20 border-2 overflow-hidden transition-all ${
                  currentImageIndex === index ? 'border-black' : 'border-transparent'
                }`}
                data-testid={`thumbnail-${index}`}
              >
                <img
                  src={img}
                  alt={`View ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side - Product Info */}
        <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center" dir="ltr">
          {/* Product Name & Price */}
          <h1 
            className="text-2xl lg:text-3xl font-medium tracking-wide uppercase mb-2"
            data-testid="product-name"
          >
            {selectedProduct.nameEn}
          </h1>
          <p 
            className="text-lg text-gray-700 mb-8"
            data-testid="product-price"
          >
            {selectedProduct.price.toFixed(2)} SAR
          </p>

          {/* Size Selection */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Size</span>
              <button className="text-sm text-gray-500 underline hover:text-black transition-colors">
                Size guide
              </button>
            </div>
            <div className="flex gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 border-2 flex items-center justify-center text-sm font-medium transition-all ${
                    selectedSize === size
                      ? 'border-black bg-white'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  data-testid={`size-${size}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full py-4 border-2 border-black bg-white text-black font-medium uppercase tracking-wider hover:bg-black hover:text-white transition-all mb-4"
            data-testid="add-to-cart-btn"
          >
            ADD TO CART
          </button>

          {/* Buy Now Button */}
          <button
            onClick={handleBuyNow}
            className="w-full py-4 bg-white text-black font-medium uppercase tracking-wider hover:underline transition-all mb-8"
            data-testid="buy-now-btn"
          >
            BUY IT NOW
          </button>

          {/* Accordion Sections */}
          <div className="border-t border-gray-200">
            {/* Description */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                className="w-full py-4 flex items-center justify-between text-left"
                data-testid="description-toggle"
              >
                <span className="font-medium">Description</span>
                <Plus className={`w-4 h-4 transition-transform ${isDescriptionOpen ? 'rotate-45' : ''}`} />
              </button>
              {isDescriptionOpen && (
                <div className="pb-4 text-gray-600 text-sm leading-relaxed">
                  <p>{selectedProduct.nameEn} - Premium quality fashion item from the 7777 collection. 
                  Made with the finest materials for ultimate comfort and style. 
                  Perfect for both casual and formal occasions.</p>
                </div>
              )}
            </div>

            {/* Care & Maintenance */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => setIsCareOpen(!isCareOpen)}
                className="w-full py-4 flex items-center justify-between text-left"
                data-testid="care-toggle"
              >
                <span className="font-medium uppercase">CARE AND MAINTENANCE</span>
                <Plus className={`w-4 h-4 transition-transform ${isCareOpen ? 'rotate-45' : ''}`} />
              </button>
              {isCareOpen && (
                <div className="pb-4 text-gray-600 text-sm leading-relaxed">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Machine wash cold with like colors</li>
                    <li>Do not bleach</li>
                    <li>Tumble dry low</li>
                    <li>Cool iron if needed</li>
                    <li>Do not dry clean</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
