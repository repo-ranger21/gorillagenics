/**
 * Week Fetcher - NFL Week Detection and Auto-Rollover Logic
 */

// NFL Season Start Date (2025 Season)
export const NFL_SEASON_START = new Date('2025-09-04T20:15:00.000Z'); // Thursday Night Football Week 1

/**
 * Determine current NFL week based on date
 * @param {Date} currentDate - Current date
 * @returns {number} NFL week number (1-18)
 */
export function getCurrentNFLWeek(currentDate = new Date()) {
  const seasonStart = NFL_SEASON_START;
  const diffTime = currentDate - seasonStart;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Each NFL week runs from Tuesday to Monday
  // Week transitions happen on Tuesday at 12:00 AM ET
  const weekNumber = Math.max(1, Math.min(18, Math.floor(diffDays / 7) + 1));
  
  // Handle Tuesday rollover (if it's Tuesday or later, advance week)
  const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 2 = Tuesday
  if (dayOfWeek >= 2) { // Tuesday (2) or later
    return Math.min(18, weekNumber + 1);
  }
  
  return weekNumber;
}

/**
 * Check if it's time for weekly rollover (Tuesday 12:00 AM ET)
 * @param {Date} currentDate - Current date
 * @returns {boolean} True if rollover should happen
 */
export function shouldRollover(currentDate = new Date()) {
  const dayOfWeek = currentDate.getDay();
  const hour = currentDate.getHours();
  
  // Tuesday (2) at midnight or later
  return dayOfWeek === 2 && hour >= 0;
}

/**
 * Get stored week from localStorage
 * @returns {Object} Stored week data
 */
export function getStoredWeek() {
  try {
    const stored = localStorage.getItem('guerillagenics_current_week');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading stored week:', error);
    return null;
  }
}

/**
 * Store current week in localStorage
 * @param {number} weekNumber - Week number to store
 * @param {Date} fetchDate - Date when data was fetched
 */
export function storeCurrentWeek(weekNumber, fetchDate = new Date()) {
  try {
    const data = {
      week: weekNumber,
      lastFetched: fetchDate.toISOString(),
      lastCheck: fetchDate.toISOString()
    };
    localStorage.setItem('guerillagenics_current_week', JSON.stringify(data));
  } catch (error) {
    console.error('Error storing week:', error);
  }
}

/**
 * Check if we need to fetch new week data
 * @returns {boolean} True if data needs refresh
 */
export function needsDataRefresh() {
  const stored = getStoredWeek();
  if (!stored) return true;
  
  const currentWeek = getCurrentNFLWeek();
  const storedWeek = stored.week;
  
  // If week has changed, refresh
  if (currentWeek !== storedWeek) return true;
  
  // Check if it's been more than 1 hour since last check
  const lastCheck = new Date(stored.lastCheck);
  const hoursSinceCheck = (Date.now() - lastCheck.getTime()) / (1000 * 60 * 60);
  
  return hoursSinceCheck > 1;
}

/**
 * Mock NFL Schedule API response for future weeks
 * @param {number} weekNumber - Week to fetch
 * @returns {Promise<Array>} Mock schedule data
 */
export async function fetchNFLSchedule(weekNumber) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For weeks beyond 1, return mock data
  if (weekNumber > 1) {
    return generateMockSchedule(weekNumber);
  }
  
  // Week 1 is handled by pre-loaded data
  return [];
}

/**
 * Generate mock schedule for testing
 * @param {number} weekNumber - Week number
 * @returns {Array} Mock games
 */
function generateMockSchedule(weekNumber) {
  const teams = [
    'Dallas Cowboys', 'New York Giants', 'Green Bay Packers', 'Chicago Bears',
    'Seattle Seahawks', 'Los Angeles Chargers', 'Baltimore Ravens', 'Cleveland Browns'
  ];
  
  const games = [];
  for (let i = 0; i < teams.length; i += 2) {
    games.push({
      id: `week${weekNumber}-game${i/2 + 1}`,
      week: weekNumber,
      away: teams[i],
      home: teams[i + 1],
      date: new Date(Date.now() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '1:00 PM',
      spread: (Math.random() - 0.5) * 14,
      total: Math.floor(Math.random() * 10) + 42
    });
  }
  
  return games;
}

/**
 * Get week display name
 * @param {number} weekNumber - Week number
 * @returns {string} Display name
 */
export function getWeekDisplayName(weekNumber) {
  if (weekNumber >= 19) return 'Playoffs';
  return `Week ${weekNumber}`;
}

/**
 * Format date for display
 * @param {string} dateStr - Date string
 * @returns {string} Formatted date
 */
export function formatGameDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
}

export default {
  getCurrentNFLWeek,
  shouldRollover,
  getStoredWeek,
  storeCurrentWeek,
  needsDataRefresh,
  fetchNFLSchedule,
  getWeekDisplayName,
  formatGameDate
};