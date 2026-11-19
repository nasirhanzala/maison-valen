import { useState } from 'react';
import { ArrowLeft, Check, CheckCircle2, Copy, Printer, ShieldCheck } from 'lucide-react';
import { ENHANCEMENTS } from '../data/hotelData';
import {
  BookingDraft,
  GuestDetails,
  Reservation,
} from '../types/hotel';
import {
  calculateNights,
  computeStayPricing,
  formatCompactDateRange,
  formatCurrency,
  formatShortDate,
  generateConfirmationCode,
} from '../utils/bookingUtils';
import { LuxuryImage } from './LuxuryImage';

interface BookingFlowViewProps {
  draft: BookingDraft;
  onUpdateDraft: (next: BookingDraft) => void;
  onBackToSuite: () => void;
  onCompleteReservation: (reservation: Reservation) => void;
  onOpenDashboard: () => void;
}

export function BookingFlowView({
  draft,
  onUpdateDraft,
  onBackToSuite,
  onCompleteReservation,
  onOpenDashboard,
}: BookingFlowViewProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const [fullName, setFullName] = useState('Eleanor Vance-Laurent');
  const [email, setEmail] = useState('eleanor.vance@atelier-laurent.fr');
  const [phone, setPhone] = useState('+33 6 42 81 90 14');
  const [arrivalWindow, setArrivalWindow] = useState('15:00 – 16:00');
  const [pillowPreference, setPillowPreference] = useState('Goose Down Soft');
  const [roomTemperature, setRoomTemperature] = useState('20.5°C');
  const [specialNotes, setSpecialNotes] = useState('');
  const [cardHolder, setCardHolder] = useState('Eleanor Vance-Laurent');
  const [cardNumber, setCardNumber] = useState('4532 8910 3402 4829');
  const [cardExpiry, setCardExpiry] = useState('09/29');
  const [cardCvc, setCardCvc] = useState('842');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const nights = calculateNights(draft.checkIn, draft.checkOut);
  const selectedEnhancements = ENHANCEMENTS.filter((e) =>
    draft.enhancementIds.includes(e.id)
  );
  const enhancementsTotal = selectedEnhancements.reduce(
    (sum, item) => sum + (item.pricingUnit === 'per-night' ? item.price * nights : item.price),
    0
  );
  const pricing = computeStayPricing(
    draft.suite.nightlyRate,
    nights,
    draft.ratePlanId,
    enhancementsTotal
  );

  const toggleEnhancement = (id: string) => {
    const exists = draft.enhancementIds.includes(id);
    const nextIds = exists
      ? draft.enhancementIds.filter((item) => item !== id)
      : [...draft.enhancementIds, id];
    onUpdateDraft({ ...draft, enhancementIds: nextIds });
  };

  const formatCardInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const validateGuestStep = (): boolean => {
    const errors: Record<string, string> = {};
    if (fullName.trim().length < 2) {
      errors.fullName = 'Please enter the primary guest full name.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address for your folio.';
    }
    if (phone.trim().length < 6) {
      errors.phone = 'Please provide a contact telephone number for arrival coordination.';
    }
    if (cardHolder.trim().length < 2) {
      errors.cardHolder = 'Please enter the cardholder name.';
    }
    const cardDigits = cardNumber.replace(/\s/g, '');
    if (cardDigits.length < 12) {
      errors.cardNumber = 'Please enter a valid 16-digit guarantee card number.';
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      errors.cardExpiry = 'Use MM/YY format.';
    }
    if (cardCvc.trim().length < 3) {
      errors.cardCvc = 'Enter 3 or 4 digits.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateGuestStep()) return;

    const cleanDigits = cardNumber.replace(/\s/g, '');
    const guest: GuestDetails = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      arrivalWindow,
      pillowPreference,
      roomTemperature,
      specialNotes: specialNotes.trim(),
      cardHolder: cardHolder.trim(),
      cardLastFour: cleanDigits.slice(-4) || '4829',
    };

    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      confirmationCode: generateConfirmationCode(),
      suiteId: draft.suite.id,
      suiteName: draft.suite.name,
      propertyId: draft.suite.propertyId,
      propertyName: draft.suite.propertyName,
      destinationCity: draft.suite.destinationCity,
      destinationCountry: draft.suite.destinationCountry,
      suiteImage: draft.suite.image,
      checkIn: draft.checkIn,
      checkOut: draft.checkOut,
      nights,
      adults: draft.adults,
      children: draft.children,
      ratePlanName: pricing.plan.name,
      nightlyRateApplied: pricing.nightlyRateApplied,
      enhancements: selectedEnhancements.map((enh) => ({
        id: enh.id,
        title: enh.title,
        amount: enh.pricingUnit === 'per-night' ? enh.price * nights : enh.price,
      })),
      taxesAndFees: pricing.taxesAndFees,
      totalAmount: pricing.totalAmount,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      guest,
      conciergeRequests: [
        {
          id: `cr-${Date.now()}`,
          type: 'In-Suite',
          note: `Suite pre-set to ${roomTemperature} with ${pillowPreference} pillows prior to ${arrivalWindow} arrival.`,
          requestedTime: `${formatShortDate(draft.checkIn)} · ${arrivalWindow.split(' ')[0]}`,
          status: 'Arranged by Butler',
        },
      ],
    };

    setConfirmedReservation(newReservation);
    onCompleteReservation(newReservation);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyCode = () => {
    if (!confirmedReservation) return;
    navigator.clipboard?.writeText(confirmedReservation.confirmationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10 lg:py-14">
      {/* Top Return & Editorial Stepper */}
      <div className="pb-8 mb-10 border-b border-[#E5E2DC] flex flex-col md:flex-row md:items-center justify-between gap-6">
        {step < 3 ? (
          <button
            type="button"
            onClick={() => (step === 2 ? setStep(1) : onBackToSuite())}
            className="inline-flex items-center gap-2 text-[13px] font-medium text-[#52504C] hover:text-[#141413] cursor-pointer w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 2 ? 'Back to Stay Enhancements' : 'Return to Suite Overview'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-[13px] font-medium text-[#1B3B36]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Reservation Confirmed</span>
          </div>
        )}

        <ol className="flex items-center gap-6 text-[13px]">
          <li className={step === 1 ? 'font-semibold text-[#141413]' : 'text-[#78756E]'}>
            01. Stay &amp; Enhancements
          </li>
          <li className="text-[#E5E2DC]" aria-hidden="true">/</li>
          <li className={step === 2 ? 'font-semibold text-[#141413]' : 'text-[#78756E]'}>
            02. Guest Details
          </li>
          <li className="text-[#E5E2DC]" aria-hidden="true">/</li>
          <li className={step === 3 ? 'font-semibold text-[#1B3B36]' : 'text-[#78756E]'}>
            03. Folio Confirmation
          </li>
        </ol>
      </div>

      {/* Step 3: Confirmed Folio View */}
      {step === 3 && confirmedReservation ? (
        <div className="max-w-3xl mx-auto bg-[#FFFFFF] border border-[#E5E2DC] p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-[#E5E2DC]">
            <div>
              <p className="text-[12px] font-medium tracking-[0.04em] text-[#1B3B36] mb-2">
                Guaranteed Sanctuary Reservation
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#141413] mb-2">
                We look forward to welcoming you, {confirmedReservation.guest.fullName}.
              </h1>
              <p className="text-sm text-[#52504C]">
                Your butler team at {confirmedReservation.propertyName} has received your arrival profile.
              </p>
            </div>

            <div className="bg-[#F8F7F4] border border-[#E5E2DC] px-4 py-3 shrink-0">
              <p className="text-[11px] text-[#78756E] mb-1">Confirmation Reference</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-medium text-[#141413] tabular-nums">
                  {confirmedReservation.confirmationCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  aria-label="Copy confirmation code"
                  className="text-[#52504C] hover:text-[#141413] cursor-pointer"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-[#1B3B36]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8 border-b border-[#E5E2DC]">
            <div>
              <p className="text-[12px] text-[#78756E] mb-1">Estate &amp; Suite</p>
              <p className="text-sm font-medium text-[#141413]">{confirmedReservation.propertyName}</p>
              <p className="text-sm text-[#52504C]">{confirmedReservation.suiteName}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#78756E] mb-1">Stay Dates</p>
              <p className="text-sm font-medium text-[#141413] tabular-nums">
                {formatCompactDateRange(confirmedReservation.checkIn, confirmedReservation.checkOut)}
              </p>
              <p className="text-sm text-[#52504C] tabular-nums">
                {confirmedReservation.nights} {confirmedReservation.nights === 1 ? 'Night' : 'Nights'} ·{' '}
                {confirmedReservation.adults + confirmedReservation.children} Guests
              </p>
            </div>
            <div>
              <p className="text-[12px] text-[#78756E] mb-1">Arrival &amp; Suite Setup</p>
              <p className="text-sm font-medium text-[#141413] tabular-nums">
                {confirmedReservation.guest.arrivalWindow}
              </p>
              <p className="text-sm text-[#52504C]">
                {confirmedReservation.guest.pillowPreference} · {confirmedReservation.guest.roomTemperature}
              </p>
            </div>
          </div>

          <div className="py-8 border-b border-[#E5E2DC] space-y-3 text-sm">
            <h2 className="font-serif text-xl font-medium text-[#141413] mb-3">
              Itemized Folio Summary
            </h2>
            <div className="flex justify-between text-[#52504C]">
              <span>
                {confirmedReservation.ratePlanName} ({confirmedReservation.nights} nights ×{' '}
                {formatCurrency(confirmedReservation.nightlyRateApplied)})
              </span>
              <span className="tabular-nums text-[#141413]">
                {formatCurrency(
                  confirmedReservation.nightlyRateApplied * confirmedReservation.nights
                )}
              </span>
            </div>
            {confirmedReservation.enhancements.map((item) => (
              <div key={item.id} className="flex justify-between text-[#52504C]">
                <span>{item.title}</span>
                <span className="tabular-nums text-[#141413]">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-[#52504C]">
              <span>Hospitality &amp; Estate Taxes</span>
              <span className="tabular-nums text-[#141413]">
                {formatCurrency(confirmedReservation.taxesAndFees)}
              </span>
            </div>
            <div className="pt-3 border-t border-[#E5E2DC] flex justify-between font-semibold text-base text-[#141413]">
              <span>Total Guaranteed Folio</span>
              <span className="tabular-nums">
                {formatCurrency(confirmedReservation.totalAmount)}
              </span>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-[#E5E2DC] hover:bg-[#F8F7F4] text-[13px] font-medium text-[#141413] cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Confirmation Folio</span>
            </button>

            <button
              type="button"
              onClick={onOpenDashboard}
              className="px-6 py-3 bg-[#1B3B36] hover:bg-[#142C28] text-[#F8F7F4] text-[13px] font-medium tracking-[0.03em] rounded-sm cursor-pointer"
            >
              Manage in My Reservations
            </button>
          </div>
        </div>
      ) : (
        /* Step 1 & Step 2 Layout with Sticky Folio Summary */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-7">
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#141413] mb-2">
                    Tailor Your Sanctuary Stay
                  </h1>
                  <p className="text-[15px] text-[#52504C]">
                    Select bespoke arrival transfers, private cellar tastings, or after-hours thermal privileges to prepare prior to arrival.
                  </p>
                </div>

                <div className="space-y-3">
                  {ENHANCEMENTS.map((enh) => {
                    const selected = draft.enhancementIds.includes(enh.id);
                    return (
                      <button
                        key={enh.id}
                        type="button"
                        onClick={() => toggleEnhancement(enh.id)}
                        className={`w-full text-left p-5 border transition-colors flex items-start justify-between gap-6 cursor-pointer ${
                          selected
                            ? 'border-[#1B3B36] bg-[#FFFFFF]'
                            : 'border-[#E5E2DC] bg-[#FFFFFF] hover:border-[#9A7B4F]/60'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <span
                            className={`mt-0.5 w-5 h-5 border flex items-center justify-center shrink-0 transition-colors ${
                              selected
                                ? 'bg-[#1B3B36] border-[#1B3B36] text-white'
                                : 'border-[#78756E]/50 bg-transparent'
                            }`}
                          >
                            {selected && <Check className="w-3.5 h-3.5" />}
                          </span>
                          <div>
                            <p className="text-[11px] font-medium text-[#78756E] mb-1">
                              {enh.category}
                            </p>
                            <p className="text-[15px] font-medium text-[#141413] mb-1">
                              {enh.title}
                            </p>
                            <p className="text-[13px] text-[#52504C]">{enh.subtitle}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-[15px] font-semibold text-[#141413] tabular-nums">
                            {formatCurrency(enh.price)}
                          </p>
                          <p className="text-[11px] text-[#78756E]">
                            {enh.pricingUnit === 'per-stay' ? 'per stay' : 'per night'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(2);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-7 py-3.5 bg-[#1B3B36] hover:bg-[#142C28] text-[#F8F7F4] text-[14px] font-medium tracking-[0.03em] rounded-sm cursor-pointer"
                  >
                    Continue to Guest Details
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleConfirmBooking} className="space-y-8" noValidate>
                <div>
                  <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#141413] mb-2">
                    Guest Profile &amp; Guarantee
                  </h1>
                  <p className="text-[15px] text-[#52504C]">
                    Your preferences are communicated directly to your dedicated butler team prior to arrival.
                  </p>
                </div>

                {/* Contact Details */}
                <div className="bg-[#FFFFFF] border border-[#E5E2DC] p-6 sm:p-8 space-y-5">
                  <h2 className="font-serif text-xl font-medium text-[#141413]">
                    Primary Guest Information
                  </h2>

                  <div>
                    <label
                      htmlFor="guest-name"
                      className="block text-[12px] font-medium text-[#52504C] mb-1.5"
                    >
                      Full Name (as on passport)
                    </label>
                    <input
                      id="guest-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#E5E2DC] text-[#141413]"
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-xs text-[#9E2A2B]">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="guest-email"
                        className="block text-[12px] font-medium text-[#52504C] mb-1.5"
                      >
                        Email Address
                      </label>
                      <input
                        id="guest-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#E5E2DC] text-[#141413]"
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-xs text-[#9E2A2B]">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="guest-phone"
                        className="block text-[12px] font-medium text-[#52504C] mb-1.5"
                      >
                        Mobile Telephone
                      </label>
                      <input
                        id="guest-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#E5E2DC] text-[#141413]"
                      />
                      {formErrors.phone && (
                        <p className="mt-1 text-xs text-[#9E2A2B]">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* In-Suite Preferences */}
                <div className="bg-[#FFFFFF] border border-[#E5E2DC] p-6 sm:p-8 space-y-5">
                  <h2 className="font-serif text-xl font-medium text-[#141413]">
                    Arrival &amp; Suite Preparation
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="arrival-window"
                        className="block text-[12px] font-medium text-[#52504C] mb-1.5"
                      >
                        Estimated Arrival
                      </label>
                      <select
                        id="arrival-window"
                        value={arrivalWindow}
                        onChange={(e) => setArrivalWindow(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-[#F8F7F4] border border-[#E5E2DC] text-[#141413]"
                      >
                        <option value="14:00 – 15:00">14:00 – 15:00</option>
                        <option value="15:00 – 16:00">15:00 – 16:00</option>
                        <option value="16:00 – 18:00">16:00 – 18:00</option>
                        <option value="After 18:00">After 18:00</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="pillow-pref"
                        className="block text-[12px] font-medium text-[#52504C] mb-1.5"
                      >
                        Pillow Selection
                      </label>
                      <select
                        id="pillow-pref"
                        value={pillowPreference}
                        onChange={(e) => setPillowPreference(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-[#F8F7F4] border border-[#E5E2DC] text-[#141413]"
                      >
                        <option value="Goose Down Soft">Goose Down Soft</option>
                        <option value="Firm Ergonomic">Firm Ergonomic</option>
                        <option value="Hypoallergenic Silk">Hypoallergenic Silk</option>
                        <option value="Buckwheat & Down">Buckwheat &amp; Down</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="room-temp"
                        className="block text-[12px] font-medium text-[#52504C] mb-1.5"
                      >
                        Suite Climate
                      </label>
                      <select
                        id="room-temp"
                        value={roomTemperature}
                        onChange={(e) => setRoomTemperature(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-[#F8F7F4] border border-[#E5E2DC] text-[#141413]"
                      >
                        <option value="19.5°C">19.5°C · Crisp</option>
                        <option value="20.5°C">20.5°C · Balanced</option>
                        <option value="22.0°C">22.0°C · Warm</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="special-notes"
                      className="block text-[12px] font-medium text-[#52504C] mb-1.5"
                    >
                      Dietary Requirements, Occasions, or Flight Details (Optional)
                    </label>
                    <textarea
                      id="special-notes"
                      rows={3}
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="e.g., Celebrating an anniversary, allergy-free floral preference, or private aviation tail number..."
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#E5E2DC] text-[#141413]"
                    />
                  </div>
                </div>

                {/* Payment Guarantee */}
                <div className="bg-[#FFFFFF] border border-[#E5E2DC] p-6 sm:p-8 space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-serif text-xl font-medium text-[#141413]">
                      Reservation Guarantee
                    </h2>
                    <span className="text-[12px] text-[#78756E]">
                      Charged at check-out unless advance tariff
                    </span>
                  </div>

                  <div>
                    <label
                      htmlFor="card-holder"
                      className="block text-[12px] font-medium text-[#52504C] mb-1.5"
                    >
                      Cardholder Name
                    </label>
                    <input
                      id="card-holder"
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F8F7F4] border border-[#E5E2DC] text-[#141413]"
                    />
                    {formErrors.cardHolder && (
                      <p className="mt-1 text-xs text-[#9E2A2B]">{formErrors.cardHolder}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="card-number"
                        className="block text-[12px] font-medium text-[#52504C] mb-1.5"
                      >
                        Card Number
                      </label>
                      <input
                        id="card-number"
                        type="text"
                        inputMode="numeric"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-[#F8F7F4] border border-[#E5E2DC] text-[#141413]"
                      />
                      {formErrors.cardNumber && (
                        <p className="mt-1 text-xs text-[#9E2A2B]">{formErrors.cardNumber}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="card-expiry"
                        className="block text-[12px] font-medium text-[#52504C] mb-1.5"
                      >
                        Expiry
                      </label>
                      <input
                        id="card-expiry"
                        type="text"
                        inputMode="numeric"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiryInput(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-[#F8F7F4] border border-[#E5E2DC] text-[#141413]"
                      />
                      {formErrors.cardExpiry && (
                        <p className="mt-1 text-xs text-[#9E2A2B]">{formErrors.cardExpiry}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="card-cvc"
                        className="block text-[12px] font-medium text-[#52504C] mb-1.5"
                      >
                        Security Code
                      </label>
                      <input
                        id="card-cvc"
                        type="password"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-[#F8F7F4] border border-[#E5E2DC] text-[#141413]"
                      />
                      {formErrors.cardCvc && (
                        <p className="mt-1 text-xs text-[#9E2A2B]">{formErrors.cardCvc}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <p className="flex items-center gap-2 text-xs text-[#78756E]">
                    <ShieldCheck className="w-4 h-4 text-[#1B3B36] shrink-0" />
                    <span>{pricing.plan.cancellationPolicy}</span>
                  </p>
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-[#1B3B36] hover:bg-[#142C28] text-[#F8F7F4] text-[14px] font-medium tracking-[0.03em] rounded-sm whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Confirm Reservation
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Sticky Folio Summary */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24 bg-[#FFFFFF] border border-[#E5E2DC] p-6 sm:p-8">
            <div className="flex items-center gap-4 pb-6 border-b border-[#E5E2DC]">
              <div className="w-24 aspect-[4/3] shrink-0 border border-[#E5E2DC]">
                <LuxuryImage
                  src={draft.suite.image}
                  alt={draft.suite.name}
                  className="w-full h-full"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] text-[#78756E] mb-0.5">
                  {draft.suite.propertyName} · {draft.suite.destinationCity}
                </p>
                <h3 className="font-serif text-xl font-medium text-[#141413] leading-snug">
                  {draft.suite.name}
                </h3>
              </div>
            </div>

            <div className="py-5 border-b border-[#E5E2DC] space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#78756E]">Dates</span>
                <span className="font-medium text-[#141413] tabular-nums">
                  {formatCompactDateRange(draft.checkIn, draft.checkOut)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78756E]">Duration &amp; Party</span>
                <span className="font-medium text-[#141413] tabular-nums">
                  {nights} {nights === 1 ? 'Night' : 'Nights'} ·{' '}
                  {draft.adults + draft.children} Guests
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78756E]">Rate Plan</span>
                <span className="font-medium text-[#141413]">{pricing.plan.name}</span>
              </div>
            </div>

            <div className="py-5 space-y-2.5 text-sm">
              <div className="flex justify-between text-[#52504C]">
                <span className="tabular-nums">
                  Suite Tariff ({nights} × {formatCurrency(pricing.nightlyRateApplied)})
                </span>
                <span className="tabular-nums text-[#141413]">
                  {formatCurrency(pricing.roomSubtotal)}
                </span>
              </div>

              {selectedEnhancements.map((enh) => {
                const amt =
                  enh.pricingUnit === 'per-night' ? enh.price * nights : enh.price;
                return (
                  <div key={enh.id} className="flex justify-between text-[#52504C]">
                    <span className="pr-4">{enh.title}</span>
                    <span className="tabular-nums text-[#141413] shrink-0">
                      {formatCurrency(amt)}
                    </span>
                  </div>
                );
              })}

              <div className="flex justify-between text-[#52504C]">
                <span>Hospitality &amp; Estate Taxes (10%)</span>
                <span className="tabular-nums text-[#141413]">
                  {formatCurrency(pricing.taxesAndFees)}
                </span>
              </div>

              <div className="pt-4 border-t border-[#E5E2DC] flex justify-between font-semibold text-base text-[#141413]">
                <span>Total Folio</span>
                <span className="tabular-nums text-lg">
                  {formatCurrency(pricing.totalAmount)}
                </span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
