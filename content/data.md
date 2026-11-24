# Genesis Hacks · structured content and facts

Extracted 5 November 2026 from the source of truth in code. Every number and fact on the site comes from these files, so a redesign should read from here, not from old page copy.

| Source file | What it holds |
|---|---|
| `frontend/src/shared/config/site.js` | brand, contact, stats, Delhi, Pune, proof events, sponsor outcomes, partner steps |
| `frontend/src/shared/data/events.js` | the event archive (every row, with role) |
| `frontend/src/shared/data/puneEventScheduleData.js` | Hackers Occupied Pune schedule and facts |
| `frontend/src/shared/data/teamMembers.js` | core team |
| `frontend/src/shared/data/mediaAssets.js` | event photos with captions and alt text |
| `frontend/src/widgets/layout/navMegaData.js` | header mega-menus |
| `frontend/src/features/story/content.js` | the current home page ("Zero Hour") copy |
| `frontend/src/shared/config/routes.json` | per-page title, meta description, H1 |

## 1. Brand and positioning

- **Name:** Genesis Hacks (short: Genesis)
- **Tagline (site.js):** Reach India's student builders at hackathons.
- **Description (used everywhere):** Genesis connects companies with India's student hackathon and builder community. We curate brand partnerships with independent hackathons and run our own series, Hackers Occupied.
- **Short description:** Hackathon partnerships in India. We connect companies with student builders at independent hackathons and our own series, Hackers Occupied.
- **Own series:** Hackers Occupied
- **Site URL:** https://www.genesishacks.com
- **Brand idea (brief, Nov 2026):** three concepts — **unorthodox, daring, fast**. Pan-India community organising hackathons, speaker sessions and builder events; aim: the biggest community for technical events in India. Audiences: builders/coders/developers, sponsors, organisers.
- **Rally lines in use on the current home page:** Everything starts at hour zero. · 36 hours. Not 36 weeks. · Nobody remembers the polite hackathons. · Know the hour you meet them. · One partner. Every hackathon worth being at. · Your genesis is a weekend away.
- **Brand strategy doc:** `docs/brand/GENESIS_BRAND_STRATEGY.md` (competitor analysis, positioning "Trusted Access Network", colour and logo recommendations).

## 2. Contact and social

- **Email:** partner@genesishacks.com
- **Phone:** +91 70433 88006 (`tel:+917043388006`)
- **Reply promise:** within 2 business days
- **Instagram:** https://www.instagram.com/genesishacks/
- **LinkedIn:** https://www.linkedin.com/company/genesishacks/

## 3. Headline numbers

| Stat | Value | Note |
|---|---|---|
| Events | 140+ | NEEDS_CONFIRMATION: how 140+ is counted |
| Attendees | 21,699 | across Genesis and partner events |
| Women | 7,664 (35%) | — |
| Men | 14,035 | — |
| Cities (from archive) | 14 | Bengaluru, Chennai, Ghaziabad, Goa, Greater Noida, Gurugram, Jaipur, Lucknow, Mohali, Mumbai, New Delhi, Noida, Pune, Ranchi |
| Events in the public archive | 49 | 47 dated |
| Archive categories | 5 | Bootcamp, Hackathon, Ideathon, Meetup, Workshop |
| Archive years | 3 | 2026, 2025, 2024 |

## 4. Hackers Occupied (own series)

### Delhi 2027 (next)

| Field | Value |
|---|---|
| Name | Hackers Occupied Delhi 2027 |
| Page | /events/hackers-occupied-delhi |
| When | Mid-January 2027 (tentative) |
| Start date (placeholder) | 2027-01-15 |
| Where | Delhi NCR |
| Venue | Venue to be announced |
| Tracks | AI, Web3, FinTech, Agro, Healthcare, CyberSecurity |
| Teams | 100 teams of 3 to 5 |
| Registrations | 4,000+ (projection, never a result) |

NEEDS_CONFIRMATION: dates, venue, final track briefs.

### Pune 2026 (done)

| Field | Value |
|---|---|
| Name | Hackers Occupied Pune |
| Page | /events/hackers-occupied-pune |
| When | 22–23 August 2026 |
| Where | Vishwakarma Institute of Technology (VIT), Pune |
| Certificates | /certificates/hackers-occupied-pune |

#### Pune event details

| Field | Value |
|---|---|
| title | Hackers Occupied Pune |
| location | Vishwakarma Institute of Technology (VIT), Pune |
| venueShort | VIT Pune |
| format | On-site hackathon |
| startDate | 2026-08-22T11:00:00+05:30 |
| endDate | 2026-08-23T15:00:00+05:30 |
| hackingStart | 2026-08-22T15:00:00+05:30 |
| submissionDeadline | 2026-08-23T10:00:00+05:30 |
| tracks | ["Agentic AI", "Web3 and blockchain"] |
| prizePool | ₹1,50,000+ |
| listingUrl | https://hackculture.io/hackathons/hackers-occupied-pune |

