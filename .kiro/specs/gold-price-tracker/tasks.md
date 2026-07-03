# Implementation Plan: Gold Price Tracker

## Overview

Build a premium India-focused gold price tracking website using Next.js 15 App Router, TypeScript strict mode, TailwindCSS v4, Framer Motion, and Shadcn UI. The implementation follows a layered approach: project scaffold → types & constants → data service → state management → query hooks → UI primitives → layout components → page sections → SEO & accessibility → tests.

All data originates from `MockGoldDataService` (implementing `GoldDataService`) and flows through React Query into Client Components. Zustand manages all synchronous UI state. The page is a single-route, multi-section layout with no backend or database.

---

## Tasks

- [x] 1. Project setup and configuration
  - Scaffold a Next.js 15 App Router project with TypeScript strict mode (`"strict": true` in tsconfig)
  - Install all production dependencies: `tailwindcss@next`, `framer-motion`, `@shadcn/ui`, `next-themes`, `@tanstack/react-query`, `zustand`, `recharts`, `react-countup`, `react-intersection-observer`, `lucide-react`
  - Install dev dependencies: `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `fast-check`, `vitest-axe`, `@types/node`
  - Configure `tsconfig.json` with path alias `"@/*": ["./src/*"]`
  - Configure `next.config.ts` (App Router, strict mode, image domains)
  - Create `vitest.config.ts` with jsdom environment, react plugin, and `@` path alias
  - Create `src/test/setup.ts` importing `@testing-library/jest-dom` with `afterEach(cleanup)`
  - _Requirements: 1.1, 1.2_


- [x] 2. Global styles and TailwindCSS v4 design tokens
  - Create `src/app/globals.css` with `@import "tailwindcss"` and `@theme` block defining `--color-gold-primary: #D4AF37`, `--color-gold-secondary: #F7C948`, `--color-background: #050505`, `--font-sans: "Geist"`
  - Add `@utility glass-card` with `background: rgba(255,255,255,0.05)`, `backdrop-filter: blur(12px)`, gold border `1px solid rgba(212,175,55,0.2)`, `border-radius: 1rem`
  - Add `@utility golden-glow` with `box-shadow: 0 0 24px rgba(212,175,55,0.3)`
  - Add `@variant dark` class strategy and `@media (prefers-reduced-motion: reduce)` override block
  - _Requirements: 1.4, 20.1, 20.2, 20.5_

- [x] 3. TypeScript types and enums
  - [x] 3.1 Create `src/types/common.ts` exporting `type Purity = "24K" | "22K" | "18K"` and `type TimeRange = "1D" | "1W" | "1M" | "3M" | "1Y"`
    - _Requirements: 2.1_
  - [x] 3.2 Create `src/types/gold.ts` exporting `GoldPriceMap`, `HistoricalPrice`, and `CityPrice` interfaces
    - _Requirements: 2.1_
  - [x] 3.3 Create `src/types/news.ts` exporting `NewsItem` interface with `id`, `headline`, `summary`, `fullSummary`, `source`, `publishedAt`
    - _Requirements: 2.1, 11.2_
  - [x] 3.4 Create `src/types/insights.ts` exporting `MarketInsight` interface with `id`, `title`, `description`, `changePercent`, `direction: "up" | "down" | "neutral"`
    - _Requirements: 2.1, 12.2_
  - [x] 3.5 Create `src/types/index.ts` barrel re-exporting all types from all type files
    - _Requirements: 2.1_


- [x] 4. Constants and static data
  - [x] 4.1 Create `src/constants/config.ts` exporting `CITIES`, `PURITIES`, `TIME_RANGES`, `BASE_PRICES`, `STALE_TIMES`, `MAX_COMPARE_WEIGHT`, `GST_RATE`
    - _Requirements: 2.5, 9.3_
  - [x] 4.2 Create `src/constants/faq.ts` exporting `FAQ_ITEMS` array of `FAQItem` objects — at least 8 items covering GST, hallmarking, 22K vs 24K, best time to buy, storage, digital gold, making charges, BIS certification
    - _Requirements: 15.1, 15.2_
  - [x] 4.3 Create `src/constants/investmentGuide.ts` exporting `INVESTMENT_TOPICS` array of `InvestmentTopic` objects — at least 4 items covering purity grades, physical vs digital gold, GST and making charges, buying best practices; each `body` field ≤120 words
    - _Requirements: 13.1, 13.2_
  - [x] 4.4 Create `src/constants/animations.ts` exporting `fadeUpVariants`, `staggerContainer`, `scaleInVariants`, and `slideInRight` Framer Motion variant objects
    - _Requirements: 20.3, 20.6_
  - [ ]* 4.5 Write property test for investment guide word count (Property 7)
    - **Property 7: Investment Guide Card Word Count**
    - Iterate over each item in `INVESTMENT_TOPICS` and assert word count of `body` ≤ 120
    - **Validates: Requirements 13.2**


