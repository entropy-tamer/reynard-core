# Centralized Optional i18n System

🦊 _whiskers twitch with intelligence_ The centralized optional i18n system provides a unified way for Reynard
packages to gracefully fall back from full i18n support to straightforward fallback translations when the i18n package is not available.

## Overview

This system allows packages to:

- Use full i18n functionality when available
- Gracefully fall back to hardcoded translations when i18n is not available
- Register their own fallback translations
- Avoid recursion issues that can occur with complex i18n loading

## Usage

### Simple Translation Function

```typescript
import { t } from "reynard-core";

// This will use i18n if available, otherwise fall back to hardcoded translations
const message = t("common.loading"); // Returns "Loading..." if i18n not available
const error = t("core.errors.generic"); // Returns "An error occurred"
```

### Registering Package-Specific Translations

```typescript
import { registerFallbackTranslations } from "reynard-core";

// Register translations for your package
registerFallbackTranslations("my-package", {
  "button.save": "Save",
  "button.cancel": "Cancel",
  "error.invalid": "Invalid input",
});

// Now you can use them
const saveText = t("my-package.button.save"); // Returns "Save"
```

### Creating Mock i18n Modules

```typescript
import { createMockI18n } from "reynard-core";

// Create a mock i18n module for testing or when i18n is not available
const mockI18n = createMockI18n();

// Use it in your components
const translationContext = {
  get locale() {
    return mockI18n.locale as any;
  },
  setLocale: mockI18n.setLocale as any,
  t: mockI18n.t,
  languages: mockI18n.languages as any,
  get isRTL() {
    return mockI18n.isRTL;
  },
};
```

## Available Fallback Translations

The system includes complete fallback translations for:

- **Core**: Error messages, module loading, storage operations
- **Common**: Loading, error, success, cancel, confirm, save, delete, edit, close, etc.
- **Themes**: Light, dark, gray, banana, strawberry, peanut, high-contrast themes
- **Components**: Modal, button, input, dropdown, tooltip translations
- **Files**: Upload, download, delete, rename, copy, move, create operations
- **Auth**: Login, logout, register, username, password, email operations
- **Chat**: Send, message, typing, online, offline, room operations
- **DateTime**: Today, yesterday, tomorrow, now, ago, in
- **Numbers**: Zero, one, two, few, many, other

## API Reference

### Functions

- `t(key: string, params?: Record<string, unknown>): string` - Main translation function
- `isI18nAvailable(): boolean` - Check if i18n is available
- `getI18nModule(): I18nModule | null` - Get the i18n module if available
- `registerFallbackTranslations(packageName: string, translations: Record<string, string>): void` - Register package translations
- `getAvailableFallbackKeys(): string[]` - Get all available fallback keys
- `hasFallbackTranslation(key: string): boolean` - Check if a fallback exists
- `createMockI18n(): I18nModule` - Create a mock i18n module

### Translation Key Format

Translation keys should follow the pattern: `{package}.{category}.{key}`

Examples:

- `core.errors.generic`
- `common.loading`
- `themes.light`
- `components.button.submit`
- `my-package.feature.action`

## Recommended Practices

1. **Use descriptive keys**: Make translation keys self-documenting
2. **Namespace by package**: Prefix keys with your package name
3. **Register early**: Call `registerFallbackTranslations` early in your package initialization
4. **Test fallbacks**: Ensure your package works without i18n
5. **Use parameters**: Leverage parameter substitution for dynamic content

## Example: Package Integration

```typescript
// In your package's main file
import { registerFallbackTranslations, t } from "reynard-core";

// Register your package's translations
registerFallbackTranslations("my-package", {
  "welcome.message": "Welcome to {appName}!",
  "button.start": "Get Started",
  "error.config": "Configuration error: {details}",
});

// Use translations in your components
export function WelcomeComponent({ appName }: { appName: string }) {
  return (
    <div>
      <h1>{t("my-package.welcome.message", { appName })}</h1>
      <button>{t("my-package.button.start")}</button>
    </div>
  );
}
```

This system ensures that Reynard packages can provide a consistent user experience whether i18n is available or not,
while maintaining the flexibility to use full i18n features when possible.
