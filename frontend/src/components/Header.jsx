import React, { useState, useEffect } from 'react';
import { Search, User, ShoppingCart, Heart, Menu, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Header = ({ onOpenAuth, onOpenSearch, onOpenAccount }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { getCartCount, setIsCartOpen } = useCart();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showExpandedMenu = scrolled || menuOpen;

  const handleUserClick = () => {
    if (isAuthenticated) {
      onOpenAccount();
    } else {
      onOpenAuth();
    }
  };

  return (
    <>
      {/* Compact Header - Shows in Hero */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          showExpandedMenu ? 'opacity-0 pointer-events-none' : 'opacity-100'
        } ${scrolled ? 'bg-black/80 backdrop-blur-xl shadow-lg' : 'bg-transparent'}`}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Right Side Icons (RTL - appears on left visually) */}
            <div className="flex items-center gap-6">
              <button 
                className="header-icon" 
                aria-label="Search"
                onClick={onOpenSearch}
                data-testid="header-search-btn"
              >
                <Search className="w-5 h-5" />
              </button>
              <button 
                className="header-icon" 
                aria-label="User Account"
                onClick={handleUserClick}
                data-testid="header-user-btn"
              >
                <User className="w-5 h-5" />
              </button>
            </div>

            {/* Center Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-3xl font-bold tracking-wider logo-text">
                ٧٧٧٧
              </h1>
            </div>

            {/* Left Side Icons (RTL - appears on right visually) */}
            <div className="flex items-center gap-6">
              <button className="header-icon relative" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button 
                className="header-icon relative" 
                aria-label="Shopping Cart"
                onClick={() => setIsCartOpen(true)}
                data-testid="header-cart-btn"
              >
                <ShoppingCart className="w-5 h-5" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {getCartCount()}
                  </span>
                )}
              </button>
              <button 
                className="header-icon lg:hidden" 
                aria-label="Menu"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Expanded Menu - Shows when scrolled or clicked */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-white ${
          showExpandedMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="border-b-2 border-black">
          {/* Top Navigation */}
          <div className="container mx-auto px-4 lg:px-8 py-4 border-b-2 border-black">
            <div className="flex items-center justify-between">
              {/* Left - Icon Group with Labels */}
              <div className="flex items-center gap-6">
                <button 
                  className="icon-with-label"
                  onClick={onOpenSearch}
                  data-testid="expanded-search-btn"
                >
                  <Search className="w-4 h-4 mb-1" />
                </button>
                <button 
                  className="icon-with-label"
                  onClick={handleUserClick}
                  data-testid="expanded-user-btn"
                >
                  <User className="w-4 h-4 mb-1" />
                  <span className="text-xs">
                    {isAuthenticated ? user?.name?.split(' ')[0] : ''}
                  </span>
                </button>
              </div>

              {/* Center Logo */}
              <h1 className="text-3xl font-bold tracking-wider text-black" style={{ fontFamily: 'Playfair Display, serif' }}>
                ٧٧٧٧
              </h1>

              {/* Right - Cart + Arrows */}
              <div className="flex items-center gap-6">
                <button 
                  className="icon-with-label relative"
                  onClick={() => setIsCartOpen(true)}
                  data-testid="expanded-header-cart-btn"
                >
                  <ShoppingCart className="w-4 h-4 mb-1" />
                  {getCartCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-4 h-4 rounded-full flex items-center justify-center" style={{ fontSize: '0.65rem' }}>
                      {getCartCount()}
                    </span>
                  )}
                </button>
                {/* <div className="flex items-center gap-2">
                  <button className="text-black hover:text-gray-600 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button className="text-black hover:text-gray-600 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div> */}
              </div>
            </div>
          </div>

          {/* Menu Items with Stretched Text Style - Smaller */}
          <div className="bg-gray-50 py-4">
            <div className="container mx-auto px-4 lg:px-8">
              <nav className="flex items-center justify-center gap-8 flex-wrap">
                <a href="#women" className="menu-item-stretched-small">WOMEN</a>
                <a href="#men" className="menu-item-stretched-small">MEN</a>
                <a href="#kids" className="menu-item-stretched-small">KIDS</a>
                <a href="#new" className="menu-item-stretched-small">NEW</a>
                <a href="#sale" className="menu-item-stretched-small">SALE</a>
                <a href="#brands" className="menu-item-stretched-small">BRANDS</a>
                <a href="#collections" className="menu-item-stretched-small">COLLECTIONS</a>
              </nav>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
