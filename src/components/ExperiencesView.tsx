import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { EXPERIENCES } from '../data/hotelData';
import { DestinationSlug, ExperienceItem, Reservation } from '../types/hotel';
import { formatCurrency } from '../utils/bookingUtils';
import { LuxuryImage } from './LuxuryImage';

interface ExperiencesViewProps {
  upcomingReservations: Reservation[];
  onAttachExperienceToStay: (reservationId: string, experience: ExperienceItem) => void;
  onExplorePropertySuites: (propertyId: Exclude<DestinationSlug, 'all'>) => void;
}

export function ExperiencesView({
  upcomingReservations,
  onAttachExperienceToStay,
  onExplorePropertySuites,
}: ExperiencesViewProps) {
  const [filterDest, setFilterDest] = useState<DestinationSlug>('all');
  const [attachedNoticeId, setAttachedNoticeId] = useState<string | null>(null);

  const filtered =
    filterDest === 'all'
      ? EXPERIENCES
      : EXPERIENCES.filter((exp) => exp.propertyId === filterDest);

  const handleRequestExperience = (exp: ExperienceItem) => {
    const matchingStay =
      upcomingReservations.find((r) => r.propertyId === exp.propertyId) ??
      upcomingReservations[0];

    if (matchingStay) {
      onAttachExperienceToStay(matchingStay.id, exp);
      setAttachedNoticeId(exp.id);
      setTimeout(() => setAttachedNoticeId(null), 3500);
    } else {
      onExplorePropertySuites(exp.propertyId);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
      <div className="max-w-2xl mb-10">
        <p className="text-[12px] font-medium tracking-[0.04em] text-[#78756E] mb-2">
          Curated Itineraries · Private Access
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#141413] leading-[1.1] mb-4">
          Private Cultural &amp; Thermal Experiences
        </h1>
        <p className="text-base leading-relaxed text-[#52504C]">
          Each Maison Valen residence grants discreet access to private historic archives, alpine restoration rituals, and regional artisans rarely open to the public.
        </p>
      </div>

      {/* Filter Segmented Bar */}
      <div className="mb-10 flex items-center gap-1 p-1 bg-[#F1EFEA] w-fit overflow-x-auto">
        {(
          [
            { id: 'all', label: 'All Estates' },
            { id: 'lake-como', label: 'Lake Como' },
            { id: 'kyoto', label: 'Kyoto' },
            { id: 'paris', label: 'Paris' },
            { id: 'st-moritz', label: 'St. Moritz' },
          ] as { id: DestinationSlug; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterDest(tab.id)}
            className={`px-4 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filterDest === tab.id
                ? 'bg-[#FFFFFF] text-[#141413] shadow-xs'
                : 'text-[#52504C] hover:text-[#141413]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filtered.map((exp) => {
          const hasMatchingStay = upcomingReservations.some(
            (r) => r.propertyId === exp.propertyId
          );
          const justAttached = attachedNoticeId === exp.id;

          return (
            <article
              key={exp.id}
              className="bg-[#FFFFFF] border border-[#E5E2DC] flex flex-col"
            >
              <div className="aspect-[4/3] w-full border-b border-[#E5E2DC]">
                <LuxuryImage
                  src={exp.image}
                  alt={exp.title}
                  className="w-full h-full"
                />
              </div>

              <div className="p-7 flex flex-col flex-1 justify-between">
                <div>
                  <p className="text-[12px] text-[#78756E] mb-2">
                    {exp.destinationCity} · {exp.duration} · {exp.groupSize}
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#141413] leading-snug mb-3">
                    {exp.title}
                  </h2>
                  <p className="text-[14px] leading-relaxed text-[#52504C] mb-5">
                    {exp.summary}
                  </p>

                  <ul className="space-y-1.5 text-[13px] text-[#52504C] mb-6">
                    {exp.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-[#9A7B4F] mt-2 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5 border-t border-[#E5E2DC] flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] text-[#78756E]">{exp.propertyName}</p>
                    <p className="text-[15px] font-semibold text-[#141413] tabular-nums">
                      {formatCurrency(exp.pricePerGuest)}{' '}
                      <span className="font-normal text-xs text-[#78756E]">/ guest</span>
                    </p>
                  </div>

                  {justAttached ? (
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1B3B36]">
                      <Check className="w-4 h-4" />
                      <span>Added to Concierge Folio</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRequestExperience(exp)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3B36] hover:bg-[#142C28] text-[#F8F7F4] text-[13px] font-medium rounded-sm cursor-pointer whitespace-nowrap"
                    >
                      <span>
                        {hasMatchingStay
                          ? 'Add to Upcoming Stay'
                          : upcomingReservations.length > 0
                          ? 'Request via Concierge'
                          : 'Select Suite & Book'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
