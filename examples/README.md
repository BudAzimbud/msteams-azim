# Examples for msteams-azim

This folder contains working examples demonstrating how to use the Microsoft Graph Calendar package.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy the environment template:
```bash
cp .env.example .env
```

3. Edit `.env` with your Microsoft Azure credentials:
```env
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_TENANT_ID=your-tenant-id
```

## Running Examples

### 1. Diagnostic Tool
Check your setup and configuration:
```bash
npm run diagnostic
```

### 2. Basic Usage
Get calendar availability for a single user:
```bash
npm run basic
```

Edit `basic-usage.ts` to change the email address and date range.

### 3. Team Availability
Check availability for multiple team members:
```bash
npm run team
```

Edit `team-availability.ts` to update team member emails.

### 4. Book Meeting
Book a meeting with automatic Teams link:
```bash
npm run book
```

Edit `book-meeting.ts` to customize meeting details.

## Example Files

- **basic-usage.ts** - Simple calendar availability check
- **team-availability.ts** - Multi-person scheduling
- **book-meeting.ts** - Create calendar events
- **diagnostic.ts** - Verify configuration

## Tips

1. **Start with diagnostic.ts** to verify your setup
2. **Use valid emails** from your Microsoft 365 tenant
3. **Check permissions** in Azure Portal if you get access denied errors
4. **Enable verbose logging** to see detailed API calls

## Troubleshooting

### "Cannot find module"
Run `npm install` in the examples folder.

### "Access Denied"
1. Check Azure Portal → App registrations → API permissions
2. Ensure admin consent is granted
3. Verify you have Calendars.Read and Calendars.ReadWrite permissions

### "User Not Found"
Use email addresses that exist in your Microsoft 365 tenant.

### "Authentication Failed"
Double-check your `.env` file has correct credentials from Azure Portal.

## Need Help?

Run the diagnostic tool first:
```bash
npm run diagnostic
```

It will tell you exactly what's configured incorrectly!
