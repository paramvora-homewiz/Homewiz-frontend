# Test Files

This directory contains all test-related files that have been moved out of the main source code.

## Directory Structure

### `/pages`
Contains test pages that were previously in `src/app/`:
- `test/` - General test page
- `test-room-image-upload/` - Room image upload testing
- `test-room-cards/` - Room cards component testing
- `test-building-display/` - Building display testing
- `debug-images/` - Image debugging page
- `test-room-render/` - Room rendering tests

### `/scripts`
Contains test and diagnostic scripts:
- `check-*.ts` - Various checking scripts for images, storage, etc.
- `test-*.ts` - Test scripts for different functionalities
- `debug-*.ts` - Debug scripts
- `diagnose-*.ts` - Diagnostic scripts
- `trace-*.ts` - Tracing scripts
- `verify-*.ts` - Verification scripts

### `/public`
Contains test HTML files:
- `test.html` - General test page
- `test-room-upload.html` - Room upload test
- `test-building-names.html` - Building names display test
- `debug-upload.js` - Debug upload script
- `diagnose.html` - Diagnostic page

### `/integration`
Contains integration tests and other test files that were in the `/tests` directory.

## Note
These files have been moved out of the main source code to keep the production codebase clean. They can be referenced or used for testing purposes when needed.