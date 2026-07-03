# Design Document — Gold Price Tracker

## Overview

A premium, India-focused gold price tracking website built with **Next.js 15 App Router**, **TypeScript** (strict mode), **TailwindCSS v4**, **Framer Motion**, and **Shadcn UI**. The application is a single-route, multi-section page with a full mock data layer that mirrors the interface of a real API service. There are no user accounts, no database, and no backend — all data originates from the `MockGoldDataService`.

---

## Architecture

### Rendering Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│  Next.js 15 App Router                                          │
│                                                                 │
│  app/                                                           │
│  ├── layout.tsx          Server Component (root layout, fonts)  │
│  ├── page.tsx            Server Component (page shell)          │
│  ├── loading.tsx         Suspense fallback                       │
│  ├── error.tsx           Error boundary                         │
│  ├── sitemap.ts          Route handler → sitemap.xml            │
│  ├── robots.ts           Route handler → robots.txt             │
│  └── manifest.ts         Route handler → manifest.json          │
│                                                                 │
│  Client Components (interactive, hydrated in browser)           │
│  ├── Loader              Session-gated splash screen            │
│  ├── Navbar              Scroll state, mobile drawer, theme     │
│  ├── HeroSection         Framer Motion entrance (no data)       │
│  ├── CurrentPriceSection React Query + CountUp                  │
│  ├── LiveChartSection    React Query + Recharts + Zustand       │
│  ├── CalculatorSection   Zustand form state + React Query       │
│  ├── CityPricesSection   React Query + Zustand search           │
│  ├── NewsSection         React Query + Shadcn Dialog            │
│  ├── MarketInsights      React Query + Framer Motion            │
│  ├── InvestmentGuide     Static content (Client for animation)  │
│  ├── CompareSection      React Query + Zustand slider           │
│  ├── FAQSection          Shadcn Accordion                       │
│  └── Footer              Static (Server Component)              │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

- **Server Components** render the page shell, root layout, footer, and static content sections. They emit no JavaScript bundle cost.
- **Client Components** are colocated with the `"use client"` directive and are dynamically imported at the page level using `next/dynamic` with `{ ssr: false }` where hydration order matters (Loader, Chart).
- **React Query** manages all async data fetching and caching. The `QueryClient` is provided via a `Providers` client component wrapper at the root layout level.
- **Zustand** manages all synchronous UI state (theme, time range filter, calculator form, city search, mobile menu).
- **next-themes** owns the actual DOM class mutation for dark/light theme; Zustand mirrors the value for components that need to read it synchronously.

---

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx                # Root layout: fonts, metadata, Providers, html/body
│   ├── page.tsx                  # Home page: imports all sections
│   ├── loading.tsx               # Global Suspense fallback
│   ├── error.tsx                 # Global error boundary
│   ├── globals.css               # CSS custom properties, Tailwind v4 @theme
│   ├── sitemap.ts                # next/sitemap route
│   ├── robots.ts                 # next/robots route
│   └── manifest.ts               # next/manifest route
│
├── components/
│   ├── layout/
│   │   ├── Loader.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── CurrentPriceSection.tsx
│   │   ├── LiveChartSection.tsx
│   │   ├── CalculatorSection.tsx
│   │   ├── CityPricesSection.tsx
│   │   ├── NewsSection.tsx
│   │   ├── MarketInsightsSection.tsx
│   │   ├── InvestmentGuideSection.tsx
│   │   ├── CompareSection.tsx
│   │   ├── FAQSection.tsx
│   │   └── index.ts
│   └── ui/
│       ├── GoldPriceCard.tsx
│       ├── NewsCard.tsx
│       ├── InsightTile.tsx
│       ├── InvestmentTopicCard.tsx
│       ├── CityPriceCard.tsx
│       ├── GlassCard.tsx          # Base glassmorphism wrapper
│       ├── GoldenGlow.tsx         # HOC / wrapper for glow effect
│       ├── SectionHeading.tsx
│       ├── TimeRangeFilter.tsx
│       ├── PuritySelector.tsx
│       └── ErrorState.tsx
│
├── hooks/
│   ├── useGoldPrices.ts           # React Query: current prices
│   ├── useHistoricalPrices.ts     # React Query: chart data
│   ├── useCityPrices.ts           # React Query: city data
│   ├── useNewsItems.ts            # React Query: news data
│   ├── useMarketInsights.ts       # React Query: insights data
│   ├── useScrolled.ts             # Scroll position for Navbar
│   ├── useInView.ts               # Intersection Observer wrapper
│   └── useReducedMotion.ts        # prefers-reduced-motion hook
│
├── services/
│   ├── GoldDataService.ts         # TypeScript interface
│   ├── MockGoldDataService.ts     # Mock implementation
│   └── index.ts                  # Singleton export
│
├── store/
│   ├── useAppStore.ts             # Zustand store (all slices)
│   └── slices/
│       ├── themeSlice.ts
│       ├── timeRangeSlice.ts
│       ├── calculatorSlice.ts
│       ├── citySearchSlice.ts
│       └── navSlice.ts
│
├── types/
│   ├── gold.ts                    # GoldPrice, HistoricalPrice, CityPrice
│   ├── news.ts                    # NewsItem
│   ├── insights.ts                # MarketInsight
│   └── common.ts                  # Purity, TimeRange enums
│
├── constants/
│   ├── config.ts                  # STALE_TIMES, CITIES, PURITIES, TIME_RANGES
│   ├── faq.ts                     # FAQ Q&A pairs
│   ├── investmentGuide.ts         # Topic card content
│   └── animations.ts              # Shared Framer Motion variants
│
├── lib/
│   ├── queryClient.ts             # React Query QueryClient factory
│   └── fonts.ts                   # Geist font setup
│
├── utils/
│   ├── formatCurrency.ts          # INR formatting helper
│   ├── calculateGst.ts            # GST calculation helper
│   ├── filterCities.ts            # Case-insensitive city filter
│   └── getPriceChangeColor.ts     # Green/red/neutral helper
│
├── providers/
│   └── Providers.tsx              # QueryClientProvider + ThemeProvider wrapper
│
└── styles/
    └── (additional CSS modules if needed)
