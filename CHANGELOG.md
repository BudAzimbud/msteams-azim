# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-11-18

### Added
- Initial release of msteams-azim
- Microsoft Graph authentication with app-only flow (MSAL)
- Calendar availability retrieval for single users
- Team availability tracking for multiple team members
- Consolidated availability view across team
- Meeting booking with automatic Teams meeting links
- Singapore timezone support (configurable)
- Custom working hours configuration
- Verbose logging option
- Comprehensive error handling and diagnostics
- TypeScript type definitions
- Full API documentation
- Usage examples for common scenarios
- Diagnostic tool for setup verification

### Features
- `getCalendarAvailability()` - Fetch calendar availability for a user
- `getTeamAvailability()` - Get availability for all team members
- `getConsolidatedAvailability()` - Combined availability view
- `bookMeeting()` - Create calendar events with Teams meetings
- `testGraphAccess()` - Verify API connectivity
- `diagnoseSetup()` - Debug configuration issues
- `setTeamMembers()` - Configure team member list
- `setVerbose()` - Control logging output

### Configuration
- Flexible timezone support (default: Singapore Standard Time)
- Customizable working hours (start, end, interval)
- Verbose logging option
- Weekend exclusion (Saturday, Sunday)

### Documentation
- Comprehensive README with usage examples
- Publishing guide for NPM
- Quick start guide
- TypeScript examples for all major features
- API reference documentation
- Troubleshooting guide

### Developer Experience
- Full TypeScript support with type definitions
- ESLint-ready code structure
- Modern ES2020 target
- CommonJS module format
- Source maps included
- Declaration maps for IDE support

[1.0.0]: https://github.com/yourusername/msgraph-calendar/releases/tag/v1.0.0
