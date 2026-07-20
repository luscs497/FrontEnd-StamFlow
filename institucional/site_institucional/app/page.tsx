import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustStrip } from "@/components/TrustStrip";
import { Innovation } from "@/components/Innovation";
import { Burnout } from "@/components/Burnout";
import { HowItWorks } from "@/components/HowItWorks";
import { Features } from "@/components/Features";
import { Privacy } from "@/components/Privacy";
import { ForCompanies } from "@/components/ForCompanies";
import { Plans } from "@/components/Plans";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <Innovation />
        <Burnout />
        <HowItWorks />
        <Features />
        <Privacy />
        <ForCompanies />
        <Plans />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
