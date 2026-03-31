# Card Keeper - Credit Card Benefits Tracker

## Product Requirements Document

---

## 1. Project Overview

**Card Keeper** is a personal credit card benefits management tool, designed to help track, remind, and optimize the use of multiple premium credit cards across US and China markets.

### Core Problem
Holding 8+ premium credit cards means $3,000+/year in annual fees. Many benefits (monthly dining credits, quarterly airline credits, semi-annual resort credits, free night certificates) go unused simply because they're forgotten. Currently no single tool handles both US and Chinese cards with proactive reminders and benefit change monitoring.

### Target User
Leo - manages 8 credit cards across 2 countries, needs a personal dashboard accessible from phone and desktop.

---

## 2. Card Portfolio

### US Cards (5 cards)

| Card | Issuer | Annual Fee | Key Recurring Benefits |
|------|--------|-----------|----------------------|
| Amex Hilton Aspire | Amex | $550 | $200 resort credit (semi-annual), $50 airline credit (quarterly), $209 CLEAR (annual), Free night (anniversary + $30K/$60K spend) |
| Amex Hilton Aspire #2 | Amex | $550 | Same as above (separate card) |
| Amex Hilton Surpass | Amex | $150 | $50 Hilton credit (quarterly), Free night at $15K spend |
| Amex Marriott Brilliant | Amex | $650 | $25 dining credit (monthly), $100 Ritz/St.Regis per stay, Priority Pass, Free night (anniversary, up to 85K pts) |
| Chase Sapphire Preferred | Chase | $95 | $50 hotel credit (anniversary), DashPass + $10/mo DoorDash, 10% anniversary points bonus |
| Chase IHG Premier | Chase | $99 | Free night (anniversary, 40K pts), $25 United TravelBank (semi-annual), cell phone protection, Global Entry credit |

### China Cards (3 cards)

| Card | Issuer | Annual Fee | Key Recurring Benefits |
|------|--------|-----------|----------------------|
| ABC Mastercard Platinum (unnaturally white) | Agricultural Bank | 880 RMB | Airport lounge 6x/year, 3x specialist appointment, 1x health checkup, flight delay insurance (claim monthly) |
| CITIC Air China World Card | CITIC Bank | 20,000 RMB (waived w/ CA Gold) | 8 Lounge Pass points/year, 36+1 lifestyle points (monthly spend targets), 5x medical appointments, PEK parking 36x/year |
| CGB Air China Platinum | CGB | 800 RMB | Unlimited lounge access, 3x specialist + 3x guide, birthday 2x miles, 80K points offset 400 RMB fee |

---

## 3. Feature Requirements

### 3.1 Benefits Dashboard (P0)

**Card Overview Page**
- Card grid/list view with card images, names, annual fees
- Status badges: benefits utilization rate (e.g., "67% used this quarter")
- Quick filter by issuer, country, benefit type

**Benefit Detail View**
- Per-card breakdown of all benefits with:
  - Benefit name, description, value
  - Reset cycle: monthly / quarterly / semi-annual / annual / per-event
  - Current period progress (used/total)
  - Next reset date with countdown
  - Usage history log

**Visual Indicators**
- Progress bars for each benefit (green/yellow/red by utilization)
- Calendar heat map showing benefit usage over time
- Total value tracker: "You've captured $X of $Y possible value this year"

### 3.2 Benefits Usage Tracking (P0)

**Mark as Used**
- One-tap "Mark Used" button per benefit
- Optional fields: date, amount, notes, receipt photo
- Support partial usage (e.g., used $15 of $25 monthly dining credit)

**Usage History**
- Timeline of all benefit usage events
- Filter by card, benefit type, date range
- Export capability (CSV)

### 3.3 Smart Reminders (P0)

**Reminder Engine**
- Auto-generate reminders based on benefit reset cycles:
  - Monthly benefits: remind on the 1st and 20th of each month
  - Quarterly benefits: remind at start and 2 weeks before end of quarter
  - Semi-annual benefits: remind at start and 1 month before end of period
  - Annual/anniversary benefits: remind 2 months, 1 month, 2 weeks before expiration
  - Free night certificates: remind 3 months, 1 month before expiration

**Reminder Channels**
- Email notifications (primary)
- Push notifications via PWA (secondary)
- In-app notification center

**Reminder Customization**
- Snooze / dismiss individual reminders
- Custom reminder schedules per benefit
- "Quiet hours" setting

### 3.4 Card Opening Tasks & Spending Trackers (P1)

**Minimum Spend Tracker**
- Track progress toward sign-up bonus minimum spend
- Fields: target amount, deadline, current spend, daily spend needed
- Countdown timer and progress bar

