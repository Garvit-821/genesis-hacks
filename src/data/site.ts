import site from './site.json'
import eventsData from './events.json'
import team from './team.json'
import pune from './pune.json'
import media from './media.json'

export const BRAND = site.BRAND
export const CONTACT = site.CONTACT
export const DELHI = site.DELHI
export const PUNE = site.PUNE
export const STATS = site.STATS
/**
 * Headline figures, rounded on purpose (team decision, Nov 2026). Exact counts stay out of
 * the copy; update these by hand when a new threshold is passed.
 */
export const HEADLINE = {
  participants: 20000,
  participantsLabel: '20,000+',
  registrations: 80000,
  registrationsLabel: '80,000+',
  hackathons: 100,
  hackathonsLabel: '100+',
  womenShareLabel: '35%',
}
export const SOCIALS = site.SOCIALS
export const PROOF_EVENTS = site.PROOF_EVENTS
export const PARTNER_STEPS = site.PARTNER_STEPS
export const SPONSOR_OUTCOMES = site.SPONSOR_OUTCOMES
export const SITE_URL = site.SITE_URL

export type EventRow = (typeof eventsData.events)[number]
export const EVENTS: EventRow[] = eventsData.events
export const EVENT_CATEGORIES: string[] = eventsData.categories
export const EVENT_CITIES: string[] = eventsData.cities
export const EVENT_YEARS: string[] = eventsData.years
export const EVENT_ROLES: string[] = eventsData.roles
export const EVENT_TOTALS = eventsData.totals

export const TEAM = team
export const PUNE_DETAILS = pune.details
export const PUNE_FACTS = pune.facts
export type ActivityCategory = { label: string; color: string; bg: string; border: string }
export const PUNE_CATEGORIES = pune.categories as Record<string, ActivityCategory>
export type Activity = (typeof pune.schedule)[number]
export const PUNE_SCHEDULE: Activity[] = pune.schedule

export type Photo = (typeof media.gallery)[number]
export const GALLERY: Photo[] = media.gallery
export const PUNE_STORY: Photo[] = media.story
export const GROUP_PHOTO: Photo = media.group

export const photo = (file: string) => GALLERY.find((p) => p.file === file) as Photo
/** A photo's date without the event name, for pages that should not lead with Pune. */
export const shotDate = (p: Photo) => p.meta.replace(/^Pune\s*·\s*/, '')
/** The latest archive event that is not Hackers Occupied Pune. */
export const LATEST_EVENT = EVENTS.find((e) => e.id !== 'hackers-occupied-pune' && e.iso)!

export const DELHI_TRACKS = [
  { name: 'AI', line: 'Models, agents and tools that do real work.' },
  { name: 'Web3', line: 'Chains, wallets and on-chain apps people can use.' },
  { name: 'FinTech', line: 'Payments, credit and money tools built for India.' },
  { name: 'Agro', line: 'Tech for farms, supply chains and food.' },
  { name: 'Healthcare', line: 'Care, diagnostics and access to health services.' },
  { name: 'CyberSecurity', line: 'Defence, privacy and security tooling.' },
]

export const CALL_SHEET = [
  { hour: 0, moment: 'Kickoff', outcome: 'Reach', line: 'Your brand opens the weekend.' },
  { hour: 2, moment: 'Workshop', outcome: 'Adoption', line: 'Teach your SDK while ideas form.' },
  { hour: 10, moment: 'Office hours', outcome: 'Adoption', line: 'Unblock teams on your stack.' },
  { hour: 18, moment: 'Night shift', outcome: 'Reach', line: 'Show up at 3 a.m. They remember.' },
  { hour: 32, moment: 'Judging', outcome: 'Talent', line: 'See who builds under pressure.' },
  { hour: 36, moment: 'Shortlist', outcome: 'Talent', line: 'Leave with names, not CVs.' },
]

export const CAREER_AREAS = [
  {
    value: 'Event operations',
    title: 'Event operations',
    line: 'Venues, run of show, check-in, food, Wi-Fi and the hundred small things that make a hackathon work on the day.',
    youWill: ['Plan schedules and floor layouts', 'Run check-in and help desks', 'Keep the event on time'],
  },
  {
    value: 'Partnerships',
    title: 'Partnerships',
    line: 'Find sponsors, write proposals and look after partners before, during and after an event.',
    youWill: ['Research companies that fit an event', 'Draft proposals and follow up', "Be the sponsor's contact on the day"],
  },
  {
    value: 'Design',
    title: 'Design',
    line: 'Event identities, posters, decks, stage graphics and the website you are on.',
    youWill: ['Design event branding', 'Make social and print assets', 'Work on genesishacks.com'],
  },
  {
    value: 'Engineering',
    title: 'Engineering',
    line: 'Internal tools like the certificate download, the forms that reach our team, and this website.',
    youWill: ['Build and fix internal tools', 'Ship website features', 'Keep forms and data safe'],
  },
  {
    value: 'Community and campus',
    title: 'Community and campus',
    line: 'Bring builders from your college to events and help first-timers find a team.',
    youWill: ['Share events on your campus', 'Help run meetups', 'Welcome first-time hackers'],
  },
]

/** Days until the (tentative) Delhi start date, counted in IST. */
export function daysToDelhi(now = new Date()) {
  const start = new Date(`${DELHI.startDate}T09:00:00+05:30`).getTime()
  return Math.max(0, Math.ceil((start - now.getTime()) / 86_400_000))
}

/**
 * Everyone who has put their name on a Genesis weekend, billed like a festival poster.
 * Names only: logos stay off the site until each brand approves its mark.
 * Source: the organisation list shared on 2026-11-18, deduplicated and cleaned.
 */
