import { useState } from 'react';
import { Building2 } from 'lucide-react';

interface LuxuryImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  priority?: boolean;
}

export function LuxuryImage({
  src,
  alt,
  className = '',
  fallbackLabel,
  priority = false,
}: LuxuryImageProps) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#EAE6DF] text-[#52504C] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Building2 className="w-6 h-6 text-[#9A7B4F] mb-2 stroke-[1.25]" />
        <span className="font-serif text-base text-[#141413]">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#EAE6DF] ${className}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-90'
        }`}
      />
    </div>
  );
}
