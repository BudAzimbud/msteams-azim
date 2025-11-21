# msteams-azim

[![npm version](https://badge.fury.io/js/msteams-azim.svg)](https://www.npmjs.com/package/msteams-azim)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

A reusable TypeScript library for managing Microsoft Graph calendar availability and bookings, with built-in support for Singapore timezone.

## Features

- 📅 Fetch calendar availability for users
- 🔍 Check team member availability
- 📊 Get consolidated team availability
- ✅ Book meetings with automatic Teams meeting links
- 🌏 Singapore timezone support (configurable)
- 🔐 Secure app-only authentication using MSAL
- 📝 Full TypeScript support
- 🛠️ Diagnostic tools for setup verification

## Installation

```bash
npm install msteams-azim
```

### Peer Dependencies

```bash
npm install moment @azure/msal-node @microsoft/microsoft-graph-client
```

## Prerequisites

Before using this library, you need to set up an Azure AD app registration:

1. **Create an App Registration** in Azure Portal
2. **Add API Permissions**:
   - `Calendars.Read` (Application)
   - `Calendars.ReadWrite` (Application)
   - `User.Read.All` (Application) - Optional but recommended
3. **Grant Admin Consent** for your organization
4. **Create a Client Secret** and note the value
5. **Get your credentials**:
   - Application (client) ID
   - Directory (tenant) ID
   - Client secret value

## Quick Start

```typescript
import { MSGraphService } from 'msteams-azim';

// Initialize the service
const graphService = new MSGraphService({
  clientId: process.env.MICROSOFT_CLIENT_ID!,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
  tenantId: process.env.MICROSOFT_TENANT_ID!,
  timeZone: 'Singapore Standard Time', // Optional, defaults to Singapore
  verbose: true // Enable logging
});

// Test the connection
const isConnected = await graphService.testGraphAccess();
console.log('Connected:', isConnected);
```

## Usage Examples

### 1. Get Calendar Availability

```typescript
// Get availability for a single user
const availability = await graphService.getCalendarAvailability(
  'user@example.com',
  '2024-01-01', // Start date
  '2024-01-07'  // End date
);

console.log(availability);
/*
[
  {
    date: '2024-01-02',
    available: true,
    timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
  },
  {
    date: '2024-01-03',
    available: true,
    timeSlots: ['09:00', '13:00', '14:00', '15:00', '16:00', '17:00']
  }
]
*/
```

### 2. Get Raw Calendar Schedule

```typescript
// Get raw schedule data with all events from Microsoft Graph
const schedule = await graphService.getCalendarSchedule(
  'user@example.com',
  '2024-01-01',
  '2024-01-07'
);

// Access schedule items (calendar events)
const events = schedule.value[0].scheduleItems;
events.forEach(event => {
  console.log(`Event: ${event.subject}`);
  console.log(`Start: ${event.start.dateTime}`);
  console.log(`End: ${event.end.dateTime}`);
  console.log(`Status: ${event.status}`);
});

// Access availability view (0=Free, 1=Tentative, 2=Busy, 3=OOF, 4=WorkingElsewhere)
const availabilityView = schedule.value[0].availabilityView;
console.log('Availability view:', availabilityView);

// Access working hours if configured
const workingHours = schedule.value[0].workingHours;
if (workingHours) {
  console.log('Working hours:', workingHours);
}
```

### 3. Team Availability

```typescript
// Set team members
graphService.setTeamMembers([
  { id: '1', email: 'member1@example.com', name: 'John Doe' },
  { id: '2', email: 'member2@example.com', name: 'Jane Smith' }
]);

// Get availability for all team members
const teamAvailability = await graphService.getTeamAvailability(
  '2024-01-01',
  '2024-01-07'
);

console.log(teamAvailability);
/*
{
  'member1@example.com': [
    { date: '2024-01-02', available: true, timeSlots: [...] }
  ],
  'member2@example.com': [
    { date: '2024-01-02', available: true, timeSlots: [...] }
  ]
}
*/
```

### 4. Consolidated Team Availability

```typescript
// Get combined availability (shows slots where ANY team member is available)
const consolidated = await graphService.getConsolidatedAvailability(
  '2024-01-01',
  '2024-01-07'
);

console.log(consolidated);
/*
[
  {
    date: '2024-01-02',
    available: true,
    timeSlots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']
  }
]
*/
```

### 5. Book a Meeting

```typescript
const booking = await graphService.bookMeeting({
  date: '2024-01-02',
  time: '14:00',
  duration: 60, // minutes
  teamMemberEmail: 'consultant@example.com',
  leadEmail: 'client@company.com',
  leadName: 'Client Name',
  subject: 'Initial Consultation',
  description: 'Discussion about project requirements'
});

console.log('Meeting booked:', booking.id);
console.log('Teams link:', booking.onlineMeeting.joinUrl);
```

### 6. Custom Working Hours and Timezone

```typescript
const graphService = new MSGraphService({
  clientId: process.env.MICROSOFT_CLIENT_ID!,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
  tenantId: process.env.MICROSOFT_TENANT_ID!,
  timeZone: 'Tokyo Standard Time',  // Change timezone
  workingHours: {
    start: 8,      // 8 AM
    end: 18,       // 6 PM
    interval: 30   // 30-minute slots
  }
});
```

#### Supported Timezones

Microsoft Graph uses **Windows timezone names** (not IANA codes like "Asia/Singapore").

Common timezones:
- `"Singapore Standard Time"` - Singapore, Malaysia, Philippines
- `"Tokyo Standard Time"` - Tokyo, Osaka
- `"China Standard Time"` - Beijing, Hong Kong
- `"India Standard Time"` - Mumbai, Delhi
- `"GMT Standard Time"` - London, Dublin
- `"Eastern Standard Time"` - New York, Toronto
- `"Pacific Standard Time"` - Los Angeles, Vancouver
- `"Central Europe Standard Time"` - Berlin, Paris, Rome

**📚 Full timezone list:** [Microsoft Windows Timezone Reference](https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/default-time-zones?view=windows-11)

⚠️ **Important:** Use Windows timezone names, not IANA codes:
- ✅ Correct: `"Singapore Standard Time"`
- ❌ Wrong: `"Asia/Singapore"`

### 7. Diagnose Setup

```typescript
// Run diagnostic to check configuration and permissions
await graphService.diagnoseSetup();
```

## Configuration Options

```typescript
interface MSGraphConfig {
  clientId: string;              // Azure AD Application (client) ID
  clientSecret: string;          // Azure AD Client secret value
  tenantId: string;              // Azure AD Directory (tenant) ID
  timeZone?: string;             // Default: "Singapore Standard Time"
  workingHours?: {
    start: number;               // Default: 9 (9 AM)
    end: number;                 // Default: 17 (5 PM)
    interval: number;            // Default: 60 (minutes)
  };
  verbose?: boolean;             // Enable logging, default: false
}
```

## API Reference

### MSGraphService

#### Methods

##### `testGraphAccess(): Promise<boolean>`
Tests Microsoft Graph API connectivity.

##### `getCalendarAvailability(userEmail: string, startDate: string, endDate: string): Promise<CalendarAvailability[]>`
Get calendar availability for a specific user.

##### `getCalendarSchedule(userEmail: string, startDate: string, endDate: string): Promise<any>`
Get raw calendar schedule data from Microsoft Graph including all events and availability view.

##### `getTeamAvailability(startDate: string, endDate: string): Promise<TeamAvailability>`
Get availability for all configured team members.

##### `getConsolidatedAvailability(startDate: string, endDate: string): Promise<CalendarAvailability[]>`
Get consolidated availability showing slots where any team member is available.

##### `bookMeeting(booking: BookingRequest): Promise<any>`
Book a meeting and create a calendar event with Teams meeting link.

##### `setTeamMembers(members: TeamMember[]): void`
Set the list of team members to track.

##### `setVerbose(verbose: boolean): void`
Enable or disable verbose logging.

##### `diagnoseSetup(): Promise<void>`
Run diagnostics to verify configuration and permissions.

## TypeScript Types

```typescript
interface CalendarAvailability {
  date: string;
  available: boolean;
  timeSlots: string[];
}

interface TeamMember {
  id: string;
  email: string;
  name: string;
  available?: boolean;
}

interface BookingRequest {
  date: string;
  time: string;
  duration: number;
  teamMemberEmail: string;
  leadEmail: string;
  leadName: string;
  subject: string;
  description?: string;
}

interface TeamAvailability {
  [memberEmail: string]: CalendarAvailability[];
}
```

## Environment Variables

Create a `.env` file:

```env
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_TENANT_ID=your-tenant-id
```

## Error Handling

The library includes comprehensive error handling:

```typescript
try {
  const availability = await graphService.getCalendarAvailability(
    'user@example.com',
    '2024-01-01',
    '2024-01-07'
  );
} catch (error) {
  if (error.statusCode === 403) {
    console.error('Permission denied - check API permissions');
  } else if (error.statusCode === 404) {
    console.error('User not found');
  } else {
    console.error('Error:', error.message);
  }
}
```

## Complete Example

```typescript
import { MSGraphService } from 'msteams-azim';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Initialize service
  const graphService = new MSGraphService({
    clientId: process.env.MICROSOFT_CLIENT_ID!,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    tenantId: process.env.MICROSOFT_TENANT_ID!,
    verbose: true
  });

  // Set team members
  graphService.setTeamMembers([
    { id: '1', email: 'consultant@example.com', name: 'Senior Consultant' }
  ]);

  // Get availability for next week
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  const availability = await graphService.getConsolidatedAvailability(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  );

  console.log('Available slots:', availability);

  // Book first available slot
  if (availability[0]?.available && availability[0].timeSlots.length > 0) {
    const booking = await graphService.bookMeeting({
      date: availability[0].date,
      time: availability[0].timeSlots[0],
      duration: 60,
      teamMemberEmail: 'consultant@example.com',
      leadEmail: 'client@company.com',
      leadName: 'John Client',
      subject: 'Consultation Meeting',
      description: 'Initial consultation call'
    });

    console.log('Meeting booked successfully!');
    console.log('Join URL:', booking.onlineMeeting?.joinUrl);
  }
}

main().catch(console.error);
```

## Troubleshooting

### "Access Denied" Error

1. Verify API permissions in Azure Portal
2. Ensure admin consent is granted
3. Check that the app registration is active
4. Verify client secret hasn't expired

### "User Not Found" Error

1. Verify the email address exists in your Microsoft 365 tenant
2. Check that the user has a valid license
3. Ensure the email format is correct

### Authentication Failures

1. Verify all three credentials (clientId, clientSecret, tenantId)
2. Ensure the client secret is the VALUE, not the ID
3. Check that the app registration is in the correct tenant

Run diagnostics:
```typescript
await graphService.diagnoseSetup();
```

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
