import React from 'react';
import { products } from '../data/mock';
import { useCart } from '../context/CartContext';
import pro1 from '../assest/product/1.jpeg';
import pro2 from '../assest/product/2.jpeg';
import pro3 from '../assest/product/3.jpeg';
import pro4 from '../assest/product/4.jpeg';

import prev1 from '../assest/preview/1.jpeg';
import prev2 from '../assest/preview/2.jpeg';
import prev3 from '../assest/preview/3.jpeg';
import prev4 from '../assest/preview/4.jpeg';

const ProductGrid = () => {
  const { openProductDetail } = useCart();
  const [hoveredProduct, setHoveredProduct] = React.useState(null);

  // Simplified products for clean display
  const productImages = [pro1, pro2, pro3, pro4];
  const previewImages = [prev1, prev2, prev3, prev4];
  
  const essentialProducts = products.slice(0, 4).map((p, index) => ({
    ...p,
    image: productImages[index], // Use the new image as the main image too
    images: [productImages[index], productImages[index], productImages[index]],
    preview: previewImages[index],
    badge: "Unisex",
  }));

  const handleProductClick = (product) => {
    openProductDetail(product);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-wider uppercase">
            ESSENTIALS
          </h2>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {essentialProducts.map((product) => (
            <div
              key={product.id}
              className="product-card-clean group cursor-pointer"
              onClick={() => handleProductClick(product)}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              data-testid={`product-card-${product.id}`}
            >
              {/* Badge */}
              <div className="text-center mb-4">
                <span className="text-sm text-gray-500 tracking-wider">
                  {product.badge}
                </span>
              </div>

              {/* Product Image */}
              <div className="relative h-96 bg-gray-50 mb-6 overflow-hidden">
                <img
                  src={hoveredProduct === product.id ? product.preview : product.images[0]}
                  alt={product.nameEn}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Product Info */}
              <div className="text-center">
                <h3 className="text-sm font-medium text-black mb-2 uppercase tracking-widest">
                  {product.nameEn}
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-base text-black font-semibold">
                    {product.price}.00 SAR
                  </p>
                  {product.isNew && (
                    <p className="text-sm text-gray-400 line-through">
                      {(product.price * 1.2).toFixed(2)} SAR
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