**Task Checklist per Card**
- Custom checklist items (e.g., "Enroll in CLEAR", "Activate DashPass", "Link United MileagePlus")
- Due dates and completion status
- Card-specific onboarding templates

### 3.5 Travel Insurance Comparison (P1)

**Insurance Matrix**
- Side-by-side comparison table of all cards' insurance benefits:
  - Trip delay (threshold hours, max amount)
  - Trip cancellation/interruption
  - Rental car insurance (primary vs secondary)
  - Lost/delayed baggage
  - Cell phone protection
  - Emergency evacuation
  - Flight accident

**Decision Helper**
- "Which card should I book flights with?" recommendation engine
- Input: trip details -> Output: best card for insurance coverage
- Special scenarios: phone bill payment, rental car booking

### 3.6 Phone Bill Payment Optimizer (P1)

**Dedicated View**
- Compare cell phone protection across cards:
  - IHG Premier: $800/claim, $50 deductible
  - (Future: Amex Platinum if added)
- Recommendation for which card to pay US phone bill with
- Track if phone bill is being paid with the right card

### 3.7 Benefits Change Monitoring (P2)

**Automated Monitoring**
- Periodic web search for each card's benefit changes
- Sources to check:
  - Official card issuer pages (amex.com, chase.com, bank sites)
  - Travel blog aggregation (TPG, NerdWallet, One Mile at a Time, Doctor of Credit)
  - Reddit communities (r/CreditCards, r/awardtravel)
  - Chinese forums (flyertea.com, smzdm.com)
- Frequency: weekly automated check + manual trigger button

**Change Detection**
- Compare current benefits against stored baseline
- Flag additions, removals, and modifications
- Severity levels: Critical (benefit removed/devalued), Info (new perk added), Minor (terms updated)

**Notification**
- Email digest of detected changes
- In-app alert banner for critical changes
- Link to source article/page

### 3.8 Notes & Annotations (P1)

- Free-text notes on any card or benefit
- Tags and categories
- "Tips & Tricks" section per card (e.g., "Aspire resort credit works at Hilton pool bar")

---

## 4. Non-Functional Requirements

### Authentication
- Simple password protection (no user accounts)
- Single password to access the app
- Remember device for 30 days
- Optional: PIN code for quick access on mobile

### Performance
- PWA (Progressive Web App) for mobile-like experience
- Offline capability for viewing cards and benefits (read-only)
- Fast load time (<2s initial, <500ms navigation)

### Data Storage
- Vercel KV (Redis) or Vercel Postgres for persistent data
- All data belongs to a single user (no multi-tenancy)
- Export/import capability (JSON backup)

### Deployment
- Vercel hosting (free tier friendly)
- GitHub repository
- Automatic deployments from main branch

---

## 5. Technical Architecture

### Tech Stack

```
Frontend:  Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
Backend:   Next.js API Routes (serverless functions)
Database:  Vercel Postgres (or SQLite via Turso for cost efficiency)
Auth:      Simple password middleware (bcrypt hash comparison)
Email:     Resend (free tier: 3,000 emails/month)
Cron:      Vercel Cron Jobs (free tier: 1 per day; or Upstash QStash)
Monitoring: Server-side web fetch + Brave Search API for change detection
PWA:       next-pwa for installable mobile experience
```

### Data Model (Core Entities)

```
Card
  - id, name, issuer, network, country, annual_fee, currency
  - image_url, color_theme
  - open_date, anniversary_date
  - status (active/closed)
  - notes

Benefit
  - id, card_id, name, description, category
  - value, currency
  - cycle_type (monthly/quarterly/semi_annual/annual/one_time/per_event)
  - cycle_start_reference (calendar_year / card_anniversary / custom_date)
  - max_uses_per_cycle (nullable, for count-based benefits)
  - max_value_per_cycle (nullable, for dollar-based benefits)
  - activation_required (boolean)
  - activation_instructions
  - external_url (link to benefit details page)
  - metadata (JSON - card-specific fields)

BenefitUsage
  - id, benefit_id, used_date, amount, notes
  - receipt_url (optional)

SpendingTracker
  - id, card_id, name (e.g., "Sign-up Bonus")
  - target_amount, current_amount, deadline
  - status (in_progress/completed/failed)

TaskItem
  - id, card_id, title, description
  - due_date, completed_at
  - category (onboarding/recurring/one_time)

Reminder
  - id, benefit_id, remind_at, type (email/push/in_app)
  - status (pending/sent/dismissed/snoozed)
  - snooze_until

InsuranceProfile
  - id, card_id, insurance_type, coverage_amount
  - deductible, threshold_hours, is_primary
  - notes, terms_url

ChangeLog
  - id, card_id, detected_at, source_url
  - change_type (addition/removal/modification)
  - severity (critical/info/minor)
  - title, description, previous_value, new_value
  - acknowledged (boolean)
```

