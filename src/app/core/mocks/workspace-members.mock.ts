import { PresenceStatus, User } from '../models/user';
import { AE, CE, IN, MemberSeed, PRODUCT_TEAM_SEEDS, PT, SG, UK } from './member-seeds.mock';
import { minutesAgo } from './mock-clock';

const FIRST_MEMBER_NUMBER = 12;
const COMPANY_DOMAIN = 'northstar.io';

const BUSINESS_TEAM_SEEDS: readonly MemberSeed[] = [
  [
    'Samir Haddad',
    'Product Analyst',
    'Product',
    'offline',
    150,
    'Dubai, UAE',
    AE,
    'Aug 2024',
    'member',
  ],
  [
    'Ayesha Rahman',
    'Content Lead',
    'Marketing',
    'online',
    0,
    'Mumbai, India',
    IN,
    'Jan 2026',
    'member',
  ],
  [
    'Neel Joshi',
    'Performance Marketer',
    'Marketing',
    'away',
    20,
    'Pune, India',
    IN,
    'Jul 2023',
    'member',
  ],
  [
    'Clara Mendes',
    'Brand Contractor',
    'Marketing',
    'offline',
    4520,
    'Lisbon, Portugal',
    PT,
    'Nov 2024',
    'guest',
    'clara@mendes.co',
  ],
  [
    'Shruti Agarwal',
    'Marketing Operations',
    'Marketing',
    'offline',
    900,
    'Jaipur, India',
    IN,
    'Apr 2026',
    'member',
  ],
  [
    'Vivek Chauhan',
    'Account Executive',
    'Sales',
    'online',
    0,
    'Gurugram, India',
    IN,
    'Oct 2023',
    'member',
  ],
  ['Ritika Bose', 'Sales Lead', 'Sales', 'away', 15, 'Kolkata, India', IN, 'Mar 2025', 'member'],
  [
    'Daniel Okafor',
    'Partnerships Manager',
    'Sales',
    'offline',
    700,
    'London, UK',
    UK,
    'Jul 2026',
    'member',
    'daniel.okafor@northstar.io',
  ],
  [
    'Anjali Verma',
    'Sales Development Rep',
    'Sales',
    'online',
    0,
    'New Delhi, India',
    IN,
    'Feb 2024',
    'member',
  ],
  [
    'Fatima Sheikh',
    'Support Engineer',
    'Customer Success',
    'online',
    0,
    'Hyderabad, India',
    IN,
    'Sep 2026',
    'member',
  ],
  [
    'Arnav Mishra',
    'Customer Success Manager',
    'Customer Success',
    'offline',
    320,
    'Lucknow, India',
    IN,
    'Jan 2023',
    'member',
  ],
  [
    'Grace Lee',
    'Onboarding Specialist',
    'Customer Success',
    'away',
    45,
    'Singapore',
    SG,
    'May 2024',
    'member',
  ],
  [
    'Suresh Iyer',
    'Finance Manager',
    'Finance',
    'offline',
    2000,
    'Chennai, India',
    IN,
    'Sep 2025',
    'member',
  ],
  [
    'Nandini Rao',
    'People Partner',
    'People',
    'online',
    0,
    'Bengaluru, India',
    IN,
    'Apr 2023',
    'admin',
  ],
  [
    'Joseph Mathew',
    'IT Administrator',
    'Operations',
    'online',
    0,
    'Kochi, India',
    IN,
    'Aug 2024',
    'admin',
  ],
  [
    'Kiara D’Souza',
    'Office & Operations Lead',
    'Operations',
    'away',
    60,
    'Goa, India',
    IN,
    'Jan 2026',
    'member',
  ],
  [
    'Tomás Alvarez',
    'Legal Counsel (contractor)',
    'Legal',
    'offline',
    7200,
    'Madrid, Spain',
    CE,
    'Jul 2023',
    'guest',
    'tomas@alvarezlegal.es',
  ],
  [
    'Prakash Hegde',
    'Recruiter',
    'People',
    'offline',
    500,
    'Mangaluru, India',
    IN,
    'Nov 2024',
    'member',
  ],
];

const emailOf = (name: string): string =>
  `${name
    .split(' ')[0]
    .toLowerCase()
    .replace(/[^a-z]/g, '')}@${COMPANY_DOMAIN}`;

const presenceTimes = (status: PresenceStatus, minutes: number): Partial<User> =>
  status === 'offline'
    ? { lastSeenAt: minutesAgo(minutes) }
    : status === 'away'
      ? { lastActiveAt: minutesAgo(minutes) }
      : {};

const toUser = (seed: MemberSeed, index: number): User => {
  const [name, title, department, status, minutes, location, zone, joinedLabel, role, email] = seed;
  return {
    id: `u${FIRST_MEMBER_NUMBER + index}`,
    name,
    title,
    department,
    email: email ?? emailOf(name),
    status,
    timeZone: zone[0],
    timeZoneLabel: zone[1],
    location,
    role,
    joinedLabel,
    ...presenceTimes(status, minutes),
  };
};

export const MOCK_WORKSPACE_MEMBERS: readonly User[] = [
  ...PRODUCT_TEAM_SEEDS,
  ...BUSINESS_TEAM_SEEDS,
].map(toUser);