```


---

## Data Layer

### TypeScript Interface

```typescript
// services/GoldDataService.ts
import type {
  GoldPriceMap,
  HistoricalPrice,
  CityPrice,
  NewsItem,
  MarketInsight,
  Purity,
  TimeRange,
} from "@/types";

export interface GoldDataService {
  /** Returns current price per gram in INR for all three purities */
  fetchCurrentPrices(): Promise<GoldPriceMap>;

  /** Returns ordered array of { date, price } for the given purity and time range */
  fetchHistoricalPrices(purity: Purity, range: TimeRange): Promise<HistoricalPrice[]>;

  /** Returns price entries for all eight supported cities */
  fetchCityPrices(): Promise<CityPrice[]>;

  /** Returns news items sorted by publication date descending */
  fetchNewsItems(): Promise<NewsItem[]>;

  /** Returns market insight tiles */
  fetchMarketInsights(): Promise<MarketInsight[]>;
}
```

### Core TypeScript Types

```typescript
// types/common.ts
export type Purity = "24K" | "22K" | "18K";
export type TimeRange = "1D" | "1W" | "1M" | "3M" | "1Y";

// types/gold.ts
export type GoldPriceMap = Record<Purity, { pricePerGram: number; changePercent: number }>;
export interface HistoricalPrice { date: string; price: number; }
export interface CityPrice { city: string; pricePerGram: number; changePercent: number; }

// types/news.ts
export interface NewsItem {
  id: string;
  headline: string;
  summary: string;   // max 200 chars
  fullSummary: string;
  source: string;
  publishedAt: string;   // ISO date string
}

// types/insights.ts
export interface MarketInsight {
  id: string;
  title: string;
  description: string;
  changePercent: number;
  direction: "up" | "down" | "neutral";
}
```

### MockGoldDataService

```typescript
// services/MockGoldDataService.ts
import type { GoldDataService } from "./GoldDataService";
import { CITIES, BASE_PRICES, NEWS_ITEMS, INSIGHTS } from "@/constants/config";

export class MockGoldDataService implements GoldDataService {
  async fetchCurrentPrices(): Promise<GoldPriceMap> {
    return {
      "24K": { pricePerGram: 7420, changePercent: 0.42 },
      "22K": { pricePerGram: 6802, changePercent: 0.38 },
      "18K": { pricePerGram: 5565, changePercent: 0.31 },
    };
  }

  async fetchHistoricalPrices(purity: Purity, range: TimeRange): Promise<HistoricalPrice[]> {
    // Algorithmically generate realistic price walk for the requested range
    const pointCount: Record<TimeRange, number> = { "1D": 24, "1W": 7, "1M": 30, "3M": 90, "1Y": 365 };
    const base = BASE_PRICES[purity];
    return Array.from({ length: pointCount[range] }, (_, i) => ({
      date: getDateFromOffset(i, range),   // utility producing ISO date string
      price: base + Math.sin(i * 0.3) * 80 + (Math.random() - 0.5) * 40,
    }));
  }

  async fetchCityPrices(): Promise<CityPrice[]> {
    return CITIES.map((city) => ({
      city,
      pricePerGram: 6802 + Math.floor(Math.random() * 60 - 30),
      changePercent: +(Math.random() * 0.8 - 0.4).toFixed(2),
    }));
  }

