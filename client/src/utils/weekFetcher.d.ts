declare module "@/utils/weekFetcher" {
  export const NFL_SEASON_START: Date;
  export function getCurrentNFLWeek(currentDate?: Date): number;
  export function shouldRollover(currentDate?: Date): boolean;
  export function getStoredWeek(): { week: number } | null;
  export function formatGameDate(date: string): string;
  export function storeCurrentWeek(week: number): void;
  export function needsDataRefresh(): boolean;
  export function fetchNFLSchedule(week: number): Promise<any>;
  export function checkTuesdayRollover(): boolean;
  export function getWeekStatus(week: number): {
    isActive: boolean;
    nextRollover: Date | null;
    daysUntilRollover: number;
  };
}