- [x] 5. Utility functions
  - [x] 5.1 Create `src/utils/formatCurrency.ts` exporting `formatINR(value: number): string` using `Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })`
    - _Requirements: 7.3, 9.4_
  - [x] 5.2 Create `src/utils/calculateGst.ts` exporting `calculateGst(basePrice: number, rate?: number): { base, gst, total }` where default rate is `0.03`
    - _Requirements: 9.3, 9.4, 9.5_
  - [x] 5.3 Create `src/utils/filterCities.ts` exporting `filterCities(cities: CityPrice[], query: string): CityPrice[]` — returns all cities when query is empty, otherwise case-insensitive substring match
    - _Requirements: 10.3, 10.4_
  - [x] 5.4 Create `src/utils/getPriceChangeColor.ts` exporting `getPriceChangeColor(change: number): string` returning `"text-emerald-400"`, `"text-red-400"`, or `"text-muted-foreground"`
    - _Requirements: 7.5, 7.6_
  - [ ]* 5.5 Write unit tests for all utility functions
    - Test `formatINR(7420)` returns `"₹7,420"`
    - Test `calculateGst(1000)` returns `{ base: 1000, gst: 30, total: 1030 }`
    - Test `filterCities(allCities, "")` returns all 8 cities
    - Test `getPriceChangeColor(0.42)` → `"text-emerald-400"`, `getPriceChangeColor(-0.1)` → `"text-red-400"`, `getPriceChangeColor(0)` → `"text-muted-foreground"`
    - _Requirements: 5.1–5.4_
  - [ ]* 5.6 Write property test for city search filter correctness (Property 4)
    - **Property 4: City Search Filter Correctness**
    - Use `fc.string()` to generate query strings; assert every returned city name includes the query as a case-insensitive substring
    - **Validates: Requirements 10.3**
  - [ ]* 5.7 Write property test for calculator GST correctness (Property 2)
    - **Property 2: Calculator Total Is Mathematically Correct**
    - Use `fc.float({ min: 0.01, max: 1000 })` × `fc.constantFrom(...PURITIES)`; assert `total === w × price × 1.03` within ±1 INR
    - **Validates: Requirements 9.2, 9.3**


- [x] 6. Data service layer
  - [x] 6.1 Create `src/services/GoldDataService.ts` exporting the `GoldDataService` TypeScript interface with methods: `fetchCurrentPrices()`, `fetchHistoricalPrices(purity, range)`, `fetchCityPrices()`, `fetchNewsItems()`, `fetchMarketInsights()`
    - _Requirements: 2.1_
  - [x] 6.2 Create `src/services/MockGoldDataService.ts` implementing `GoldDataService` — hardcode current prices for 24K/22K/18K, algorithmically generate historical price arrays using sinusoidal walk, return city prices for all 8 cities with random variance, return static `NEWS_ITEMS` and `INSIGHTS` arrays inline
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  - [x] 6.3 Create `src/services/index.ts` exporting singleton `goldDataService: GoldDataService = new MockGoldDataService()`
    - _Requirements: 2.6_
  - [ ]* 6.4 Write unit tests for MockGoldDataService
    - Test `fetchCurrentPrices()` returns all three purity keys with positive `pricePerGram`
    - Test `fetchCityPrices()` returns exactly 8 city entries matching `CITIES` constant
    - Test `fetchNewsItems()` returns an array with at least 6 items each having `id`, `headline`, `summary`, `fullSummary`, `source`, `publishedAt`
    - _Requirements: 2.2, 2.3, 2.5, 11.1_
  - [ ]* 6.5 Write property test for historical prices shape (Property 1)
    - **Property 1: Historical Prices Cover Requested Range**
    - Use `fc.constantFrom(...TIME_RANGES)` × `fc.constantFrom(...PURITIES)`; assert returned array is non-empty, all prices positive, dates in ascending order
    - **Validates: Requirements 2.4**

