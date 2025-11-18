import moment from "moment";
import { CalendarAvailability, TeamMember, TeamAvailability } from "./types";
import { ICalendarService } from "./calendar";
import { ILogger, SilentLogger } from "./logger";
import { Validator } from "./validator";

/**
 * Interface for team operations
 */
export interface ITeamService {
  setMembers(members: TeamMember[]): void;
  getMembers(): TeamMember[];
  getTeamAvailability(startDate: string, endDate: string): Promise<TeamAvailability>;
  getConsolidatedAvailability(startDate: string, endDate: string): Promise<CalendarAvailability[]>;
}

/**
 * Team Service
 * Handles team-related operations
 * 
 * Single Responsibility: Only handles team operations
 * Dependency Inversion: Depends on ICalendarService abstraction
 */
export class TeamService implements ITeamService {
  private teamMembers: TeamMember[] = [];
  private logger: ILogger;

  constructor(
    private calendarService: ICalendarService,
    logger?: ILogger
  ) {
    this.logger = logger || new SilentLogger();
    this.logger.debug('Team Service initialized');
  }

  /**
   * Set team members
   */
  setMembers(members: TeamMember[]): void {
    if (!Array.isArray(members)) {
      throw new Error('Team members must be an array');
    }

    // Validate each member
    members.forEach((member, index) => {
      if (!member.email) {
        throw new Error(`Team member at index ${index} is missing email`);
      }
      Validator.validateEmail(member.email);
    });

    this.teamMembers = members;
    this.logger.info(`Team members set: ${members.length} members`);
  }

  /**
   * Get team members
   */
  getMembers(): TeamMember[] {
    return [...this.teamMembers]; // Return copy to prevent mutation
  }

  /**
   * Get availability for all team members
   */
  async getTeamAvailability(
    startDate: string,
    endDate: string
  ): Promise<TeamAvailability> {
    Validator.validateDateRange(startDate, endDate);

    if (this.teamMembers.length === 0) {
      this.logger.warn('No team members configured');
      return {};
    }

    this.logger.info(
      `Fetching availability for ${this.teamMembers.length} team members`
    );

    const teamAvailability: TeamAvailability = {};

    // Fetch availability for each member
    for (const member of this.teamMembers) {
      try {
        const availability = await this.calendarService.getAvailability(
          member.email,
          startDate,
          endDate
        );
        teamAvailability[member.email] = availability;
        this.logger.debug(`Availability fetched for ${member.email}`);
      } catch (error: any) {
        this.logger.error(`Error getting availability for ${member.email}:`, error);
        // Continue with other members even if one fails
        teamAvailability[member.email] = [];
      }
    }

    return teamAvailability;
  }

  /**
   * Get consolidated availability (any member available)
   */
  async getConsolidatedAvailability(
    startDate: string,
    endDate: string
  ): Promise<CalendarAvailability[]> {
    const teamAvailability = await this.getTeamAvailability(startDate, endDate);
    
    return this.consolidateAvailability(teamAvailability, startDate, endDate);
  }

  /**
   * Consolidate team availability
   */
  private consolidateAvailability(
    teamAvailability: TeamAvailability,
    startDate: string,
    endDate: string
  ): CalendarAvailability[] {
    const consolidated: CalendarAvailability[] = [];
    let currentDate = moment(startDate);
    const endMoment = moment(endDate);

    while (currentDate.isSameOrBefore(endMoment)) {
      if (currentDate.day() !== 0 && currentDate.day() !== 6) {
        const dateStr = currentDate.format("YYYY-MM-DD");
        const allTimeSlots: string[] = [];
        let hasAvailability = false;

        // Collect all available time slots from all members
        Object.values(teamAvailability).forEach((memberAvailability) => {
          const dayAvailability = memberAvailability.find(
            (day) => day.date === dateStr
          );
          
          if (dayAvailability?.available) {
            allTimeSlots.push(...dayAvailability.timeSlots);
            hasAvailability = true;
          }
        });

        // Remove duplicates and sort
        const uniqueTimeSlots = [...new Set(allTimeSlots)].sort();

        consolidated.push({
          date: dateStr,
          available: hasAvailability,
          timeSlots: uniqueTimeSlots,
        });
      }

      currentDate.add(1, "day");
    }

    this.logger.debug(`Consolidated availability for ${consolidated.length} days`);
    return consolidated;
  }
}
