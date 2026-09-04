import { About } from "./about";
import { Footer } from "./footer";
import { HowItWork } from "./howitwork";
import { Navbar } from "./navbar";
import { PublicHero } from "./publichero";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Navbar />
      <main>
        <PublicHero />
        <About />
        <HowItWork />
      </main>
      <Footer />
    </div>
  );
}
