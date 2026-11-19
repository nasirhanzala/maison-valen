import { useState } from 'react';
import { ArrowLeft, Check, ShieldCheck } from 'lucide-react';
import { PROPERTIES, RATE_PLANS } from '../data/hotelData';
import { RatePlan, SearchCriteria, Suite } from '../types/hotel';
import {
  addDaysISO,
  calculateNights,
  computeStayPricing,
  formatCurrency,
  formatShortDate,
} from '../utils/bookingUtils';
import { LuxuryImage } from './LuxuryImage';

interface SuiteDetailViewProps {
  suite: Suite;
  criteria: SearchCriteria;
  onUpdateCriteria: (next: SearchCriteria) => void;
  onBack: () => void;
  onProceedToBooking: (ratePlanId: RatePlan['id']) => void;
}

export function SuiteDetailView({
  suite,
  criteria,
  onUpdateCriteria,
  onBack,
  onProceedToBooking,
}: SuiteDetailViewProps) {
  const [selectedImage, setSelectedImage] = useState<'primary' | 'secondary'>('primary');
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<RatePlan['id']>('flexible');

  const property = PROPERTIES.find((p) => p.id === suite.propertyId) ?? PROPERTIES[0];
  const nights = calculateNights(criteria.checkIn, criteria.checkOut);
  const pricing = computeStayPricing(suite.nightlyRate, nights, selectedRatePlanId, 0);

  const handleCheckInChange = (value: string) => {
    const nextCheckOut =
      value >= criteria.checkOut ? addDaysISO(value, 2) : criteria.checkOut;
    onUpdateCriteria({ ...criteria, checkIn: value, checkOut: nextCheckOut });
  };

  const handleCheckOutChange = (value: string) => {
    if (value <= criteria.checkIn) {
      onUpdateCriteria({ ...criteria, checkOut: addDaysISO(criteria.checkIn, 1) });
      return;
    }
    onUpdateCriteria({ ...criteria, checkOut: value });
  };

  const activePhoto = selectedImage === 'primary' ? suite.image : suite.secondaryImage;

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10 lg:py-14 pb-28 lg:pb-16">
      {/* Breadcrumb Back Navigation */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#52504C] hover:text-[#141413] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Suites Collection</span>
        </button>

        <p className="hidden sm:block text-[12px] text-[#78756E]">
          {property.name} · {property.regionLabel}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Column: Architectural Gallery & Specifications */}
        <div className="lg:col-span-7 space-y-10">
          <div>
            <p className="text-[12px] font-medium tracking-[0.04em] text-[#78756E] mb-2">
              {suite.destinationCity}, {suite.destinationCountry} · {suite.categoryLabel} ·{' '}
              {suite.areaSqm} m²
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#141413] leading-[1.1] mb-4">
              {suite.name}
            </h1>
            <p className="text-base leading-relaxed text-[#52504C] max-w-2xl">
              {suite.summary}
            </p>
          </div>

          {/* Primary & Secondary Photo Viewer */}
          <div className="space-y-3">
            <div className="aspect-[4/3] w-full border border-[#E5E2DC]">
              <LuxuryImage
                src={activePhoto}
                alt={`${suite.name} architectural view`}
                fallbackLabel={suite.name}
                priority
                className="w-full h-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedImage('primary')}
                className={`aspect-[16/9] border transition-opacity cursor-pointer overflow-hidden ${
                  selectedImage === 'primary'
                    ? 'border-[#1B3B36] opacity-100'
                    : 'border-[#E5E2DC] opacity-70 hover:opacity-100'
                }`}
              >
                <LuxuryImage
                  src={suite.image}
                  alt={`${suite.name} primary living salon`}
                  className="w-full h-full"
                />
              </button>
              <button
                type="button"
                onClick={() => setSelectedImage('secondary')}
                className={`aspect-[16/9] border transition-opacity cursor-pointer overflow-hidden ${
                  selectedImage === 'secondary'
                    ? 'border-[#1B3B36] opacity-100'
                    : 'border-[#E5E2DC] opacity-70 hover:opacity-100'
                }`}
              >
                <LuxuryImage
                  src={suite.secondaryImage}
                  alt={`${suite.propertyName} estate setting`}
                  className="w-full h-full"
                />
              </button>
            </div>
          </div>

          {/* Architectural Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-y border-[#E5E2DC]">
            <div>
              <p className="text-[12px] text-[#78756E] mb-1">Interior Floor</p>
              <p className="text-[15px] font-medium text-[#141413] tabular-nums">
                {suite.areaSqm} m²
              </p>
            </div>
            <div>
              <p className="text-[12px] text-[#78756E] mb-1">Occupancy</p>
              <p className="text-[15px] font-medium text-[#141413] tabular-nums">
                Up to {suite.maxAdults} Adults
              </p>
            </div>
            <div>
              <p className="text-[12px] text-[#78756E] mb-1">Check-In / Out</p>
              <p className="text-[15px] font-medium text-[#141413] tabular-nums">
                {property.checkInTime} / {property.checkOutTime}
              </p>
            </div>
            <div>
              <p className="text-[12px] text-[#78756E] mb-1">Availability</p>
              <p className="text-[15px] font-medium text-[#1B3B36] tabular-nums">
                {suite.availableCount} {suite.availableCount === 1 ? 'Residence' : 'Residences'} Open
              </p>
            </div>
          </div>

          {/* Architectural Narrative */}
          <div>
            <h2 className="font-serif text-2xl font-medium text-[#141413] mb-3">
              Spatial Architecture &amp; Orientation
            </h2>
            <p className="text-[15px] leading-[1.7] text-[#52504C] mb-4">
              {suite.architecturalDetails}
            </p>
            <p className="text-[14px] text-[#78756E]">
              <strong className="font-medium text-[#141413]">Bedding:</strong>{' '}
              {suite.bedConfiguration} ·{' '}
              <strong className="font-medium text-[#141413]">Aspect:</strong>{' '}
              {suite.viewDescription}
            </p>
          </div>

          {/* Amenities & Complimentary Inclusions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-[#E5E2DC]">
            <div>
              <h3 className="font-serif text-xl font-medium text-[#141413] mb-4">
                Residence Appointments
              </h3>
              <ul className="space-y-2.5 text-[14px] text-[#52504C]">
                {suite.amenities.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-[#9A7B4F] mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-xl font-medium text-[#141413] mb-4">
                Complimentary Privileges
              </h3>
              <ul className="space-y-2.5 text-[14px] text-[#52504C]">
                {suite.inclusions.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#1B3B36] mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Estate Context */}
          <div className="pt-6 border-t border-[#E5E2DC]">
            <h3 className="font-serif text-xl font-medium text-[#141413] mb-2">
              {property.name} Sanctuary Highlights
            </h3>
            <p className="text-[14px] leading-relaxed text-[#52504C] mb-3">
              {property.description}
            </p>
            <p className="text-[13px] text-[#78756E]">
              {property.diningHighlight} · {property.wellnessHighlight} · {property.coordinates}
            </p>
          </div>
        </div>

        {/* Right Column: Contiguous Sticky Booking Module */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24 bg-[#FFFFFF] border border-[#E5E2DC] p-6 sm:p-8">
          <div className="pb-5 border-b border-[#E5E2DC] flex items-baseline justify-between gap-4">
            <div>
              <p className="text-[12px] text-[#78756E] mb-1">Selected Rate Tariff</p>
              <p className="font-serif text-3xl font-medium text-[#141413] tabular-nums">
                {formatCurrency(pricing.nightlyRateApplied)}
                <span className="font-sans text-sm font-normal text-[#78756E]"> / night</span>
              </p>
            </div>
            <span className="text-[12px] font-medium text-[#1B3B36] tabular-nums">
              {nights} {nights === 1 ? 'Night' : 'Nights'}
            </span>
          </div>

          {/* Dates & Guests */}
          <div className="py-5 border-b border-[#E5E2DC] space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="detail-checkin"
                  className="block text-[12px] font-medium text-[#78756E] mb-1"
                >
                  Check-In
                </label>
                <input
                  id="detail-checkin"
                  type="date"
                  value={criteria.checkIn}
                  min="2026-11-15"
                  onChange={(e) => handleCheckInChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-[#141413] bg-[#F8F7F4] border border-[#E5E2DC] tabular-nums"
                />
              </div>
              <div>
                <label
                  htmlFor="detail-checkout"
                  className="block text-[12px] font-medium text-[#78756E] mb-1"
                >
                  Check-Out
                </label>
                <input
                  id="detail-checkout"
                  type="date"
                  value={criteria.checkOut}
                  min={addDaysISO(criteria.checkIn, 1)}
                  onChange={(e) => handleCheckOutChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-[#141413] bg-[#F8F7F4] border border-[#E5E2DC] tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="detail-adults"
                  className="block text-[12px] font-medium text-[#78756E] mb-1"
                >
                  Adults (Max {suite.maxAdults})
                </label>
                <select
                  id="detail-adults"
                  value={Math.min(criteria.adults, suite.maxAdults)}
                  onChange={(e) =>
                    onUpdateCriteria({ ...criteria, adults: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm text-[#141413] bg-[#F8F7F4] border border-[#E5E2DC] tabular-nums"
                >
                  {Array.from({ length: suite.maxAdults }, (_, idx) => idx + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Adult' : 'Adults'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="detail-children"
                  className="block text-[12px] font-medium text-[#78756E] mb-1"
                >
                  Children (Max {suite.maxChildren})
                </label>
                <select
                  id="detail-children"
                  value={Math.min(criteria.children, suite.maxChildren)}
                  onChange={(e) =>
                    onUpdateCriteria({ ...criteria, children: Number(e.target.value) })
                  }
                  disabled={suite.maxChildren === 0}
                  className="w-full px-3 py-2 text-sm text-[#141413] bg-[#F8F7F4] border border-[#E5E2DC] tabular-nums disabled:opacity-50"
                >
                  {Array.from({ length: suite.maxChildren + 1 }, (_, idx) => idx).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Child' : 'Children'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Rate Plan Selection */}
          <div className="py-5 border-b border-[#E5E2DC] space-y-3">
            <p className="text-[12px] font-medium text-[#78756E]">Select Rate Privilege</p>
            <div className="space-y-2.5">
              {RATE_PLANS.map((plan) => {
                const planNightly = Math.round(suite.nightlyRate * plan.multiplier);
                const active = selectedRatePlanId === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedRatePlanId(plan.id)}
                    className={`w-full text-left p-3.5 border transition-colors cursor-pointer ${
                      active
                        ? 'border-[#1B3B36] bg-[#F8F7F4]'
                        : 'border-[#E5E2DC] hover:border-[#9A7B4F]/60 bg-[#FFFFFF]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="text-[14px] font-medium text-[#141413]">
                        {plan.name}
                      </span>
                      <span className="text-[14px] font-semibold text-[#141413] tabular-nums shrink-0">
                        {formatCurrency(planNightly)}/nt
                      </span>
                    </div>
                    <p className="text-[12px] text-[#52504C] leading-snug">
                      {plan.summary}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Itemized Folio Estimate */}
          <div className="py-5 space-y-2.5 text-[14px]">
            <div className="flex items-center justify-between text-[#52504C]">
              <span className="tabular-nums">
                {formatCurrency(pricing.nightlyRateApplied)} × {nights}{' '}
                {nights === 1 ? 'night' : 'nights'}
              </span>
              <span className="tabular-nums text-[#141413]">
                {formatCurrency(pricing.roomSubtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#52504C]">
              <span>Local hospitality &amp; estate taxes (10%)</span>
              <span className="tabular-nums text-[#141413]">
                {formatCurrency(pricing.taxesAndFees)}
              </span>
            </div>
            <div className="pt-3 border-t border-[#E5E2DC] flex items-center justify-between font-semibold text-[#141413]">
              <span>Estimated Stay Total</span>
              <span className="text-lg tabular-nums">{formatCurrency(pricing.totalAmount)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onProceedToBooking(selectedRatePlanId)}
            className="w-full py-3.5 px-6 bg-[#1B3B36] hover:bg-[#142C28] text-[#F8F7F4] text-[14px] font-medium tracking-[0.03em] rounded-sm transition-colors cursor-pointer"
          >
            Proceed to Reservation
          </button>

          <div className="mt-4 flex items-start gap-2 text-[12px] text-[#78756E]">
            <ShieldCheck className="w-4 h-4 text-[#1B3B36] shrink-0 mt-0.5" />
            <span>{pricing.plan.cancellationPolicy}</span>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Sticky Bar (Compact <= 64px) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FFFFFF] border-t border-[#E5E2DC] px-5 py-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] text-[#78756E] truncate">
            {formatShortDate(criteria.checkIn)} · {nights} {nights === 1 ? 'night' : 'nights'}
          </p>
          <p className="text-[15px] font-semibold text-[#141413] tabular-nums">
            {formatCurrency(pricing.totalAmount)} total
          </p>
        </div>
        <button
          type="button"
          onClick={() => onProceedToBooking(selectedRatePlanId)}
          className="px-5 py-2.5 bg-[#1B3B36] text-[#F8F7F4] text-[13px] font-medium rounded-sm whitespace-nowrap shrink-0 cursor-pointer"
        >
          Reserve Suite
        </button>
      </div>
    </div>
  );
}
