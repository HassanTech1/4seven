import React from 'react';
import { X, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../data/mock';

const CartSidebar = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    openProductDetail,
  } = useCart();

  // Get recommended products (products not in cart)
  const recommendedProducts = products
    .filter(p => !cartItems.some(item => item.id === p.id))
    .slice(0, 4);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[90] transition-opacity"
        onClick={() => setIsCartOpen(false)}
        data-testid="cart-overlay"
      />

      {/* Sidebar */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[95] shadow-2xl transform transition-transform duration-300 overflow-y-auto"
        data-testid="cart-sidebar"
        dir="ltr"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium tracking-wider uppercase">
            YOUR CART ({cartItems.length})
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            data-testid="close-cart-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="px-6 py-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-6">
                {cartItems.map((item, index) => (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="flex gap-4"
                    data-testid={`cart-item-${index}`}
                  >
                    {/* Product Image */}
                    <div className="w-20 h-28 bg-gray-100 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.nameEn}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium uppercase tracking-wide">
                            {item.nameEn}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Size: {item.size}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border border-gray-300">
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            data-testid={`decrease-qty-${index}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            data-testid={`increase-qty-${index}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id, item.size)}
                          className="text-xs text-gray-500 underline hover:text-black transition-colors"
                          data-testid={`remove-item-${index}`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* You May Like Section Removed */}

              {/* Subtotal & Checkout */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium uppercase">SUBTOTAL:</span>
                  <span className="text-lg font-medium">{getCartTotal().toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  Taxes, discounts and <span className="underline">shipping</span> calculated at checkout.
                </p>
                <button className="text-xs text-gray-500 underline mb-6">
                  Order note
                </button>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-black text-white font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors"
                  data-testid="checkout-btn"
                >
                  CHECKOUT
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
