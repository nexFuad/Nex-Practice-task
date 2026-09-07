import { About } from "../../components/Landing/about";
import { Footer } from "../../components/Shared/footer";
import { HowItWork } from "../../components/Landing/howitwork";
import { Navbar } from "../../components/Shared/navbar";
import { PublicHero } from "../../components/Landing/publichero";

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

export default LandingPage;
