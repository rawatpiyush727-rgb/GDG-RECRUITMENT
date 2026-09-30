import { SpotlightNavbar } from "../components/ui/spotlight-navbar";
import { DepartmentsShowcase } from "../components/ui/departments-showcase";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Departments", href: "/departments" },
  { label: "About", href: "#about" },
];

export default function Departments() {
  return (
    <div className="relative flex flex-col h-screen w-full bg-[#080808] overflow-hidden">
      {/* Sticky navbar — always visible at top */}
      <div className="flex-none pointer-events-auto z-50">
        <SpotlightNavbar
          items={NAV_ITEMS}
          defaultActiveIndex={1}
          className="pt-3 sm:pt-4"
        />
      </div>

      {/* Full-height 3-D showcase — fills the remaining space */}
      <div className="flex-1 min-h-0 w-full">
        <DepartmentsShowcase />
      </div>
    </div>
  );
}
