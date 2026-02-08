"use client";

import * as React from "react";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";
import { LoginModal } from "@/components/landing/login-modal";

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);

  return (
    <main className="min-h-screen">
      <Header onLoginClick={() => setIsLoginOpen(true)} />
      <Hero onGetStarted={() => setIsLoginOpen(true)} />
      <Features />
      <HowItWorks />
      <Pricing onGetStarted={() => setIsLoginOpen(true)} />
      <Footer onGetStarted={() => setIsLoginOpen(true)} />
      <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </main>
  );
}