#### Pune facts

| Fact | Value |
|---|---|
| activityCount | 45 |
| mentoringRounds | 3 |
| logitechActivities | 3 |
| hackingHours | 19 |
| eventHours | 28 |
| days | 2 |

#### Pune activity categories

| Key | Value |
|---|---|
| Participant Flow | {"label": "Participant Flow", "color": "#38bdf8", "bg": "rgba(56, 189, 248, 0.12)", "border": "rgba(56, 189, 248, 0.3)"} |
| Opening Ceremony | {"label": "Opening Ceremony", "color": "#c4b5fd", "bg": "rgba(196, 181, 253, 0.12)", "border": "rgba(196, 181, 253, 0.3)"} |
| Competition | {"label": "Competition", "color": "#f43f5e", "bg": "rgba(244, 63, 94, 0.12)", "border": "rgba(244, 63, 94, 0.3)"} |
| Hacking | {"label": "Hacking", "color": "#34d399", "bg": "rgba(52, 211, 153, 0.12)", "border": "rgba(52, 211, 153, 0.3)"} |
| Creator Activity | {"label": "Creator Activity", "color": "#a855f7", "bg": "rgba(168, 85, 247, 0.12)", "border": "rgba(168, 85, 247, 0.3)"} |
| Sponsor Break | {"label": "Sponsor Break", "color": "#fbbf24", "bg": "rgba(251, 191, 36, 0.12)", "border": "rgba(251, 191, 36, 0.3)"} |
| Mentoring | {"label": "Mentoring", "color": "#818cf8", "bg": "rgba(129, 140, 248, 0.12)", "border": "rgba(129, 140, 248, 0.3)"} |
| Food Break | {"label": "Food Break", "color": "#f97316", "bg": "rgba(249, 115, 22, 0.12)", "border": "rgba(249, 115, 22, 0.3)"} |
| Sponsor Activity | {"label": "Sponsor Activity", "color": "#f472b6", "bg": "rgba(244, 114, 182, 0.12)", "border": "rgba(244, 114, 182, 0.3)"} |
| Session | {"label": "Session", "color": "#2dd4bf", "bg": "rgba(45, 212, 191, 0.12)", "border": "rgba(45, 212, 191, 0.3)"} |
| Closing Ceremony | {"label": "Closing Ceremony", "color": "#e879f9", "bg": "rgba(232, 121, 249, 0.12)", "border": "rgba(232, 121, 249, 0.3)"} |

#### Pune schedule (all activities)

