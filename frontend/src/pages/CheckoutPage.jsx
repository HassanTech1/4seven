import React, { useState, useEffect } from 'react';
import { ChevronLeft, Lock, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CheckoutPage = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(null);
  const [saveInfo, setSaveInfo] = useState(false);
  const [emailNews, setEmailNews] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    region: 'الرياض',
    postalCode: '',
    phone: user?.phone || '',
    country: 'Saudi Arabia',
  });

  const regions = [
    'الرياض', 'مكة المكرمة', 'المدينة المنورة', 'القصيم', 'الشرقية',
    'عسير', 'تبوك', 'حائل', 'الحدود الشمالية', 'جازان', 'نجران', 'الباحة', 'الجوف'
  ];

  // Load saved addresses if authenticated
  useEffect(() => {
    const loadSavedAddresses = async () => {
      try {
        const response = await fetch(`${API_URL}/api/addresses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setSavedAddresses(data.addresses || []);
        
        // Auto-select default address
        const defaultAddr = data.addresses?.find(a => a.is_default);
        if (defaultAddr) {
          selectAddress(defaultAddr);
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
      }
    };

    if (isAuthenticated && token) {
      loadSavedAddresses();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  const selectAddress = (address) => {
    setSelectedAddressId(address.id);
    const nameParts = address.full_name.split(' ');
    setFormData({
      ...formData,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      address: address.street,
      city: address.city,
      region: address.region,
      postalCode: address.postal_code || '',
      phone: address.phone,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setSelectedAddressId(null); // Clear selected address when manually editing
  };

  const calculateTax = () => {
    return getCartTotal() * 0.15; // 15% VAT
  };

  const getShippingCost = () => {
    return 0; // Free shipping
  };

  const getFinalTotal = () => {
    let total = getCartTotal() + calculateTax() + getShippingCost();
    if (discountApplied) {
      total -= discountApplied.amount;
    }
    return total;
  };

  const applyDiscount = () => {
    // Mock discount codes
    if (discountCode.toUpperCase() === '7777') {
      setDiscountApplied({ code: '7777', amount: getCartTotal() * 0.1, percent: 10 });
    } else if (discountCode.toUpperCase() === 'WELCOME') {
      setDiscountApplied({ code: 'WELCOME', amount: 50, percent: null });
    } else {
      alert('Invalid discount code');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.email || !formData.firstName || !formData.lastName || 
        !formData.address || !formData.city || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Save address if requested and authenticated
      if (saveInfo && isAuthenticated) {
        await fetch(`${API_URL}/api/addresses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: 'Checkout Address',
            full_name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            street: formData.address,
            city: formData.city,
            region: formData.region,
            postal_code: formData.postalCode,
            is_default: false,
          }),
        });
      }

      // Create checkout session with shipping info
      const response = await fetch(`${API_URL}/api/checkout/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          origin_url: window.location.origin,
          items: cartItems.map(item => ({
            product_id: item.id,
            name: item.nameEn,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            image: item.image,
          })),
          shipping_address: {
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            address: formData.address,
            apartment: formData.apartment,
            city: formData.city,
            region: formData.region,
            postal_code: formData.postalCode,
            phone: formData.phone,
            country: formData.country,
          },
          discount_code: discountApplied?.code || null,
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error processing checkout');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="ltr">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <a href="/" className="text-black underline">Continue shopping</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir="ltr">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Form */}
          <div className="lg:w-[60%] p-6 lg:p-12 lg:pr-16">
            {/* Logo */}
            <div className="mb-8">
              <a href="/" className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                ٧٧٧٧
              </a>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
              <a href="/" className="hover:text-black">Cart</a>
              <span>›</span>
              <span className="text-black">Information</span>
              <span>›</span>
              <span>Shipping</span>
              <span>›</span>
              <span>Payment</span>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Contact Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">Contact</h2>
                  {!isAuthenticated && (
                    <a href="#" className="text-sm text-blue-600 hover:underline">Sign in</a>
                  )}
                </div>
                
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black mb-3"
                  data-testid="checkout-email"
                />
                
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={emailNews}
                    onChange={(e) => setEmailNews(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  Email me with news and offers
                </label>
              </div>

              {/* Delivery Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Delivery</h2>

                {/* Saved Addresses */}
                {savedAddresses.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Saved Addresses</label>
                    <div className="space-y-2">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => selectAddress(addr)}
                          className={`w-full text-left p-3 border rounded-lg transition-colors ${
                            selectedAddressId === addr.id 
                              ? 'border-black bg-gray-50' 
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <p className="font-medium">{addr.full_name}</p>
                          <p className="text-sm text-gray-600">{addr.street}, {addr.city}</p>
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Or enter a new address below:</p>
                  </div>
                )}

                {/* Country */}
                <div className="mb-4">
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
                  >
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="UAE">United Arab Emirates</option>
                    <option value="Kuwait">Kuwait</option>
                    <option value="Bahrain">Bahrain</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Oman">Oman</option>
                  </select>
                </div>

                {/* Name Row */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    required
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    data-testid="checkout-firstname"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    required
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    data-testid="checkout-lastname"
                  />
                </div>

                {/* Address */}
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black mb-4"
                  data-testid="checkout-address"
                />

                {/* Apartment */}
                <input
                  type="text"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleChange}
                  placeholder="Apartment, suite, etc. (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black mb-4"
                />

                {/* City & Region Row */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    required
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                    data-testid="checkout-city"
                  />
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
                  >
                    {regions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Postal Code */}
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Postal code (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black mb-4"
                />

                {/* Phone */}
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black mb-4"
                  data-testid="checkout-phone"
                />

                {/* Save Info Checkbox */}
                {isAuthenticated && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={saveInfo}
                      onChange={(e) => setSaveInfo(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    Save this information for next time
                  </label>
                )}
              </div>

              {/* Shipping Method */}
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Shipping method</h2>
                <div className="border border-black rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-black flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-black"></div>
                      </div>
                      <span>Delivery</span>
                    </div>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-2">Payment</h2>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  All transactions are secure and encrypted.
                </p>

                {/* Payment Options */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Credit Card Option */}
                  <div className="border-b border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-black flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-black"></div>
                      </div>
                      <span className="font-medium">Credit / Debit Card</span>
                      <div className="flex gap-1 ml-auto">
                        <img src="https://cdn.shopify.com/s/files/1/0532/8617/7311/files/visa.svg" alt="Visa" className="h-6" onError={(e) => e.target.style.display='none'} />
                        <img src="https://cdn.shopify.com/s/files/1/0532/8617/7311/files/mastercard.svg" alt="Mastercard" className="h-6" onError={(e) => e.target.style.display='none'} />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 ml-7">
                      You'll be redirected to complete your payment securely.
                    </p>
                  </div>

                  {/* Tabby Option (Coming Soon) */}
                  <div className="p-4 opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                      <span>Pay later with Tabby</span>
                      <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded">Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                data-testid="complete-order-btn"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </>
                ) : (
                  'Complete order'
                )}
              </button>

              {/* Back Link */}
              <a 
                href="/"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-black mt-6"
              >
                <ChevronLeft className="w-4 h-4" />
                Return to cart
              </a>
            </form>
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:w-[40%] bg-gray-50 p-6 lg:p-12 lg:pl-8 border-l border-gray-200">
            {/* Order Items */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-4" data-testid={`checkout-item-${index}`}>
                  <div className="relative w-16 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.nameEn}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-500 text-white text-xs rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.nameEn}</p>
                    <p className="text-xs text-gray-500">{item.size}</p>
                  </div>
                  <p className="font-medium text-sm">SAR {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Discount Code */}
            <div className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Discount code or gift card"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  data-testid="discount-code-input"
                />
              </div>
              <button
                type="button"
                onClick={applyDiscount}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                data-testid="apply-discount-btn"
              >
                Apply
              </button>
            </div>

            {/* Applied Discount */}
            {discountApplied && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 flex items-center justify-between">
                <span className="text-green-700 text-sm">
                  {discountApplied.percent 
                    ? `${discountApplied.percent}% off applied!` 
                    : `SAR ${discountApplied.amount.toFixed(2)} off applied!`
                  }
                </span>
                <button 
                  onClick={() => setDiscountApplied(null)}
                  className="text-green-700 hover:text-green-800"
                >
                  ×
                </button>
              </div>
            )}

            {/* Order Summary */}
            <div className="space-y-3 border-t border-gray-200 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>SAR {getCartTotal().toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  Shipping
                  <span className="w-4 h-4 rounded-full border border-gray-400 text-xs flex items-center justify-center">?</span>
                </span>
                <span className="text-green-600">FREE</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  Estimated taxes (15% VAT)
                  <span className="w-4 h-4 rounded-full border border-gray-400 text-xs flex items-center justify-center">?</span>
                </span>
                <span>SAR {calculateTax().toFixed(2)}</span>
              </div>

              {discountApplied && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({discountApplied.code})</span>
                  <span>-SAR {discountApplied.amount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                <span>Total</span>
                <span>SAR {getFinalTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
