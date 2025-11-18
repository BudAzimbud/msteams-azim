import {
  CalendarAvailability,
  TeamMember,
  BookingRequest,
  MSGraphConfig,
  TeamAvailability,
} from "./types";
import { MSALAuthProvider, IAuthProvider } from "./auth";
import { CalendarService, ICalendarService, CalendarServiceConfig } from "./calendar";
import { TeamService, ITeamService } from "./team";
import { Logger, LogLevel, ILogger, SilentLogger, ConsoleLogger } from "./logger";
import { Validator } from "./validator";
import { ConfigurationError } from "./errors";

/**
 * Microsoft Graph Calendar Service (Facade Pattern)
 * 
 * This is the main entry point for the library.
 * It provides a simple interface that delegates to specialized services.
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Each service handles one concern
 * - Open/Closed: Extensible through interfaces
 * - Liskov Substitution: Services can be replaced with compatible implementations
 * - Interface Segregation: Small, focused interfaces
 * - Dependency Inversion: Depends on abstractions (interfaces), not implementations
 * 
 * @example
 * ```typescript
 * const service = new MSGraphService({
 *   clientId: 'xxx',
 *   clientSecret: 'xxx',
 *   tenantId: 'xxx'
 * });
 * 
 * const availability = await service.getCalendarAvailability(
 *   'user@example.com',
 *   '2024-01-01',
 *   '2024-01-07'
 * );
 * ```
 */
export class MSGraphService {
  private authProvider: IAuthProvider;
  private calendarService: ICalendarService;
  private teamService: ITeamService;
  private logger: ILogger;
  private config: Required<MSGraphConfig>;

  constructor(config: MSGraphConfig) {
    // Validate configuration
    Validator.validateConfig(config);

    // Set defaults
    this.config = {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      tenantId: config.tenantId,
      timeZone: config.timeZone || "Singapore Standard Time",
      workingHours: config.workingHours || {
        start: 9,
        end: 17,
        interval: 60,
      },
      verbose: config.verbose || false,
    };

    // Initialize logger
    this.logger = this.config.verbose
      ? new Logger(LogLevel.DEBUG)
      : new SilentLogger();

    this.logger.info('Initializing Microsoft Graph Service...');

    try {
      // Initialize auth provider (Dependency Injection)
      this.authProvider = new MSALAuthProvider(
        {
          clientId: this.config.clientId,
          clientSecret: this.config.clientSecret,
          tenantId: this.config.tenantId,
        },
        this.logger
      );

      // Initialize calendar service
      const calendarConfig: CalendarServiceConfig = {
        timeZone: this.config.timeZone,
        workingHours: this.config.workingHours,
      };

      this.calendarService = new CalendarService(
        this.authProvider,
        calendarConfig,
        this.logger
      );

      // Initialize team service
      this.teamService = new TeamService(this.calendarService, this.logger);

      this.logger.info('Microsoft Graph Service initialized successfully');
    } catch (error: any) {
      this.logger.error('Failed to initialize service:', error);
      throw new ConfigurationError(
        `Failed to initialize Microsoft Graph Service: ${error.message}`
      );
    }
  }

  /**
   * Enable or disable verbose logging
   */
  setVerbose(verbose: boolean): void {
    this.config.verbose = verbose;
    this.logger = verbose ? new Logger(LogLevel.DEBUG) : new SilentLogger();
    this.logger.info(`Verbose logging ${verbose ? 'enabled' : 'disabled'}`);
  }

  /**
   * Set custom logger
   */
  setLogger(logger: ILogger): void {
    this.logger = logger;
  }

  /**
   * Set team members
   */
  setTeamMembers(members: TeamMember[]): void {
    this.teamService.setMembers(members);
  }

  /**
   * Get team members
   */
  getTeamMembers(): TeamMember[] {
    return this.teamService.getMembers();
  }

  /**
   * Test Microsoft Graph API access
   */
  async testGraphAccess(): Promise<boolean> {
    try {
      this.logger.info('Testing Microsoft Graph API access...');
      return await this.authProvider.testConnection();
    } catch (error: any) {
      this.logger.error('Graph API test failed:', error);
      return false;
    }
  }

  /**
   * Get calendar availability for a specific user
   * 
   * @param userEmail - Email address of the user
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @returns Array of calendar availability for each day
   * 
   * @throws {ValidationError} If input validation fails
   * @throws {AuthenticationError} If authentication fails
   * @throws {PermissionError} If insufficient permissions
   * @throws {ResourceNotFoundError} If user not found
   * 
   * @example
   * ```typescript
   * const availability = await service.getCalendarAvailability(
   *   'user@example.com',
   *   '2024-01-01',
   *   '2024-01-07'
   * );
   * ```
   */
  async getCalendarAvailability(
    userEmail: string,
    startDate: string,
    endDate: string
  ): Promise<CalendarAvailability[]> {
    return await this.calendarService.getAvailability(
      userEmail,
      startDate,
      endDate
    );
  }

