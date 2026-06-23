import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustStrip } from "@/components/TrustStrip";
import { HowItWorks } from "@/components/HowItWorks";
import { Privacy } from "@/components/Privacy";
import { Features } from "@/components/Features";
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
        <HowItWorks />
        <Privacy />
        <Features />
        <ForCompanies />
        <Plans />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