  async fetchNewsItems(): Promise<NewsItem[]> { return NEWS_ITEMS; }
  async fetchMarketInsights(): Promise<MarketInsight[]> { return INSIGHTS; }
}
```

### Singleton Export

```typescript
// services/index.ts
import { MockGoldDataService } from "./MockGoldDataService";
import type { GoldDataService } from "./GoldDataService";

// Swap this single line to use a real API service
export const goldDataService: GoldDataService = new MockGoldDataService();
```


---

## State Management — Zustand Store

All slices are combined into a single `useAppStore` hook using Zustand's `create` with the `immer` middleware for ergonomic mutation.

```typescript
// store/useAppStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  // Theme slice
  theme: "dark" | "light";
  setTheme: (t: "dark" | "light") => void;

  // Time-range slice (default: "1M")
  timeRange: TimeRange;
  setTimeRange: (r: TimeRange) => void;

  // Calculator slice
  calcWeight: string;
  calcPurity: Purity;
  setCalcWeight: (w: string) => void;
  setCalcPurity: (p: Purity) => void;

  // City search slice
  citySearch: string;
  setCitySearch: (q: string) => void;

  // Nav slice
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),

      timeRange: "1M",
      setTimeRange: (timeRange) => set({ timeRange }),

      calcWeight: "",
      calcPurity: "22K",
      setCalcWeight: (calcWeight) => set({ calcWeight }),
      setCalcPurity: (calcPurity) => set({ calcPurity }),

      citySearch: "",
      setCitySearch: (citySearch) => set({ citySearch }),

      mobileMenuOpen: false,
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
    }),
    { name: "gold-tracker-store", partialize: (s) => ({ theme: s.theme }) }
  )
);
```

> The `persist` middleware persists only the `theme` slice to `localStorage`. All other slices are ephemeral session state.

---

## React Query Setup

```typescript
// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,     // 1 minute default
        gcTime: 5 * 60_000,
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  });
}
```

```typescript
// providers/Providers.tsx
"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { makeQueryClient } from "@/lib/queryClient";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

### Query Keys & Hooks

| Hook | Query Key | staleTime |
|---|---|---|
| `useGoldPrices()` | `["goldPrices"]` | 60 000 ms |
| `useHistoricalPrices(purity, range)` | `["historical", purity, range]` | 60 000 ms |
| `useCityPrices()` | `["cityPrices"]` | 300 000 ms |
| `useNewsItems()` | `["news"]` | 300 000 ms |
| `useMarketInsights()` | `["insights"]` | 300 000 ms |

```typescript
// hooks/useGoldPrices.ts
import { useQuery } from "@tanstack/react-query";
import { goldDataService } from "@/services";

export function useGoldPrices() {
  return useQuery({
    queryKey: ["goldPrices"],
    queryFn: () => goldDataService.fetchCurrentPrices(),
    staleTime: 60_000,
  });
}
```

---

## Component Hierarchy

```
app/page.tsx (Server Component)
├── <Providers>  (Client, wraps all)
│   ├── <Loader />                     Client — session-gated, Framer Motion
│   ├── <Navbar />                     Client — scroll state, mobile drawer
│   ├── <main>
│   │   ├── <HeroSection />            Client — Framer Motion entrance
│   │   ├── <Suspense>
│   │   │   └── <CurrentPriceSection />  Client — useGoldPrices + CountUp
│   │   │       └── <GoldPriceCard /> × 3
│   │   ├── <Suspense>
│   │   │   └── <LiveChartSection />   Client — useHistoricalPrices + Recharts
│   │   │       ├── <TimeRangeFilter />
│   │   │       ├── <PuritySelector />
│   │   │       └── <GoldAreaChart />
│   │   ├── <Suspense>
│   │   │   └── <CalculatorSection />  Client — Zustand form + useGoldPrices
│   │   ├── <Suspense>
│   │   │   └── <CityPricesSection />  Client — useCityPrices + Zustand search
│   │   │       └── <CityPriceCard /> × 8
│   │   ├── <Suspense>
│   │   │   └── <NewsSection />        Client — useNewsItems + Shadcn Dialog
│   │   │       └── <NewsCard /> × 6+
│   │   ├── <Suspense>
│   │   │   └── <MarketInsightsSection />  Client — useMarketInsights
│   │   │       └── <InsightTile /> × 4+
│   │   ├── <InvestmentGuideSection /> Client — static content + animation
│   │   │   └── <InvestmentTopicCard /> × 4+
│   │   ├── <Suspense>
│   │   │   └── <CompareSection />     Client — useGoldPrices + slider
│   │   ├── <FAQSection />             Client — Shadcn Accordion
│   │   └── <Footer />                 Server Component
```


---

## Section Designs

### 1. Loader

