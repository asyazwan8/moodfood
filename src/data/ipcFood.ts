import type { Daypart } from '../mood/classify';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠️  VERIFY BEFORE YOU DEMO THIS.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * These outlets are real IPC Shopping Centre tenants, but the list was
 * assembled from press coverage and third-party directories — NOT from IPC's
 * live store guide, which was not reachable when this was built.
 *
 * So: tenancies change, and floor locations here are best-known rather than
 * confirmed. Only Nando's carries a lot number, because that is the only one
 * with a source behind it. Everything else gives a floor and stops there,
 * because sending a visitor confidently to a lot that does not exist is worse
 * than sending them to the right floor.
 *
 * Before the demo, check every row against ipc.com.my/store-guide, fill in the
 * real `lot` values, and delete anything that has moved out. This is one flat
 * array on purpose — it should be a five-minute job.
 */

export type Outlet = {
  id: string;
  name: string;
  /** Floor. Keep it honest — a floor you are sure of beats a lot you are not. */
  where: string;
  /** Only set this where you have actually confirmed the unit number. */
  lot?: string;
  cuisine: string;
  /** The specific thing to order. Specificity is what makes this feel human. */
  dish: string;
  /** Why this, for this mood. Spoken in the kiosk's voice. */
  why: string;
  /** Matched against the current mood's `craves`. See src/mood/moods.ts. */
  craves: string[];
  dayparts: Daypart[];
};

const ALL_DAY: Daypart[] = ['morning', 'afternoon', 'evening', 'latenight'];
const MEALS: Daypart[] = ['afternoon', 'evening'];

