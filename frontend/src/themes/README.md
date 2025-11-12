# Bunny Theme System

Centralized theme system for the UVbunny Angular application.

## Structure

```
themes/
├── _variables.scss      # Color palette, spacing, and design tokens
├── _mixins.scss         # Reusable SCSS mixins
├── _light-theme.scss    # Light theme styles
├── _dark-theme.scss     # Dark theme styles
├── _material-overrides.scss  # Angular Material component overrides
├── bunny-theme.scss     # Main entry point (imports all above)
└── README.md            # This file
```

## Usage

### In Component SCSS Files

```scss
@import '../../themes/variables';
@import '../../themes/mixins';

.my-component {
  @include container(1200px);
  @include theme-text();
  @include theme-bg();
  
  .my-card {
    @include card-hover;
    border-radius: $radius-lg;
    padding: $spacing-md;
  }
}
```

### Available Variables

#### Colors
- `$bunny-primary` - Primary brand color (#622c9d)
- `$bunny-bg-light` / `$bunny-bg-dark` - Background colors
- `$bunny-surface-light` / `$bunny-surface-dark` - Surface colors
- `$bunny-text-light-primary` / `$bunny-text-dark-primary` - Text colors

#### Spacing
- `$spacing-xs`, `$spacing-sm`, `$spacing-md`, `$spacing-lg`, `$spacing-xl`

#### Shadows
- `$shadow-sm`, `$shadow-md`, `$shadow-lg`, `$shadow-hover`

#### Transitions
- `$transition-base`, `$transition-fast`

### Available Mixins

- `@include container($max-width)` - Centered container with max-width
- `@include grid($min-width, $gap)` - Responsive grid layout
- `@include flex-center` - Flex with align-items center
- `@include flex-center-all` - Flex with both align and justify center
- `@include card-hover` - Card hover animation
- `@include theme-text($light, $dark)` - Theme-aware text color
- `@include theme-bg($light, $dark)` - Theme-aware background
- `@include theme-border($light, $dark)` - Theme-aware border
- `@include dark-theme { }` - Dark theme context
- `@include light-theme { }` - Light theme context

## Best Practices

1. **Always use variables** instead of hardcoded values
2. **Use mixins** for repetitive patterns
3. **Keep component SCSS minimal** - move common styles to theme
4. **Use theme-aware mixins** for colors that change with theme
5. **Import only what you need** - don't import entire theme if you only need variables

## Theme Colors

### Light Theme
- Background: `#ece5f1` (light purple)
- Primary: `#622c9d` (purple)
- Surface: `#ffffff` (white)

### Dark Theme
- Background: `#121212` (dark gray)
- Primary: `#622c9d` (purple - same as light)
- Surface: `#1e1e1e` (dark gray)
- Material Primary: `#90caf9` (light blue)