- [x] 7. Checkpoint — core data layer complete
  - Ensure all tests pass for utilities and data service, ask the user if questions arise.


- [x] 8. Zustand store
  - [x] 8.1 Create `src/store/useAppStore.ts` with `create<AppState>()(persist(...))` holding theme, timeRange, calcWeight, calcPurity, citySearch, mobileMenuOpen slices with their setters; persist only `theme` to localStorage via `partialize`; initialize `timeRange: "1M"` and `mobileMenuOpen: false`
    - _Requirements: 3.1, 3.3, 3.4_
  - [ ]* 8.2 Write unit tests for Zustand store initialization and mutations
    - Assert store initializes with `timeRange: "1M"` and `mobileMenuOpen: false`
    - Assert `setTheme("light")` updates `theme` slice
    - Assert `setCitySearch("Mumbai")` updates `citySearch`
    - _Requirements: 3.1, 3.3, 3.4_

- [x] 9. React Query setup and custom hooks
  - [x] 9.1 Create `src/lib/queryClient.ts` exporting `makeQueryClient()` factory with `staleTime: 60_000`, `gcTime: 300_000`, `retry: 2`, `refetchOnWindowFocus: false`
    - _Requirements: 7.7_
  - [x] 9.2 Create `src/lib/fonts.ts` setting up Geist font via `next/font/google`
    - _Requirements: 1.3_
  - [x] 9.3 Create `src/providers/Providers.tsx` as a Client Component wrapping children in `QueryClientProvider` (with `useState(() => makeQueryClient())`) and `ThemeProvider` from next-themes with `attribute="class"` and `defaultTheme="dark"`
    - _Requirements: 18.1, 18.2, 18.6_
  - [x] 9.4 Create `src/hooks/useGoldPrices.ts` — `useQuery({ queryKey: ["goldPrices"], queryFn: () => goldDataService.fetchCurrentPrices(), staleTime: 60_000 })`
    - _Requirements: 7.7_
  - [x] 9.5 Create `src/hooks/useHistoricalPrices.ts` — `useQuery({ queryKey: ["historical", purity, range], queryFn: ... })` accepting `purity: Purity` and `range: TimeRange` params
    - _Requirements: 8.3_
  - [x] 9.6 Create `src/hooks/useCityPrices.ts` — `useQuery({ queryKey: ["cityPrices"], staleTime: 300_000, ... })`
    - _Requirements: 10.7_
  - [x] 9.7 Create `src/hooks/useNewsItems.ts` — `useQuery({ queryKey: ["news"], staleTime: 300_000, ... })`
    - _Requirements: 11.1_
  - [x] 9.8 Create `src/hooks/useMarketInsights.ts` — `useQuery({ queryKey: ["insights"], staleTime: 300_000, ... })`
    - _Requirements: 12.4_
  - [x] 9.9 Create `src/hooks/useScrolled.ts` — `useState(false)` + `useEffect` listening to `window.scroll` returning `true` when `scrollY > 80`
    - _Requirements: 5.8_
  - [x] 9.10 Create `src/hooks/useReducedMotion.ts` wrapping Framer Motion's `useReducedMotion()`
    - _Requirements: 20.5_


