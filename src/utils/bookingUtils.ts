import { RATE_PLANS } from '../data/hotelData';
import { RatePlan } from '../types/hotel';

export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn + 'T00:00:00');
  const end = new Date(checkOut + 'T00:00:00');
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 1;
  }
  const diffMs = end.getTime() - start.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 1;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatShortDate(isoDate: string): string {
  const parsed = new Date(isoDate + 'T00:00:00');
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
}

export function formatCompactDateRange(checkIn: string, checkOut: string): string {
  const start = new Date(checkIn + 'T00:00:00');
  const end = new Date(checkOut + 'T00:00:00');
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${checkIn} – ${checkOut}`;
  }
  const startFmt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(start);
  const endFmt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(end);
  return `${startFmt} – ${endFmt}`;
}

export function addDaysISO(isoDate: string, days: number): string {
  const date = new Date(isoDate + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return isoDate;
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function getRatePlan(ratePlanId: RatePlan['id']): RatePlan {
  return RATE_PLANS.find((plan) => plan.id === ratePlanId) ?? RATE_PLANS[0];
}

export function computeStayPricing(
  baseNightlyRate: number,
  nights: number,
  ratePlanId: RatePlan['id'],
  enhancementsTotal: number
) {
  const plan = getRatePlan(ratePlanId);
  const nightlyRateApplied = Math.round(baseNightlyRate * plan.multiplier);
  const roomSubtotal = nightlyRateApplied * nights;
  const taxesAndFees = Math.round((roomSubtotal + enhancementsTotal) * 0.1);
  const totalAmount = roomSubtotal + enhancementsTotal + taxesAndFees;
  return {
    plan,
    nightlyRateApplied,
    roomSubtotal,
    taxesAndFees,
    totalAmount,
  };
}

export function generateConfirmationCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `MV-2026-${digits}`;
}
