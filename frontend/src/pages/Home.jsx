import { SpotlightNavbar } from "../components/ui/spotlight-navbar";
import Hero from "../components/ui/hero";
import WaveGridBackground from "../components/ui/wave-grid-background";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Departments", href: "/departments" },
  { label: "About", href: "#about" },
];

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#080808]">
      <WaveGridBackground className="h-full w-full">
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="pointer-events-auto">
            <SpotlightNavbar items={NAV_ITEMS} className="pt-3 sm:pt-4" />
          </div>
          <Hero />
        </div>
      </WaveGridBackground>
    </main>
  );
}