export const OUTLETS: Outlet[] = [
  {
    id: 'nandos',
    name: "Nando's",
    where: 'Ground Floor',
    lot: 'G.19',
    cuisine: 'Flame-grilled peri-peri',
    dish: 'Quarter chicken, hot. Not medium. Hot.',
    why: 'Grilled over actual flame, and the heat gives that feeling somewhere to go.',
    craves: ['grilled', 'bold', 'spicy', 'hearty'],
    dayparts: MEALS,
  },
  {
    id: 'boat-noodle',
    name: 'Boat Noodle',
    where: 'Ground Floor',
    cuisine: 'Thai street food',
    dish: 'A few of the little bowls. Nobody stops at one.',
    why: 'Tiny bowls of something fierce and sour. Ordering five feels like a small victory.',
    craves: ['spicy', 'bold', 'warm-broth', 'adventurous'],
    dayparts: MEALS,
  },
  {
    id: 'absolute-thai',
    name: 'Absolute Thai',
    where: 'Ground Floor',
    cuisine: 'Thai',
    dish: 'Tom yum, and a plate of something fried to share.',
    why: 'Sour, hot and loud. It wakes a table up.',
    craves: ['spicy', 'bold', 'shareable', 'warm-broth'],
    dayparts: MEALS,
  },
  {
    id: 'ichiban-ramen',
    name: 'Ichiban Ramen',
    where: 'Ground Floor',
    cuisine: 'Japanese ramen',
    dish: 'A bowl of shoyu ramen, extra egg.',
    why: 'Hot broth does something to a bad afternoon that no salad can.',
    craves: ['warm-broth', 'comforting', 'hearty'],
    dayparts: MEALS,
  },
  {
    id: 'noodle-king',
    name: 'Noodle King House',
    where: 'Ground Floor',
    cuisine: 'Noodles',
    dish: 'Whatever comes in the biggest bowl.',
    why: 'Uncomplicated, hot, and it arrives fast. Sometimes that is the whole brief.',
    craves: ['warm-broth', 'comforting', 'hearty', 'quick'],
    dayparts: MEALS,
  },
  {
    id: 'paradise-dynasty',
    name: 'Paradise Dynasty',
    where: 'Ground Floor',
    cuisine: 'Chinese',
    dish: 'The rainbow xiao long bao. Yes, all eight colours.',
    why: 'Food that arrives looking like an occasion. Good day deserves a good table.',
    craves: ['celebratory', 'shareable', 'classic'],
    dayparts: MEALS,
  },
  {
    id: 'hana',
    name: 'Hana Japanese Dining',
    where: 'Ground Floor',
    cuisine: 'Japanese',
    dish: 'Sit at the counter and let the chef decide.',
    why: 'Quiet, careful, unhurried. The opposite of whatever today has been.',
    craves: ['gentle', 'celebratory', 'adventurous'],
    dayparts: ['evening'],
  },
  {
    id: 'canton-boy',
    name: 'Canton Boy',
    where: 'Ground Floor',
    cuisine: 'Modern Cantonese',
    dish: 'Dim sum for the table, and keep it coming.',
    why: 'Built for sharing and a bit of noise. Do not eat this one alone.',
    craves: ['shareable', 'celebratory', 'bold', 'new'],
    dayparts: MEALS,
  },
  {
    id: 'kpop-madang',
    name: 'KPOP Madang',
    where: 'Ground Floor',
    cuisine: 'Korean',
    dish: 'Army stew, and the banchan that keeps refilling.',
    why: 'Bubbling, red, endless. Exactly the right amount of too much.',
    craves: ['spicy', 'bold', 'shareable', 'new'],
    dayparts: MEALS,
  },
  {
    id: 'taste-of-medan',
    name: 'Taste of Medan',
    where: 'Ground Floor',
    cuisine: 'Indonesian',
    dish: 'Mee Aceh, if you are feeling brave.',
    why: 'Flavours most people here have not had before. Good day to fix that.',
    craves: ['adventurous', 'hearty', 'spicy', 'new'],
    dayparts: MEALS,
  },
  {
    id: 'bababoy',
    name: 'BabaBoy',
    where: 'Ground Floor',
    cuisine: 'Nyonya',
    dish: 'Something with a proper Peranakan gravy on it.',
    why: 'Old recipes, slow flavours. It tastes like someone put time into it.',
    craves: ['adventurous', 'new', 'bold', 'comforting'],
    dayparts: MEALS,
  },
  {
    id: 'manhattan-fish',
    name: 'The Manhattan Fish Market',
    where: 'Ground Floor',
    cuisine: 'Seafood',
    dish: 'The flaming garlic prawns. For the fire, obviously.',
    why: 'They set it on fire at your table. That is the entire recommendation.',
    craves: ['shareable', 'fun', 'hearty', 'celebratory'],
    dayparts: MEALS,
  },
  {
    id: 'ikea',
    name: 'IKEA Restaurant & Café',
    where: 'IKEA Damansara, next door',
    cuisine: 'Swedish',
    dish: 'Meatballs, mash, lingonberry. Do not overthink it.',
    why: 'The most reliable plate of food in this entire postcode. Cheap, warm, always there.',
    craves: ['comforting', 'classic', 'hearty'],
    dayparts: ALL_DAY,
  },
  {
    id: 'sushi-king',
    name: 'Sushi King',
    where: 'Ground Floor',
    cuisine: 'Japanese',
    dish: 'Sit at the belt and take whatever looks good.',
    why: 'No menu, no decisions. Plates come to you. Low effort, high reward.',
    craves: ['quick', 'classic', 'fun'],
    dayparts: MEALS,
  },
  {
    id: 'empire-sushi',
    name: 'Empire Sushi',
    where: 'Ground Floor',
    cuisine: 'Japanese kiosk',
    dish: 'A box of something to eat standing up.',
    why: 'Fast, cold, clean. In and out in ten minutes.',
    craves: ['quick', 'shareable', 'fun'],
    dayparts: ALL_DAY,
  },
  {
    id: 'aw',
    name: 'A&W',
    where: 'Ground Floor',
    cuisine: 'American',
    dish: 'Root beer float. The waffle is not optional.',
    why: 'This one is pure nostalgia. It is not clever food and it is not trying to be.',
    craves: ['comforting', 'sweet', 'classic', 'fun'],
    dayparts: ALL_DAY,
  },
  {
    id: 'pezzo',
    name: 'Pezzo Pizza',
    where: 'Ground Floor',
    cuisine: 'Pizza',
    dish: 'One slice. Maybe two. Eat it walking.',
    why: 'Pizza by the slice solves a surprising number of problems.',
    craves: ['quick', 'shareable', 'fun'],
    dayparts: ALL_DAY,
  },
  {
    id: 'mr-vegan',
    name: 'Mr Vegan',
    where: 'Ground Floor',
    cuisine: 'Plant-based',
    dish: 'Something green that still tastes like dinner.',
    why: 'Light, clean, no heaviness afterwards. Your body will notice.',
    craves: ['gentle', 'new', 'comforting'],
    dayparts: MEALS,
  },
  {
    id: 'sandwich-box',
    name: 'Sandwich Box',
    where: 'Ground Floor',
    cuisine: 'Sandwiches',
    dish: 'A sandwich, made properly, eaten slowly.',
    why: 'No fuss. Sit down, eat it, feel like a person again.',
    craves: ['quick', 'gentle', 'classic'],
    dayparts: ['morning', 'afternoon'],
  },
  {
    id: 'dome',
    name: 'Dôme Café',
    where: 'Ground Floor',
    cuisine: 'Café',
    dish: 'A flat white and the good chair by the window.',
    why: 'Sit down properly. Twenty minutes of not being needed by anyone.',
    craves: ['caffeine', 'gentle', 'comforting', 'classic'],
    dayparts: ALL_DAY,
  },
  {
    id: 'starbucks',
    name: 'Starbucks',
    where: 'Ground Floor',
    cuisine: 'Coffee',
    dish: 'Whatever you always get. Today is not the day to experiment.',
    why: 'Familiar, warm, and you already know exactly how it will taste.',
    craves: ['caffeine', 'quick', 'gentle'],
    dayparts: ALL_DAY,
  },
  {
    id: 'bread-history',
    name: 'Bread History',
    where: 'Ground Floor',
    cuisine: 'Bakery',
    dish: 'Something soft, still warm, eaten before you leave the shop.',
    why: 'Warm bread is an unreasonably effective mood fix.',
    craves: ['sweet', 'quick', 'comforting'],
    dayparts: ALL_DAY,
  },
  {
    id: 'bananabro',
    name: 'BananaBro',
    where: 'Ground Floor',
    cuisine: 'Desserts',
    dish: 'Banana, fried, absolutely covered in things.',
    why: 'Ridiculous and joyful. Nobody eats this looking miserable.',
    craves: ['sweet', 'fun', 'quick', 'new'],
    dayparts: ALL_DAY,
  },
  {
    id: 'famous-amos',
    name: 'Famous Amos',
    where: 'Ground Floor',
    cuisine: 'Cookies',
    dish: 'A small bag. Be honest — a medium bag.',
    why: 'The smell alone does half the work before you even pay.',
    craves: ['sweet', 'quick', 'fun'],
    dayparts: ALL_DAY,
  },
  {
    id: 'familymart',
    name: 'FamilyMart',
    where: 'Ground Floor',
    cuisine: 'Convenience',
    dish: 'A soft serve and something warm from the counter.',
    why: 'Two minutes, small money, and it genuinely helps. No notes.',
    craves: ['quick', 'sweet', 'caffeine'],
    dayparts: ALL_DAY,
  },
];
