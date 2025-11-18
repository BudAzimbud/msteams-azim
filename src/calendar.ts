import { Client } from "@microsoft/microsoft-graph-client";
import moment from "moment";
import { CalendarAvailability, BookingRequest, TeamMember } from "./types";
import { IAuthProvider } from "./auth";
import { 
  PermissionError, 
  ResourceNotFoundError, 
  ValidationError 
} from "./errors";
import { ILogger, SilentLogger } from "./logger";
import { Validator } from "./validator";

/**
 * Interface for calendar operations
 */
export interface ICalendarService {
  getAvailability(
    userEmail: string,
    startDate: string,
    endDate: string
  ): Promise<CalendarAvailability[]>;

  bookMeeting(booking: BookingRequest): Promise<any>;
}

/**
 * Configuration for calendar service
 */
export interface CalendarServiceConfig {
  timeZone: string;
  workingHours: {
    start: number;
    end: number;
    interval: number;
  };
}

/**
 * Microsoft Graph Calendar Service
 * Handles calendar operations
 * 
 * Single Responsibility: Only handles calendar-related operations
 * Dependency Inversion: Depends on IAuthProvider abstraction
 */
export class CalendarService implements ICalendarService {
  private logger: ILogger;

  constructor(
    private authProvider: IAuthProvider,
    private config: CalendarServiceConfig,
    logger?: ILogger
  ) {
    this.logger = logger || new SilentLogger();
    this.logger.debug('Calendar Service initialized');
  }

  /**
   * Get calendar availability for a user
   */
  async getAvailability(
    userEmail: string,
    startDate: string,
    endDate: string
  ): Promise<CalendarAvailability[]> {
    // Validate inputs
    Validator.validateEmail(userEmail);
    Validator.validateDateRange(startDate, endDate);

    try {
      this.logger.info(
        `Fetching availability for ${userEmail} from ${startDate} to ${endDate}`
      );

      const client = await this.authProvider.getClient();

      const startDateTime = moment(startDate)
        .startOf("day")
        .format("YYYY-MM-DDTHH:mm:ss");

      const endDateTime = moment(endDate)
        .endOf("day")
        .format("YYYY-MM-DDTHH:mm:ss");

      const response = await this.fetchScheduleFromGraph(
        client,
        userEmail,
        startDateTime,
        endDateTime
      );

      const scheduleItems = response.value[0]?.scheduleItems || [];
      this.logger.debug(`Found ${scheduleItems.length} calendar events`);

      return this.generateAvailability(startDate, endDate, scheduleItems);
    } catch (error: any) {
      return this.handleCalendarError(error, userEmail, startDate, endDate);
    }
  }

  /**
   * Book a meeting
   */
  async bookMeeting(booking: BookingRequest): Promise<any> {
    // Validate booking
    Validator.validateBookingRequest(booking);

    try {
      this.logger.info(
        `Booking meeting for ${booking.leadEmail} with ${booking.teamMemberEmail}`
      );

      const client = await this.authProvider.getClient();

      const event = this.createEventObject(booking);

      const createdEvent = await client
        .api(`/users/${booking.teamMemberEmail}/events`)
        .header("Prefer", `outlook.timezone="${this.config.timeZone}"`)
        .post(event);

      this.logger.info(`Meeting booked successfully: ${createdEvent.id}`);

      return createdEvent;
    } catch (error: any) {
      this.logger.error('Failed to book meeting:', error);

      if (error.statusCode === 404) {
        throw new ResourceNotFoundError('User', booking.teamMemberEmail);
      } else if (error.statusCode === 403) {
        throw new PermissionError(
          'Insufficient permissions to create calendar events',
          ['Calendars.ReadWrite']
        );
      }

      throw new ValidationError(`Failed to book meeting: ${error.message}`);
    }
  }

  /**
   * Fetch schedule from Microsoft Graph
   */
  private async fetchScheduleFromGraph(
    client: Client,
    userEmail: string,
    startDateTime: string,
    endDateTime: string
  ): Promise<any> {
    try {
      return await client
        .api(`/users/${encodeURIComponent(userEmail)}/calendar/getSchedule`)
        .header("Prefer", `outlook.timezone="${this.config.timeZone}"`)
        .post({
          schedules: [userEmail],
          startTime: {
            dateTime: startDateTime,
            timeZone: this.config.timeZone,
          },
          endTime: {
            dateTime: endDateTime,
            timeZone: this.config.timeZone,
          },
          availabilityViewInterval: this.config.workingHours.interval,
        });
    } catch (error: any) {
      if (error.statusCode === 403) {
        throw new PermissionError(
          'Access denied to calendar endpoint',
          ['Calendars.Read', 'Calendars.ReadWrite']
        );
      }
      throw error;
    }
  }

