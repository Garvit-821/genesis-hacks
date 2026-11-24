# Genesis Hacks · content handoff for a from-scratch redesign

Extracted 5 November 2026 from the running site (branch `redesign/minimal-landing`) and from the
data files in `frontend/src`. Use this folder as the single brief for a new design: it holds every
word, number, event, photo and asset the current site uses, with no design attached.

## Files

| File | What it is | Size |
|---|---|---|
| `data.md` | **Start here.** Facts and structured content: brand, contact, stats, Delhi and Pune, the full 49-event archive, the Pune schedule (45 items), proof events, sponsor offer and process, partner-form options, brands seen at events, team, photos with alt text, navigation menus, current home-page copy, SEO per page | ~33 KB |
| `pages.md` | Every public page as rendered (17 pages incl. 404, plus header and footer): headings, body copy, links, buttons, form fields, image alt text, title tags and meta descriptions | ~74 KB |
| `guide.md` | The organiser guide "How to run a hackathon": 8 categories, 31 articles, with sections, checklists and callouts | ~21 KB |
| `content.json` | Everything above in one machine-readable file (`data`, `brands`, `partnerForm`, `pages`) | ~340 KB |

Related, already in the repo:
- `docs/brand/GENESIS_BRAND_STRATEGY.md`: competitor analysis of 20 orgs, positioning, colour and logo recommendations.
- `docs/build-loop/zero-hour/`: the current home page's creative record (brief, 8 concepts, copy deck, busy-reader rules).

## The brief in five lines
1. **Who:** Genesis Hacks, a pan-India community that organises hackathons, speaker sessions and builder events, and runs its own series, **Hackers Occupied** (Pune done Aug 2026; Delhi next, mid-Jan 2027, tentative).
2. **Brand concepts:** **unorthodox, daring, fast**, as ideas, not literal words.
3. **Readers:** sponsors checking credibility before they pay; builders deciding whether to trust an event; organisers who might partner.
4. **Proof:** 140+ events, 21,699 attendees, 35 % women, 14 cities; Event Partner at Hackaccino 4.0 (Bennett), Innovate 4.0 (IIT Delhi), CodeClash 2.0 (Google Gurugram), 0xGenIgnite (NIT Goa).
5. **Two actions:** partner/sponsor (`/partner`, partner@genesishacks.com, +91 70433 88006) and Hackers Occupied Delhi (`/events/hackers-occupied-delhi`).

## Pages on the current site
`/` home · `/partner` sponsor · `/collaborate` co-host, judge, mentor · `/events` archive · `/events/hackers-occupied-delhi` · `/events/hackers-occupied-pune` recap · `/gallery` · `/certificates/hackers-occupied-pune` · `/about` · `/values` · `/team` · `/careers` · `/contact` · `/guide` + 31 articles · `/privacy` · `/terms` · 404.

## Assets you can reuse (`frontend/public/`)
| Asset | Files | Notes |
|---|---|---|
| 3D mascot | `model/Hero-{Low,Medium,High,Ultra}[-KTX2].glb` (1–7 MB), `model/About.glb` (11 MB) | adaptive-quality loader in `frontend/src/infrastructure/performance/` |
| Event photos | `gallery/hackers-occupied-pune/*.webp`, 16 photos, 1280×853 | all real, from Pune; captions and alt text in `data.md` §10 |
| Pune poster | `images/hackers-occupied-pune-poster.{png,webp}` | |
| Logo | `images/logo.png`, `images/logo-mark.{png,webp}`, favicons, `icon-192/512.png`, `images/og-genesis.jpg` | |
| Brand logos (seen at events) | `brand-logos/*.webp` (11), `logo images/*.png` (11) | approval needed before showing (see below) |
| Certificate template | `certificates/hackers-occupied-pune.png` | |
| Fonts | Geist + Geist Mono (OFL, licence file present), Gridular (pixel, the site's long-time display face), OT Brut (condensed serif), Aeonik, Leirtag Aquelli **Demo** | only Geist has a licence file in the repo |

## Open items (NEEDS_CONFIRMATION in code)
- How "140+ events" is counted (the public archive lists 49).
- Delhi 2027 dates, venue and final track briefs.
- Sponsorship packages and pricing; partner-form budget bands should match them.
- Wording of the four partnership steps.
- Role of archive rows not checked by the October audit (default "Event Partner").
- Written approval to show each brand name or logo.
- Photo consent from people pictured.
- Team roles, Harshil's surname, photos/LinkedIn, Aditya's email spelling.
- Pune prize pool figure and final team count.
- Licence terms for the MLH-adapted guide structure.
- Web licences for OT Brut, Gridular and Aeonik; Leirtag Aquelli is a demo font (do not ship).
- Retention period for files uploaded through the partner form.
- India map outline accuracy on the events map (Survey of India).

## Honesty rules the current copy follows (worth keeping)
- Label projections as projections ("4,000+ registrations, projection").
- Label Genesis's role at every partner event ("Event Partner" vs "Organiser").
- Mark tentative dates as tentative.
- Only real Genesis event photos, never stock.
