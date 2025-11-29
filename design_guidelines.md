# Design Guidelines: Jaipur Helper Marketplace Platform

## Design Approach
**Reference-Based:** Drawing inspiration from trusted marketplace platforms like Upwork (profile cards), Airbnb (search filters, trust signals), and LinkedIn (professional credibility), adapted for the Indian local services market with emphasis on accessibility and trust-building.

## Core Design Principles
1. **Trust First:** Verification badges, clear profile information, and professional presentation
2. **Accessible Hierarchy:** Clear visual distinction between different user roles and content importance
3. **Local Context:** Design considerations for Hindi-speaking users and mobile-first usage

## Typography System
- **Primary Font:** Inter (Google Fonts) - clean, readable, professional
- **Secondary Font:** Noto Sans Devanagari (Google Fonts) - for Hindi text
- **Hierarchy:**
  - Hero Headlines: 3xl to 5xl, font-bold
  - Section Headers: 2xl to 3xl, font-semibold
  - Card Titles: lg to xl, font-medium
  - Body Text: base, font-normal
  - Captions/Meta: sm, font-normal

## Layout System
**Spacing Units:** Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Container: max-w-7xl with px-4 md:px-6 lg:px-8
- Section Padding: py-12 md:py-16 lg:py-20
- Card Padding: p-4 md:p-6
- Element Spacing: gap-4 for cards, gap-6 for sections

## Component Library

### Navigation
**Main Header:** Sticky navigation with logo (left), search bar (center on desktop), CTA buttons (right), mobile hamburger menu
- Include: Login/Signup, Post Job, Language toggle (EN/HI), Subscription badge for logged-in users
- Search bar: Prominent with category dropdown + area dropdown + search button

### Hero Section (Home Page)
**Full-width hero** with background image showing diverse Jaipur workers (construction, domestic help, drivers) with slight overlay
- Centered headline: "Find Trusted Helpers in Jaipur" with supporting tagline
- Dual search cards: "I'm Looking for Help" and "I Want to Offer Services"
- Trust indicators below: "10,000+ Verified Workers" | "500+ Happy Employers" | "Police Verified Options"

### Worker Profile Cards
**Grid layout:** 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
- Card structure:
  - Worker photo (square, rounded corners)
  - Verification badges (top-right overlay on photo)
  - Name + Job category
  - Experience + Rating stars
  - Key skills (max 3 tags)
  - Salary expectation
  - Area with map pin icon
  - CTA: "View Contact" (lock icon for non-subscribers)
- Hover state: Subtle lift with shadow increase

### Search & Filter Panel
**Left sidebar (desktop) / Collapsible drawer (mobile)**
- Category checkboxes with icons (Maid, Driver, Carpenter, etc.)
- Area multi-select dropdown
- Salary range slider
- Experience filter
- Gender filter
- Work type (Full-time/Part-time/Contract)
- "Apply Filters" button (sticky at bottom)

### Subscription Plan Cards
**Centered 4-column grid** (stacks on mobile)
- Card hierarchy: Free (subtle), Basic, Premium (highlighted with border), Business
- Each card: Plan name, price (large), feature list with checkmarks, CTA button
- Premium plan: Add "Most Popular" badge at top

### Job Posting Form
**Clean, stepped form** with progress indicator
- Step 1: Category + Job Title
- Step 2: Location + Salary Range
- Step 3: Description + Requirements
- Step 4: Review + Post
- Right sidebar: Preview card of how job will appear

### Dashboard Layouts
**Role-specific dashboards** with side navigation
- **Client Dashboard:** Saved workers, active subscriptions, job posts, contact history
- **Agent Dashboard:** Worker profile queue, KYC upload interface, area assignments, performance metrics
- **Admin Dashboard:** Stats cards (total workers, subscriptions, revenue), approval queue, agent management table

### Verification Badge System
Visual badges as small chips/icons:
- ✓ Basic Verified (green checkmark)
- 🛡️ Police Verified (shield icon)
- ⭐ Premium Profile (star icon)
Display on worker cards (top-right) and profile pages (near name)

### Footer
**Multi-column footer** with dark background
- Column 1: Logo + tagline + social links
- Column 2: Quick Links (Categories, Areas, Pricing)
- Column 3: For Workers (Become Helper, Verification)
- Column 4: Support (Contact, FAQs, Terms)
- Bottom bar: Copyright + Language selector

## Area Landing Pages (SEO)
**Template structure** for "X in Y" pages (e.g., "Factory Helpers in Sitapura")
- Hero banner: Area-specific image with category overlay
- Breadcrumb navigation
- Worker grid (filtered by area + category)
- Area information sidebar: Map, popular categories in this area
- FAQ section specific to that area/category combination

## Icons
Use **Heroicons** (outline for regular UI, solid for emphasis) via CDN

## Images
**Hero Section:** Large background image (1920x800px) showing diverse Jaipur workers in professional setting with slight dark overlay (30% opacity) for text readability

**Worker Profile Photos:** Square placeholders (400x400px) with professional framing guidelines for agents

**Category Icons:** Use icon library for category representations alongside worker photos

**Area Pages:** Jaipur landmark photos relevant to each area (1200x400px hero banners)

**Trust Signals:** Consider small illustrative icons for verification badges and feature highlights

## Responsive Behavior
- **Desktop (1280px+):** Full multi-column layouts, side filters, 3-column worker grids
- **Tablet (768-1279px):** 2-column grids, collapsible filters, optimized spacing
- **Mobile (<768px):** Single column, bottom sheet filters, sticky search/CTA buttons, tap-friendly 48px minimum touch targets

## Key Interactions
- **Contact Reveal:** Blur contact details with lock icon overlay for non-subscribers, modal popup on click prompting subscription
- **Filter Application:** Instant results update with loading skeleton states
- **Subscription Purchase:** Modal flow with plan comparison, Stripe integration
- **Worker Profile View:** Slide-in panel (desktop) or full page (mobile) with complete details, gallery, and verification documents

**Animation Philosophy:** Minimal, purposeful - use for state transitions (loading, success states) and subtle hover effects only. No distracting scroll animations.