### Page Structure

```
/                     -> Dashboard (overview of all cards + upcoming deadlines)
/cards                -> Card list/grid
/cards/[id]           -> Card detail (benefits, usage, tasks, notes)
/cards/[id]/benefit/[bid] -> Benefit detail + usage history
/reminders            -> Reminder center (upcoming + history)
/insurance            -> Insurance comparison matrix
/changes              -> Benefits change log
/spending             -> Spending trackers (sign-up bonuses)
/settings             -> Password, email, notification preferences
/api/cron/remind      -> Cron endpoint for sending reminders
/api/cron/monitor     -> Cron endpoint for benefits change detection
/api/monitor/trigger  -> Manual trigger for change detection
```

### Cron Jobs

| Job | Frequency | Purpose |
|-----|-----------|---------|
| Daily Reminder Check | Every day at 9am | Check for benefits expiring soon, send reminders |
| Weekly Change Monitor | Every Monday | Search web for card benefit changes, update changelog |

### Benefits Change Detection Flow

```
1. For each card, construct search queries:
   - "[Card Name] benefits changes 2026"
   - "[Card Name] devaluation news"
   - "[Card Name] new perks announcement"

2. Use Brave Search API to find recent articles/discussions

3. Fetch key pages (official card pages) and compare against stored baseline:
   - Extract key benefit values (credit amounts, point multipliers, etc.)
   - Diff against previous snapshot

4. If changes detected:
   - Create ChangeLog entry
   - Send email notification
   - Update in-app alert

5. Store page snapshot for next comparison
```

---

## 6. Pre-populated Card Data

The app will ship with all 8 cards pre-configured with their current benefits data based on research (see Appendix). Users can edit/customize but shouldn't need to enter data from scratch.

### Benefit Categories
- `credit` - Statement credits (dining, airline, resort, etc.)
- `free_night` - Hotel free night certificates
- `status` - Elite status benefits
- `lounge` - Airport lounge access
- `insurance` - Travel/purchase insurance
- `points` - Points/miles earning bonuses
- `lifestyle` - Health, fitness, entertainment perks
- `travel` - Travel convenience (Global Entry, rental car, etc.)

---

## 7. Internationalization

- UI language: Chinese (primary), with English card names preserved
- Currency: Support both USD and CNY display
- Date format: YYYY-MM-DD
- Timezone: Support US Eastern/Pacific and China Standard Time

---

## 8. Development Phases

### Phase 1 - Core MVP (Week 1-2)
- [ ] Project setup (Next.js + Vercel + DB)
- [ ] Password authentication
- [ ] Card management (CRUD + pre-populated data)
- [ ] Benefit tracking with usage marking
- [ ] Basic dashboard with progress indicators
- [ ] Mobile-responsive design

### Phase 2 - Reminders & Tracking (Week 3)
- [ ] Reminder engine + Vercel cron
- [ ] Email notifications via Resend
- [ ] Spending trackers for sign-up bonuses
- [ ] Task checklists per card

### Phase 3 - Intelligence (Week 4)
- [ ] Insurance comparison matrix
- [ ] Phone bill payment optimizer
- [ ] "Which card to use" decision helper
- [ ] Benefits change monitoring (Brave Search + web scraping)
- [ ] Change notification system

### Phase 4 - Polish (Week 5)
- [ ] PWA setup for mobile installation
- [ ] Data export/import
- [ ] Calendar heat map visualization
- [ ] Notes and tips system
- [ ] Performance optimization

---

## Appendix A: Pre-populated Benefits Data Summary

### Amex Hilton Aspire ($550/yr)
- Hilton Diamond Status (automatic)
- $200 Hilton Resort Credit (semi-annual: Jan-Jun, Jul-Dec)
- $50 Airline Credit (quarterly)
- $209 CLEAR+ Credit (annual)
- $100 Waldorf Astoria/Conrad Property Credit (per stay, 2-night min)
- Free Night Certificate (anniversary, uncapped)
- Additional Free Night at $30K and $60K annual spend
- 14x Hilton at Hilton, 7x flights/dining/grocery/gas, 3x everything else

### Amex Hilton Surpass ($150/yr)
- Hilton Gold Status (Diamond at $40K spend)
- $50 Hilton Property Credit (quarterly)
- Free Night at $15K annual spend (uncapped)
- 12x at Hilton, 6x dining/grocery/gas, 4x online retail, 3x everything else

