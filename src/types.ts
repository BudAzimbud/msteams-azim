/**
 * Calendar availability interface
 */
export interface CalendarAvailability {
  date: string;
  available: boolean;
  timeSlots: string[];
}

/**
 * Team member interface
 */
export interface TeamMember {
  id: string;
  email: string;
  name: string;
  available?: boolean;
}

/**
 * Booking slot interface
 */
export interface BookingSlot {
  date: string;
  time: string;
  duration: number; // in minutes
  teamMemberEmail: string;
}

/**
 * Extended booking interface with lead information
 */
export interface BookingRequest extends BookingSlot {
  leadEmail: string;
  leadName: string;
  subject: string;
  description?: string;
}

/**
 * Microsoft Graph schedule response interface
 */
export interface GraphScheduleResponse {
  value: Array<{
    scheduleId: string;
    availabilityView: string[];
    freeBusyViewData: string[];
    workingHours?: {
      daysOfWeek: string[];
      startTime: string;
      endTime: string;
      timeZone: string;
    };
  }>;
}

/**
 * Microsoft Graph configuration
 */
export interface MSGraphConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  /**
   * Timezone to use for calendar operations
   * @default "Singapore Standard Time"
   */
  timeZone?: string;
  /**
   * Default working hours
   */
  workingHours?: {
    start: number; // Hour (0-23)
    end: number; // Hour (0-23)
    interval: number; // Minutes
  };
  /**
   * Enable verbose logging
   * @default false
   */
  verbose?: boolean;
}

/**
 * Team availability map
 */
export interface TeamAvailability {
  [memberEmail: string]: CalendarAvailability[];
}