| # | Date | Start | End | Duration | Activity | Type | Who | Notes | Milestone |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 22 Aug 2026 | 11:00 | 11:15 | 15 min | Participant Arrival | Participant Flow | All participants | Participants begin arriving at venue | — |
| 2 | 22 Aug 2026 | 11:15 | 12:30 | 1 hr 15 min | Registration & Check In | Participant Flow | All participants | Registration and participant verification | — |
| 3 | 22 Aug 2026 | 12:30 | 12:45 | 15 min | Participant Settling | Participant Flow | All participants | Participants settle and prepare for opening ceremony | — |
| 4 | 22 Aug 2026 | 12:45 | 13:00 | 15 min | Movement to Auditorium | Participant Flow | All participants | Participants move to auditorium and take seats | — |
| 5 | 22 Aug 2026 | 13:00 | 13:05 | 5 min | Opening Ceremony Begins | Opening Ceremony | All participants | Welcome and formal start of opening ceremony | yes |
| 6 | 22 Aug 2026 | 13:05 | 13:30 | 25 min | Welcome & Hackers Occupied Pune Introduction | Opening Ceremony | All participants | Introduction to Hackers Occupied Pune and host team | — |
| 7 | 22 Aug 2026 | 13:30 | 14:00 | 30 min | Genesis Introduction & Keynote | Opening Ceremony | All participants | Introduction to Genesis and the two tracks | — |
| 8 | 22 Aug 2026 | 14:00 | 14:30 | 30 min | Partner & Sponsor Introduction | Opening Ceremony | All participants | Keynotes and thanks to partners and sponsors | — |
| 9 | 22 Aug 2026 | 14:30 | 14:45 | 15 min | Logitech Activities & Gear Announcement | Opening Ceremony | All participants | Logitech activities 1, 2 and 3 and their prizes announced | — |
| 10 | 22 Aug 2026 | 14:45 | 15:00 | 15 min | Hackathon Briefing & Rules | Opening Ceremony | All participants | Final instructions and rules before hacking begins at 3:00 PM. The opening ceremony ends here | — |
| 11 | 22 Aug 2026 | 15:00 | 15:00 | 0 min | Problem Statement Release | Competition | All teams | Official problem statements released at 3:00 PM | yes |
| 12 | 22 Aug 2026 | 15:00 | 15:00 | 0 min | Hackathon Begins | Competition | All teams | Official hacking period begins (3:00 PM) | yes |
| 13 | 22 Aug 2026 | 15:00 | 17:00 | 2 hr | Hacking Period 1 | Hacking | All teams | Teams begin initial project architecture and development | — |
| 14 | 22 Aug 2026 | 15:00 | 15:10 | 10 min | Creator Challenge Release | Creator Activity | Creators | 10 to 15 creator challenges released; submissions due 23 Aug at 11:00 AM | yes |
| 15 | 22 Aug 2026 | 17:00 | 17:15 | 15 min | Cornitos Snacks + Red Bull | Sponsor Break | All teams | Snacks and Red Bull served at team tables | — |
| 16 | 22 Aug 2026 | 17:15 | 18:00 | 45 min | Hacking Period 2 | Hacking | All teams | Teams continue development | — |
| 17 | 22 Aug 2026 | 18:00 | 19:30 | 1 hr 30 min | Mentoring Round 1 | Mentoring | All teams | Two mentors visit every team, about 5 minutes each | yes |
| 18 | 22 Aug 2026 | 18:00 | 20:00 | 2 hr | Hacking Period 3 | Hacking | All teams | Teams continue development before dinner | — |
| 19 | 22 Aug 2026 | 20:00 | 20:30 | 30 min | Dinner | Food Break | All teams | Dinner served at team tables | — |
| 20 | 22 Aug 2026 | 20:30 | 23:00 | 2 hr 30 min | Hacking Period 4 | Hacking | All teams | Teams continue development | — |
| 21 | 22 Aug 2026 | 23:00 | 00:00 | 1 hr | Mentoring Round 2 | Mentoring | All teams | Two mentors visit every team, about 5 minutes each | yes |
| 22 | 22 Aug 2026 | 23:00 | 00:00 | 1 hr | Hacking Period 5 | Hacking | All teams | Teams continue development | — |
| 23 | 23 Aug 2026 | 00:00 | 00:15 | 15 min | Midnight Snacks | Food Break | All teams | Snacks served at team tables | — |
| 24 | 23 Aug 2026 | 00:15 | 01:15 | 1 hr | Hacking Period 6 | Hacking | All teams | Teams continue development | — |
| 25 | 23 Aug 2026 | 01:15 | 01:45 | 30 min | Logitech Activity 1 | Sponsor Activity | 1 participant per team | One person from each team takes part while the rest keep building | yes |
| 26 | 23 Aug 2026 | 01:15 | 02:45 | 1 hr 30 min | Hacking Period 7 | Hacking | All teams | Teams continue development | — |
| 27 | 23 Aug 2026 | 02:45 | 03:15 | 30 min | Logitech Activity 2 | Sponsor Activity | 1 participant per team | One person from each team takes part while the rest keep building | yes |
| 28 | 23 Aug 2026 | 02:45 | 04:15 | 1 hr 30 min | Hacking Period 8 | Hacking | All teams | Teams continue development | — |
| 29 | 23 Aug 2026 | 04:15 | 04:45 | 30 min | Logitech Activity 3 | Sponsor Activity | 1 participant per team | One person from each team takes part while the rest keep building | yes |
| 30 | 23 Aug 2026 | 04:15 | 07:00 | 2 hr 45 min | Hacking Period 9 (Overnight) | Hacking | All teams | Final overnight development period | — |
| 31 | 23 Aug 2026 | 07:00 | 08:00 | 1 hr | Hacking Period 10 (Final Stretch) | Hacking | All teams | Final development stretch before morning break | — |
| 32 | 23 Aug 2026 | 08:00 | 08:30 | 30 min | Morning Tea + Breakfast | Food Break | All teams | Breakfast and morning tea served at team tables | — |
| 33 | 23 Aug 2026 | 08:30 | 08:45 | 15 min | Mentoring Round 3 | Mentoring | All teams | Mentoring round 3: 5 minutes per team for final guidance | yes |
| 34 | 23 Aug 2026 | 08:45 | 10:00 | 1 hr 15 min | Final Hacking & Code Freeze Prep | Hacking | All teams | Final project polishing, documentation, and submission prep | — |
| 35 | 23 Aug 2026 | 10:00 | 10:00 | 0 min | Final Submission Deadline | Competition | All teams | All project code and links due at 10:00 AM sharp | yes |
| 36 | 23 Aug 2026 | 10:00 | 10:30 | 30 min | Submission Verification | Competition | Organisers and judges | Submission status and repo link verification | — |
| 37 | 23 Aug 2026 | 10:30 | 12:30 | 2 hr | Judging | Competition | All teams | Judges visit each team at its desk until 12:30 PM | yes |
| 38 | 23 Aug 2026 | 11:00 | 11:00 | 0 min | Creator Track Submission Deadline | Creator Activity | Creators / All teams | 11:00 AM Creator Submission deadline for all completed creator challenges | yes |
| 39 | 23 Aug 2026 | 12:30 | 13:15 | 45 min | Score Consolidation & Break | Competition | Organisers and judges | Scores compiled while participants take a break | — |
| 40 | 23 Aug 2026 | 13:15 | 13:15 | 0 min | Closing Ceremony Begins | Closing Ceremony | All participants | Closing ceremony commences at 1:15 PM | yes |
| 41 | 23 Aug 2026 | 13:15 | 13:25 | 10 min | Closing Remarks & Keynote | Closing Ceremony | All participants | Formal closing remarks and event reflections | — |
| 42 | 23 Aug 2026 | 13:25 | 13:35 | 10 min | Winner Announcements | Closing Ceremony | All participants | Winners announced for Agentic AI, Web3, Logitech & Creator tracks | yes |
| 43 | 23 Aug 2026 | 13:35 | 13:45 | 10 min | Prize Distribution & Final Photography | Closing Ceremony | Winners & Participants | Prizes presented and the official group photo. The closing ceremony ends at 1:45 PM | yes |
| 44 | 23 Aug 2026 | 13:45 | 15:00 | 1 hr 15 min | Salesforce Speaker Session | Session | All teams | Optional session with Salesforce engineers; e-certificates for those who attended | yes |
| 45 | 23 Aug 2026 | 15:00 | 15:00 | 0 min | Event Concludes | Closing Ceremony | All participants | Hackers Occupied Pune ends at 3:00 PM | yes |

