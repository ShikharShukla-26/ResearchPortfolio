export const site = {
  name: 'Shikhar Shukla',
  tagline:
    'Behavioral & UX research — qualitative, ethnographic and heuristic methods. Vadodara, India.',
  email: 'shikharshukla678@gmail.com',
  phone: '+91 9825496937',
  address:
    '122/C, Vishwamitry Township, Mangalpur, Vadodara, Gujarat 390011, India',
  linkedin: 'https://www.linkedin.com/in/shikhar-shukla-2094ba135/',
  substack: 'https://shikharshukla26.substack.com',
  portfolio: 'https://www.shikharshukla.dev',
  resume: '/Shikhar_Shukla_Research.pdf'
} as const;

export const research = [
  {
    href: '/work/surface-compliance',
    title: 'Surface Compliance, Silent Resistance — a workplace ethnography',
    date: 'Jan – Jun 2026',
    dateTime: '2026-06'
  },
  {
    href: '/work/surface-compliance-exit-arc',
    title: 'The Exit Arc — the Control–Trust–Output Loop in terminal phase',
    date: 'Jul – Aug 2026',
    dateTime: '2026-08'
  },
  {
    href: '/work/six-week-silence',
    title: 'The Six-Week Silence — how a team mistook a communication gap for a broken process',
    date: 'August 2026',
    dateTime: '2026-08'
  },
  {
    href: '/work/zipcar',
    title: 'Zipcar — first-time experience audit of the booking flow',
    date: '2026',
    dateTime: '2026'
  },
  {
    href: '/work/decathlon',
    title: 'Decathlon.in — heuristic evaluation of the purchase journey',
    date: 'September 2026',
    dateTime: '2026-09'
  },
  {
    href: '/work/wise',
    title: 'Wise India — onboarding cognitive walkthrough for a first-time visitor',
    date: 'September 2026',
    dateTime: '2026-09'
  }
] as const;

export const writing = [
  {
    href: 'https://shikharshukla26.substack.com/p/research-project-001-the-six-week',
    title: 'Research Project 001: The Six-Week Silence',
    date: 'August 2026',
    dateTime: '2026-08'
  },
  {
    href: 'https://shikharshukla26.substack.com/p/the-voice-that-disappeared',
    title: 'The Voice That Disappeared',
    date: 'July 2026',
    dateTime: '2026-07'
  },
  {
    href: 'https://shikharshukla26.substack.com/p/the-unseen-wall',
    title: 'The Something I Was Looking For In Other People',
    date: 'June 2026',
    dateTime: '2026-06'
  },
  {
    href: 'https://shikharshukla26.substack.com/p/counterfeit-certainty',
    title: 'Counterfeit Certainty',
    date: 'June 2026',
    dateTime: '2026-06'
  },
  {
    href: 'https://shikharshukla26.substack.com/p/i-thought-i-was-interested-in-self',
    title: 'I Thought I Was Interested In Self-Knowledge',
    date: 'June 2026',
    dateTime: '2026-06'
  },
  {
    href: 'https://shikharshukla26.substack.com/p/youtube-the-day-youtube-stopped-choosing',
    title: 'The Day YouTube Stopped Choosing For Me',
    date: 'May 2026',
    dateTime: '2026-05'
  },
  {
    href: 'https://shikharshukla26.substack.com/p/how-youtube-controls-your-thinking',
    title: 'How YouTube Controls Your Thinking Before You Notice',
    date: 'May 2026',
    dateTime: '2026-05'
  },
  {
    href: 'https://shikharshukla26.substack.com/p/youtube-is-not-your-problem-tomorrow',
    title: 'YouTube Is Not Your Problem. Tomorrow Is.',
    date: 'May 2026',
    dateTime: '2026-05'
  }
] as const;

export const elsewhere = [
  { href: site.resume, label: 'Resume (PDF)' },
  { href: site.linkedin, label: 'LinkedIn' },
  { href: site.substack, label: 'Substack' },
  { href: `mailto:${site.email}`, label: 'Email' },
  { href: site.portfolio, label: 'shikharshukla.dev' }
] as const;
