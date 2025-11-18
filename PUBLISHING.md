# Publishing Guide for @boneconsulting/msgraph-calendar

This guide will walk you through publishing your package to NPM.

## Prerequisites

1. **NPM Account**: Create an account at [npmjs.com](https://www.npmjs.com/signup)
2. **NPM CLI**: Ensure you have npm installed (`npm -v`)
3. **Git**: For version control (optional but recommended)

## Step-by-Step Publishing Process

### 1. Update Package Scope (Optional)

If you want to use a different package name or remove the scope:

Edit `package.json`:
```json
{
  "name": "msgraph-calendar-singapore",  // Without scope
  // OR
  "name": "@yourcompany/msgraph-calendar"  // With your scope
}
```

### 2. Install Dependencies

```bash
cd /Users/Azim/msteams-azim
npm install
```

### 3. Build the Package

```bash
npm run build
```

This will compile TypeScript files from `src/` to `dist/`.

### 4. Test Locally (Optional but Recommended)

Test the package locally before publishing:

```bash
# In your package directory
npm link

# In another test project
npm link @boneconsulting/msgraph-calendar

# Test your examples
cd examples
npm install
npm install dotenv @types/node ts-node
npx ts-node diagnostic.ts
```

### 5. Login to NPM

```bash
npm login
```

Enter your:
- Username
- Password
- Email
- One-time password (if 2FA is enabled)

### 6. Publish to NPM

For scoped packages (like `@boneconsulting/msgraph-calendar`):

```bash
# Public package (free)
npm publish --access public

# Private package (requires paid plan)
npm publish
```

For non-scoped packages:
```bash
npm publish
```

### 7. Verify Publication

Check your package at:
```
https://www.npmjs.com/package/@boneconsulting/msgraph-calendar
```

## Package Version Management

### Updating Versions

Use semantic versioning (MAJOR.MINOR.PATCH):

```bash
# Patch release (1.0.0 -> 1.0.1) - bug fixes
npm version patch

# Minor release (1.0.0 -> 1.1.0) - new features, backwards compatible
npm version minor

# Major release (1.0.0 -> 2.0.0) - breaking changes
npm version major
```

Then publish:
```bash
npm publish --access public
```

## Pre-Publication Checklist

- [ ] All dependencies are correctly listed in `package.json`
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] README.md is complete and accurate
- [ ] LICENSE file is included
- [ ] `.npmignore` excludes unnecessary files
- [ ] Examples are working
- [ ] Version number is correct
- [ ] Package name is available on NPM

## Testing the Published Package

After publishing, test installation in a new project:

```bash
mkdir test-package
cd test-package
npm init -y
npm install @boneconsulting/msgraph-calendar moment
```

Create `test.js`:
```javascript
const { MSGraphService } = require('@boneconsulting/msgraph-calendar');

const service = new MSGraphService({
  clientId: 'test',
  clientSecret: 'test',
  tenantId: 'test'
});

console.log('Package loaded successfully!');
```

Run:
```bash
node test.js
```

## Unpublishing (Use Carefully!)

You can only unpublish within 72 hours of publishing:

```bash
npm unpublish @boneconsulting/msgraph-calendar@1.0.0
```

⚠️ **Warning**: Unpublishing can break projects that depend on your package!

## Setting Up NPM Organization (Optional)

For `@boneconsulting` scope, you need to create an organization:

1. Go to [npmjs.com](https://www.npmjs.com)
2. Click on your profile → "Add Organization"
3. Create organization named "boneconsulting"
4. Invite team members if needed

## Continuous Integration (Optional)

Add to `.github/workflows/publish.yml`:

```yaml
name: Publish to NPM

on:
  release:
    types: [created]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Common Issues

### 403 Forbidden
- You don't have permission to publish under this scope
- Create an organization or change package name

### 402 Payment Required
- Scoped packages are private by default (requires paid plan)
- Use `--access public` flag

### Package Name Already Exists
- Choose a different name
- Add a scope: `@yourcompany/package-name`

### Build Errors
- Check `tsconfig.json` settings
- Ensure all imports are correct
- Run `npm run build` locally first

## Best Practices

1. **Use Semantic Versioning**: Follow semver strictly
2. **Write Good Documentation**: Clear README with examples
3. **Test Before Publishing**: Always test locally first
4. **Maintain Changelog**: Keep a CHANGELOG.md file
5. **Add Keywords**: Help users discover your package
6. **Set Up CI/CD**: Automate testing and publishing
7. **Respond to Issues**: Be active in maintaining the package

## Quick Reference Commands

```bash
# Login
npm login

# Build
npm run build

# Publish (first time)
npm publish --access public

# Update version and publish
npm version patch
npm publish --access public

# View package info
npm view @boneconsulting/msgraph-calendar

# Check who can publish
npm owner ls @boneconsulting/msgraph-calendar

# Add collaborator
npm owner add username @boneconsulting/msgraph-calendar
```

## Support

For NPM-specific issues:
- [NPM Documentation](https://docs.npmjs.com/)
- [NPM Support](https://www.npmjs.com/support)

For package issues:
- Create an issue on GitHub
- Check the README for troubleshooting