NEEDS_CONFIRMATION: prize pool figure and final team count.

## 5. Proof events (strongest credibility)

Genesis was **Event Partner** at each; keep the role visible wherever these appear.

| Event | Venue | Role | Fact |
|---|---|---|---|
| Hackaccino 4.0 | Bennett University, Greater Noida | Event Partner | 1,500 participants, 36 hours offline |
| Innovate 4.0 | IIT Delhi | Event Partner | Hackathon at IIT Delhi |
| CodeClash 2.0 | Google Office, Gurugram | Event Partner | Hackathon hosted at Google's Gurugram office |
| 0xGenIgnite | NIT Goa | Event Partner | Web3 hackathon, 11–12 October 2025 |

## 6. Sponsors: outcomes, formats and process

### What sponsors get

| Outcome | Line | Formats |
|---|---|---|
| Reach | Put your product in front of student developers at the events they already go to. | Title and track sponsorship; Booths and demo tables; Swag and credits |
| Talent | Meet builders while they build, not after they have sent a CV. | Judging and mentoring; Hiring challenges; Shortlists from winning teams |
| Adoption | Get your API, SDK or chain used in real projects over a weekend. | Sponsor tracks and bounties; Workshops on day one; Office hours with your team |

Packages and pricing: not public ("shared on request"). NEEDS_CONFIRMATION.

### How a partnership runs

| Step | Title | Line |
|---|---|---|
| 01 | Tell us the goal | Hiring, developer adoption or brand. One call, 30 minutes. |
| 02 | We shortlist events | Hackers Occupied or independent hackathons that match your audience, city and budget. |
| 03 | Show up on the day | Tracks, judging, booths or workshops. We handle the organisers. |
| 04 | Hear what happened | We follow up with what your team saw and what came out of it. |

### Partner form options

- **Partnership type:** Event sponsorship | Campus or college chapter | Community partnership | Product, credits or perks
- **Budget:** Under ₹1 lakh | ₹1–5 lakh | ₹5–15 lakh | ₹15 lakh+ | Not decided (NEEDS_CONFIRMATION: match packages)
- **Timeline:** This month | 1–3 months | 3–6 months | Exploring
- **Attachment:** PDF, PPT or PPTX up to 3 MB (sponsorship and community partnership only)

### Sponsor call sheet (current home page)

| Hour | Moment | Outcome | Line |
|---|---|---|---|
| H+00 | Kickoff | Reach | Your brand opens the weekend. |
| H+02 | Workshop | Adoption | Teach your SDK while ideas form. |
| H+10 | Office hours | Adoption | Unblock teams on your stack. |
| H+18 | Night shift | Reach | Show up at 3 a.m. They remember. |
| H+32 | Judging | Talent | See who builds under pressure. |
| H+36 | Shortlist | Talent | Leave with names, not CVs. |

## 7. Brands seen at Genesis events

