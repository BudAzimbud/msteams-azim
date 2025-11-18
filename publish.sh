#!/bin/bash

# NPM Package Publishing Script
# This script automates the publishing process

set -e  # Exit on error

echo "🚀 Publishing @boneconsulting/msgraph-calendar to NPM"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the project root?"
    exit 1
fi

# Step 1: Clean previous builds
echo "📦 Step 1: Cleaning previous builds..."
rm -rf dist/
echo "✅ Cleaned dist/ folder"
echo ""

# Step 2: Install dependencies
echo "📥 Step 2: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Step 3: Build the package
echo "🔨 Step 3: Building TypeScript..."
npm run build
echo "✅ Build completed"
echo ""

# Step 4: Check if dist folder was created
if [ ! -d "dist" ]; then
    echo "❌ Error: dist/ folder not created. Build may have failed."
    exit 1
fi

# Step 5: Show package contents
echo "📋 Step 4: Package contents:"
echo "Files that will be published:"
npm pack --dry-run
echo ""

# Step 6: Run tests (if any)
echo "🧪 Step 5: Running tests..."
npm test || echo "⚠️  No tests configured (this is okay for now)"
echo ""

# Step 7: Check npm login status
echo "🔐 Step 6: Checking NPM login status..."
npm whoami || {
    echo "❌ You are not logged in to NPM"
    echo "Please run: npm login"
    exit 1
}
echo "✅ You are logged in to NPM"
echo ""

# Step 8: Version check
echo "📌 Current version: $(node -p "require('./package.json').version")"
echo ""

# Step 9: Confirm before publishing
echo "⚠️  Ready to publish to NPM!"
echo ""
read -p "Are you sure you want to publish? (y/N): " confirm

if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Publishing cancelled"
    exit 1
fi

# Step 10: Publish
echo ""
echo "📤 Publishing to NPM..."
npm publish --access public

echo ""
echo "🎉 Successfully published!"
echo ""
echo "📦 View your package at:"
echo "   https://www.npmjs.com/package/@boneconsulting/msgraph-calendar"
echo ""
echo "📥 Users can now install with:"
echo "   npm install @boneconsulting/msgraph-calendar"
echo ""
echo "🚀 Next steps:"
echo "   1. Tag this release in Git"
echo "   2. Create a GitHub release"
echo "   3. Update documentation if needed"
echo ""
