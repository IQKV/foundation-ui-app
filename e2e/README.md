# E2E Testing Guide

This directory contains end-to-end tests for the React 19 + Tanstack Query + Tanstack Router + Mantine UI application.

## 🏗️ Test Structure

```
e2e/
├── config/                 # Test configuration
│   └── test-config.ts      # Constants and configuration
├── setup/                  # Test setup files
│   └── global-setup.ts     # Global test setup
├── utils/                  # Test utilities and helpers
│   └── test-helpers.ts     # Page objects and common utilities
├── smoke.spec.ts          # Smoke tests for critical functionality
└── README.md              # This file
```

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests (Chromium only)
pnpm e2e

# Run tests in headed mode (see browser)
pnpm e2e:headed

# Run tests in debug mode
pnpm e2e:debug

# Run tests in UI mode (interactive)
pnpm e2e:ui

# Run tests across all browsers
ALL_BROWSERS=true pnpm e2e

# Update snapshots
pnpm e2e:update

# Show test report
pnpm e2e:report
```

### Running Specific Tests

```bash
# Run only smoke tests
npx playwright test smoke

# Run only auth tests
npx playwright test auth/

# Run specific test file
npx playwright test auth/login.spec.ts

# Run tests matching pattern
npx playwright test --grep "login"
```

## 📋 Test Categories

### 1. Smoke Tests (`smoke.spec.ts`)

Quick sanity checks that verify:

- Pages load correctly
- No critical console errors
- Basic navigation works
- App is responsive
- Essential functionality works

## 🛠️ Test Utilities

### Page Object Model (`utils/test-helpers.ts`)

The `AuthPage` class provides a clean interface for interacting with authentication pages:

```typescript
const authPage = new AuthPage(page);

// Navigation
await authPage.goToLogin();
await authPage.goToRegister();

// Form interactions
await authPage.fillLoginForm("username", "password", true);
await authPage.submitLoginForm();

// Assertions
await authPage.expectLoginPageVisible();
await authPage.expectValidationError("Username is required");
```

### Test Data Generators

```typescript
import { testData } from "./utils/test-helpers";

// Use predefined valid user
const user = testData.validUser;

// Generate unique user for each test
const uniqueUser = testData.generateUniqueUser();

// Use invalid data for validation tests
const invalidData = testData.invalidData;
```

### Utility Functions

```typescript
import { testUtils } from "./utils/test-helpers";

// Wait for page to be ready
await testUtils.waitForPageReady(page);

// Test across multiple viewports
await testUtils.testResponsiveDesign(page, async (page) => {
  // Your test logic here
});

// Check for console errors
await testUtils.expectNoConsoleErrors(page);
```

## 🎯 Best Practices

### 1. Test Organization

- Group related tests in describe blocks
- Use descriptive test names
- Keep tests focused and atomic
- Use page objects for reusable interactions

### 2. Reliability

- Wait for elements to be visible before interacting
- Use proper timeouts and retries
- Handle loading states appropriately
- Test across different viewports

### 3. Maintainability

- Use constants for selectors and test data
- Abstract common operations into utilities
- Keep tests DRY but readable
- Document complex test scenarios

### 4. Performance

- Run only necessary browsers locally
- Use parallel execution when possible
- Optimize test data and setup
- Clean up after tests when needed

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)

- **Local Development**: Runs only Chromium for speed
- **CI Environment**: Runs all browsers with retries
- **Timeouts**: Increased for reliability
- **Reporters**: HTML report + list format

### Test Config (`config/test-config.ts`)

- Centralized constants and configuration
- Test data generators
- Validation message patterns
- Viewport definitions

## 🐛 Debugging

### Common Issues

1. **Element not found**: Check if selectors match actual DOM
2. **Timeouts**: Increase timeouts or add proper waits
3. **Flaky tests**: Add retries or improve test stability
4. **API errors**: Expected when no backend is running

### Debug Tools

```bash
# Run with debug mode
pnpm e2e:debug

# Run specific test with debug
npx playwright test auth/login.spec.ts --debug

# Generate trace files
npx playwright test --trace on

# Open trace viewer
npx playwright show-trace trace.zip
```

### VS Code Integration

Install the Playwright extension for VS Code to:

- Run tests from the editor
- Debug tests with breakpoints
- View test results inline
- Generate test code

## 📊 Test Reports

After running tests, view the HTML report:

```bash
pnpm e2e:report
```

The report includes:

- Test results and timing
- Screenshots of failures
- Video recordings (on failure)
- Trace files for debugging

## 🚨 CI/CD Integration

The tests are configured to run efficiently in CI:

- Sequential execution for stability
- Retries for flaky tests
- Proper error reporting
- Artifact collection (screenshots, videos, traces)

Environment variables:

- `CI=true`: Enables CI-specific configuration
- `ALL_BROWSERS=true`: Runs tests in all browsers
- `BASE_URL`: Override the base URL for testing

## 📝 Writing New Tests

1. **Choose the right location**:
   - Add to existing files for related functionality
   - Create new files for new features

2. **Use the page object model**:

   ```typescript
   test("my new test", async ({ page }) => {
     const authPage = new AuthPage(page);
     await authPage.goToLogin();
     // ... test logic
   });
   ```

3. **Follow naming conventions**:
   - Descriptive test names
   - Group related tests
   - Use consistent terminology

4. **Add proper assertions**:
   - Test both positive and negative cases
   - Verify loading states
   - Check accessibility

5. **Update documentation** when adding new patterns or utilities.
