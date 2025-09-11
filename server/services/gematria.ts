// =========================
// GuerillaGenics — Gematria Meta-Layer (TypeScript)
// =========================

// Letter value mappings for different cipher systems
const LETTERS_VEC: Record<string, number> = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
  'J': 10, 'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15, 'P': 16, 'Q': 17,
  'R': 18, 'S': 19, 'T': 20, 'U': 21, 'V': 22, 'W': 23, 'X': 24, 'Y': 25, 'Z': 26
};

const REVERSE_VEC: Record<string, number> = {
  'A': 26, 'B': 25, 'C': 24, 'D': 23, 'E': 22, 'F': 21, 'G': 20, 'H': 19, 'I': 18,
  'J': 17, 'K': 16, 'L': 15, 'M': 14, 'N': 13, 'O': 12, 'P': 11, 'Q': 10,
  'R': 9, 'S': 8, 'T': 7, 'U': 6, 'V': 5, 'W': 4, 'X': 3, 'Y': 2, 'Z': 1
};

// Full Reduction (Pythagorean): 1..9 repeating
const REDUCTION_VALS = [1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8];
const REDUCTION_VEC: Record<string, number> = Object.fromEntries(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter, index) => [letter, REDUCTION_VALS[index]])
);

// Reverse Reduction: reverse alphabet with 1..9 repeating
const REV_REDUCTION_VALS = [1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8];
const REV_REDUCTION_VEC: Record<string, number> = Object.fromEntries(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reverse().map((letter, index) => [letter, REV_REDUCTION_VALS[index]])
);

// Ritual numbers catalog for proximity analysis
const RITUAL_NUMBERS = [7, 9, 11, 13, 22, 27, 33, 38, 41, 44, 55, 66, 77, 88, 99, 118];

// ---- Core Cipher Functions ----

/**
 * Clean text to contain only A-Z letters
 */
function cleanLetters(text: string): string {
  return text.toUpperCase().replace(/[^A-Z]/g, '');
}

/**
 * Calculate gematria sum using specified cipher mapping
 */
function gemSum(text: string, mapping: Record<string, number>): number {
  const cleaned = cleanLetters(text);
  if (cleaned.length === 0) return 0;
  
  return cleaned.split('').reduce((sum, letter) => {
    return sum + (mapping[letter] || 0);
  }, 0);
}

/**
 * Calculate all four gematria cipher values for a given text
 */
export function calculateGematriaCiphers(text: string): GematriaCiphers {
  return {
    ordinal: gemSum(text, LETTERS_VEC),
    reduction: gemSum(text, REDUCTION_VEC),
    reverse: gemSum(text, REVERSE_VEC),
    reverseReduction: gemSum(text, REV_REDUCTION_VEC)
  };
}

// ---- Date Numerology Functions ----

/**
 * Reduce number to single digit except for master numbers 11, 22, 33
 */
