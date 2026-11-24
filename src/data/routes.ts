import { daysToDelhi, EVENT_TOTALS } from './site'

export type RouteMeta = {
  title: string
  description: string
  /** Position on the site-wide 36-hour clock (the whole site is one hackathon weekend). */
  stamp: string
  label: string
  /** One line of narration the transition curtain speaks. */
  line: string
}

const delhiStamp = () => `T−${String(daysToDelhi()).padStart(2, '0')}D`

export const ROUTES: Record<string, RouteMeta> = {
  '/': {
    title: 'Genesis Hacks: hackathon partnerships in India',
    description: "Genesis connects companies with India's student hackathon and builder community. 20,000+ participants, 80,000+ registrations and 100+ hackathons. Next up: Hackers Occupied Delhi, January 2027.",
    stamp: 'T+00:00', label: 'Hour zero', line: 'Sat 09:00. Doors open.',
  },
  '/about': {
    title: 'About Genesis Hacks',
    description: "Genesis connects companies with India's student hackathon and builder community and runs its own series, Hackers Occupied.",
    stamp: 'T+01:00', label: 'About', line: "Sat 10:00. Who's running this?",
  },
  '/values': {
    title: 'How we run events | Genesis Hacks',
    description: 'The principles Genesis follows when it runs or partners on a hackathon.',
    stamp: 'T+02:00', label: 'House rules', line: 'Sat 11:00. Rules, read aloud.',
  },
  '/team': {
    title: 'Team | Genesis Hacks',
    description: 'The people who run Genesis Hacks.',
    stamp: 'T+03:00', label: 'Team', line: 'Sat 12:00. Meet the crew.',
  },
  '/events': {
    title: 'Events archive | Genesis Hacks',
    description: 'Every hackathon, meetup and bootcamp Genesis has run or partnered on across India, with the role Genesis played at each.',
    stamp: 'T+06:00', label: 'Archive', line: 'Sat 15:00. Every room so far.',
  },
  '/events/hackers-occupied-pune': {
    title: 'Hackers Occupied Pune 2026 recap | Genesis Hacks',
    description: 'Hackers Occupied Pune took place on 22–23 August 2026 at VIT Pune. Schedule, photos and participant certificates.',
    stamp: 'T+12:00', label: 'Pune', line: 'Sat 21:00. The lab floor, VIT Pune.',
  },
  '/gallery': {
    title: 'Photos from Hackers Occupied Pune | Genesis Hacks',
    description: 'Photos from Hackers Occupied Pune, 22–23 August 2026 at VIT Pune.',
    stamp: 'T+18:00', label: 'Gallery', line: "Sun 03:00. Someone's taking photos.",
  },
  '/partner': {
    title: 'Sponsor a hackathon in India | Genesis Hacks',
    description: 'Sponsor Hackers Occupied Delhi or independent student hackathons across India. Tell us your goal, budget and timeline and we shortlist events that fit.',
    stamp: 'T+24:00', label: 'Partner', line: 'Sun 09:00. The sponsors walk in.',
  },
  '/collaborate': {
    title: 'Co-host, judge or mentor | Genesis Hacks',
    description: 'Co-host a hackathon with Genesis, run a track, list your event, or judge and mentor at one.',
    stamp: 'T+26:00', label: 'Collaborate', line: 'Sun 11:00. Pull up a chair.',
  },
  '/careers': {
    title: 'Join the crew | Genesis Hacks',
    description: 'Help Genesis run hackathons across India. Tell us what you want to work on.',
    stamp: 'T+28:00', label: 'Join the crew', line: 'Sun 13:00. We need more hands.',
  },
  '/contact': {
    title: 'Contact | Genesis Hacks',
    description: 'Sponsors and partners: email partner@genesishacks.com or call +91 70433 88006. Students and campus communities: use the form.',
    stamp: 'T+30:00', label: 'Contact', line: 'Sun 15:00. Say hello.',
  },
  '/guide': {
    title: 'How to run a hackathon: a practical guide | Genesis Hacks',
    description: 'A practical guide to planning, funding and running a student hackathon in India.',
    stamp: 'T+32:00', label: 'Organiser guide', line: 'Sun 17:00. Write it down for the next team.',
  },
  '/certificates/hackers-occupied-pune': {
    title: 'Hackers Occupied Pune certificates | Genesis Hacks',
    description: 'Participants of Hackers Occupied Pune 2026 can download their certificate with their registered email and phone.',
    stamp: 'T+35:00', label: 'Certificates', line: 'Sun 20:00. Proof you were there.',
  },
  '/privacy': {
    title: 'Privacy policy | Genesis Hacks',
    description: "How Genesis Hacks collects, uses and protects personal data under India's Digital Personal Data Protection Act, 2023.",
    stamp: 'T+34:00', label: 'Privacy', line: 'The small print, in plain words.',
  },
  '/terms': {
    title: 'Terms of service | Genesis Hacks',
    description: 'The terms that apply when you use genesishacks.com.',
    stamp: 'T+34:00', label: 'Terms', line: 'The small print, in plain words.',
  },
}