From the logo marquee (`widgets/layout/Marquee.jsx`). NEEDS_CONFIRMATION: written approval to show each name.

| Brand | Logo file |
|---|---|
| AbhiBus | (text only) |
| Akai Space | (text only) |
| AlgoBharat | (text only) |
| Algorand Foundation | (text only) |
| Daytona | (text only) |
| Devfolio | (text only) |
| Duality AI | /brand-logos/duality-ai.webp |
| EigenCloud | (text only) |
| Endless Domain | (text only) |
| ETHIndia | /brand-logos/ethindia.webp |
| GitHub | (text only) |
| Google | /brand-logos/google.webp |
| HackCulture | (text only) |
| KodeMaster AI | (text only) |
| Logitech | (text only) |
| Microsoft | (text only) |
| Microsoft Azure | /brand-logos/microsoft-azure.webp |
| Physics Wallah (PW) | /brand-logos/physics-wallah.webp |
| Polygon | (text only) |
| Reskill | (text only) |
| Stellar | (text only) |
| TON | /brand-logos/ton.webp |
| Unstop | (text only) |
| Vercel | (text only) |
| Wormhole | (text only) |

## 8. Event archive (every row)

Role: **Organiser** = Genesis ran it; **Event Partner** = someone else organised, Genesis partnered. Rows not confirmed against the audit default to Event Partner (the conservative choice).