- [x] 10. UI primitive components
  - [x] 10.1 Create `src/components/ui/GlassCard.tsx` accepting `children`, `className?`, and `glow?: boolean`; apply `glass-card` utility class and `hover:golden-glow` transition when `glow` is true
    - _Requirements: 7.4, 20.1_
  - [x] 10.2 Create `src/components/ui/SectionHeading.tsx` accepting `title`, `subtitle?`, `align?`; render `<h2>` with gold accent underline and optional subtitle paragraph
    - _Requirements: 6.1_
  - [x] 10.3 Create `src/components/ui/ErrorState.tsx` accepting `message?` and `onRetry?`; render an inline error message in the section's normal layout space (never full-page)
    - _Requirements: 19.6_
  - [x] 10.4 Create `src/components/ui/TimeRangeFilter.tsx` accepting `value: TimeRange` and `onChange`; render a row of `<button>` elements for each `TIME_RANGES` value, highlighting the active one
    - _Requirements: 8.2, 8.3_
  - [x] 10.5 Create `src/components/ui/PuritySelector.tsx` accepting `value: Purity` and `onChange`; render a Shadcn `<Select>` with 24K / 22K / 18K options
    - _Requirements: 8.4_
  - [x] 10.6 Create `src/components/ui/GoldPriceCard.tsx` accepting `purity`, `pricePerGram`, `changePercent`, `inView`; wrap in `GlassCard` with golden glow on hover; show purity badge, `<CountUp>` animated price, and change percent with color from `getPriceChangeColor`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  - [x] 10.7 Create `src/components/ui/NewsCard.tsx` accepting `item: NewsItem` and `onClick`; render `GlassCard` with headline, truncated summary, source, and date; animate in via Framer Motion `fadeUpVariants` with `viewport` prop
    - _Requirements: 11.2, 11.3_
  - [x] 10.8 Create `src/components/ui/InsightTile.tsx` accepting `insight: MarketInsight` and `index`; render `GlassCard` with title, description, directional badge using `getPriceChangeColor`; stagger delay = `index × 100ms`
    - _Requirements: 12.1, 12.2, 12.3_
  - [x] 10.9 Create `src/components/ui/CityPriceCard.tsx` accepting `cityPrice: CityPrice`; render `GlassCard` with city name, 22K price per gram, and change percent color-coded
    - _Requirements: 10.6_
  - [x] 10.10 Create `src/components/ui/InvestmentTopicCard.tsx` accepting an `InvestmentTopic`; render `GlassCard` with Lucide icon, title, and body text; animate in via Framer Motion
    - _Requirements: 13.2, 13.4_
  - [ ]* 10.11 Write component tests for UI primitives
    - Test `<GoldPriceCard>` renders purity badge and price value
    - Test `<ErrorState>` renders error message without crashing
    - Test icon-only buttons have non-empty `aria-label` (Property 9)
    - **Property 9: Icon-Only Buttons Have Accessible Labels**
    - **Validates: Requirements 19.3**
  - [ ]* 10.12 Write property test for glassmorphism styles (Property 12)
    - **Property 12: Glassmorphism Styles Applied to All Cards**
    - Render each card component and assert computed styles include semi-transparent background, backdrop-filter blur, and gold border
    - **Validates: Requirements 20.1**


- [x] 11. Layout components (Loader, Navbar, Footer)
  - [x] 11.1 Create `src/components/layout/Loader.tsx` as a Client Component; gate display on `sessionStorage.getItem("loaderShown")`; Framer Motion scale+opacity entrance animation; auto-dismiss after 2.0s with 0.4s exit; set `sessionStorage` item on complete
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 11.2 Create `src/components/layout/Navbar.tsx` as a Client Component; fixed top with glassmorphism bg; desktop anchor links hidden on mobile; hamburger button with `aria-label="Open menu"` using Zustand `mobileMenuOpen`; theme toggle button with `aria-label`; mobile drawer with all section links; `useScrolled()` hook to increase backdrop blur at 80px scroll
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 19.3_
  - [x] 11.3 Create `src/components/layout/Footer.tsx` as a Server Component; disclaimer text, copyright with `new Date().getFullYear()`, three link groups (Tools, Learn, About), social media Lucide icons; `grid-cols-1 sm:grid-cols-3` responsive layout
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_
  - [ ]* 11.4 Write component tests for layout components
    - Test `<Loader>` unmounts after 2500ms using fake timers
    - Test `<Footer>` renders disclaimer text and copyright year
    - _Requirements: 4.3, 16.1, 16.2_

- [ ] 12. Checkpoint — layout and primitives complete
  - Ensure all layout and UI primitive tests pass, ask the user if questions arise.


