import { PROPERTIES } from '../data/hotelData';
import { DestinationSlug, ViewRoute } from '../types/hotel';

interface FooterProps {
  onNavigate: (view: ViewRoute) => void;
  onSelectDestination: (dest: DestinationSlug) => void;
}

export function Footer({ onNavigate, onSelectDestination }: FooterProps) {
  return (
    <footer className="bg-[#121211] text-[#F7F5F0] border-t border-white/10">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          <div className="md:col-span-5">
            <p className="font-serif text-2xl tracking-[0.14em] uppercase font-medium mb-4">
              Maison Valen
            </p>
            <p className="text-sm leading-relaxed text-[#B8B4AC] max-w-md">
              An international collection of architectural five-star sanctuaries
              dedicated to quiet restoration, regional gastronomy, and unhurried
              hospitality.
            </p>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-[12px] font-medium tracking-[0.06em] uppercase text-[#9A7B4F] mb-4">
              International Estates
            </h4>
            <ul className="space-y-2.5 text-sm text-[#D6D2CA]">
              {PROPERTIES.map((prop) => (
                <li key={prop.id}>
                  <button
                    type="button"
                    onClick={() => onSelectDestination(prop.id)}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    {prop.name} · {prop.city}, {prop.country}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-[12px] font-medium tracking-[0.06em] uppercase text-[#9A7B4F] mb-4">
              Guest Services
            </h4>
            <ul className="space-y-2.5 text-sm text-[#D6D2CA]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('suites')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Suites &amp; Residences
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('experiences')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Private Experiences
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('reservations')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Manage Reservations
                </button>
              </li>
              <li className="pt-2 text-xs text-[#8E8A82]">
                Private Concierge Desk: +41 44 580 29 10
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#8E8A82]">
          <p>© 2026 Maison Valen Hotels &amp; Residences. All rights reserved.</p>
          <p>Geneva · Paris · Lake Como · Kyoto · St. Moritz</p>
        </div>
      </div>
    </footer>
  );
}
