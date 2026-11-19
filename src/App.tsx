import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { BookingFlowView } from './components/BookingFlowView';
import { BookingSearchStrip } from './components/BookingSearchStrip';
import { ExperiencesView } from './components/ExperiencesView';
import { Footer } from './components/Footer';
import { LuxuryImage } from './components/LuxuryImage';
import { Navbar } from './components/Navbar';
import { ReservationsDashboard } from './components/ReservationsDashboard';
import { SuiteCard } from './components/SuiteCard';
import { SuiteDetailView } from './components/SuiteDetailView';
import {
  GUEST_TESTIMONIALS,
  IMAGES,
  INITIAL_RESERVATIONS,
  PROPERTIES,
  SUITES,
} from './data/hotelData';
import {
  BookingDraft,
  DestinationSlug,
  ExperienceItem,
  RatePlan,
  Reservation,
  SearchCriteria,
  Suite,
  SuiteCategory,
  ViewRoute,
} from './types/hotel';
import { calculateNights, formatCurrency } from './utils/bookingUtils';

const STORAGE_KEY = 'maison_valen_reservations_v1';

export default function App() {
  const [activeView, setActiveView] = useState<ViewRoute>('home');
  const [selectedSuite, setSelectedSuite] = useState<Suite>(SUITES[0]);
  const [bookingDraft, setBookingDraft] = useState<BookingDraft | null>(null);

  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    destination: 'all',
    checkIn: '2026-12-18',
    checkOut: '2026-12-21',
    adults: 2,
    children: 0,
    rooms: 1,
  });

  const [categoryFilter, setCategoryFilter] = useState<SuiteCategory>('all');

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to initial curated reservations
    }
    return INITIAL_RESERVATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
    } catch {
      // Ignore storage quota errors
    }
  }, [reservations]);

  const nights = calculateNights(searchCriteria.checkIn, searchCriteria.checkOut);

  const filteredSuites = useMemo(() => {
    return SUITES.filter((suite) => {
      const matchesDest =
        searchCriteria.destination === 'all' ||
        suite.propertyId === searchCriteria.destination;
      const matchesCategory =
        categoryFilter === 'all' || suite.category === categoryFilter;
      const matchesAdults = suite.maxAdults >= searchCriteria.adults;
      const matchesChildren = suite.maxChildren >= searchCriteria.children;
      return matchesDest && matchesCategory && matchesAdults && matchesChildren;
    });
  }, [searchCriteria, categoryFilter]);

  const navigateTo = (view: ViewRoute, sectionId?: string) => {
    setActiveView(view);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectSuite = (suite: Suite) => {
    setSelectedSuite(suite);
    setActiveView('suite-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToBooking = (ratePlanId: RatePlan['id']) => {
    setBookingDraft({
      suite: selectedSuite,
      checkIn: searchCriteria.checkIn,
      checkOut: searchCriteria.checkOut,
      adults: Math.min(searchCriteria.adults, selectedSuite.maxAdults),
      children: Math.min(searchCriteria.children, selectedSuite.maxChildren),
      ratePlanId,
      enhancementIds: [],
    });
    setActiveView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteReservation = (newReservation: Reservation) => {
    setReservations((prev) => [newReservation, ...prev]);
  };

  const handleUpdateReservation = (updated: Reservation) => {
    setReservations((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const handleAttachExperience = (
    reservationId: string,
    experience: ExperienceItem
  ) => {
    setReservations((prev) =>
      prev.map((res) => {
        if (res.id !== reservationId) return res;
        return {
          ...res,
          conciergeRequests: [
            ...res.conciergeRequests,
            {
              id: `cr-${Date.now()}`,
              type: 'In-Suite',
              note: `Private Experience Request: ${experience.title} (${experience.duration}, ${formatCurrency(
                experience.pricePerGuest
              )}/guest).`,
              requestedTime: 'During Stay',
              status: 'Arranged by Butler',
            },
          ],
        };
      })
    );
  };

  const handleSelectDestination = (dest: DestinationSlug) => {
    setSearchCriteria((prev) => ({ ...prev, destination: dest }));
    setCategoryFilter('all');
    setActiveView('suites');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const upcomingReservations = reservations.filter((r) => r.status === 'Confirmed');

  const activePropertyName =
    searchCriteria.destination === 'all'
      ? null
      : PROPERTIES.find((p) => p.id === searchCriteria.destination)?.name ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#141413]">
      <Navbar
        activeView={activeView}
        onNavigate={navigateTo}
        onStartReservation={() => navigateTo('suites')}
      />

      <main className="flex-1">
        {activeView === 'home' && (
          <>
            {/* Flagship Hero Focal Anchor */}
            <section className="relative min-h-[540px] lg:min-h-[640px] flex items-end bg-[#121211]">
              <div className="absolute inset-0">
                <LuxuryImage
                  src={IMAGES.heroCourtyard}
                  alt="Palazzo Valen twilight reflecting pool and Lake Como architecture"
                  fallbackLabel="Maison Valen Flagship Sanctuary"
                  priority
                  className="w-full h-full"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/15"
                  aria-hidden="true"
                />
              </div>

              <div className="relative z-10 max-w-[1280px] w-full mx-auto px-6 lg:px-10 py-14 lg:py-20">
                <div className="max-w-2xl text-[#F7F5F0]">
                  <p className="text-[13px] font-medium tracking-[0.06em] text-[#E3DAC9] mb-4">
                    Lake Como · Paris · Kyoto · St. Moritz
                  </p>
                  <h1 className="font-serif text-[clamp(2.5rem,4.5vw,4.25rem)] font-medium leading-[1.06] tracking-[-0.01em] mb-5">
                    Architectural Sanctuaries Shaped by Stillness
                  </h1>
                  <p className="text-[15px] sm:text-base leading-relaxed text-[#E7E3DA] max-w-xl mb-8">
                    Private five-star residences crafted in heritage stone, cypress,
                    and alpine larch—each anchored by subterranean thermal baths and
                    dedicated butler service.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigateTo('suites')}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#F8F7F4] hover:bg-[#FFFFFF] text-[#141413] text-[13px] font-semibold tracking-[0.03em] rounded-sm transition-colors cursor-pointer"
                  >
                    <span>Explore Suites &amp; Availability</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* Full-Width 4-Column Booking Strip */}
            <BookingSearchStrip
              criteria={searchCriteria}
              onChange={setSearchCriteria}
              onSearchSubmit={() => navigateTo('suites')}
            />

            {/* Section 1: International Estates */}
            <section
              id="destinations-section"
              className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16 lg:py-24"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="max-w-xl">
                  <p className="text-[12px] font-medium tracking-[0.04em] text-[#78756E] mb-2">
                    The Collection
                  </p>
                  <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#141413] leading-[1.12]">
                    Four International Five-Star Estates
                  </h2>
                </div>
                <p className="text-sm text-[#52504C] max-w-md leading-relaxed">
                  Intimate key counts ranging from sixteen to thirty-four suites
                  ensure unhurried privacy across every season.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                {PROPERTIES.map((prop) => (
                  <article
                    key={prop.id}
                    className="group bg-[#FFFFFF] border border-[#E5E2DC] flex flex-col"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectDestination(prop.id)}
                      className="text-left w-full cursor-pointer focus-visible:outline-none"
                    >
                      <div className="aspect-[16/10] w-full overflow-hidden border-b border-[#E5E2DC]">
                        <LuxuryImage
                          src={prop.heroImage}
                          alt={`${prop.name} in ${prop.city}`}
                          className="w-full h-full transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    </button>

                    <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between">
                      <div>
                        <p className="text-[12px] text-[#78756E] mb-2">
                          {prop.city}, {prop.country} · {prop.suiteCount} Suites · From{' '}
                          <span className="tabular-nums font-medium text-[#141413]">
                            {formatCurrency(prop.startingRate)}
                          </span>
                          /night
                        </p>
                        <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#141413] mb-2.5">
                          {prop.name}
                        </h3>
                        <p className="text-[14px] leading-relaxed text-[#52504C] mb-5">
                          {prop.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#E5E2DC] flex items-center justify-between gap-4">
                        <span className="text-[12px] text-[#78756E] truncate">
                          {prop.diningHighlight}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSelectDestination(prop.id)}
                          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1B3B36] hover:text-[#142C28] whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>Explore Suites</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Section 2: Featured Suites Showcase */}
            <section className="bg-[#FFFFFF] border-y border-[#E5E2DC]">
              <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                  <div>
                    <p className="text-[12px] font-medium tracking-[0.04em] text-[#78756E] mb-2">
                      Private Residences
                    </p>
                    <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#141413] leading-[1.12]">
                      Signature Suites &amp; Penthouses
                    </h2>
                  </div>

                  {/* Interactive Segmented Category Tabs */}
                  <div
                    className="inline-flex items-center gap-1 p-1 bg-[#F1EFEA] overflow-x-auto max-w-full"
                    role="tablist"
                    aria-label="Filter suites by typology"
                  >
                    {(
                      [
                        { id: 'all', label: 'All Suites' },
                        { id: 'penthouse', label: 'Penthouses' },
                        { id: 'grand-suite', label: 'Grand Suites' },
                        { id: 'pavilion', label: 'Pavilions' },
                        { id: 'alpine', label: 'Alpine' },
                      ] as { id: SuiteCategory; label: string }[]
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={categoryFilter === tab.id}
                        onClick={() => setCategoryFilter(tab.id)}
                        className={`px-3.5 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          categoryFilter === tab.id
                            ? 'bg-[#FFFFFF] text-[#141413] shadow-xs'
                            : 'text-[#52504C] hover:text-[#141413]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                  {(categoryFilter === 'all' ? SUITES.slice(0, 3) : filteredSuites).map(
                    (suite) => (
                      <SuiteCard
                        key={suite.id}
                        suite={suite}
                        nights={nights}
                        onSelectSuite={handleSelectSuite}
                      />
                    )
                  )}
                </div>

                <div className="mt-12 text-center">
                  <button
                    type="button"
                    onClick={() => navigateTo('suites')}
                    className="inline-flex items-center gap-2 px-7 py-3.5 border border-[#141413] hover:bg-[#141413] hover:text-[#F8F7F4] text-[13px] font-medium tracking-[0.03em] transition-colors cursor-pointer"
                  >
                    <span>View All {SUITES.length} Suites &amp; Residences</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* Section 3: Hospitality Standards & Guest Proof */}
            <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-5 space-y-6">
                  <p className="text-[12px] font-medium tracking-[0.04em] text-[#78756E]">
                    Hospitality Standard
                  </p>
                  <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#141413] leading-[1.15]">
                    Measured Discretion Across Every Stay
                  </h2>
                  <p className="text-[15px] leading-relaxed text-[#52504C]">
                    Before arrival, our estate directors coordinate aviation transfers,
                    suite micro-climate preferences, and private museum or thermal bath
                    access so check-in happens seamlessly inside your residence.
                  </p>

                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E5E2DC]">
                    <div>
                      <p className="font-serif text-2xl sm:text-3xl font-medium text-[#141413] tabular-nums">
                        98.4%
                      </p>
                      <p className="text-xs text-[#78756E] mt-1">Guest return rate</p>
                    </div>
                    <div>
                      <p className="font-serif text-2xl sm:text-3xl font-medium text-[#141413] tabular-nums">
                        2.4 : 1
                      </p>
                      <p className="text-xs text-[#78756E] mt-1">Staff to suite ratio</p>
                    </div>
                    <div>
                      <p className="font-serif text-2xl sm:text-3xl font-medium text-[#141413] tabular-nums">
                        24h
                      </p>
                      <p className="text-xs text-[#78756E] mt-1">Dedicated butler</p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {GUEST_TESTIMONIALS.map((item) => (
                    <blockquote
                      key={item.author}
                      className="bg-[#FFFFFF] border border-[#E5E2DC] p-7 flex flex-col justify-between"
                    >
                      <p className="font-serif text-xl leading-relaxed text-[#141413] mb-6">
                        “{item.quote}”
                      </p>
                      <footer className="pt-4 border-t border-[#E5E2DC]">
                        <p className="text-sm font-medium text-[#141413]">
                          {item.author}
                        </p>
                        <p className="text-xs text-[#52504C]">{item.role}</p>
                        <p className="text-xs text-[#78756E] mt-1">{item.stayContext}</p>
                      </footer>
                    </blockquote>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {activeView === 'suites' && (
          <>
            <BookingSearchStrip
              criteria={searchCriteria}
              onChange={setSearchCriteria}
              onSearchSubmit={() => {}}
            />

            <section className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div>
                  <p className="text-[12px] font-medium tracking-[0.04em] text-[#78756E] mb-2">
                    Availability &amp; Tariffs · {nights} {nights === 1 ? 'Night' : 'Nights'}
                  </p>
                  <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#141413] leading-[1.1]">
                    {activePropertyName
                      ? `${activePropertyName} Suites`
                      : 'All Suites & Private Residences'}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {searchCriteria.destination !== 'all' && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearchCriteria((prev) => ({ ...prev, destination: 'all' }))
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E2DC] bg-[#FFFFFF] text-xs font-medium text-[#52504C] hover:text-[#141413] cursor-pointer"
                    >
                      <span>Showing: {activePropertyName}</span>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div
                    className="inline-flex items-center gap-1 p-1 bg-[#F1EFEA] overflow-x-auto"
                    role="tablist"
                    aria-label="Filter suites by typology"
                  >
                    {(
                      [
                        { id: 'all', label: 'All' },
                        { id: 'penthouse', label: 'Penthouses' },
                        { id: 'grand-suite', label: 'Grand Suites' },
                        { id: 'pavilion', label: 'Pavilions' },
                        { id: 'alpine', label: 'Alpine' },
                      ] as { id: SuiteCategory; label: string }[]
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={categoryFilter === tab.id}
                        onClick={() => setCategoryFilter(tab.id)}
                        className={`px-3.5 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          categoryFilter === tab.id
                            ? 'bg-[#FFFFFF] text-[#141413] shadow-xs'
                            : 'text-[#52504C] hover:text-[#141413]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredSuites.length === 0 ? (
                <div className="bg-[#FFFFFF] border border-[#E5E2DC] p-12 text-center">
                  <h2 className="font-serif text-2xl text-[#141413] mb-2">
                    No Residences Match Your Current Party &amp; Filter
                  </h2>
                  <p className="text-sm text-[#52504C] mb-6 max-w-md mx-auto">
                    Reset the suite typology or adjust your party occupancy to view adjoining residences across our estates.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter('all');
                      setSearchCriteria((prev) => ({
                        ...prev,
                        destination: 'all',
                        adults: 2,
                        children: 0,
                      }));
                    }}
                    className="px-6 py-3 bg-[#1B3B36] text-[#F8F7F4] text-xs font-medium cursor-pointer"
                  >
                    Reset Search Criteria
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredSuites.map((suite) => (
                    <SuiteCard
                      key={suite.id}
                      suite={suite}
                      nights={nights}
                      onSelectSuite={handleSelectSuite}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeView === 'suite-detail' && (
          <SuiteDetailView
            suite={selectedSuite}
            criteria={searchCriteria}
            onUpdateCriteria={setSearchCriteria}
            onBack={() => navigateTo('suites')}
            onProceedToBooking={handleProceedToBooking}
          />
        )}

        {activeView === 'booking' && bookingDraft && (
          <BookingFlowView
            draft={bookingDraft}
            onUpdateDraft={setBookingDraft}
            onBackToSuite={() => navigateTo('suite-detail')}
            onCompleteReservation={handleCompleteReservation}
            onOpenDashboard={() => navigateTo('reservations')}
          />
        )}

        {activeView === 'experiences' && (
          <ExperiencesView
            upcomingReservations={upcomingReservations}
            onAttachExperienceToStay={handleAttachExperience}
            onExplorePropertySuites={(propId) => handleSelectDestination(propId)}
          />
        )}

        {activeView === 'reservations' && (
          <ReservationsDashboard
            reservations={reservations}
            onUpdateReservation={handleUpdateReservation}
            onStartNewBooking={() => navigateTo('suites')}
          />
        )}
      </main>

      <Footer
        onNavigate={(view) => navigateTo(view)}
        onSelectDestination={handleSelectDestination}
      />
    </div>
  );
}
