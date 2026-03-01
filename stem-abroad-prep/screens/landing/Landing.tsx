import React from 'react';
import type { LandingProps } from './types';
import Navbar from './sections/Navbar';
import HeroSection from './sections/HeroSection';
import ProblemsSection from './sections/ProblemsSection';
import StackingCardsSection from './sections/StackingCardsSection';
import ComparisonSection from './sections/ComparisonSection';
import DemoSection from './sections/DemoSection';
import TestimonialsSection from './sections/TestimonialsSection';
import ImpactSection from './sections/ImpactSection';
import PartnersSection from './sections/PartnersSection';
import Footer from './sections/Footer';

export default function Landing({ onStartDemo, onOpenAuth, onOpenAbout, onOpenSpeed }: LandingProps) {
  const partnerLogos = Array.from({ length: 24 }, (_, i) => `../images/partners/partner-${String(i + 1).padStart(2, '0')}.png`);

  return (
    <div className="bg-white">
      <Navbar onStartDemo={onStartDemo} onOpenAuth={onOpenAuth} onOpenAbout={onOpenAbout} onOpenSpeed={onOpenSpeed} />
      <HeroSection onStartDemo={onStartDemo} />
      <ProblemsSection />
      <StackingCardsSection />
      <ComparisonSection onStartDemo={onStartDemo} />
      <DemoSection onStartDemo={onStartDemo} />
      <TestimonialsSection />
      <ImpactSection />
      <PartnersSection partnerLogos={partnerLogos} />
      <Footer onOpenAbout={onOpenAbout} />
    </div>
  );
}