| Date | Event | Category | Venue | City | Attendees | Role | Confirmed | Page |
|---|---|---|---|---|---|---|---|---|
| Mid-January 2027 (tentative) | Hackers Occupied Delhi 2027 | Hackathon | Venue to be announced | Delhi NCR | — | Organiser | yes | /events/hackers-occupied-delhi |
| 22–23 August 2026 | Hackers Occupied Pune | Hackathon | Vishwakarma Institute of Technology (VIT) | Pune | — | Organiser | yes | /events/hackers-occupied-pune |
| 10–27 Feb 2026 | Escape Da Vinci | Meetup | Chandigarh University | Mohali | — | Event Partner | — | — |
| 17 Jan 2026 | Ranchi Hacks | Hackathon | Sarala Birla University | Ranchi | — | Event Partner | — | — |
| — | Hackaccino 4.0 | Hackathon | Bennett University | Greater Noida | 1,500 | Event Partner | yes | — |
| — | Innovate 4.0 | Hackathon | IIT Delhi | New Delhi | — | Event Partner | yes | — |
| 13 Dec 2025 | Duality | Hackathon | OpsTree Office | Gurugram | 102 | Event Partner | — | — |
| 6 Dec 2025 | SecureVerse | Meetup | Thoughtworks Office | Gurugram | — | Event Partner | — | — |
| 5 Dec 2025 | Vibestate 25 | Hackathon | Online | Online | — | Event Partner | — | — |
| 29 Nov 2025 | SynergiX Buildstation | Hackathon | VIPS-TC, Pitampura | New Delhi | 300 | Event Partner | — | — |
| 29 Nov 2025 | Mind the Gap 2.0 | Workshop | ABES Engineering College | Ghaziabad | — | Event Partner | — | — |
| 22 Nov 2025 | Nerds Meetup | Meetup | Thoughtworks Office | Gurugram | — | Event Partner | — | — |
| 21 Nov 2025 | Hype | Meetup | Vivekananda Global University | Jaipur | — | Event Partner | — | — |
| 20 Nov 2025 | Build with Gemini | Hackathon | University of Delhi | New Delhi | — | Event Partner | — | — |
| 14 Nov 2025 | TechJam 2.0 | Hackathon | Microsoft Office | Noida | — | Event Partner | — | — |
| 1 Nov 2025 | Monad Blitz Delhi | Hackathon | New Delhi | New Delhi | — | Event Partner | — | — |
| 27 Oct – 1 Nov 2025 | Design-A-Thon | Ideathon | Manipal University Jaipur | Jaipur | — | Event Partner | — | — |
| 15–16 Oct 2025 | Hardware Hackfest | Hackathon | GGSIPU | New Delhi | — | Event Partner | — | — |
| 13–14 Oct 2025 | Vault Heist | Hackathon | CGC University | Mohali | — | Event Partner | — | — |
| 11–12 Oct 2025 | 0xGenIgnite | Hackathon | NIT Goa | Goa | 51 | Event Partner | yes | — |
| 8–9 Oct 2025 | EcoCode | Hackathon | BVCOE | New Delhi | — | Event Partner | — | — |
| 30 Sep 2025 | Azure Developer Day | Meetup | Microsoft Office | Noida | — | Event Partner | — | — |
| 20 Sep 2025 | Breach and Chill | Meetup | Microsoft Office | Noida | — | Event Partner | — | — |
| 20 Sep 2025 | Hackster | Hackathon | HMRITM | New Delhi | — | Event Partner | — | — |
| 13 Sep 2025 | Code Veda | Hackathon | Microsoft Office | Gurugram | — | Event Partner | — | — |
| 13 Sep 2025 | Google I/O Extended | Meetup | Thoughtworks Office | Gurugram | 250 | Event Partner | — | — |
| 13 Sep – 5 Oct 2025 | 0xGenIgnite Bootcamp Tour | Bootcamp | Mumbai, Lucknow, Noida and Bengaluru | Mumbai | — | Event Partner | — | — |
| 6 Sep 2025 | HackLoop 2K25 | Meetup | Thoughtworks Office | Gurugram | — | Event Partner | — | — |
| 5–6 Sep 2025 | HackQuanta | Hackathon | JIMS Engineering Management Technical Campus | Greater Noida | — | Event Partner | — | — |
| 30 Aug 2025 | Troubleshoot Ideathon | Ideathon | Microsoft Office | Noida | — | Event Partner | — | — |
| 30 Aug 2025 | Hackground India 2K25 | Hackathon | Thoughtworks Office | Gurugram | — | Event Partner | — | — |
| 29 Aug 2025 | Char Log Kya Kahenge | Meetup | Microsoft Office | Noida | 130 | Event Partner | — | — |
| 23 Aug 2025 | Hack4Bihar | Hackathon | Thoughtworks Office | Gurugram | — | Event Partner | — | — |
| 22 Aug 2025 | Tech Masala | Meetup | Microsoft Office | Noida | — | Event Partner | — | — |
| 22 Aug 2025 | No Agenda Meetup | Meetup | Microsoft Office | Gurugram | — | Event Partner | — | — |
| 27 Jul 2025 | Hackshastra Pre-Meetup | Meetup | IIIT Delhi | New Delhi | — | Event Partner | — | — |
| 26 Jul 2025 | Web3 Pe Charcha | Meetup | Microsoft Office | Gurugram | 100 | Event Partner | — | — |
| 19 Jul 2025 | Careerverse | Meetup | Thoughtworks Office | Gurugram | — | Event Partner | — | — |
| 13 Jul 2025 | CodeCap Meetup | Meetup | Central Academy International School, Dwarka | New Delhi | — | Event Partner | — | — |
| 5 Jul 2025 | 15Forteen Meetup | Meetup | Microsoft Office | Noida | — | Event Partner | — | — |
| 28–29 Jun 2025 | HackArena 2025 | Hackathon | IIIT Delhi | New Delhi | — | Event Partner | — | — |
| 25 Jun 2025 | Genesis Meetup | Meetup | Microsoft Office | Noida | 130 | Organiser | — | — |
| 20–28 Jun 2025 | CodeClash 2.0 | Hackathon | Google Office | Gurugram | — | Event Partner | yes | — |
| 23 May 2025 | Hackamania | Hackathon | Microsoft Office | Gurugram | — | Event Partner | — | — |
| 3–4 May 2025 | HackHaven 2.0 | Hackathon | ABES Engineering College | Ghaziabad | — | Event Partner | — | — |
| 2–3 May 2025 | Supernova | Hackathon | GL Bajaj Institute of Technology and Management | Greater Noida | — | Event Partner | — | — |
| 28 Mar 2025 | Web3 Mai Bahut Scope Hai IRL | Meetup | SRM Institute of Science and Technology | Chennai | 150 | Event Partner | — | — |
| 15 Jan 2025 | How to Blockchain | Workshop | SRM Institute of Science and Technology | Chennai | 120 | Event Partner | — | — |
| 20 Sep 2024 | Welcoming the Founder | Meetup | SRM Institute of Science and Technology | Chennai | 200 | Event Partner | — | — |
| 19 Sep 2024 | Beyond the Code | Meetup | SRM Institute of Science and Technology | Chennai | 700 | Event Partner | — | — |

## 9. Team

NEEDS_CONFIRMATION: roles, Harshil's surname, photos/LinkedIn, Aditya's email spelling.

| # | Name | Initials | Colour |
|---|---|---|---|
| 01 | Harshil | H | #c4b5fd |
| 02 | Moksha Kohli | MK | #86efac |
| 03 | Aditya Jain | AJ | #f9a8d4 |
| 04 | Garvit Prakash | GP | #7dd3fc |

## 10. Photos (real event photography only)

All from Hackers Occupied Pune, in `frontend/public/gallery/hackers-occupied-pune/` (1280×853 WebP). NEEDS_CONFIRMATION: consent from people pictured.