```
┌─────────────────────────────────────────────────────────────────┐
│  Position: fixed, inset-0, z-[9999], bg-[#050505]              │
│  • Framer Motion: scale 0.8→1 + opacity 0→1, duration 0.6s     │
│  • After 2.0s: opacity 1→0 exit animation (0.4s)               │
│  • On complete: setShowLoader(false), saved to sessionStorage   │
│  • Centered wordmark "GOLD TRACKER" in Primary Gold color       │
│  • Animated golden ring orbiting the wordmark (CSS animation)  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation notes:**
- `const [show, setShow] = useState(() => !sessionStorage.getItem("loaderShown"))` guards re-display.
- Dynamic import: `const Loader = dynamic(() => import("@/components/layout/Loader"), { ssr: false })`.

### 2. Navbar

```
┌─────────────────────────────────────────────────────────────────┐
│  Position: fixed, top-0, w-full, z-50                          │
│  Normal: bg-black/40 backdrop-blur-md border-b border-gold/10  │
│  Scrolled (>80px): bg-black/70 backdrop-blur-xl               │
│  Left: Logo/Wordmark                                           │
│  Center: Section anchor links (hidden on mobile)               │
│  Right: Theme toggle + Hamburger (mobile only)                 │
│                                                                 │
│  Mobile drawer: fixed inset-0 bg-black/95, slide-in from right │
│  Zustand: mobileMenuOpen controls drawer visibility            │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Hero Section

```
┌─────────────────────────────────────────────────────────────────┐
│  Desktop: two columns (60/40 split)                            │
│  Left:                                                         │
│    H1: "Track Gold Prices" (animate y+30→0, opacity 0→1)      │
│    H2: India's premium real-time gold price tracker            │
│    CTA Button → scrolls to #current-prices                     │
│  Right:                                                        │
│    Decorative animated gold price ticker strip                 │
│                                                                 │
│  Background: radial-gradient from gold/10 to transparent       │
│  Mobile: single column, text center-aligned                    │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Current Gold Price Section

Three `<GoldPriceCard>` cards in a responsive grid (1 col → 3 col).

**GoldPriceCard internals:**
```
┌─────────────────────────────────────────────────────────────────┐
│  GlassCard base + golden-glow on hover                         │
│  Top: Purity badge (24K / 22K / 18K)                           │
│  Center: <CountUp end={pricePerGram} prefix="₹" decimals={0} /> │
│  Bottom: changePercent with ▲/▼ icon, green/red color          │
│  Trigger: useInView → starts CountUp when card enters viewport │
└─────────────────────────────────────────────────────────────────┘
```

### 5. Live Chart Section

```typescript
// Recharts setup
<ResponsiveContainer width="100%" height={320}>
  <AreaChart data={historicalPrices}>
    <defs>
      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
    <XAxis dataKey="date" tick={{ fill: "#888", fontSize: 11 }} />
    <YAxis tick={{ fill: "#888", fontSize: 11 }} />
    <Tooltip content={<CustomGoldTooltip />} />
    <Area
      type="monotone"
      dataKey="price"
      stroke="#D4AF37"
      strokeWidth={2}
      fill="url(#goldGradient)"
      isAnimationActive={true}
      animationDuration={400}
    />
  </AreaChart>
</ResponsiveContainer>
```

**Custom tooltip:**
```typescript
function CustomGoldTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-sm">
      <p className="text-gold font-semibold">₹{payload[0].value.toLocaleString("en-IN")}</p>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}
```

### 6. Price Calculator Section

State lives in Zustand (`calcWeight`, `calcPurity`). Computation is a pure derived value:

```typescript
const pricePerGram = prices?.[calcPurity]?.pricePerGram ?? 0;
const isValid = calcWeight !== "" && !isNaN(+calcWeight) && +calcWeight > 0;
const basePrice = isValid ? +calcWeight * pricePerGram : 0;
const gstAmount = basePrice * 0.03;
const totalPrice = basePrice + gstAmount;
```

Layout: two-column form + result panel on desktop; stacked on mobile.

### 7. City Prices Section

Filtered list derived from Zustand `citySearch`:
```typescript
const filtered = useMemo(
  () => cities.filter((c) => c.city.toLowerCase().includes(citySearch.toLowerCase())),
  [cities, citySearch]
);
```

`<CityPriceCard>` uses Framer Motion stagger:
```typescript
const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
```

### 8. News Section

Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. Clicking a card triggers:
```typescript
<Dialog>
  <DialogTrigger asChild><NewsCard ... /></DialogTrigger>
  <DialogContent className="glass-card max-w-2xl">
    <DialogHeader><DialogTitle>{item.headline}</DialogTitle></DialogHeader>
    <p>{item.fullSummary}</p>
  </DialogContent>
