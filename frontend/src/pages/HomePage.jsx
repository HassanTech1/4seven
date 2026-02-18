import React from "react";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import PromoBanner from "../components/PromoBanner";
import ProductGrid from "../components/ProductGrid";
import LifestyleSection from "../components/LifestyleSection";
// import FloatingChat from "../components/FloatingChat";
import Footer from "../components/Footer";

const HomePage = ({ onOpenAuth, onOpenSearch, onOpenAccount }) => (
  <>
    <Header 
      onOpenAuth={onOpenAuth} 
      onOpenSearch={onOpenSearch}
      onOpenAccount={onOpenAccount}
    />
    <HeroSection />
    <PromoBanner />
    <ProductGrid />
    <LifestyleSection />
    {/* <FloatingChat /> */}
    <Footer />
  </>
);

export default HomePage;
