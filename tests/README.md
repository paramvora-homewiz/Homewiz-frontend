# Tests Directory

This directory contains all test files for the Homewiz frontend application.

## Directory Structure

```
tests/
├── README.md                 # This file
├── unit/                     # Unit tests for individual functions/modules
├── integration/              # Integration tests for multi-component interactions
├── components/               # Component-specific tests
└── validation.test.js        # Form validation test suite
```

## Test Categories

### Unit Tests (`unit/`)
Tests for individual functions, utilities, and modules in isolation.

### Integration Tests (`integration/`)
Tests that verify the interaction between multiple components, services, or modules.

### Component Tests (`components/`)
Tests specifically for React components, including rendering, props, and user interactions.

### Validation Tests (`validation.test.js`)
Comprehensive test suite for form validation logic, covering:
- Empty form validation
- Partial data validation
- Email format validation
- Complete valid data scenarios

## Running Tests

### All Tests
```bash
npm test
```

### Test with Coverage
```bash
npm run test:coverage
```

### Test with UI
```bash
npm run test:ui
```

### Individual Test Files
```bash
# Run validation tests
npx vitest tests/validation.test.js

# Run specific test pattern
npx vitest tests/unit/
```

## Test Framework

This project uses [Vitest](https://vitest.dev/) as the testing framework, which provides:
- Fast execution with HMR (Hot Module Reload)
- Jest-compatible API
- TypeScript support
- Built-in coverage reporting
- UI mode for interactive testing

## Writing Tests

### Test File Naming
- Unit tests: `*.test.ts` or `*.test.js`
- Component tests: `ComponentName.test.tsx`
- Integration tests: `featureName.integration.test.ts`

### Example Test Structure
```javascript
import { describe, it, expect } from 'vitest'
import { validateTenantFormData } from '../src/lib/backend-sync'

describe('Tenant Form Validation', () => {
  it('should validate required fields', () => {
    const result = validateTenantFormData({})
    expect(result.isValid).toBe(false)
    expect(result.errors).toHaveProperty('tenant_name')
  })
})
```

## Configuration

Test configuration is defined in:
- `vitest.config.ts` - Main Vitest configuration
- `tsconfig.json` - TypeScript configuration for tests

## Best Practices

1. **Test Organization**: Group related tests using `describe` blocks
2. **Test Isolation**: Each test should be independent and not rely on others
3. **Meaningful Names**: Use descriptive test names that explain what is being tested
4. **Coverage**: Aim for good test coverage, especially for critical business logic
5. **Mock External Dependencies**: Use mocks for API calls, database operations, etc.
6. **Test Edge Cases**: Include tests for error conditions and edge cases

## Adding New Tests

1. Create the test file in the appropriate directory
2. Import the functions/components you want to test
3. Write descriptive test cases
4. Run the tests to ensure they pass
5. Check coverage reports to identify any gaps

For more information on testing with Vitest, see the [official documentation](https://vitest.dev/guide/).