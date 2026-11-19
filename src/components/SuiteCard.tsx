import { ArrowRight } from 'lucide-react';
import { Suite } from '../types/hotel';
import { formatCurrency } from '../utils/bookingUtils';
import { LuxuryImage } from './LuxuryImage';

interface SuiteCardProps {
  suite: Suite;
  nights: number;
  onSelectSuite: (suite: Suite) => void;
}

export function SuiteCard({ suite, nights, onSelectSuite }: SuiteCardProps) {
  return (
    <article className="group bg-[#FFFFFF] border border-[#E5E2DC] flex flex-col transition-transform duration-200 hover:-translate-y-0.5">
      <button
        type="button"
        onClick={() => onSelectSuite(suite)}
        className="text-left w-full cursor-pointer focus-visible:outline-none"
      >
        <div className="aspect-[4/3] w-full overflow-hidden">
          <LuxuryImage
            src={suite.image}
            alt={`${suite.name} at ${suite.propertyName}`}
            fallbackLabel={suite.name}
            className="w-full h-full transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </button>

      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <p className="text-[12px] font-medium text-[#78756E] tracking-[0.02em] mb-2">
            {suite.destinationCity} · {suite.areaSqm} m² · Up to {suite.maxAdults} Guests
          </p>

          <h3 className="font-serif text-2xl font-medium text-[#141413] leading-snug mb-2">
            {suite.name}
          </h3>

          <p className="text-[14px] leading-relaxed text-[#52504C] line-clamp-2 mb-5">
            {suite.summary}
          </p>
        </div>

        <div className="pt-4 border-t border-[#E5E2DC] flex items-end justify-between gap-4">
          <div>
            <p className="text-[12px] text-[#78756E] mb-0.5">
              {suite.propertyName}
            </p>
            <p className="text-[15px] font-semibold text-[#141413] tabular-nums">
              {formatCurrency(suite.nightlyRate)}{' '}
              <span className="font-normal text-[13px] text-[#78756E]">
                / night · {formatCurrency(suite.nightlyRate * nights)} total
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectSuite(suite)}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1B3B36] hover:text-[#142C28] whitespace-nowrap shrink-0 cursor-pointer py-1.5"
          >
            <span>View Suite</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
