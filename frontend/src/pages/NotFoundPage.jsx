import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";


const NotFoundPage = ({ onOpenAuth, onOpenSearch, onOpenAccount }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Connect to backend API
    console.log("Feedback submitted:", { email, message });
    alert("Thank you for your report! We will look into it.");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        onOpenAuth={onOpenAuth} 
        onOpenSearch={onOpenSearch}
        onOpenAccount={onOpenAccount}
      />
      
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50">
        <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-sm border">
          <div className="mb-8">
            <div className="text-8xl font-black text-gray-200 mb-4">404</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Design is a journey of discovery.
            </h1>
            <p className="text-gray-600 mb-1">
              Sometimes we get lost, but that's ok.
            </p>
            <p className="text-gray-500 text-sm">
              The route error could not be found.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Describe what you were doing
              </label>
              <Textarea
                id="message"
                placeholder="I was just trying to do... and then I ended up on this page."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px]"
                required
              />
            </div>

            <div className="pt-2">
                <Button type="submit" className="w-full">
                    Fix this problem!
                </Button>
            </div>
            
            <p className="text-xs text-gray-400 text-center mt-4">
             Very best,<br/>
             The Team
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFoundPage;