- [ ] 13. Hero and Current Price sections
  - [ ] 13.1 Create `src/components/sections/HeroSection.tsx` as a Client Component; two-column desktop layout (60/40), stacked mobile; Framer Motion `fadeUpVariants` on H1 and subtitle; CTA button scrolls to `#current-prices`; CSS radial-gradient gold glow background; decorative animated ticker strip on the right
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [ ] 13.2 Create `src/components/sections/CurrentPriceSection.tsx` as a Client Component; call `useGoldPrices()`; render loading skeleton, `<ErrorState>` on error, or `1×3` responsive grid of `<GoldPriceCard>` components; use `useInView` (react-intersection-observer) to pass `inView` prop to cards triggering CountUp
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  - [ ]* 13.3 Write component tests for Hero and CurrentPrice sections
    - Test `<CurrentPriceSection>` renders three purity cards with correct labels
    - Test error state renders `<ErrorState>` when query fails (Property 10)
    - **Property 10: Data Fetch Failures Produce Error States, Not Crashes**
    - **Validates: Requirements 19.6**

- [ ] 14. Live Chart and Calculator sections
  - [ ] 14.1 Create `src/components/sections/LiveChartSection.tsx` as a Client Component (dynamic import with `ssr: false`); call `useHistoricalPrices(purity, timeRange)` from Zustand store; render `<TimeRangeFilter>` and `<PuritySelector>`; Recharts `<AreaChart>` with `ResponsiveContainer`, gold `linearGradient` fill, `CustomGoldTooltip`, and Recharts built-in animation
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_
  - [ ]* 14.2 Write property test for time range store updates (Property 5)
    - **Property 5: Time Range Selection Updates Store and Query**
    - Simulate clicking each `TimeRange` button; assert Zustand `timeRange` updates and React Query key contains the new value
    - **Validates: Requirements 8.3**
  - [ ] 14.3 Create `src/components/sections/CalculatorSection.tsx` as a Client Component (dynamic import with `ssr: false`); read `calcWeight`, `calcPurity` from Zustand; source price from `useGoldPrices()` cache; compute `calculateGst(weight × pricePerGram)`; show base price, GST line item, total; validate weight input and show inline error for invalid/zero/negative values
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_
  - [ ]* 14.4 Write component test for calculator validation (Property 3)
    - **Property 3: Calculator Rejects Invalid Inputs**
    - Use `fc.oneof(fc.constant(""), fc.float({ max: 0 }), fc.string())` to generate invalid inputs; assert validation error shown and no numeric total displayed
    - **Validates: Requirements 9.6**


- [ ] 15. City Prices and News sections
  - [ ] 15.1 Create `src/components/sections/CityPricesSection.tsx` as a Client Component; call `useCityPrices()`; read `citySearch` from Zustand; compute `filterCities(cities, citySearch)` in `useMemo`; render search `<input>` updating `setCitySearch`; animate `<CityPriceCard>` list using `staggerContainer` and `itemVariants` from Framer Motion with `viewport` prop
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_
  - [ ]* 15.2 Write component test for city search filter
    - Test typing "Mumbai" shows only Mumbai card
    - Test clearing search shows all 8 cards
    - _Requirements: 10.3, 10.4_
  - [ ] 15.3 Create `src/components/sections/NewsSection.tsx` as a Client Component; call `useNewsItems()`; render `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`; each card wrapped in Shadcn `<Dialog>` with `<DialogTrigger asChild>`; `<DialogContent>` shows full article summary; cards animate in with Framer Motion `fadeUpVariants` and `viewport` prop
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  - [ ]* 15.4 Write component test for News dialog
    - Test clicking a `<NewsCard>` opens the Shadcn dialog with full summary text
    - _Requirements: 11.4_

- [ ] 16. Market Insights and Investment Guide sections
  - [ ] 16.1 Create `src/components/sections/MarketInsightsSection.tsx` as a Client Component; call `useMarketInsights()`; render `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`; use `staggerContainer` with `staggerChildren: 0.1` and `viewport` prop; render `<InsightTile>` for each insight
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  - [ ] 16.2 Create `src/components/sections/InvestmentGuideSection.tsx` as a Client Component; import `INVESTMENT_TOPICS` from constants; render `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`; animate cards in using Framer Motion with `viewport` prop; each card uses `<InvestmentTopicCard>`
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  - [ ]* 16.3 Write accessibility tests for Market Insights and Investment Guide sections
    - Run `checkA11y` via vitest-axe on rendered sections
    - _Requirements: 19.4, 19.5_