| File | Caption | Date | Alt text |
|---|---|---|---|
| /gallery/hackers-occupied-pune/dsc09998.webp | Full house | Pune · 23 Aug 2026 | Participants, mentors and organisers of Hackers Occupied Pune seated together on the steps of the VIT auditorium |
| /gallery/hackers-occupied-pune/dsc09188.webp | Energy check | Pune · 22 Aug 2026 | Two Red Bull team members with drink backpacks in the lab while participants raise cans behind them |
| /gallery/hackers-occupied-pune/dsc00001.webp | Closing frame | Pune · 23 Aug 2026 | Group photo of everyone at the close of Hackers Occupied Pune in the VIT auditorium |
| /gallery/hackers-occupied-pune/dsc09197.webp | Refuel | Pune · 22 Aug 2026 | The Red Bull team walking the lab rows handing out drinks to teams at their desks |
| /gallery/hackers-occupied-pune/dsc09252.webp | Talking it through | Pune · 22 Aug 2026 | A seated mentor talking a standing team through their project |
| /gallery/hackers-occupied-pune/dsc09229.webp | Desk rounds | Pune · 22 Aug 2026 | Mentors and organisers gathered around a team's workstation reviewing their build |
| /gallery/hackers-occupied-pune/dsc09397.webp | Late-night laughs | Pune · 22 Aug 2026 | Participants laughing together with cans in hand during a break from building |
| /gallery/hackers-occupied-pune/dsc09230.webp | Under the hood | Pune · 22 Aug 2026 | Organisers and participants leaning in to look at a team's screen |
| /gallery/hackers-occupied-pune/dsc09999.webp | Everyone in | Pune · 23 Aug 2026 | A second group photo of all Hackers Occupied Pune participants in the auditorium |
| /gallery/hackers-occupied-pune/dsc09246.webp | The lab floor | Pune · 22 Aug 2026 | Teams coding at desktop computers on the lab floor at Hackers Occupied Pune |
| /gallery/hackers-occupied-pune/dsc00002.webp | Last one | Pune · 23 Aug 2026 | A wide group photo of participants and organisers in the auditorium at the end of the event |
| /gallery/hackers-occupied-pune/dsc09631.webp | Overnight build | Pune · 23 Aug 2026 | An organiser in a Genesis T-shirt checking in on a team at their desks overnight |
| /gallery/hackers-occupied-pune/dsc09243.webp | Code review | Pune · 22 Aug 2026 | A participant showing code on a laptop to a seated mentor |
| /gallery/hackers-occupied-pune/dsc09238.webp | Walkthrough | Pune · 22 Aug 2026 | A team in lanyards explaining their project to a mentor |
| /gallery/hackers-occupied-pune/dsc09340.webp | Heads down | Pune · 22 Aug 2026 | Participants working on laptops by the window late in the evening |
| /gallery/hackers-occupied-pune/dsc09267.webp | Huddle | Pune · 22 Aug 2026 | A group of participants crowded around a laptop with a mentor |

Pune recap strip order: Energy check, The lab floor, Walkthrough, Talking it through, Huddle, Late-night laughs, Heads down, Overnight build, Full house. Group photo: Full house.

## 11. Navigation (header mega-menus)

### Events

