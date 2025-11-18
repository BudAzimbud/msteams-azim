# Quick Start Guide

Get started with @boneconsulting/msgraph-calendar in 5 minutes!

## 1. Install the Package

```bash
npm install @boneconsulting/msgraph-calendar moment
```

## 2. Set Up Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Name: "Calendar Service" (or any name)
5. Click "Register"

### Add API Permissions

1. Go to "API permissions"
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Select "Application permissions"
5. Add these permissions:
   - `Calendars.Read`
   - `Calendars.ReadWrite`
   - `User.Read.All` (optional)
6. Click "Grant admin consent"

### Create Client Secret

1. Go to "Certificates & secrets"
2. Click "New client secret"
3. Add description: "Calendar Service Secret"
4. Set expiry: 24 months
5. Click "Add"
6. **COPY THE VALUE** (you won't see it again!)

### Get Your Credentials

From the "Overview" page, copy:
- **Application (client) ID**
- **Directory (tenant) ID**

## 3. Create Your Project

```bash
mkdir my-calendar-app
cd my-calendar-app
npm init -y
npm install @boneconsulting/msgraph-calendar moment dotenv
npm install --save-dev typescript @types/node ts-node
```

Create `.env` file:
```env
MICROSOFT_CLIENT_ID=your-client-id-here
MICROSOFT_CLIENT_SECRET=your-client-secret-here
MICROSOFT_TENANT_ID=your-tenant-id-here
```

## 4. Write Your First Script

Create `index.ts`:

```typescript
import { MSGraphService } from '@boneconsulting/msgraph-calendar';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Initialize service
  const graph = new MSGraphService({
    clientId: process.env.MICROSOFT_CLIENT_ID!,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    tenantId: process.env.MICROSOFT_TENANT_ID!,
    verbose: true
  });

  // Test connection
  const connected = await graph.testGraphAccess();
  console.log('Connected:', connected);

  // Get availability
  const availability = await graph.getCalendarAvailability(
    'user@yourcompany.com',
    '2024-01-15',
    '2024-01-19'
  );

  console.log('Available slots:', availability);
}

main().catch(console.error);
```

## 5. Run It!

```bash
npx ts-node index.ts
```

## What's Next?

- Check out [README.md](./README.md) for complete API documentation
- Explore [examples/](./examples/) folder for more use cases
- Read [PUBLISHING.md](./PUBLISHING.md) to learn about updates

## Common First-Time Issues

### "Access Denied"
✅ Make sure you clicked "Grant admin consent" in Azure Portal

### "User Not Found"
✅ Replace `user@yourcompany.com` with an actual email in your Microsoft 365 tenant

### "Authentication Failed"
✅ Double-check your `.env` file has the correct credentials

### "Cannot find module"
✅ Run `npm install` to install all dependencies

## Need Help?

Run the diagnostic tool:

```typescript
import { MSGraphService } from '@boneconsulting/msgraph-calendar';

const graph = new MSGraphService({
  clientId: process.env.MICROSOFT_CLIENT_ID!,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
  tenantId: process.env.MICROSOFT_TENANT_ID!
});

await graph.diagnoseSetup();
```

This will check your configuration and tell you exactly what's wrong!