- [ ] 17. Compare and FAQ sections
  - [ ] 17.1 Create `src/components/sections/CompareSection.tsx` as a Client Component; call `useGoldPrices()`; local `compareWeight` state (range slider 1–100); render table rows for 24K/22K/18K showing price/gram and `weight × price` total; show differential rows 24K−22K and 24K−18K in INR and %; animate in with Framer Motion `viewport`
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  - [ ]* 17.2 Write property test for compare weight estimates (Property 6)
    - **Property 6: Compare Section Weight Estimates Are Correct**
    - Use `fc.integer({ min: 1, max: 100 })`; assert each purity cost = `w × pricePerGram[p]` and 24K−22K differential is independent of weight
    - **Validates: Requirements 14.2, 14.3**
  - [ ] 17.3 Create `src/components/sections/FAQSection.tsx` as a Client Component; import `FAQ_ITEMS`; render Shadcn `<Accordion type="single" collapsible>` with `<AccordionItem>`, `<AccordionTrigger>`, `<AccordionContent>` for each item; ensure keyboard navigation compliance
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_
  - [ ]* 17.4 Write component test for FAQ single-open invariant (Property 8)
    - **Property 8: FAQ Accordion Single-Open Invariant**
    - Use `fc.tuple(fc.nat(7), fc.nat(7)).filter(([a, b]) => a !== b)`; open item A then item B; assert A is collapsed and B is expanded
    - **Validates: Requirements 15.4**

- [ ] 18. Checkpoint — all sections complete
  - Ensure all section tests pass, ask the user if questions arise.


- [ ] 19. App shell — root layout and page assembly
  - [ ] 19.1 Create `src/app/layout.tsx` as a Server Component; apply Geist font via `next/font/google`; export `metadata` object with title, description, keywords, OpenGraph, Twitter card, robots, and manifest link; render `<html lang="en" suppressHydrationWarning>`, wrap `{children}` in `<Providers>`
    - _Requirements: 1.3, 1.5, 18.6_
  - [ ] 19.2 Create `src/app/loading.tsx` as the global Suspense fallback with a minimal full-screen skeleton
    - _Requirements: 19.2_
  - [ ] 19.3 Create `src/app/error.tsx` as the global error boundary Client Component with `"use client"` directive
    - _Requirements: 19.6_
  - [ ] 19.4 Create `src/app/page.tsx` as a Server Component; dynamically import `Loader` and `LiveChartSection` and `CalculatorSection` with `{ ssr: false }`; import all other section components statically; wrap each interactive section in `<Suspense fallback={<SectionSkeleton />}>`; assemble: Loader → Navbar → main → (HeroSection, CurrentPriceSection, LiveChartSection, CalculatorSection, CityPricesSection, NewsSection, MarketInsightsSection, InvestmentGuideSection, CompareSection, FAQSection) → Footer
    - _Requirements: 1.1, 19.2_
  - [ ] 19.5 Create `src/components/sections/index.ts` barrel exporting all section components
    - _Requirements: 19.4_

- [ ] 20. SEO — sitemap, robots, and manifest
  - [ ] 20.1 Create `src/app/sitemap.ts` exporting a `sitemap()` function returning a `MetadataRoute.Sitemap` array with the homepage entry, `changeFrequency: "daily"`, and `priority: 1`
    - _Requirements: 1.5_
  - [ ] 20.2 Create `src/app/robots.ts` exporting a `robots()` function returning `MetadataRoute.Robots` allowing all crawlers
    - _Requirements: 1.5_
  - [ ] 20.3 Create `src/app/manifest.ts` exporting a `manifest()` function returning a `MetadataRoute.Manifest` with `name`, `short_name`, `start_url: "/"`, `display: "standalone"`, `background_color: "#050505"`, `theme_color: "#D4AF37"`, and icon entries
    - _Requirements: 1.5_


