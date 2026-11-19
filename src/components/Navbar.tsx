import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ViewRoute } from '../types/hotel';

interface NavbarProps {
  activeView: ViewRoute;
  onNavigate: (view: ViewRoute, sectionId?: string) => void;
  onStartReservation: () => void;
}

export function Navbar({
  activeView,
  onNavigate,
  onStartReservation,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { label: string; view: ViewRoute; sectionId?: string }[] = [
    { label: 'Destinations', view: 'home', sectionId: 'destinations-section' },
    { label: 'Suites', view: 'suites' },
    { label: 'Experiences', view: 'experiences' },
    { label: 'My Reservations', view: 'reservations' },
  ];

  const handleLinkClick = (view: ViewRoute, sectionId?: string) => {
    setMobileMenuOpen(false);
    onNavigate(view, sectionId);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F7F4]/95 backdrop-blur-sm border-b border-[#E5E2DC]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleLinkClick('home')}
          className="font-serif text-xl sm:text-2xl tracking-[0.14em] uppercase font-medium text-[#141413] whitespace-nowrap shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          Maison Valen
        </button>

        {/* Zone 2: 4 Single-line Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-8 text-[13px] font-medium tracking-[0.04em] text-[#52504C]"
        >
          {navItems.map((item) => {
            const isActive =
              activeView === item.view &&
              !(item.sectionId && activeView === 'home');
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleLinkClick(item.view, item.sectionId)}
                className={`relative py-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-200 hover:text-[#141413] ${
                  isActive ? 'text-[#141413]' : 'text-[#52504C]'
                }`}
              >
                {item.label}
                <span
                  className={`absolute left-0 right-0 bottom-0 h-[1px] bg-[#141413] transition-transform duration-200 origin-left ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action + Mobile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onStartReservation();
            }}
            className="px-5 py-2.5 text-[13px] font-medium tracking-[0.03em] text-[#F8F7F4] bg-[#1B3B36] hover:bg-[#142C28] rounded-sm transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Reserve Stay
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 text-[#141413] hover:bg-[#F1EFEA] rounded-sm transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E2DC] bg-[#F8F7F4] px-6 py-5">
          <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleLinkClick(item.view, item.sectionId)}
                className="w-full text-left py-3 text-base font-medium text-[#141413] border-b border-[#E5E2DC]/60 last:border-b-0 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