const DELHI_META = (): RouteMeta => ({
  title: 'Hackers Occupied Delhi 2027 | Genesis Hacks',
  description: 'Hackers Occupied Delhi: 100 teams, six tracks (AI, Web3, FinTech, Agro, Healthcare, CyberSecurity), Delhi NCR, mid-January 2027 (tentative). Sponsor or register interest.',
  stamp: delhiStamp(), label: "Delhi '27", line: 'The clock resets in Delhi.',
})

const NOT_FOUND: RouteMeta = {
  title: 'Page not found | Genesis Hacks',
  description: 'This page does not exist.',
  stamp: 'T+??:??', label: 'Lost', line: "This hour doesn't exist.",
}

export function metaFor(pathname: string): RouteMeta {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/events/hackers-occupied-delhi') return DELHI_META()
  if (ROUTES[path]) return ROUTES[path]
  if (path.startsWith('/guide/')) return { ...ROUTES['/guide'], label: 'Organiser guide' }
  return NOT_FOUND
}

export const REDIRECTS: Record<string, string> = {
  '/sponsors': '/partner',
  '/partners': '/partner',
  '/sponsor': '/partner',
  '/hackers-occupied-pune': '/events/hackers-occupied-pune',
  '/hackers-occupied-delhi': '/events/hackers-occupied-delhi',
  '/certificate': '/certificates/hackers-occupied-pune',
}

export const NAV = {
  primary: [
    { to: '/events', label: 'Events' },
    { to: '/partner', label: 'Partner' },
    { to: '/about', label: 'About' },
    { to: '/guide', label: 'Guide' },
  ],
  groups: [
    {
      title: 'Events',
      links: [
        { to: '/events', label: 'Archive', note: `${EVENT_TOTALS.events} events listed` },
        { to: '/events/hackers-occupied-delhi', label: "Delhi '27", note: 'Upcoming' },
        { to: '/gallery', label: 'Gallery', note: '16 photos' },
      ],
    },
    {
      title: 'Work with us',
      links: [
        { to: '/partner', label: 'Sponsor', note: 'For companies' },
        { to: '/collaborate', label: 'Collaborate', note: 'Co-host, judge, mentor' },
        { to: '/careers', label: 'Join the crew', note: 'Help run events' },
        { to: '/contact', label: 'Contact', note: 'Email, phone, form' },
      ],
    },
    {
      title: 'Genesis',
      links: [
        { to: '/about', label: 'About', note: 'What we do' },
        { to: '/values', label: 'How we run events', note: 'Six rules' },
        { to: '/team', label: 'Team', note: 'Four people' },
        { to: '/guide', label: 'Organiser guide', note: '31 articles' },
      ],
    },
  ],
}