export type BillTier = { id: string; label: string; size: 'xl' | 'l' | 'm' | 's'; names: string[] }
export const LINEUP: BillTier[] = [
  {
    id: 'headliners',
    label: 'Headlining',
    size: 'xl',
    names: ['YouTube', 'GitHub', 'Microsoft Azure', 'Salesforce', 'Accenture', 'TCS', 'Thoughtworks', 'Paytm', 'Vercel', 'Red Bull', 'Monster Energy', 'Physics Wallah', 'GeeksforGeeks', 'MLH', 'Unstop', 'Market Mafia', 'Logitech', 'Build with Gemini', 'AI Impact Summit 2026 · MeitY'],
  },
  {
    id: 'tools',
    label: 'Tools, AI & platforms',
    size: 'l',
    names: ['FlutterFlow', 'GenSpark', 'Julep AI', 'Duality AI', 'Orkes', 'KodeMaster AI', 'GoAvo.ai', 'agentloop.co', 'RunAnywhere', 'Opencode', 'Masters Union', 'Commudle', 'Devnovate', 'EventEye', 'Endless Domains', 'Interview Buddy', 'Squareboat', 'Softmart Solutions', 'APPWARS Technologies', 'Reskilll', 'UptoSkills', 'Growbinar', 'Maximally', 'HackBase', 'LinkedOut', 'Last3Feet', 'TechLeads', 'SoarX', 'The Legal Capital', 'Crest'],
  },
  {
    id: 'web3',
    label: 'Web3',
    size: 'l',
    names: ['Algorand', 'Monad Foundation', 'EigenLayer', 'Wormhole', 'TON', 'Stellar', 'OpenBuild', 'Chain Chapter', 'BlockOn Ventures & Web3preneur', 'Hyderabad DAO', 'Lucknow DAOs', 'PuneDAO', 'Web3 Mumbai', 'NodeZer0'],
  },
  {
    id: 'backers',
    label: 'Backers & accelerators',
    size: 'm',
    names: ['eChai Ventures', 'Nebula Accelerator', 'FundNexus', 'Build Club', 'Builder Base Community', 'NYDC 2026', 'Digital India Hackathon'],
  },
  {
    id: 'communities',
    label: 'Communities',
    size: 'm',
    names: ['Geek Room', 'GDG New Delhi', 'GDG Ranchi', 'GDG MIET', 'DezHub India', 'HackCulture', 'HackHalt', 'Hackshastra', 'HackLoop', 'HackTropica', 'Hack4Bihar', 'Hack4Good', 'Tech4Hack', 'DevHive', 'DevSphere India', 'DevXpanse', 'DevXSphere', 'Code Rangers', 'CodeCap', 'CodeGeeks', 'Code Veda', 'Singularity', 'Aya Community', 'AIDN Pune', 'bits&bytes', 'Nerds Room', 'Ignite Room', 'theDevArmy', 'TechTribe Connect', 'TechVerse Nexus', 'Tech Verse', 'Tech Masters', 'Tech Illumination', 'TechDome', 'Techera', 'The Elites', 'SynergiX', 'Webyte', 'GSoC Innovators Club', 'AARVAK', 'ADC', 'The Student Spot'],
  },
  {
    id: 'clubs',
    label: 'Campus chapters & clubs',
    size: 's',
    names: ['GDG on Campus IIT Delhi', 'GDG on Campus IGDTUW', 'GDG on Campus ABESEC', 'GDG on Campus NIT Rourkela', 'Geek Room ADGIPS', 'Geek Room JIMS-EMTC', 'IEEE USAR', 'IEEE WIE USAR', 'CSI Bennett University', 'ISTE CGC University', 'TCET ACM SIGAI', 'TCET ACM SIGITE', 'Creative Computing Society, Thapar', 'CST Club, VGU', 'TechTatva & CodeChef CU', 'Abhyudaya Club, GL Bajaj', 'Hashtag, JIMS-EMTC', 'Intellia, MIET', 'Hacknovate, ABESIT', 'HackJKLU', 'AceHack, UEM Jaipur', 'Elysian, EDC', 'EDC, JSS University', 'TISEC, VIPS-TC', 'E-Cell, Vijaybhoomi University', 'Student Activity Center, NIT Rourkela'],
  },
  {
    id: 'campuses',
    label: 'Campuses',
    size: 'm',
    names: ['IIT Delhi', 'IIIT Delhi', 'University of Delhi', 'NIT Rourkela', 'NIT Goa', 'Thapar Institute', 'Bennett University', 'Chandigarh University', 'CGC University, Mohali', 'Manipal University Jaipur', 'VIT Bhopal University', 'SRM Delhi-NCR', 'IGDTUW', 'USAR, GGSIPU', 'JSS University, Noida', 'ABES Engineering College', 'ABES Institute of Technology', 'GL Bajaj', 'MIET Meerut', 'JIMS-EMTC', 'VIPS-TC', 'Inderprastha Engineering College', 'HMR Institute', 'Dronacharya Group of Institutions', 'GTBIT', 'Trinity Institute', 'Bharati Vidyapeeth', 'BVEST', 'Thakur College of Engineering', 'Vishwakarma Institute of Technology, Pune', 'Vijaybhoomi University', 'Vivekananda Global University', 'UEM Jaipur', 'Sarala Birla University', 'Aravali College', 'Asansol Engineering College', 'Polaris School of Technology'],
  },
  {
    id: 'perks',
    label: 'Fuel, travel & friends',
    size: 's',
    names: ['Cornitos', 'AbhiBus', 'AllTrip', 'Chic Avenue', 'Exposure Explorers', 'Merajs Creative', 'Advertising Point Line', 'CU Content', 'Politics Personal', 'Legacy Search'],
  },
]
export const LINEUP_TOTAL = LINEUP.reduce((n, t) => n + t.names.length, 0)