</Dialog>
```

### 9. Market Insights Section

Four `<InsightTile>` components in a `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` grid.
Each tile shows: title, description, `<ChangePercentBadge direction changePercent />`.
Stagger: `staggerChildren: 0.1` (max total 400 ms for 4 tiles).

### 10. Investment Guide Section

Static content from `constants/investmentGuide.ts`. Four cards minimum with Lucide icon, title, body.
Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4`.

### 11. Compare Section

Weight slider: `<input type="range" min={1} max={100} />` → local state `compareWeight`.
Table rows: one per purity, columns: Purity | Price/gram | Total (weight × price).
Differential rows: 24K−22K and 24K−18K in INR and %.
Data from `useGoldPrices()` (same cache as Current Price section).

### 12. FAQ Section

```typescript
<Accordion type="single" collapsible className="w-full">
  {FAQ_ITEMS.map((item) => (
    <AccordionItem key={item.id} value={item.id}>
      <AccordionTrigger>{item.question}</AccordionTrigger>
      <AccordionContent>{item.answer}</AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

`type="single"` + `collapsible` enforces single-open behavior. Shadcn's built-in CSS animation handles expand/collapse.

### 13. Footer

Server Component. Three link groups: Tools, Learn, About. Copyright uses `new Date().getFullYear()`.
Disclaimer: "All prices shown are simulated and for informational purposes only."
Responsive: `grid-cols-1 sm:grid-cols-3`.


---

## TailwindCSS v4 Design Tokens

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-gold-primary: #D4AF37;
  --color-gold-secondary: #F7C948;
  --color-background: #050505;
  --color-surface: rgba(255, 255, 255, 0.05);

  --font-sans: "Geist", ui-sans-serif, system-ui;

  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Glassmorphism utility */
@utility glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 1rem;
}

/* Golden glow utility */
@utility golden-glow {
  box-shadow: 0 0 24px rgba(212, 175, 55, 0.3);
}

/* Reduced motion override */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Framer Motion Animation Patterns

All shared variants are exported from `constants/animations.ts`:

```typescript
// constants/animations.ts
import type { Variants } from "framer-motion";

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};
```

### Viewport Trigger Pattern

All section cards use Framer Motion's `viewport` prop to avoid off-screen animation on load:

```typescript
<motion.div
  variants={fadeUpVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-80px" }}
>
  ...
</motion.div>
```

### Reduced Motion Hook

```typescript
// hooks/useReducedMotion.ts
import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

export function useReducedMotion() {
  return useFramerReducedMotion() ?? false;
}
```

Components read this and pass `{ duration: 0 }` as the `transition` override when `true`.

---

## Responsive Layout Strategy

| Breakpoint | Name | Min Width | Layout Behavior |
|---|---|---|---|
| (default) | mobile | 0 | Single column, hamburger nav, stacked hero |
| `sm:` | tablet | 640px | 2-col card grids, condensed navbar links |
| `lg:` | laptop | 1024px | 3-col card grids, full horizontal navbar |
| `xl:` | desktop | 1280px | Wider gutters, 4-col insights grid |
| `2xl:` | ultra-wide | 1536px | `max-w-[1536px] mx-auto` content container |

### Touch Target Compliance

All interactive elements on mobile use `min-h-[44px] min-w-[44px]` via Tailwind classes.

### Navigation Responsive Behavior

```typescript
// Navbar responsive classes
<nav className="fixed top-0 inset-x-0 z-50 ...">
  {/* Desktop links */}
  <ul className="hidden lg:flex gap-6">...</ul>
  {/* Mobile: hamburger */}
  <button className="lg:hidden min-h-[44px] min-w-[44px]" aria-label="Open menu">
    <MenuIcon />
  </button>
</nav>
```

---

## SEO & Metadata

### Root Layout Metadata

```typescript
// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gold Price Tracker India — Live 24K, 22K, 18K Rates",
  description: "Track today's gold prices in India for 24K, 22K, and 18K purity across major cities. Interactive charts, GST calculator, and market insights.",
  keywords: ["gold price india", "gold rate today", "24k gold price", "gold price calculator"],
  openGraph: {
    title: "Gold Price Tracker India",
    description: "Live gold rates for all purities across Indian cities.",
    type: "website",
    locale: "en_IN",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gold Price Tracker India",
    description: "Live gold rates across Indian cities.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
};
```

### Sitemap

```typescript
// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://goldpricetracker.in", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
  ];
}
```

### Web App Manifest

```typescript
// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gold Price Tracker India",
    short_name: "GoldTracker",
    description: "Live gold prices for India",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#D4AF37",
    icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  };
}
```

---

## Performance

### Dynamic Imports

```typescript
// app/page.tsx (Server Component)
import dynamic from "next/dynamic";

