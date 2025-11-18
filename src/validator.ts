import { MSGraphConfig, BookingRequest } from "./types";

/**
 * Validator class for input validation
 */
export class Validator {
  /**
   * Validate Microsoft Graph configuration
   */
  static validateConfig(config: MSGraphConfig): void {
    if (!config.clientId || config.clientId.trim() === '') {
      throw new Error('clientId is required and cannot be empty');
    }

    if (!config.clientSecret || config.clientSecret.trim() === '') {
      throw new Error('clientSecret is required and cannot be empty');
    }

    if (!config.tenantId || config.tenantId.trim() === '') {
      throw new Error('tenantId is required and cannot be empty');
    }

    // Validate GUID format
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!guidRegex.test(config.clientId)) {
      throw new Error('clientId must be a valid GUID');
    }

    if (!guidRegex.test(config.tenantId)) {
      throw new Error('tenantId must be a valid GUID');
    }

    // Validate working hours if provided
    if (config.workingHours) {
      const { start, end, interval } = config.workingHours;
      
      if (start < 0 || start > 23) {
        throw new Error('workingHours.start must be between 0 and 23');
      }

      if (end < 0 || end > 23) {
        throw new Error('workingHours.end must be between 0 and 23');
      }

      if (start >= end) {
        throw new Error('workingHours.start must be less than workingHours.end');
      }

      if (interval <= 0 || interval > 1440) {
        throw new Error('workingHours.interval must be between 1 and 1440 minutes');
      }
    }
  }

  /**
   * Validate email address format
   */
  static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !emailRegex.test(email)) {
      throw new Error(`Invalid email address: ${email}`);
    }
  }

  /**
   * Validate date format (YYYY-MM-DD)
   */
  static validateDate(date: string): void {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    if (!dateRegex.test(date)) {
      throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD`);
    }

    const parsedDate = new Date(date);
    
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date: ${date}`);
    }
  }

  /**
   * Validate time format (HH:mm)
   */
  static validateTime(time: string): void {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!timeRegex.test(time)) {
      throw new Error(`Invalid time format: ${time}. Expected HH:mm (24-hour format)`);
    }
  }

  /**
   * Validate date range
   */
  static validateDateRange(startDate: string, endDate: string): void {
    this.validateDate(startDate);
    this.validateDate(endDate);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw new Error('startDate must be before or equal to endDate');
    }

    // Warn if range is too large (more than 90 days)
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 90) {
      console.warn(`Warning: Date range is ${diffDays} days. Large ranges may affect performance.`);
    }
  }

  /**
   * Validate booking request
   */
  static validateBookingRequest(booking: BookingRequest): void {
    // Validate dates and times
    this.validateDate(booking.date);
    this.validateTime(booking.time);

    // Validate emails
    this.validateEmail(booking.teamMemberEmail);
    this.validateEmail(booking.leadEmail);

    // Validate duration
    if (booking.duration <= 0 || booking.duration > 1440) {
      throw new Error('duration must be between 1 and 1440 minutes');
    }

    // Validate names
    if (!booking.leadName || booking.leadName.trim() === '') {
      throw new Error('leadName is required');
    }

    if (!booking.subject || booking.subject.trim() === '') {
      throw new Error('subject is required');
    }

    // Validate booking is not in the past
    const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
    const now = new Date();
    
    if (bookingDateTime < now) {
      throw new Error('Cannot book meetings in the past');
    }
  }
}
