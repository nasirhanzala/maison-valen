import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, MapPin, Minus, Plus, Users } from 'lucide-react';
import { PROPERTIES } from '../data/hotelData';
import { DestinationSlug, SearchCriteria } from '../types/hotel';
import { addDaysISO, calculateNights, formatShortDate } from '../utils/bookingUtils';

interface BookingSearchStripProps {
  criteria: SearchCriteria;
  onChange: (next: SearchCriteria) => void;
  onSearchSubmit: () => void;
}

export function BookingSearchStrip({
  criteria,
  onChange,
  onSearchSubmit,
}: BookingSearchStripProps) {
  const [guestPopoverOpen, setGuestPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setGuestPopoverOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const nights = calculateNights(criteria.checkIn, criteria.checkOut);
  const totalGuests = criteria.adults + criteria.children;

  const handleCheckInChange = (value: string) => {
    const nextCheckOut =
      value >= criteria.checkOut ? addDaysISO(value, 2) : criteria.checkOut;
    onChange({
      ...criteria,
      checkIn: value,
      checkOut: nextCheckOut,
    });
  };

  const handleCheckOutChange = (value: string) => {
    if (value <= criteria.checkIn) {
      onChange({
        ...criteria,
        checkOut: addDaysISO(criteria.checkIn, 1),
      });
      return;
    }
    onChange({ ...criteria, checkOut: value });
  };

  return (
    <section
      aria-label="Stay Availability Search"
      className="bg-[#FFFFFF] border-y border-[#E5E2DC]"
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setGuestPopoverOpen(false);
            onSearchSubmit();
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 lg:divide-x lg:divide-[#E5E2DC] items-stretch"
        >
          {/* Column 1: Destination */}
          <div className="lg:pr-6 flex flex-col justify-center">
            <label
              htmlFor="search-destination"
              className="flex items-center gap-1.5 text-[12px] font-medium text-[#78756E] mb-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-[#9A7B4F]" />
              <span>Sanctuary Destination</span>
            </label>
            <div className="relative">
              <select
                id="search-destination"
                value={criteria.destination}
                onChange={(e) =>
                  onChange({
                    ...criteria,
                    destination: e.target.value as DestinationSlug,
                  })
                }
                className="w-full appearance-none bg-transparent text-[15px] font-medium text-[#141413] pr-6 py-1.5 cursor-pointer border-b border-transparent focus:border-[#1B3B36]"
              >
                <option value="all">All International Estates</option>
                {PROPERTIES.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.city}, {prop.country} — {prop.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#78756E] pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Column 2: Check-in / Check-out Dates */}
          <div className="lg:px-6 flex flex-col justify-center">
            <div className="flex items-center justify-between text-[12px] font-medium text-[#78756E] mb-1.5">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#9A7B4F]" />
                <span>Arrival &amp; Departure</span>
              </span>
              <span className="tabular-nums text-[#141413]">
                {nights} {nights === 1 ? 'Night' : 'Nights'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                aria-label="Check-in date"
                value={criteria.checkIn}
                min="2026-11-15"
                onChange={(e) => handleCheckInChange(e.target.value)}
                className="w-full bg-transparent text-[14px] font-medium text-[#141413] tabular-nums py-1.5 border-b border-[#E5E2DC] focus:border-[#1B3B36] cursor-pointer"
              />
              <input
                type="date"
                aria-label="Check-out date"
                value={criteria.checkOut}
                min={addDaysISO(criteria.checkIn, 1)}
                onChange={(e) => handleCheckOutChange(e.target.value)}
                className="w-full bg-transparent text-[14px] font-medium text-[#141413] tabular-nums py-1.5 border-b border-[#E5E2DC] focus:border-[#1B3B36] cursor-pointer"
              />
            </div>
          </div>

          {/* Column 3: Guests & Suites Stepper */}
          <div className="lg:px-6 flex flex-col justify-center relative" ref={popoverRef}>
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#78756E] mb-1.5">
              <Users className="w-3.5 h-3.5 text-[#9A7B4F]" />
              <span>Guests &amp; Residences</span>
            </span>
            <button
              type="button"
              onClick={() => setGuestPopoverOpen((prev) => !prev)}
              aria-expanded={guestPopoverOpen}
              className="w-full flex items-center justify-between text-left text-[15px] font-medium text-[#141413] py-1.5 cursor-pointer"
            >
              <span className="tabular-nums truncate">
                {totalGuests} {totalGuests === 1 ? 'Guest' : 'Guests'} · {criteria.rooms}{' '}
                {criteria.rooms === 1 ? 'Suite' : 'Suites'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#78756E] transition-transform duration-200 shrink-0 ${
                  guestPopoverOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {guestPopoverOpen && (
              <div className="absolute left-0 lg:left-6 right-0 top-full mt-3 z-30 bg-[#FFFFFF] border border-[#E5E2DC] shadow-lg p-5 min-w-[260px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#141413]">Adults</p>
                      <p className="text-xs text-[#78756E]">Ages 13 and above</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label="Decrease adults"
                        disabled={criteria.adults <= 1}
                        onClick={() =>
                          onChange({ ...criteria, adults: Math.max(1, criteria.adults - 1) })
                        }
                        className="w-8 h-8 flex items-center justify-center border border-[#E5E2DC] text-[#141413] disabled:opacity-40 hover:bg-[#F1EFEA] cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm font-medium tabular-nums">
                        {criteria.adults}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase adults"
                        disabled={criteria.adults >= 6}
                        onClick={() =>
                          onChange({ ...criteria, adults: Math.min(6, criteria.adults + 1) })
                        }
                        className="w-8 h-8 flex items-center justify-center border border-[#E5E2DC] text-[#141413] disabled:opacity-40 hover:bg-[#F1EFEA] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#141413]">Children</p>
                      <p className="text-xs text-[#78756E]">Ages 0 to 12</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label="Decrease children"
                        disabled={criteria.children <= 0}
                        onClick={() =>
                          onChange({
                            ...criteria,
                            children: Math.max(0, criteria.children - 1),
                          })
                        }
                        className="w-8 h-8 flex items-center justify-center border border-[#E5E2DC] text-[#141413] disabled:opacity-40 hover:bg-[#F1EFEA] cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm font-medium tabular-nums">
                        {criteria.children}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase children"
                        disabled={criteria.children >= 4}
                        onClick={() =>
                          onChange({
                            ...criteria,
                            children: Math.min(4, criteria.children + 1),
                          })
                        }
                        className="w-8 h-8 flex items-center justify-center border border-[#E5E2DC] text-[#141413] disabled:opacity-40 hover:bg-[#F1EFEA] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E5E2DC]">
                    <div>
                      <p className="text-sm font-medium text-[#141413]">Suites</p>
                      <p className="text-xs text-[#78756E]">Adjoining available</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label="Decrease suites"
                        disabled={criteria.rooms <= 1}
                        onClick={() =>
                          onChange({ ...criteria, rooms: Math.max(1, criteria.rooms - 1) })
                        }
                        className="w-8 h-8 flex items-center justify-center border border-[#E5E2DC] text-[#141413] disabled:opacity-40 hover:bg-[#F1EFEA] cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm font-medium tabular-nums">
                        {criteria.rooms}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase suites"
                        disabled={criteria.rooms >= 3}
                        onClick={() =>
                          onChange({ ...criteria, rooms: Math.min(3, criteria.rooms + 1) })
                        }
                        className="w-8 h-8 flex items-center justify-center border border-[#E5E2DC] text-[#141413] disabled:opacity-40 hover:bg-[#F1EFEA] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Column 4: Primary Search CTA */}
          <div className="lg:pl-6 flex items-center">
            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-[#1B3B36] hover:bg-[#142C28] text-[#F8F7F4] text-[13px] font-medium tracking-[0.04em] rounded-sm transition-colors duration-200 cursor-pointer whitespace-nowrap"
            >
              Check Availability
            </button>
          </div>
        </form>

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#78756E]">
          <span>
            Selected window: {formatShortDate(criteria.checkIn)} – {formatShortDate(criteria.checkOut)}
          </span>
          <span>Best available direct rate · Complimentary daily breakfast &amp; thermal access</span>
        </div>
      </div>
    </section>
  );
}
