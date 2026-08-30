import { Footer } from "./Footer";
import { HeroSection } from "./HeroSection";
import { Navbar } from "./Navbar";
import { SectionPlaceholder } from "./SectionPlaceholder";
export function PublicLandingContainer() { return <div className="min-h-screen bg-slate-50 text-slate-950"><Navbar /><main><HeroSection /><SectionPlaceholder id="how-it-works" eyebrow="Simple operations" title="One connected workflow for every shift." description="Plan coverage, verify patrols, and respond to incidents from one reliable operational view." /><SectionPlaceholder id="dashboard" eyebrow="Live command center" title="The information your team needs, right when it matters." description="A clear dashboard keeps sites, teams, and incidents visible in real time." /><SectionPlaceholder id="facilities" eyebrow="Built for facilities" title="Security that scales with your portfolio." description="Give every location consistent procedures and give every stakeholder confidence." /></main><Footer /></div>; }