- [ ] 21. Accessibility and reduced motion audit
  - [ ] 21.1 Add `focus-visible:ring-2 focus-visible:ring-gold-primary focus-visible:ring-offset-2` to the global stylesheet or Tailwind base layer to ensure visible focus indicators on all focusable elements
    - _Requirements: 19.5_
  - [ ] 21.2 Verify all icon-only buttons in Navbar (hamburger, close drawer, theme toggle) and chart controls carry non-empty `aria-label` attributes; add any missing labels
    - _Requirements: 19.3_
  - [ ] 21.3 Wrap `scroll-behavior: smooth` in `@media (prefers-reduced-motion: no-preference)` in the global stylesheet; update all Framer Motion animated components to read `useReducedMotion()` and set `transition: { duration: 0 }` when true
    - _Requirements: 20.5_
  - [ ]* 21.4 Write property test for reduced motion animation disabling (Property 11)
    - **Property 11: Reduced Motion Disables Animations**
    - Mock `window.matchMedia` to return `prefers-reduced-motion: reduce`; render animated components and assert all Framer Motion transition durations are 0ms
    - **Validates: Requirements 20.5**
  - [ ]* 21.5 Run axe-core accessibility checks on all major section components
    - Use vitest-axe `checkA11y` on: `<Navbar>`, `<CurrentPriceSection>`, `<CalculatorSection>`, `<CityPricesSection>`, `<NewsSection>`, `<FAQSection>`
    - _Requirements: 19.3, 19.4, 19.5_

- [ ] 22. Final integration, responsiveness, and polish
  - [ ] 22.1 Add `id` attributes to all page section wrappers matching Navbar anchor hrefs (`#hero`, `#current-prices`, `#live-chart`, `#calculator`, `#city-prices`, `#news`, `#market-insights`, `#investment-guide`, `#compare`, `#faq`) to enable smooth scroll navigation
    - _Requirements: 5.2, 5.3_
  - [ ] 22.2 Wrap all section main content containers in `max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8` to enforce the ultra-wide max-width constraint and consistent gutters
    - _Requirements: 17.5_
  - [ ] 22.3 Verify dark/light theme token application: dark bg `#050505`, light bg `#FAFAFA`; confirm gold accent colors are invariant in both themes; fix any token or class inconsistencies found
    - _Requirements: 18.3, 18.4, 18.5_
  - [ ] 22.4 Audit all card components for mobile touch target compliance — ensure all interactive elements have `min-h-[44px] min-w-[44px]`; fix any violations
    - _Requirements: 17.2_
  - [ ]* 22.5 Write integration test for full page render
    - Render the full page with mocked React Query providers; assert all 10 section headings are present in the DOM; assert no uncaught errors
    - _Requirements: 19.2, 19.6_

- [ ] 23. Final checkpoint — full test suite
  - Ensure all property tests, unit tests, component tests, and accessibility tests pass; ask the user if any questions arise before closing out.


---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All tasks reference specific requirements for traceability
- Property tests use Vitest + fast-check; component tests use Vitest + React Testing Library; accessibility tests use vitest-axe
- The design uses TypeScript / Next.js 15 throughout — no language selection step needed
- Mock data can be swapped for a real API by replacing the singleton in `src/services/index.ts` only
- Sections are assembled in `app/page.tsx` (Server Component); interactive sections use dynamic imports with `ssr: false`
- All Framer Motion animations use `viewport: { once: true, margin: "-80px" }` to avoid off-screen animation on load

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5"] },
    { "id": 1, "tasks": ["4.1", "4.2", "4.3", "4.4", "8.1", "9.1", "9.2"] },
    { "id": 2, "tasks": ["4.5", "5.1", "5.2", "5.3", "5.4", "6.1", "8.2", "9.3", "9.4", "9.5", "9.6", "9.7", "9.8", "9.9", "9.10"] },
    { "id": 3, "tasks": ["5.5", "5.6", "5.7", "6.2", "6.3", "10.1", "10.2", "10.3", "10.4", "10.5"] },
    { "id": 4, "tasks": ["6.4", "6.5", "10.6", "10.7", "10.8", "10.9", "10.10"] },
    { "id": 5, "tasks": ["10.11", "10.12", "11.1", "11.2", "11.3"] },
    { "id": 6, "tasks": ["11.4", "13.1", "13.2", "14.1", "14.3", "15.1", "15.3", "16.1", "16.2", "17.1", "17.3"] },
    { "id": 7, "tasks": ["13.3", "14.2", "14.4", "15.2", "15.4", "16.3", "17.2", "17.4", "19.1", "19.2", "19.3"] },
    { "id": 8, "tasks": ["19.4", "19.5", "20.1", "20.2", "20.3"] },
    { "id": 9, "tasks": ["21.1", "21.2", "21.3", "22.1", "22.2", "22.3", "22.4"] },
    { "id": 10, "tasks": ["21.4", "21.5", "22.5"] }
  ]
}
```