  /**
   * Generate availability for date range
   */
  private generateAvailability(
    startDate: string,
    endDate: string,
    scheduleItems: any[]
  ): CalendarAvailability[] {
    const availability: CalendarAvailability[] = [];
    let currentDate = moment(startDate);
    const endMoment = moment(endDate);

    while (currentDate.isSameOrBefore(endMoment, "day")) {
      // Skip weekends
      if (currentDate.day() !== 0 && currentDate.day() !== 6) {
        const dayAvailability = this.generateDayAvailability(
          currentDate.format("YYYY-MM-DD"),
          scheduleItems
        );
        availability.push(dayAvailability);
      }
      currentDate.add(1, "day");
    }

    this.logger.debug(`Generated availability for ${availability.length} days`);
    return availability;
  }

  /**
   * Generate availability for a single day
   */
  private generateDayAvailability(
    date: string,
    scheduleItems: any[]
  ): CalendarAvailability {
    const dayEvents = scheduleItems.filter((item) => {
      const eventStart = moment(item.start.dateTime);
      return eventStart.format("YYYY-MM-DD") === date;
    });

    const blockedSlots = this.getBlockedSlots(dayEvents);
    const timeSlots = this.generateTimeSlots(blockedSlots);

    return {
      date,
      available: timeSlots.length > 0,
      timeSlots,
    };
  }

  /**
   * Get blocked time slots from events
   */
  private getBlockedSlots(events: any[]): Set<string> {
    const blockedSlots = new Set<string>();

    events.forEach((event) => {
      const eventStart = moment(event.start.dateTime);
      const eventEnd = moment(event.end.dateTime);

      let currentSlot = eventStart.clone().startOf('hour');

      while (currentSlot.isBefore(eventEnd)) {
        blockedSlots.add(currentSlot.format("HH:mm"));
        currentSlot.add(this.config.workingHours.interval, "minutes");
      }
    });

    return blockedSlots;
  }

  /**
   * Generate available time slots
   */
  private generateTimeSlots(blockedSlots: Set<string>): string[] {
    const timeSlots: string[] = [];
    const { start, end } = this.config.workingHours;

    for (let hour = start; hour <= end; hour++) {
      const timeSlot = `${hour.toString().padStart(2, "0")}:00`;
      
      if (!blockedSlots.has(timeSlot)) {
        timeSlots.push(timeSlot);
      }
    }

    return timeSlots;
  }

  /**
   * Create event object for booking
   */
  private createEventObject(booking: BookingRequest): any {
    const [hours, minutes] = booking.time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + booking.duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;

    return {
      subject: booking.subject,
      body: {
        contentType: "HTML" as const,
        content: booking.description || `Meeting with ${booking.leadName}`,
      },
      start: {
        dateTime: `${booking.date}T${booking.time}:00`,
        timeZone: this.config.timeZone,
      },
      end: {
        dateTime: `${booking.date}T${endHours
          .toString()
          .padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}:00`,
        timeZone: this.config.timeZone,
      },
      attendees: [
        {
          emailAddress: {
            address: booking.leadEmail,
            name: booking.leadName,
          },
          type: "required" as const,
        },
        {
          emailAddress: {
            address: booking.teamMemberEmail,
            name: booking.teamMemberEmail,
          },
          type: "required" as const,
        },
      ],
      isOnlineMeeting: true,
      onlineMeetingProvider: "teamsForBusiness" as const,
    };
  }

  /**
   * Handle calendar errors with fallback
   */
  private handleCalendarError(
    error: any,
    userEmail: string,
    startDate: string,
    endDate: string
  ): CalendarAvailability[] {
    this.logger.error('Calendar error:', error);

    if (error instanceof PermissionError || error instanceof ResourceNotFoundError) {
      throw error;
    }

    if (error.statusCode === 404) {
      throw new ResourceNotFoundError('User', userEmail);
    }

    // Return default availability as fallback
    this.logger.warn('Falling back to default availability');
    return this.getDefaultAvailability(startDate, endDate);
  }

  /**
   * Get default availability (fallback)
   */
  private getDefaultAvailability(
    startDate: string,
    endDate: string
  ): CalendarAvailability[] {
    const availability: CalendarAvailability[] = [];
    let currentDate = moment(startDate);
    const endMoment = moment(endDate);

    while (currentDate.isSameOrBefore(endMoment)) {
      if (currentDate.day() !== 0 && currentDate.day() !== 6) {
        availability.push({
          date: currentDate.format("YYYY-MM-DD"),
          available: true,
          timeSlots: [
            "09:00", "10:00", "11:00", "13:00",
            "14:00", "15:00", "16:00", "17:00",
          ],
        });
      }
      currentDate.add(1, "day");
    }

    return availability;
  }
}
