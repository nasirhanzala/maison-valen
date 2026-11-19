import { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import { ConciergeRequest, Reservation } from '../types/hotel';
import {
  addDaysISO,
  calculateNights,
  formatCompactDateRange,
  formatCurrency,
} from '../utils/bookingUtils';
import { LuxuryImage } from './LuxuryImage';

interface ReservationsDashboardProps {
  reservations: Reservation[];
  onUpdateReservation: (updated: Reservation) => void;
  onStartNewBooking: () => void;
}

type StatusFilter = 'All' | 'Confirmed' | 'Completed' | 'Cancelled';

export function ReservationsDashboard({
  reservations,
  onUpdateReservation,
  onStartNewBooking,
}: ReservationsDashboardProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolioId, setActiveFolioId] = useState<string | null>(null);

  // Concierge form inside folio drawer
  const [conciergeType, setConciergeType] = useState<ConciergeRequest['type']>('Chauffeur');
  const [conciergeTime, setConciergeTime] = useState('Arrival Day · 18:30');
  const [conciergeNote, setConciergeNote] = useState('');

  // Date edit mode inside folio drawer
  const [editingDates, setEditingDates] = useState(false);
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const upcomingCount = reservations.filter((r) => r.status === 'Confirmed').length;
  const totalReservedNights = reservations
    .filter((r) => r.status !== 'Cancelled')
    .reduce((sum, r) => sum + r.nights, 0);
  const totalConciergeCount = reservations
    .filter((r) => r.status === 'Confirmed')
    .reduce((sum, r) => sum + r.conciergeRequests.length, 0);

  const filteredReservations = reservations.filter((res) => {
    const matchesStatus = statusFilter === 'All' || res.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      res.confirmationCode.toLowerCase().includes(q) ||
      res.propertyName.toLowerCase().includes(q) ||
      res.destinationCity.toLowerCase().includes(q) ||
      res.suiteName.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const activeReservation =
    reservations.find((r) => r.id === activeFolioId) ?? null;

  const openFolio = (res: Reservation) => {
    setActiveFolioId(res.id);
    setEditCheckIn(res.checkIn);
    setEditCheckOut(res.checkOut);
    setEditingDates(false);
    setConfirmCancelOpen(false);
    setConciergeNote('');
  };

  const handleSaveDates = () => {
    if (!activeReservation) return;
    const validCheckOut =
      editCheckOut <= editCheckIn ? addDaysISO(editCheckIn, 1) : editCheckOut;
    const nextNights = calculateNights(editCheckIn, validCheckOut);
    const enhSum = activeReservation.enhancements.reduce((s, e) => s + e.amount, 0);
    const roomSubtotal = activeReservation.nightlyRateApplied * nextNights;
    const taxesAndFees = Math.round((roomSubtotal + enhSum) * 0.1);
    const totalAmount = roomSubtotal + enhSum + taxesAndFees;

    onUpdateReservation({
      ...activeReservation,
      checkIn: editCheckIn,
      checkOut: validCheckOut,
      nights: nextNights,
      taxesAndFees,
      totalAmount,
    });
    setEditingDates(false);
  };

  const handleAddConcierge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReservation || !conciergeNote.trim()) return;

    const newReq: ConciergeRequest = {
      id: `cr-${Date.now()}`,
      type: conciergeType,
      note: conciergeNote.trim(),
      requestedTime: conciergeTime.trim() || 'Upon Arrival',
      status: 'Arranged by Butler',
    };

    onUpdateReservation({
      ...activeReservation,
      conciergeRequests: [...activeReservation.conciergeRequests, newReq],
    });
    setConciergeNote('');
  };

  const handleCancelReservation = () => {
    if (!activeReservation) return;
    onUpdateReservation({
      ...activeReservation,
      status: 'Cancelled',
    });
    setConfirmCancelOpen(false);
  };

  const renderStatusBadge = (status: Reservation['status']) => {
    if (status === 'Confirmed') {
      return (
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#1B3B36]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Confirmed</span>
        </span>
      );
    }
    if (status === 'Completed') {
      return (
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#52504C]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Completed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#9E2A2B]">
        <XCircle className="w-3.5 h-3.5" />
        <span>Cancelled</span>
      </span>
    );
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10 lg:py-14">
      {/* Portal Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-[#E5E2DC]">
        <div>
          <p className="text-[12px] font-medium tracking-[0.04em] text-[#78756E] mb-2">
            Guest Portal · Valen Privé
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#141413]">
            Reservations &amp; Concierge Folio
          </h1>
        </div>

        <button
          type="button"
          onClick={onStartNewBooking}
          className="px-6 py-3 bg-[#1B3B36] hover:bg-[#142C28] text-[#F8F7F4] text-[13px] font-medium tracking-[0.03em] rounded-sm whitespace-nowrap shrink-0 cursor-pointer"
        >
          Reserve New Suite
        </button>
      </div>

      {/* 4-Column Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-[#E5E2DC] bg-[#FFFFFF]">
        <div className="p-6 border-r border-b lg:border-b-0 border-[#E5E2DC]">
          <p className="text-[12px] text-[#78756E] mb-1">Upcoming Stays</p>
          <p className="font-serif text-3xl font-medium text-[#141413] tabular-nums">
            {upcomingCount}
          </p>
        </div>
        <div className="p-6 lg:border-r border-b lg:border-b-0 border-[#E5E2DC]">
          <p className="text-[12px] text-[#78756E] mb-1">Sanctuary Nights</p>
          <p className="font-serif text-3xl font-medium text-[#141413] tabular-nums">
            {totalReservedNights}
          </p>
        </div>
        <div className="p-6 border-r border-[#E5E2DC]">
          <p className="text-[12px] text-[#78756E] mb-1">Active Arrangements</p>
          <p className="font-serif text-3xl font-medium text-[#141413] tabular-nums">
            {totalConciergeCount}
          </p>
        </div>
        <div className="p-6">
          <p className="text-[12px] text-[#78756E] mb-1">Membership Recognition</p>
          <p className="font-serif text-3xl font-medium text-[#1B3B36]">
            Valen Privé
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div
          className="inline-flex items-center gap-1 p-1 bg-[#F1EFEA] w-fit overflow-x-auto"
          role="tablist"
          aria-label="Filter reservations by status"
        >
          {(['All', 'Confirmed', 'Completed', 'Cancelled'] as StatusFilter[]).map((tab) => {
            const active = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#FFFFFF] text-[#141413] shadow-xs'
                    : 'text-[#52504C] hover:text-[#141413]'
                }`}
              >
                {tab === 'All' ? 'All Stays' : tab}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#78756E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference, city, suite..."
            aria-label="Search reservations"
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#FFFFFF] border border-[#E5E2DC] text-[#141413]"
          />
        </div>
      </div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E5E2DC] p-12 text-center">
          <p className="font-serif text-2xl text-[#141413] mb-2">
            No Matching Stays Found
          </p>
          <p className="text-sm text-[#52504C] mb-6">
            Adjust your filter criteria or explore our international sanctuaries to plan your next itinerary.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('All');
              setSearchQuery('');
            }}
            className="px-5 py-2.5 border border-[#E5E2DC] text-sm font-medium text-[#141413] hover:bg-[#F8F7F4] cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((res) => (
            <article
              key={res.id}
              className="bg-[#FFFFFF] border border-[#E5E2DC] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 min-w-0">
                <div className="w-full sm:w-40 aspect-[4/3] shrink-0 border border-[#E5E2DC]">
                  <LuxuryImage
                    src={res.suiteImage}
                    alt={res.suiteName}
                    className="w-full h-full"
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs font-medium text-[#52504C] tabular-nums">
                      {res.confirmationCode}
                    </span>
                    <span className="text-[#E5E2DC]" aria-hidden="true">·</span>
                    {renderStatusBadge(res.status)}
                  </div>

                  <h2 className="font-serif text-2xl font-medium text-[#141413] leading-snug">
                    {res.suiteName}
                  </h2>

                  <p className="text-sm text-[#52504C]">
                    {res.propertyName}, {res.destinationCity} ·{' '}
                    <span className="tabular-nums">
                      {formatCompactDateRange(res.checkIn, res.checkOut)}
                    </span>{' '}
                    ({res.nights} {res.nights === 1 ? 'night' : 'nights'})
                  </p>

                  <p className="text-xs text-[#78756E]">
                    {res.ratePlanName} · {res.conciergeRequests.length} Butler{' '}
                    {res.conciergeRequests.length === 1 ? 'Arrangement' : 'Arrangements'}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E5E2DC] shrink-0">
                <div className="lg:text-right">
                  <p className="text-[12px] text-[#78756E]">Total Folio</p>
                  <p className="text-xl font-semibold text-[#141413] tabular-nums">
                    {formatCurrency(res.totalAmount)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openFolio(res)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#141413] hover:bg-[#141413] hover:text-[#F8F7F4] text-[13px] font-medium text-[#141413] transition-colors whitespace-nowrap cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Manage Folio &amp; Concierge</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Slide-Over Folio & Concierge Drawer */}
      {activeReservation && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-label="Reservation Folio and Concierge Drawer"
        >
          <div className="w-full max-w-xl bg-[#F8F7F4] h-full overflow-y-auto border-l border-[#E5E2DC] flex flex-col">
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 bg-[#F8F7F4] border-b border-[#E5E2DC] px-6 py-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-[#78756E] tabular-nums">
                  {activeReservation.confirmationCode}
                </p>
                <h3 className="font-serif text-2xl font-medium text-[#141413]">
                  {activeReservation.propertyName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveFolioId(null)}
                aria-label="Close folio drawer"
                className="p-2 text-[#52504C] hover:text-[#141413] hover:bg-[#EAE6DF] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8 flex-1">
              {/* Status & Dates Section */}
              <div className="bg-[#FFFFFF] border border-[#E5E2DC] p-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  {renderStatusBadge(activeReservation.status)}
                  {activeReservation.status === 'Confirmed' && !editingDates && (
                    <button
                      type="button"
                      onClick={() => setEditingDates(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1B3B36] hover:underline cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Modify Dates</span>
                    </button>
                  )}
                </div>

                <div>
                  <p className="font-serif text-xl font-medium text-[#141413]">
                    {activeReservation.suiteName}
                  </p>
                  <p className="text-sm text-[#52504C]">
                    {activeReservation.destinationCity}, {activeReservation.destinationCountry}
                  </p>
                </div>

                {editingDates ? (
                  <div className="pt-3 border-t border-[#E5E2DC] space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-[#78756E] mb-1">Check-In</label>
                        <input
                          type="date"
                          value={editCheckIn}
                          min="2026-11-15"
                          onChange={(e) => setEditCheckIn(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border border-[#E5E2DC] tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#78756E] mb-1">Check-Out</label>
                        <input
                          type="date"
                          value={editCheckOut}
                          min={addDaysISO(editCheckIn, 1)}
                          onChange={(e) => setEditCheckOut(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-[#F8F7F4] border border-[#E5E2DC] tabular-nums"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingDates(false)}
                        className="px-3 py-1.5 text-xs border border-[#E5E2DC] text-[#52504C] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveDates}
                        className="px-4 py-1.5 text-xs font-medium bg-[#1B3B36] text-[#F8F7F4] cursor-pointer"
                      >
                        Update Stay Dates
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-[#E5E2DC] flex items-center justify-between text-sm">
                    <span className="text-[#52504C] tabular-nums">
                      {formatCompactDateRange(activeReservation.checkIn, activeReservation.checkOut)}
                    </span>
                    <span className="font-medium text-[#141413] tabular-nums">
                      {activeReservation.nights}{' '}
                      {activeReservation.nights === 1 ? 'Night' : 'Nights'}
                    </span>
                  </div>
                )}
              </div>

              {/* Butler & Concierge Itinerary */}
              <div className="bg-[#FFFFFF] border border-[#E5E2DC] p-5 space-y-4">
                <h4 className="font-serif text-xl font-medium text-[#141413]">
                  Butler &amp; Concierge Itinerary
                </h4>

                {activeReservation.conciergeRequests.length === 0 ? (
                  <p className="text-sm text-[#78756E]">
                    No special arrangements logged yet. Request airport transfers, dining reservations, or thermal rituals below.
                  </p>
                ) : (
                  <ul className="divide-y divide-[#E5E2DC]">
                    {activeReservation.conciergeRequests.map((req) => (
                      <li key={req.id} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold text-[#141413]">
                            {req.type} ·{' '}
                            <span className="font-normal text-[#78756E] tabular-nums">
                              {req.requestedTime}
                            </span>
                          </span>
                          <span className="text-[11px] font-medium text-[#1B3B36]">
                            {req.status}
                          </span>
                        </div>
                        <p className="text-sm text-[#52504C]">{req.note}</p>
                      </li>
                    ))}
                  </ul>
                )}

                {activeReservation.status === 'Confirmed' && (
                  <form
                    onSubmit={handleAddConcierge}
                    className="pt-4 border-t border-[#E5E2DC] space-y-3"
                  >
                    <p className="text-xs font-medium text-[#52504C]">
                      Add Bespoke Arrangement
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={conciergeType}
                        onChange={(e) =>
                          setConciergeType(e.target.value as ConciergeRequest['type'])
                        }
                        aria-label="Arrangement category"
                        className="px-3 py-2 text-xs bg-[#F8F7F4] border border-[#E5E2DC] text-[#141413]"
                      >
                        <option value="Chauffeur">Chauffeur / Transfer</option>
                        <option value="Dining">Michelin / Private Dining</option>
                        <option value="Thermal Spa">Thermal Spa &amp; Rituals</option>
                        <option value="In-Suite">In-Suite Preparation</option>
                      </select>

                      <div className="relative">
                        <Clock className="w-3.5 h-3.5 text-[#78756E] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={conciergeTime}
                          onChange={(e) => setConciergeTime(e.target.value)}
                          aria-label="Preferred time"
                          placeholder="Day & Time"
                          className="w-full pl-8 pr-2.5 py-2 text-xs bg-[#F8F7F4] border border-[#E5E2DC] text-[#141413]"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={conciergeNote}
                        onChange={(e) => setConciergeNote(e.target.value)}
                        placeholder="e.g., Reserve window table at 20:00 or chilled Franciacorta..."
                        aria-label="Concierge arrangement request"
                        className="flex-1 px-3 py-2 text-sm bg-[#F8F7F4] border border-[#E5E2DC] text-[#141413]"
                      />
                      <button
                        type="submit"
                        disabled={!conciergeNote.trim()}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-[#1B3B36] hover:bg-[#142C28] disabled:opacity-40 text-[#F8F7F4] text-xs font-medium shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Financial Folio */}
              <div className="bg-[#FFFFFF] border border-[#E5E2DC] p-5 space-y-3 text-sm">
                <h4 className="font-serif text-xl font-medium text-[#141413] mb-2">
                  Itemized Folio
                </h4>
                <div className="flex justify-between text-[#52504C]">
                  <span className="tabular-nums">
                    {activeReservation.ratePlanName} ({activeReservation.nights} ×{' '}
                    {formatCurrency(activeReservation.nightlyRateApplied)})
                  </span>
                  <span className="tabular-nums text-[#141413]">
                    {formatCurrency(
                      activeReservation.nightlyRateApplied * activeReservation.nights
                    )}
                  </span>
                </div>
                {activeReservation.enhancements.map((enh) => (
                  <div key={enh.id} className="flex justify-between text-[#52504C]">
                    <span>{enh.title}</span>
                    <span className="tabular-nums text-[#141413]">
                      {formatCurrency(enh.amount)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-[#52504C]">
                  <span>Taxes &amp; Hospitality Levy</span>
                  <span className="tabular-nums text-[#141413]">
                    {formatCurrency(activeReservation.taxesAndFees)}
                  </span>
                </div>
                <div className="pt-3 border-t border-[#E5E2DC] flex justify-between font-semibold text-base text-[#141413]">
                  <span>Total</span>
                  <span className="tabular-nums">
                    {formatCurrency(activeReservation.totalAmount)}
                  </span>
                </div>
                <p className="text-xs text-[#78756E] pt-1">
                  Guaranteed with card ending in •••• {activeReservation.guest.cardLastFour}
                </p>
              </div>

              {/* Cancel Reservation Control */}
              {activeReservation.status === 'Confirmed' && (
                <div className="pt-2">
                  {confirmCancelOpen ? (
                    <div className="bg-[#FFFFFF] border border-[#9E2A2B]/40 p-4 space-y-3">
                      <p className="text-sm text-[#141413]">
                        Confirm cancellation of <strong>{activeReservation.confirmationCode}</strong>? This action releases your suite reservation immediately.
                      </p>
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setConfirmCancelOpen(false)}
                          className="px-4 py-2 text-xs border border-[#E5E2DC] text-[#52504C] cursor-pointer"
                        >
                          Keep Reservation
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelReservation}
                          className="px-4 py-2 text-xs font-medium bg-[#9E2A2B] text-white cursor-pointer"
                        >
                          Confirm Cancellation
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmCancelOpen(true)}
                      className="text-xs font-medium text-[#9E2A2B] hover:underline cursor-pointer"
                    >
                      Cancel This Reservation
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