  /**
   * Get availability for all team members
   * 
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @returns Object mapping email to availability array
   * 
   * @example
   * ```typescript
   * service.setTeamMembers([
   *   { id: '1', email: 'user1@example.com', name: 'User 1' }
   * ]);
   * 
   * const teamAvailability = await service.getTeamAvailability(
   *   '2024-01-01',
   *   '2024-01-07'
   * );
   * ```
   */
  async getTeamAvailability(
    startDate: string,
    endDate: string
  ): Promise<TeamAvailability> {
    return await this.teamService.getTeamAvailability(startDate, endDate);
  }

  /**
   * Get consolidated availability (any team member available)
   * 
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @returns Array showing combined availability
   * 
   * @example
   * ```typescript
   * const consolidated = await service.getConsolidatedAvailability(
   *   '2024-01-01',
   *   '2024-01-07'
   * );
   * ```
   */
  async getConsolidatedAvailability(
    startDate: string,
    endDate: string
  ): Promise<CalendarAvailability[]> {
    return await this.teamService.getConsolidatedAvailability(
      startDate,
      endDate
    );
  }

  /**
   * Book a meeting slot
   * 
   * @param booking - Booking details including date, time, attendees
   * @returns Created calendar event with Teams meeting link
   * 
   * @throws {ValidationError} If booking validation fails
   * @throws {AuthenticationError} If authentication fails
   * @throws {PermissionError} If insufficient permissions
   * @throws {ResourceNotFoundError} If user not found
   * 
   * @example
   * ```typescript
   * const booking = await service.bookMeeting({
   *   date: '2024-01-02',
   *   time: '14:00',
   *   duration: 60,
   *   teamMemberEmail: 'consultant@example.com',
   *   leadEmail: 'client@example.com',
   *   leadName: 'John Client',
   *   subject: 'Consultation Meeting',
   *   description: 'Initial consultation'
   * });
   * 
   * console.log('Teams link:', booking.onlineMeeting.joinUrl);
   * ```
   */
  async bookMeeting(booking: BookingRequest): Promise<any> {
    return await this.calendarService.bookMeeting(booking);
  }

  /**
   * Diagnose Microsoft Graph setup and permissions
   * Useful for troubleshooting configuration issues
   */
  async diagnoseSetup(): Promise<void> {
    const originalLogger = this.logger;
    this.logger = new ConsoleLogger();

    console.log("🔍 Microsoft Graph Setup Diagnosis");
    console.log("=====================================\n");

    // Check configuration
    console.log("1. Configuration:");
    console.log(`   ✓ Client ID: ${this.config.clientId ? "SET" : "❌ MISSING"}`);
    console.log(`   ✓ Client Secret: ${this.config.clientSecret ? "SET" : "❌ MISSING"}`);
    console.log(`   ✓ Tenant ID: ${this.config.tenantId ? "SET" : "❌ MISSING"}`);
    console.log(`   ✓ Timezone: ${this.config.timeZone}`);
    console.log(`   ✓ Working Hours: ${this.config.workingHours.start}:00 - ${this.config.workingHours.end}:00\n`);

    // Test authentication
    console.log("2. Authentication Test:");
    try {
      const connected = await this.testGraphAccess();
      console.log(`   ${connected ? "✅" : "❌"} Authentication: ${connected ? "SUCCESS" : "FAILED"}\n`);
    } catch (error: any) {
      console.log(`   ❌ Authentication failed: ${error.message}\n`);
      this.logger = originalLogger;
      return;
    }

    // Show required permissions
    console.log("3. Required Permissions:");
    console.log("   - Calendars.Read (Application)");
    console.log("   - Calendars.ReadWrite (Application)");
    console.log("   - User.Read.All (Application) [optional]\n");

    console.log("4. Quick Links:");
    console.log(`   - Azure Portal: https://portal.azure.com`);
    console.log(`   - App Registration: https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/${this.config.clientId}\n`);

    console.log("✅ Diagnosis complete!\n");

    this.logger = originalLogger;
  }

  /**
   * Get the current configuration (without sensitive data)
   */
  getConfig(): Partial<MSGraphConfig> {
    return {
      clientId: this.config.clientId,
      tenantId: this.config.tenantId,
      timeZone: this.config.timeZone,
      workingHours: { ...this.config.workingHours },
      verbose: this.config.verbose,
    };
  }
}