- **Feature card** (Upcoming): Hackers Occupied Delhi 2027 — Delhi NCR · Mid-January 2027 (tentative). 100 teams, six tracks. → `/events/hackers-occupied-delhi` [See the event]
- **Hackers Occupied/**
  - Hackers Occupied Delhi 2027 — Upcoming. Sponsor it or register interest → `/events/hackers-occupied-delhi`
  - Hackers Occupied Pune 2026 — Recap, schedule and photos → `/events/hackers-occupied-pune`
  - Pune certificates — For registered Pune participants → `/certificates/hackers-occupied-pune`
- **Archive/**
  - Events archive — Every event Genesis has run or partnered on → `/events`
  - Gallery — Photos from Hackers Occupied Pune → `/gallery`

### Partner

- **Feature card** (For sponsors): Sponsor a hackathon — Tell us your goal, budget and timeline. We shortlist events that fit. → `/partner` [Start here]
- **Work with us/**
  - Sponsor an event — Hackers Occupied Delhi or independent hackathons → `/partner`
  - Co-host, judge or mentor — Run a track, list your event, judge or mentor → `/collaborate`
  - Contact — Email, phone or the form → `/contact`

### About

- **Genesis/**
  - About Genesis — What we do and for whom → `/about`
  - How we run events — The rules we hold ourselves to → `/values`
  - Team — The people who run Genesis → `/team`
- **Resources/**
  - Organiser guide — How to run a student hackathon → `/guide`
  - Join the crew — Help run events across India → `/careers`

## 12. Current home page copy ("Zero Hour" story)

The home page is one 36-hour hackathon; scroll runs a clock from T+00:00 (Sat 9 a.m.) to T+36:00 (Sun 9 p.m.). Full creative record: `docs/build-loop/zero-hour/` (brief, concepts, copy deck).

| Clock | Chapter |
|---|---|
| T+00:00 | Hour zero |
| T+00:42 | Three words |
| T+06:00 | Headcount |
| T+12:00 | Rooms |
| T+18:00 | 3 a.m. |
| T+24:00 | For sponsors |
| T+30:00 | For builders |
| T+36:00 | Demo |

- **Hero:** Everything starts at hour zero. — Hackathons and builder events across India. Fast, unorthodox, in public.
- **Three words:** Unorthodox: Hackathons in rooms nobody expected. · Daring: We say the number out loud. Then we show up. · Fast: 36 hours. Not 36 weeks.
- **Headcount:** Counted, not estimated. Attendance across Genesis and partner events to date. 1 dot = 10 builders.
- **Rooms:** Rooms nobody expected.
- **3 a.m.:** Nobody remembers the polite hackathons. So we occupy cities. Hackers Occupied. One city. One weekend. Every builder worth meeting.
- **Call sheet:** Know the hour you meet them. Not a logo on a banner. A call sheet. Sign-off: One partner. Every hackathon worth being at.
- **Builders:** Your genesis is a weekend away. Ship something real with people you met that morning. Points: Mentors who've shipped, Judges who hire, A certificate you can share
- **Demo:** Time. Hands off keyboards. The clock resets in Delhi.

## 13. SEO per page (routes.json)

| Route | Title | Description | H1 | Priority |
|---|---|---|---|---|
| / | Genesis Hacks: hackathon partnerships in India | Genesis connects companies with India's student hackathon and builder community. 140+ events, 21,699 attendees. Next up: Hackers Occupied Delhi, January 2027. | Reach India's student builders at hackathons. | 1.0 |
| /events/hackers-occupied-delhi | Hackers Occupied Delhi 2027 / Genesis Hacks | Hackers Occupied Delhi: 100 teams, six tracks (AI, Web3, FinTech, Agro, Healthcare, CyberSecurity), Delhi NCR, mid-January 2027 (tentative). Sponsor or register interest. | Hackers Occupied Delhi 2027 | 0.9 |
| /partner | Sponsor a hackathon in India / Genesis Hacks | Sponsor Hackers Occupied Delhi or independent student hackathons across India. Tell us your goal, budget and timeline and we shortlist events that fit. | Partner with Genesis | 0.9 |
| /events | Events archive / Genesis Hacks | Every hackathon, meetup and bootcamp Genesis has run or partnered on across India, with the role Genesis played at each. | Events archive | 0.8 |
| /events/hackers-occupied-pune | Hackers Occupied Pune 2026 recap / Genesis Hacks | Hackers Occupied Pune took place on 22–23 August 2026 at VIT Pune. Schedule, photos and participant certificates. | Hackers Occupied Pune | 0.6 |
| /about | About Genesis Hacks | Genesis connects companies with India's student hackathon and builder community and runs its own series, Hackers Occupied. | About Genesis | 0.7 |
| /values | How we run events / Genesis Hacks | The principles Genesis follows when it runs or partners on a hackathon. | How we run events | 0.4 |
| /team | Team / Genesis Hacks | The people who run Genesis Hacks. | The people who run Genesis | 0.5 |
| /contact | Contact / Genesis Hacks | Sponsors and partners: email partner@genesishacks.com or call +91 70433 88006. Students and campus communities: use the form. | Contact Genesis | 0.7 |
| /collaborate | Co-host, judge or mentor / Genesis Hacks | Co-host a hackathon with Genesis, run a track, list your event, or judge and mentor at one. | Collaborate with Genesis | 0.6 |
| /careers | Join the crew / Genesis Hacks | Help Genesis run hackathons across India. Tell us what you want to work on. | Join the Genesis crew | 0.4 |
| /guide | How to run a hackathon: a practical guide / Genesis Hacks | A practical guide to planning, funding and running a student hackathon in India. | How to run a hackathon | 0.5 |
| /gallery | Photos from Hackers Occupied Pune / Genesis Hacks | Photos from Hackers Occupied Pune, 22–23 August 2026 at VIT Pune. | Gallery | 0.4 |
| /certificates/hackers-occupied-pune | Hackers Occupied Pune certificates / Genesis Hacks | Participants of Hackers Occupied Pune 2026 can download their certificate with their registered email and phone. | Download your certificate | 0.3 |
| /privacy | Privacy policy / Genesis Hacks | How Genesis Hacks collects, uses and protects personal data under India's Digital Personal Data Protection Act, 2023. | Privacy policy | 0.2 |
| /terms | Terms of service / Genesis Hacks | The terms that apply when you use genesishacks.com. | Terms of service | 0.2 |