### Amex Marriott Brilliant ($650/yr)
- Marriott Platinum Elite + 25 Elite Night Credits
- $25 Dining Credit (monthly, worldwide restaurants)
- $100 Ritz-Carlton/St.Regis Property Credit (per stay, 2-night min)
- Priority Pass Select (cardholder + 2 guests)
- Free Night Certificate (anniversary, up to 85K pts, top-up +25K)
- Global Entry/TSA PreCheck Credit ($120/4 years)
- Trip Delay: $500/trip after 6-hour delay
- 6x Marriott, 3x dining/flights, 2x everything else

### Chase Sapphire Preferred ($95/yr)
- $50 Hotel Credit via Chase Travel (anniversary)
- DashPass + $10/mo DoorDash credit (through 12/2027)
- 10% Anniversary Points Bonus
- 5x Lyft (through 9/2027), 5x Chase Travel, 3x dining/grocery/streaming
- Primary Rental Car Insurance ($60K)
- Trip Delay: $500/ticket after 12-hour delay
- Trip Cancellation: $10K/person, $20K/trip
- NO cell phone protection

### Chase IHG Premier ($99/yr)
- IHG Platinum Elite (Diamond at $40K spend)
- Free Night Certificate (anniversary, 40K pts, toppable)
- $25 United TravelBank (semi-annual: Jan, Jul)
- 4th Night Free on IHG award stays
- Global Entry/TSA PreCheck Credit ($120/4 years)
- Cell Phone Protection ($800/claim, $50 deductible)
- 10x IHG (up to 26x total), 5x travel/gas/dining, 3x everything else
- Bonus Free Night at $60K annual spend

### ABC Mastercard Platinum (880 RMB/yr)
- Airport Lounge: 6x/year (2026 change, was unlimited)
- Airport Transfer: 100K points per trip, 12x/year max
- Flight Delay Insurance: 2hr delay = 300 RMB, monthly claim, must activate in app
- Specialist Appointment: 3x/year + full escort service
- Annual Health Checkup: 1x/year
- 24/7 Roadside Assistance (unlimited)
- Points: 25:1 mile conversion, 5x on mobile pay (new card, 2 months)
- Mastercard World privileges (quarterly promotions)

### CITIC Air China World Card (20,000 RMB/yr, waived)
- Air China Phoenix Gold Status benefits (own lounge access)
- Dragon Pass Lounge: 8 points/year
- 36+1 Lifestyle Points (monthly: 2/4/6 points at 2K/4K/6K spend)
- Medical Appointments: 5 points/year
- PEK Airport Parking: 48hr free, 36x/year
- Flight Delay Insurance: 2hr = 1000 RMB, 4hr = 2000 RMB
- Miles: 8 RMB = 1 mile (2000 miles/month online cap)
- Hertz rental discount, no FX fee

### CGB Air China Platinum (800 RMB/yr)
- Unlimited CGB + Dragon Pass Lounge Access (no guests)
- Unlimited High-speed Rail Lounge
- Specialist Appointment: 3x/year
- Medical Guide Service: 3x/year
- Birthday Month: 2x miles
- Miles: 10 RMB = 1 mile (direct accumulation)
- Roadside Assistance + designated driver
- Fee offset: 80K points = 400 RMB off annual fee
- CGB restaurant benefit: requires 3000 RMB/month prior spend

---

## Appendix B: Insurance Comparison Matrix

| Insurance Type | Aspire | Brilliant | CSP | IHG Premier | ABC Plat | CITIC World | CGB Plat |
|---------------|--------|-----------|-----|-------------|----------|-------------|----------|
| Trip Delay | $500 (6hr) | $500 (6hr) | $500 (12hr) | None | 300 RMB (2hr) | 1000/2000 RMB | N/A |
| Trip Cancel | $10K/$20K | $10K/$20K | $10K/$20K | $5K/$10K | N/A | N/A | N/A |
| Rental Car | Secondary | Secondary $75K | Primary $60K | Secondary | N/A | N/A | N/A |
| Cell Phone | None | None | None | $800/$50ded | N/A | N/A | N/A |
| Lost Baggage | $3,000 | $3,000 | $3,000 | $3,000 | N/A | N/A | N/A |
| Flight Accident | N/A | N/A | $500K | N/A | 1000万 RMB | Included | Included |
| Emergency Evac | Uncapped | Uncapped | $100K | N/A | N/A | N/A | N/A |

**Phone Bill Recommendation:** Pay US phone bill with **Chase IHG Premier** ($800/claim, $50 deductible cell phone protection).

**Flight Booking Recommendation:**
- Domestic US flights: **Chase CSP** (primary rental car + $500 delay after 12hr)
- International flights: **Amex Brilliant** or **Aspire** ($500 delay after 6hr + uncapped emergency evacuation)
- China domestic flights: **CITIC World Card** (best delay coverage: 1000-2000 RMB)
