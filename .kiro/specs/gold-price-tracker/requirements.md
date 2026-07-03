# Requirements Document

## Introduction

A premium, India-focused gold price tracking website built with Next.js 15 (App Router), TypeScript, TailwindCSS v4, Framer Motion, and Shadcn UI. The site presents gold price data, interactive charts, a price calculator, city-wise prices, market news, and educational content in a luxury financial dashboard aesthetic. All data is served from a mock data layer that is abstracted behind service interfaces so a real API (e.g., GoldAPI.io) can be wired in later with minimal changes. The site is purely informational — no user accounts, no portfolio tracking.

---

## Glossary

- **Application**: The gold price tracking Next.js web application.
- **Mock Data Service**: The abstracted data layer that returns simulated gold price, city, news, and chart data; implements the same interface as a real API service.
- **Data Service Interface**: The TypeScript interface that both the Mock Data Service and any future real API service must implement.
- **Gold Price Card**: The UI component that displays the current gold price for a given purity.
- **Price Calculator**: The interactive form that computes the cost of a gold purchase inclusive of 3% GST.
- **City Price Panel**: The section displaying gold prices across the eight supported Indian cities.
- **Live Chart**: The Recharts-powered interactive price history chart.
- **News Card**: A card component rendering a single gold market news item.
- **Theme**: The visual color mode (dark or light) controlled by next-themes and stored in Zustand UI state.
- **Time-Range Filter**: The selector controlling the historical date range displayed in the Live Chart (1D / 1W / 1M / 3M / 1Y).
- **INR**: Indian Rupee (₹), the sole display currency.
- **Purity**: The gold purity grade — 24K, 22K, or 18K.
- **GST**: Goods and Services Tax applied to gold purchases in India at a rate of 3%.
- **Glassmorphism Card**: A UI card with a frosted-glass visual effect (semi-transparent background, backdrop blur, subtle border).
- **Golden Glow**: A CSS box-shadow or filter effect using the Primary Gold color (#D4AF37) to simulate luminescence.
- **Geist Font**: The typeface applied globally via next/font.
- **Loader**: The full-screen animated splash screen shown on initial page load.
- **Navbar**: The top navigation bar with site branding, section links, and theme toggle.
- **Hero Section**: The above-the-fold section with headline, sub-headline, and primary call-to-action.
- **Market Insights Section**: The section surfacing trend indicators, percentage changes, and contextual market commentary.
- **Investment Guide Section**: The educational section explaining gold investment basics, purity grades, and buying tips.
- **Compare Section**: The section comparing gold prices across purity grades and/or time periods side-by-side.
- **FAQ Section**: The accordion-style frequently-asked-questions section.
- **Footer**: The bottom site section with links, disclaimer, and copyright.
- **React Query**: The server-state and data-fetching library used to fetch and cache Mock Data Service responses.
- **Zustand Store**: The client-side state store managing Theme, Time-Range Filter, Calculator form state, City search query, and mobile menu open/close.
- **React CountUp**: The library used for animated number roll-up on price reveals.
- **React Intersection Observer**: The library used to trigger section entrance animations when elements enter the viewport.
- **Framer Motion**: The animation library used for page transitions, card entrances, and micro-interactions.
- **Recharts**: The charting library used to render the Live Chart.
- **Shadcn UI**: The component library providing accessible base components (dialogs, accordions, selects, tooltips, etc.).
- **Lucide Icons**: The icon library used throughout the Application.

---

## Requirements

### Requirement 1 — Project Foundation & Configuration

**User Story:** As a developer, I want a correctly configured Next.js 15 App Router project with all declared dependencies, so that the Application builds and runs without errors.

#### Acceptance Criteria

1. THE Application SHALL be bootstrapped as a Next.js 15 project using the App Router with TypeScript strict mode enabled.
2. THE Application SHALL include TailwindCSS v4, Framer Motion, Shadcn UI, next-themes, React Query, Zustand, Recharts, React CountUp, React Intersection Observer, and Lucide Icons as production dependencies.
3. THE Application SHALL apply the Geist font globally via `next/font/google` in the root layout.
4. THE Application SHALL define CSS custom properties for Primary Gold (`#D4AF37`), Secondary Gold (`#F7C948`), and background (`#050505`) in the global stylesheet.
5. THE Application SHALL export a Next.js metadata object from the root layout containing a descriptive `title` and `description`.

---

### Requirement 2 — Data Service Abstraction

**User Story:** As a developer, I want all data access to go through a typed service interface, so that the Mock Data Service can be replaced by a real API with minimal code changes.

#### Acceptance Criteria

1. THE Application SHALL define a TypeScript `GoldDataService` interface that declares methods for: fetching the current gold price by purity, fetching historical price series by purity and time range, fetching city price list, and fetching news items.
2. THE Application SHALL implement a `MockGoldDataService` class that fulfils the `GoldDataService` interface using realistic static or algorithmically generated values.
3. WHEN the `MockGoldDataService` returns current gold prices, THE `MockGoldDataService` SHALL return prices in INR for all three purity grades (24K, 22K, 18K) simultaneously.
4. WHEN the `MockGoldDataService` returns historical price data, THE `MockGoldDataService` SHALL return an array of `{ date: string; price: number }` objects covering the requested time range (1D, 1W, 1M, 3M, 1Y).
5. WHEN the `MockGoldDataService` returns city prices, THE `MockGoldDataService` SHALL return a price entry for each of the eight cities: Mumbai, Delhi, Chennai, Kochi, Hyderabad, Bangalore, Kolkata, and Pune.
6. THE Application SHALL instantiate the active data service as a singleton and inject it into React Query query functions, so that swapping the implementation requires changing only the instantiation site.

---

### Requirement 3 — Zustand UI State Store

**User Story:** As a developer, I want a centralised Zustand store for all UI state, so that components remain decoupled and state changes propagate predictably.

#### Acceptance Criteria

1. THE Zustand Store SHALL hold and expose setters for: the active Theme (`dark` | `light`), the active Time-Range Filter (`1D` | `1W` | `1M` | `3M` | `1Y`), the Price Calculator form state (weight in grams, purity selection), the City search query string, and the mobile menu open/closed boolean.
2. WHEN the Theme is toggled, THE Zustand Store SHALL update the Theme slice and THE Application SHALL delegate the actual DOM class update to next-themes.
3. THE Zustand Store SHALL initialise the Time-Range Filter to `1M` by default.
4. THE Zustand Store SHALL initialise the mobile menu to closed by default.

---

### Requirement 4 — Loader

**User Story:** As a visitor, I want a premium animated splash screen on first load, so that the site feels polished and branded before content appears.

#### Acceptance Criteria

1. WHEN the Application first mounts in a browser, THE Loader SHALL render a full-screen overlay with the `#050505` background color.
2. THE Loader SHALL display an animated gold logo or wordmark using Framer Motion.
3. WHEN the Loader animation completes (no longer than 2.5 seconds), THE Loader SHALL unmount and reveal the page content beneath.
4. THE Loader SHALL NOT be shown on subsequent client-side navigations within the same session.

---

### Requirement 5 — Navbar

**User Story:** As a visitor, I want a persistent navigation bar, so that I can jump to any section and toggle the colour theme from anywhere on the page.

#### Acceptance Criteria

1. THE Navbar SHALL be rendered as a fixed element at the top of the viewport with a glassmorphism background.
2. THE Navbar SHALL display anchor links to each major page section: Hero, Current Price, Live Chart, Calculator, City Prices, News, Market Insights, Investment Guide, Compare, FAQ.
3. WHEN a section anchor link is clicked, THE Application SHALL smooth-scroll to the target section.
4. THE Navbar SHALL include a theme toggle button that switches between dark and light mode.
5. WHEN the viewport width is below the tablet breakpoint, THE Navbar SHALL hide the anchor link list and display a hamburger menu icon instead.
6. WHEN the hamburger icon is clicked, THE Navbar SHALL open a full-width mobile menu drawer displaying all section links.
7. WHEN a mobile menu link is clicked, THE Navbar SHALL close the mobile menu drawer and smooth-scroll to the target section.
8. WHEN the page is scrolled more than 80px from the top, THE Navbar SHALL apply an increased backdrop-blur and reduce its background opacity to reinforce the glassmorphism effect.

---

### Requirement 6 — Hero Section

**User Story:** As a visitor, I want an impactful above-the-fold hero section, so that the purpose of the site is immediately clear and I am drawn into the content.

#### Acceptance Criteria

1. THE Hero Section SHALL display a primary headline, a sub-headline describing the India gold price tracking purpose, and a call-to-action button that scrolls to the Current Gold Price section.
2. THE Hero Section SHALL animate all headline and sub-headline elements into view using Framer Motion on initial load.
3. THE Hero Section SHALL display an ambient golden glow background effect using CSS radial gradients with the Primary Gold color.
4. WHEN viewed on a mobile viewport, THE Hero Section SHALL stack the headline and call-to-action vertically.
5. WHEN viewed on a desktop viewport, THE Hero Section SHALL use a two-column layout with text on the left and a decorative gold price ticker or visual on the right.

---

### Requirement 7 — Current Gold Price Section

**User Story:** As a visitor, I want to see the latest gold prices for all purity grades at a glance, so that I can quickly reference today's rates.

#### Acceptance Criteria

1. THE Current Gold Price Section SHALL display three Gold Price Cards, one for each purity grade: 24K, 22K, and 18K.
2. WHEN the Current Gold Price Section enters the viewport, THE Gold Price Card SHALL animate the price value using React CountUp from zero to the current price.
3. THE Gold Price Card SHALL display the price per gram in INR alongside the purity label and a percentage change indicator (positive or negative) relative to the previous day.
4. THE Gold Price Card SHALL use the Glassmorphism Card style with a Golden Glow border on hover.
5. WHEN the percentage change is positive, THE Gold Price Card SHALL render the change indicator in a green tone.
6. WHEN the percentage change is negative or zero, THE Gold Price Card SHALL render the change indicator in a red or neutral tone respectively.
7. THE Current Gold Price Section SHALL fetch price data via React Query with a `staleTime` of 60 000 ms.

---

### Requirement 8 — Live Chart Section

**User Story:** As a visitor, I want an interactive historical price chart, so that I can visualise gold price trends over different time periods.

#### Acceptance Criteria

1. THE Live Chart Section SHALL render a Recharts `LineChart` or `AreaChart` displaying the historical price series for the selected purity and time range.
2. THE Live Chart Section SHALL display a row of Time-Range Filter buttons: 1D, 1W, 1M, 3M, 1Y.
3. WHEN a Time-Range Filter button is clicked, THE Zustand Store SHALL update the active Time-Range Filter and THE Live Chart Section SHALL re-fetch and re-render the chart data for the new range.
4. THE Live Chart Section SHALL display a purity selector allowing the user to switch the chart between 24K, 22K, and 18K data series.
5. THE Live Chart Section SHALL style the chart line and gradient fill using the Primary Gold and Secondary Gold colors.
6. WHEN the user hovers over the chart, THE Live Chart Section SHALL display a custom Recharts tooltip showing the exact date and price in INR.
7. THE Live Chart Section SHALL apply smooth animated transitions when the data series changes using Recharts built-in animation props.
8. THE Live Chart Section SHALL be fully responsive, resizing fluidly across all viewport widths using a Recharts `ResponsiveContainer`.

---

### Requirement 9 — Price Calculator Section

**User Story:** As a visitor, I want a gold price calculator that accounts for GST, so that I can estimate the real cost of a gold purchase.

#### Acceptance Criteria

1. THE Price Calculator SHALL present an input field for weight in grams, a purity selector (24K / 22K / 18K), and a computed total price display.
2. WHEN the weight input or purity selector changes, THE Price Calculator SHALL update the Zustand Store calculator state and re-compute the total in real time.
3. THE Price Calculator SHALL compute the total as: `(weight × price-per-gram-for-selected-purity) × 1.03` to apply 3% GST.
4. THE Price Calculator SHALL display the GST amount as a separate line item alongside the base price and total price, all in INR.
5. THE Price Calculator SHALL display a breakdown showing base cost and GST amount so the visitor understands the composition of the total.
6. IF the weight input contains a non-numeric value or a value less than or equal to zero, THEN THE Price Calculator SHALL display an inline validation message and disable the result display.
7. THE Price Calculator component SHALL source the per-gram price from the same React Query cache used by the Current Gold Price Section, ensuring consistency.

---

### Requirement 10 — City Prices Section

**User Story:** As a visitor, I want to see gold prices for major Indian cities, so that I can find rates relevant to my location.

#### Acceptance Criteria

1. THE City Price Panel SHALL display gold price cards for all eight cities: Mumbai, Delhi, Chennai, Kochi, Hyderabad, Bangalore, Kolkata, and Pune.
2. THE City Price Panel SHALL include a search input that filters the displayed city cards by city name.
3. WHEN the city search query changes, THE Zustand Store SHALL update the City search query and THE City Price Panel SHALL filter the visible cards to only those whose city name contains the query string (case-insensitive).
4. WHEN the City search query is empty, THE City Price Panel SHALL display all eight city cards.
5. WHEN the City Price Panel section enters the viewport, THE City Price Panel SHALL animate each card into view sequentially using Framer Motion stagger.
6. THE City Price Panel SHALL display the 22K price per gram for each city as the primary figure, with a secondary label showing the city name.
7. THE City Price Panel SHALL fetch city price data via React Query with a `staleTime` of 300 000 ms.

---

### Requirement 11 — News Section

**User Story:** As a visitor, I want to read recent gold market news, so that I can stay informed about factors affecting gold prices.

#### Acceptance Criteria

1. THE News Section SHALL render a grid of at least six News Cards populated from the Mock Data Service.
2. THE News Card SHALL display: a headline, a short summary (maximum 200 characters), a source label, and a publication date.
3. THE News Card SHALL use the Glassmorphism Card style and animate into view using React Intersection Observer and Framer Motion.
4. WHEN a News Card is clicked or activated via keyboard, THE Application SHALL open a Shadcn UI dialog displaying the full article summary.
5. THE News Section SHALL display cards in a responsive grid: one column on mobile, two columns on tablet, three columns on desktop.

---

### Requirement 12 — Market Insights Section

**User Story:** As a visitor, I want to see key market indicators and trend commentary, so that I can quickly interpret the current gold market environment.

#### Acceptance Criteria

1. THE Market Insights Section SHALL display at least four insight tiles covering: 24K spot price trend, INR/USD exchange rate impact note, global demand indicator, and a seasonal trend note.
2. THE Market Insights Section SHALL render a percentage change badge on each tile indicating direction (up/down) with appropriate color coding.
3. WHEN the Market Insights Section enters the viewport, THE Market Insights Section SHALL animate tiles into view using Framer Motion with a stagger delay of 100 ms per tile.
4. THE Market Insights Section data SHALL be sourced from the Mock Data Service via the `GoldDataService` interface.

---

### Requirement 13 — Investment Guide Section

**User Story:** As a visitor, I want an educational guide about gold investment in India, so that I can make informed decisions about buying gold.

#### Acceptance Criteria

1. THE Investment Guide Section SHALL contain at least four topic cards covering: understanding gold purity grades, physical gold vs. digital gold, GST and making charges explained, and best practices for buying gold in India.
2. THE Investment Guide Section SHALL present each topic card with an icon (from Lucide Icons), a title, and a concise explanation of no more than 120 words.
3. THE Investment Guide Section SHALL use a responsive grid: one column on mobile, two columns on tablet, two or three columns on desktop.
4. THE Investment Guide Section SHALL animate cards into view using React Intersection Observer and Framer Motion.

---

### Requirement 14 — Compare Section

**User Story:** As a visitor, I want to compare gold prices across purity grades side-by-side, so that I can understand the price difference between grades.

#### Acceptance Criteria

1. THE Compare Section SHALL display a side-by-side comparison table or card grid showing the current price per gram for 24K, 22K, and 18K.
2. THE Compare Section SHALL show the price differential between 24K and 22K, and between 24K and 18K, expressed in INR and as a percentage.
3. THE Compare Section SHALL include an interactive weight slider (range 1–100 grams) that updates all three purity cost estimates in real time as the slider is moved.
4. THE Compare Section SHALL source price data from the same React Query cache as the Current Gold Price Section.
5. WHEN the Compare Section enters the viewport, THE Compare Section SHALL animate into view using Framer Motion.

---

### Requirement 15 — FAQ Section

**User Story:** As a visitor, I want answers to common gold-related questions, so that I can resolve doubts without leaving the site.

#### Acceptance Criteria

1. THE FAQ Section SHALL render at least eight question-answer pairs using a Shadcn UI Accordion component.
2. THE FAQ Section questions SHALL cover topics including: GST on gold, hallmarking, 22K vs 24K, best time to buy gold, storing gold safely, digital gold options, making charges, and BIS certification.
3. WHEN an accordion item is expanded, THE FAQ Section SHALL animate the answer panel open using Framer Motion or the built-in Shadcn UI animation.
4. WHEN an accordion item is expanded, THE FAQ Section SHALL collapse all other items (single-open mode).
5. THE FAQ Section SHALL be fully keyboard-navigable per WCAG 2.1 AA accordion interaction patterns.

---

### Requirement 16 — Footer

**User Story:** As a visitor, I want a well-structured footer, so that I can find supplementary links, a data disclaimer, and copyright information.

#### Acceptance Criteria

1. THE Footer SHALL display a disclaimer stating that all prices are simulated and for informational purposes only.
2. THE Footer SHALL display a copyright notice with the current year.
3. THE Footer SHALL include navigation links grouped into logical categories (e.g., Tools, Learn, About).
4. THE Footer SHALL display social media icon links using Lucide Icons.
5. WHEN viewed on a mobile viewport, THE Footer SHALL stack link groups vertically.
6. WHEN viewed on a desktop viewport, THE Footer SHALL arrange link groups in a multi-column horizontal layout.

---

### Requirement 17 — Responsiveness & Breakpoints

**User Story:** As a visitor using any device, I want the Application to render correctly and be fully usable, so that I have a consistent premium experience regardless of screen size.

#### Acceptance Criteria

1. THE Application SHALL define and apply five responsive breakpoint tiers: mobile (< 640px), tablet (640px–1023px), laptop (1024px–1279px), desktop (1280px–1535px), and ultra-wide (≥ 1536px).
2. WHEN rendered on a mobile viewport, THE Application SHALL use single-column layouts for all grid sections and ensure touch targets are at least 44×44 CSS pixels.
3. WHEN rendered on a tablet viewport, THE Application SHALL use two-column grid layouts for card sections.
4. WHEN rendered on a laptop or desktop viewport, THE Application SHALL use three or more column grid layouts for card sections and a horizontal Navbar link list.
5. WHEN rendered on an ultra-wide viewport, THE Application SHALL constrain the main content container to a maximum width of 1536px and center it horizontally.
6. THE Application SHALL use TailwindCSS v4 responsive prefix utilities to implement all breakpoint-specific layout rules.

---

### Requirement 18 — Dark / Light Theme

**User Story:** As a visitor, I want to toggle between dark and light themes, so that I can view the site comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Application SHALL default to dark theme (`#050505` background) on first load.
2. WHEN the theme toggle is activated, THE Application SHALL switch the active theme between dark and light and persist the selection to `localStorage` via next-themes.
3. WHEN in dark theme, THE Application SHALL use `#050505` as the primary background and white or light-grey as the primary text color.
4. WHEN in light theme, THE Application SHALL use a white or off-white primary background and dark-grey as the primary text color.
5. WHEN in either theme, THE Application SHALL preserve the Primary Gold (#D4AF37) and Secondary Gold (#F7C948) accent colors.
6. THE Application SHALL apply theme switching without a flash-of-unstyled-content by using the next-themes `suppressHydrationWarning` attribute on the `<html>` element.

---

### Requirement 19 — Performance & Accessibility

**User Story:** As a visitor, I want the Application to load quickly and be accessible, so that I have a smooth experience regardless of connection speed or assistive technology.

#### Acceptance Criteria

1. THE Application SHALL use Next.js Image component for all raster images to enable automatic optimisation, lazy loading, and correct `width`/`height` attributes.
2. THE Application SHALL server-render all above-the-fold sections using Next.js Server Components and hydrate interactive sections (Chart, Calculator, City Panel) as Client Components.
3. THE Application SHALL provide descriptive `aria-label` attributes on all icon-only buttons (theme toggle, hamburger menu, close menu).
4. THE Application SHALL ensure all interactive elements are reachable and operable via keyboard navigation.
5. THE Application SHALL provide visible focus indicators on all focusable elements.
6. IF a React Query fetch fails, THEN THE Application SHALL display a non-blocking error state within the affected section rather than crashing the page.
7. THE Application SHALL achieve a Lighthouse performance score of at least 80 on desktop in production mode (measured locally).

---

### Requirement 20 — Animation & Visual Design System

**User Story:** As a visitor, I want consistent, premium animations and visual polish throughout, so that the site conveys a luxury brand identity.

#### Acceptance Criteria

1. THE Application SHALL apply Glassmorphism Card styles — `background: rgba(255,255,255,0.05)`, `backdrop-filter: blur(12px)`, and a `1px solid rgba(212,175,55,0.2)` border — to all card components.
2. THE Application SHALL apply a Golden Glow shadow (`box-shadow: 0 0 24px rgba(212,175,55,0.3)`) to Gold Price Cards and Compare Section tiles on hover.
3. THE Application SHALL use Framer Motion `viewport` prop to trigger entrance animations only when elements scroll into view, preventing off-screen animation on load.
4. THE Application SHALL limit the number of simultaneously animating elements to avoid layout thrashing; stagger delays SHALL NOT exceed 600 ms total for any group.
5. THE Application SHALL respect the `prefers-reduced-motion` media query by disabling non-essential animations when the visitor has enabled reduced motion in their OS settings.
6. THE Application SHALL use consistent animation easing (`easeOut`) and duration (200–400 ms) for all Framer Motion transitions.