function reduceToDigit(n: number): number {
  if ([11, 22, 33].includes(n)) return n;
  
  while (n >= 10 && ![11, 22, 33].includes(n)) {
    n = n.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return n;
}

/**
 * Calculate date numerology for a given date
 */
export function calculateDateNumerology(date: Date): DateNumerology {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const ymdSum = year + month + day;
  const ymdReduced = reduceToDigit(ymdSum);
  
  // Calculate day of year (1-365/366)
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Get weekday (1 = Monday, 7 = Sunday)
  const weekdayNum = date.getDay() === 0 ? 7 : date.getDay();
  
  return {
    year,
    month,
    day,
    ymdSum,
    ymdReduced,
    dayOfYear,
    weekdayNum,
    isMaster: [11, 22, 33].includes(ymdReduced)
  };
}

// ---- Ritual Number Analysis ----

/**
 * Find closest distance to ritual numbers catalog
 */
function findClosestRitualDistance(value: number): { distance: number; isHit: boolean } {
  const distances = RITUAL_NUMBERS.map(ritual => Math.abs(value - ritual));
  const minDistance = Math.min(...distances);
  return {
    distance: minDistance,
    isHit: minDistance === 0
  };
}

// ---- Alignment Features ----

/**
 * Calculate alignment features between name gematria and date numerology
 */
export function calculateAlignmentFeatures(
  nameGematria: GematriaCiphers,
  dateNumerology: DateNumerology
): AlignmentFeatures {
  // Check for exact matches between any cipher and date reduced value
  const exactMatch = [
    nameGematria.ordinal,
    nameGematria.reduction,
    nameGematria.reverse,
    nameGematria.reverseReduction
  ].some(value => value === dateNumerology.ymdReduced);
  
  // Find minimum distance to ritual numbers across all ciphers
  const allCipherValues = [
    nameGematria.ordinal,
    nameGematria.reduction,
    nameGematria.reverse,
    nameGematria.reverseReduction
  ];
  
  const ritualAnalysis = allCipherValues.map(findClosestRitualDistance);
  const minRitualDistance = Math.min(...ritualAnalysis.map(r => r.distance));
  const hasRitualHit = ritualAnalysis.some(r => r.isHit);
  const ritualStrength = 1 / (1 + minRitualDistance); // Bounded (0,1]
  
  return {
    exactMatch,
    ritualProximity: minRitualDistance,
    ritualHit: hasRitualHit,
    ritualStrength
  };
}

// ---- Birthday Alignment ----

/**
 * Calculate birthday alignment features relative to game date
 */
export function calculateBirthdayAlignment(playerBirthday: Date, gameDate: Date): BirthdayAlignment {
  // Calculate if birthday falls on same month/day as game
  const bdayExact = (
    playerBirthday.getMonth() === gameDate.getMonth() &&
    playerBirthday.getDate() === gameDate.getDate()
  );
  
  // Calculate days difference for current year
  const currentYear = gameDate.getFullYear();
  const birthdayThisYear = new Date(currentYear, playerBirthday.getMonth(), playerBirthday.getDate());
  const diffDays = Math.floor((gameDate.getTime() - birthdayThisYear.getTime()) / (1000 * 60 * 60 * 24));
  
  // Check if within 3 days (birthday week)
  const bdayWeek = Math.abs(diffDays) <= 3;
  
  return {
    bdayExact,
    bdayWeek,
    bdayDiffDays: diffDays
  };
}

// ---- Composite Entity Scoring ----

/**
 * Calculate composite gematria score by combining player, team, and coach names
 */
export function calculateCompositeGematria(
  playerName: string,
  teamName: string,
  coachName: string
): GematriaCiphers {
  const player = calculateGematriaCiphers(playerName);
  const team = calculateGematriaCiphers(teamName);
  const coach = calculateGematriaCiphers(coachName);
  
  return {
    ordinal: player.ordinal + team.ordinal + coach.ordinal,
    reduction: player.reduction + team.reduction + coach.reduction,
    reverse: player.reverse + team.reverse + coach.reverse,
    reverseReduction: player.reverseReduction + team.reverseReduction + coach.reverseReduction
  };
}

// ---- GAS (Gematria Alignment Score) ----

/**
 * Compute overall Gematria Alignment Score (0-1)
 */
export function computeGAS(
  nameGematria: GematriaCiphers,
  dateNumerology: DateNumerology,
  alignmentFeatures: AlignmentFeatures,
  birthdayFeatures: BirthdayAlignment,
  weights = { exact: 0.35, ritual: 0.40, birthday: 0.20, master: 0.05 }
): number {
  const scaleRitual = 1 - Math.min(alignmentFeatures.ritualProximity / 10, 1); // 0..1
  
  const gas = 
    weights.exact * (alignmentFeatures.exactMatch ? 1 : 0) +
    weights.ritual * scaleRitual +
    weights.birthday * (0.7 * (birthdayFeatures.bdayWeek ? 1 : 0) + 0.3 * (birthdayFeatures.bdayExact ? 1 : 0)) +
    weights.master * (dateNumerology.isMaster ? 1 : 0);
  
  return Math.min(Math.max(gas, 0), 1);
}

// ---- Model Fusion ----

/**
 * Sigmoid function for probability transformation
 */
function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

/**
 * Logit function for inverse sigmoid
 */
function logit(p: number): number {
  const clipped = Math.min(Math.max(p, 0.0001), 0.9999); // Avoid division by zero
  return Math.log(clipped / (1 - clipped));
}

/**
 * Fuse BioBoost probability with Gematria signals
 */
export function fuseGematriaBioBoost(
  bioBoostProb: number,
  gas: number,
  birthdayFeatures: BirthdayAlignment,
  alignmentFeatures: AlignmentFeatures,
  weights = { w: 1.0, alpha: 0.35, beta: 0.20, gamma: 0.25 }
): GematriaFusionResult {
  const birthdayScore = 0.7 * (birthdayFeatures.bdayWeek ? 1 : 0) + 0.3 * (birthdayFeatures.bdayExact ? 1 : 0);
  
  const z = logit(bioBoostProb) * weights.w + 
           weights.alpha * gas + 
           weights.beta * birthdayScore + 
           weights.gamma * alignmentFeatures.ritualStrength;
  
  const finalProb = sigmoid(z);
  const edgeProb = finalProb - bioBoostProb;
  
  let confidence: 'ELITE' | 'STRONG' | 'MODERATE';
  if (Math.abs(edgeProb) >= 0.10) confidence = 'ELITE';
  else if (Math.abs(edgeProb) >= 0.05) confidence = 'STRONG';
  else confidence = 'MODERATE';
  
  return {
    finalProbability: finalProb,
    edgeProbability: edgeProb,
    confidence,
    z
  };
}

// ---- Type Definitions ----

export interface GematriaCiphers {
  ordinal: number;
  reduction: number;
  reverse: number;
  reverseReduction: number;
}

export interface DateNumerology {
  year: number;
  month: number;
  day: number;
  ymdSum: number;
  ymdReduced: number;
  dayOfYear: number;
  weekdayNum: number;
  isMaster: boolean;
}

export interface AlignmentFeatures {
  exactMatch: boolean;
  ritualProximity: number;
  ritualHit: boolean;
  ritualStrength: number;
}

export interface BirthdayAlignment {
  bdayExact: boolean;
  bdayWeek: boolean;
  bdayDiffDays: number;
}

export interface GematriaFusionResult {
  finalProbability: number;
  edgeProbability: number;
  confidence: 'ELITE' | 'STRONG' | 'MODERATE';
  z: number;
}

export interface GematriaPlayerAnalysis {
  nameGematria: GematriaCiphers;
  compositeGematria: GematriaCiphers;
  dateNumerology: DateNumerology;
  alignmentFeatures: AlignmentFeatures;
  birthdayAlignment: BirthdayAlignment;
  gas: number;
  fusionResult: GematriaFusionResult;
}