const Loader = dynamic(() => import("@/components/layout/Loader"), { ssr: false });
const LiveChartSection = dynamic(() => import("@/components/sections/LiveChartSection"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const CalculatorSection = dynamic(() => import("@/components/sections/CalculatorSection"), { ssr: false });
```

### Suspense Boundaries

Each interactive section is wrapped in `<Suspense fallback={<SectionSkeleton />}>` so slow data fetches do not block the initial paint of surrounding sections.

### Server vs Client Split

| Component | Rendering | Reason |
|---|---|---|
| `layout.tsx` | Server | Static shell, fonts, metadata |
| `page.tsx` | Server | Section composition only |
| `Footer` | Server | Pure static content |
| All section content | Client | React Query, Zustand, Framer Motion |
| `Providers` | Client | Context providers require browser |

---

## Accessibility

- All icon-only buttons carry `aria-label` (theme toggle, hamburger, close drawer, chart controls).
- Shadcn UI `Accordion` implements ARIA 1.1 accordion pattern out of the box.
- Shadcn UI `Dialog` traps focus and sets `aria-modal="true"`.
- Color contrast: gold (#D4AF37) on dark background (#050505) achieves minimum 4.5:1 for large text.
- Focus ring: `focus-visible:ring-2 focus-visible:ring-gold-primary focus-visible:ring-offset-2` applied globally.
- Smooth scroll respects `prefers-reduced-motion`: `scroll-behavior: smooth` is inside a `@media (prefers-reduced-motion: no-preference)` block.

---

## Theme System (next-themes)

```typescript
// app/layout.tsx
<html lang="en" suppressHydrationWarning>
  <body>
    <Providers>{children}</Providers>
  </body>
</html>
```

```typescript
// TailwindCSS v4 dark mode via class strategy
@variant dark (&:where(.dark, .dark *));
```

Dark theme palette:
- Background: `#050505`
- Surface: `rgba(255,255,255,0.05)`
- Text primary: `#F5F5F5`
- Text muted: `#888888`

Light theme palette:
- Background: `#FAFAFA`
- Surface: `rgba(0,0,0,0.04)`
- Text primary: `#111111`
- Text muted: `#666666`

Gold accent colors are invariant across themes.


---

## Error Handling

Every React Query hook returns `{ data, isLoading, error }`. Sections render conditionally:

```typescript
if (error) return <ErrorState message="Unable to load gold prices. Please try again." />;
if (isLoading) return <SectionSkeleton />;
```

`<ErrorState>` is a non-blocking inline component — it occupies the section's normal layout space and does not crash the page or adjacent sections.

---

## Utility Functions

```typescript
// utils/formatCurrency.ts
export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

// utils/calculateGst.ts
export function calculateGst(basePrice: number, rate = 0.03) {
  const gst = basePrice * rate;
  return { base: basePrice, gst, total: basePrice + gst };
}

// utils/filterCities.ts
export function filterCities(cities: CityPrice[], query: string): CityPrice[] {
  if (!query.trim()) return cities;
  const q = query.toLowerCase();
  return cities.filter((c) => c.city.toLowerCase().includes(q));
}

// utils/getPriceChangeColor.ts
export function getPriceChangeColor(change: number): string {
  if (change > 0) return "text-emerald-400";
  if (change < 0) return "text-red-400";
  return "text-muted-foreground";
}
```

---

## Constants

```typescript
// constants/config.ts
export const CITIES = ["Mumbai","Delhi","Chennai","Kochi","Hyderabad","Bangalore","Kolkata","Pune"] as const;
export const PURITIES = ["24K","22K","18K"] as const;
export const TIME_RANGES = ["1D","1W","1M","3M","1Y"] as const;
export const BASE_PRICES: Record<Purity, number> = { "24K": 7420, "22K": 6802, "18K": 5565 };
export const STALE_TIMES = { PRICES: 60_000, CITY: 300_000, NEWS: 300_000 } as const;
export const MAX_COMPARE_WEIGHT = 100;
export const GST_RATE = 0.03;
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Historical Prices Cover Requested Range

*For any* valid `TimeRange` value (`1D` | `1W` | `1M` | `3M` | `1Y`) and any `Purity` value, calling `fetchHistoricalPrices(purity, range)` on the `MockGoldDataService` SHALL return a non-empty array of objects each conforming to `{ date: string; price: number }`, with prices that are positive numbers and dates in ascending chronological order.

**Validates: Requirements 2.4**

---

### Property 2: Calculator Total Is Mathematically Correct

*For any* positive weight `w` (in grams) and any purity `p` in `{24K, 22K, 18K}`, the calculated total displayed by the Price Calculator SHALL equal `w × pricePerGram[p] × 1.03`, with the GST line item equal to `w × pricePerGram[p] × 0.03`, within floating-point rounding tolerance of ±1 INR.

**Validates: Requirements 9.2, 9.3**

---

### Property 3: Calculator Rejects Invalid Inputs

*For any* weight value that is either non-numeric, zero, or negative, the Price Calculator SHALL display a validation error message and SHALL NOT display a numeric total price.

**Validates: Requirements 9.6**

---

### Property 4: City Search Filter Correctness

*For any* non-empty search query string `q`, every city card displayed in the City Prices Section SHALL have a city name that contains `q` as a case-insensitive substring; no city card SHALL be displayed whose city name does not contain `q`.

**Validates: Requirements 10.3**

---

### Property 5: Time Range Selection Updates Store and Query

*For any* `TimeRange` value selected via the Time-Range Filter buttons, the Zustand store's `timeRange` field SHALL be updated to that value, and the React Query key for historical prices SHALL include that value, causing a cache miss and re-fetch when the value changes.

**Validates: Requirements 8.3**

---

### Property 6: Compare Section Weight Estimates Are Correct

*For any* weight `w` in the integer range `[1, 100]`, the cost estimate shown for each purity `p` in the Compare Section SHALL equal `w × pricePerGram[p]`, and the differential between 24K and 22K SHALL equal `pricePerGram["24K"] - pricePerGram["22K"]` regardless of the slider position.

**Validates: Requirements 14.2, 14.3**

---

### Property 7: Investment Guide Card Word Count

*For any* investment guide topic card rendered in the Investment Guide Section, the explanation text SHALL contain no more than 120 words.

**Validates: Requirements 13.2**

---

### Property 8: FAQ Accordion Single-Open Invariant

*For any* two distinct FAQ accordion items A and B, if item A is currently expanded and item B is activated, then item A SHALL be collapsed and item B SHALL be expanded; no other items SHALL be expanded simultaneously.

**Validates: Requirements 15.4**

---

### Property 9: Icon-Only Buttons Have Accessible Labels

*For any* icon-only interactive element rendered in the Application (theme toggle, hamburger menu, close drawer, chart controls), the element SHALL have a non-empty `aria-label` attribute.

**Validates: Requirements 19.3**

---

### Property 10: Data Fetch Failures Produce Error States, Not Crashes

*For any* React Query data hook that throws an error (simulated via mock rejection), the corresponding section SHALL render an `<ErrorState>` component within its normal layout area, and the rest of the page SHALL continue to render without an uncaught exception.

**Validates: Requirements 19.6**

---

### Property 11: Reduced Motion Disables Animations

*For any* animated component in the Application, when the `prefers-reduced-motion: reduce` media query is active, the component's Framer Motion transitions SHALL have a duration of 0 ms or be omitted, ensuring no motion is presented to users who have opted out.

**Validates: Requirements 20.5**

---

### Property 12: Glassmorphism Styles Applied to All Cards

*For any* card component (`GoldPriceCard`, `CityPriceCard`, `NewsCard`, `InsightTile`, `InvestmentTopicCard`, `GlassCard`), the rendered element SHALL have a semi-transparent background (`rgba(255,255,255,0.05)`), a `backdrop-filter: blur(12px)` style, and a `1px solid rgba(212,175,55,0.2)` border.

**Validates: Requirements 20.1**


---

## Components and Interfaces

### GlassCard (Base Component)

```typescript
// components/ui/GlassCard.tsx
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;   // enables golden-glow on hover
}
```

Renders a `<div>` with the `glass-card` utility class plus optional `hover:golden-glow` transition.

### GoldPriceCard

```typescript
// components/ui/GoldPriceCard.tsx
interface GoldPriceCardProps {
  purity: Purity;
  pricePerGram: number;
  changePercent: number;
  inView: boolean;    // triggers CountUp
}
```

### NewsCard

```typescript
// components/ui/NewsCard.tsx
interface NewsCardProps {
  item: NewsItem;
  onClick: () => void;
}
```

### InsightTile

```typescript
// components/ui/InsightTile.tsx
interface InsightTileProps {
  insight: MarketInsight;
  index: number;    // stagger delay = index × 100ms
}
```

### CityPriceCard

```typescript
// components/ui/CityPriceCard.tsx
interface CityPriceCardProps {
  cityPrice: CityPrice;
}
```

### TimeRangeFilter

```typescript
// components/ui/TimeRangeFilter.tsx
interface TimeRangeFilterProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}
```

Renders a row of `<button>` elements for each `TIME_RANGES` constant value.

### PuritySelector

```typescript
// components/ui/PuritySelector.tsx
interface PuritySelectorProps {
  value: Purity;
  onChange: (purity: Purity) => void;
}
```

Renders a Shadcn UI `<Select>` with 24K / 22K / 18K options.

### ErrorState

```typescript
// components/ui/ErrorState.tsx
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}
```

Renders an inline error message within the section's normal layout space. Never full-page.

### SectionHeading

```typescript
// components/ui/SectionHeading.tsx
interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}
```

### Navbar

```typescript
// components/layout/Navbar.tsx
// Internal state driven by:
// - useScrolled() hook (scroll > 80px detection)
// - useAppStore(s => s.mobileMenuOpen) + setMobileMenuOpen
// - useTheme() from next-themes + setTheme from Zustand
```

### Loader

```typescript
// components/layout/Loader.tsx
// Props: none
// Internal: useState<boolean> gated on sessionStorage
// Fires setShowLoader(false) + sessionStorage.setItem after 2.0s delay + 0.4s exit
```

---

## Data Models

### GoldPriceMap

```typescript
type GoldPriceMap = {
  "24K": { pricePerGram: number; changePercent: number };
  "22K": { pricePerGram: number; changePercent: number };
  "18K": { pricePerGram: number; changePercent: number };
};
```

### HistoricalPrice

```typescript
interface HistoricalPrice {
  date: string;      // ISO 8601 date string, ascending order
  price: number;     // price per gram in INR, positive
}
```

### CityPrice

```typescript
interface CityPrice {
  city: string;           // one of the eight supported cities
  pricePerGram: number;   // 22K price per gram in INR
  changePercent: number;  // % change from previous day
}
```

### NewsItem

```typescript
interface NewsItem {
  id: string;
  headline: string;
  summary: string;       // ≤200 chars, displayed on card
  fullSummary: string;   // full text shown in Dialog
  source: string;        // publication name
  publishedAt: string;   // ISO date string
}
```

### MarketInsight

```typescript
interface MarketInsight {
  id: string;
  title: string;
  description: string;
  changePercent: number;
  direction: "up" | "down" | "neutral";
}
```

### AppStore (Zustand)

```typescript
interface AppState {
  theme: "dark" | "light";
  timeRange: "1D" | "1W" | "1M" | "3M" | "1Y";
  calcWeight: string;
  calcPurity: "24K" | "22K" | "18K";
  citySearch: string;
  mobileMenuOpen: boolean;
  // setters omitted for brevity — see Zustand Store section
}
```

### InvestmentTopicCard (static data shape)

```typescript
interface InvestmentTopic {
  id: string;
  icon: LucideIcon;
  title: string;
  body: string;   // ≤120 words
}
```

### FAQItem (static data shape)

```typescript
interface FAQItem {
  id: string;
  question: string;
  answer: string;
}
```

---

## Testing Strategy

Testing follows a dual approach: **property-based tests** for universal invariants (see Correctness Properties section) and **example-based unit/integration tests** for specific behaviors and edge cases.

### Property-Based Tests (Vitest + fast-check)

Target the pure utility functions and data service methods:

| Property | Target Module | Generator |
|---|---|---|
| Property 1: Historical prices shape | `MockGoldDataService.fetchHistoricalPrices` | `fc.constantFrom(...TIME_RANGES)` × `fc.constantFrom(...PURITIES)` |
| Property 2: Calculator total correctness | `calculateGst` + price lookup | `fc.float({ min: 0.01, max: 1000 })` × `fc.constantFrom(...PURITIES)` |
| Property 3: Calculator invalid input rejection | Calculator component logic | `fc.oneof(fc.constant(""), fc.float({ max: 0 }), fc.string())` |
| Property 4: City search filter | `filterCities` utility | `fc.string()` search query against generated city arrays |
| Property 6: Compare weight estimates | Comparison calculation | `fc.integer({ min: 1, max: 100 })` |
| Property 7: Investment card word count | Static content array | Iterate `INVESTMENT_TOPICS` |
| Property 8: FAQ single-open | Accordion state logic | `fc.tuple(fc.nat(7), fc.nat(7)).filter(([a,b]) => a !== b)` |

### Example-Based Unit Tests (Vitest)

- `MockGoldDataService.fetchCurrentPrices()` returns all three purities
- `MockGoldDataService.fetchCityPrices()` returns all eight cities
- Zustand store initializes with `timeRange: "1M"` and `mobileMenuOpen: false`
- `formatINR(7420)` returns `"₹7,420"`
- `filterCities(allCities, "")` returns all 8 cities
- `getPriceChangeColor(0.42)` returns `"text-emerald-400"`
- `getPriceChangeColor(-0.1)` returns `"text-red-400"`

### Component Tests (React Testing Library + Vitest)

- `<GoldPriceCard>` renders purity badge and price value
- `<ErrorState>` renders error message without crashing
- `<Loader>` unmounts after 2500ms (fake timers)
- `<FAQSection>` — opening item B while A is open collapses A
- Icon-only buttons (`aria-label` presence assertions)
- `<CalculatorSection>` with weight `"0"` shows validation message

### Accessibility Tests (axe-core via vitest-axe)

Run `checkA11y` on all major section components to catch ARIA violations automatically.

### Test Configuration

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

```typescript
// src/test/setup.ts
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
afterEach(() => cleanup());
```
