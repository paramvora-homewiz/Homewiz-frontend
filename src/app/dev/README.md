# Development Pages

This directory contains development, testing, and debugging pages that are not part of the main application flow. These pages are useful for development, testing, and troubleshooting but should not be included in production builds.

## Directory Contents

### Testing Pages
- **test-basic-input/** - Basic input component testing
- **test-building-check/** - Building validation testing
- **test-complete-flow/** - End-to-end form flow testing
- **test-css/** - CSS and styling tests
- **test-room-upload/** - Room image upload testing
- **test-simple-form/** - Simple form testing
- **test-supabase/** - Supabase connection testing
- **test-pages/** - General testing pages
- **forms-test/** - Form component testing

### Debug Pages
- **debug/** - General debugging page (contains hardcoded credentials - remove for production)
- **debug-room-number/** - Room number debugging utilities

### Demo Pages
- **demo/** - Application demo page
- **error-handling-demo/** - Error handling demonstration
- **template-demo/** - Form template demonstration
- **compare-uploads/** - Upload comparison tools

### Alternative Implementations
- **standalone/** - Standalone version of the application
- **simple/** - Simplified application interface

## Usage in Development

These pages can be accessed during development by navigating to `/dev/[page-name]` in your browser.

## Production Builds

**Important**: These pages should be excluded from production builds. Consider adding them to your build exclusion rules or removing this entire directory before deploying to production.

## Security Note

Some debug pages may contain hardcoded credentials or sensitive information. Review all pages before any deployment and ensure no sensitive data is exposed.