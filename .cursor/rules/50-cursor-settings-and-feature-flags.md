---
alwaysApply: true
---

# Cursor Settings and Feature Flags

**Intent:** How to add a new app setting toggle (per your docs) and keep Cursor generations consistent.

**Scope:** Frontend settings code.

## When Adding a Setting

1. Create property type in `frontend/src/app/types/settings.ts` (or extend existing settings interface).
2. Add default in `frontend/src/app/services/settings.service.ts`:
   - Update initialization/default values.
   - Use Angular signals or BehaviorSubject for reactive state.
3. Toggle UI:
   - Beta → `frontend/src/app/settings/settings-beta-tab.component.ts`
   - General → `frontend/src/app/settings/settings-general-tab.component.ts`
   - Add as Material toggle/checkbox component (see snippet below).
4. Consume in app:
   ```typescript
   // In component
   constructor(private settingsService: SettingsService) {}
   
   get flagIsEnabled(): boolean {
     return this.settingsService.getSetting('myNewProperty') ?? false;
   }
   ```

## Toggle Snippet (Example)

```html
<!-- In component template -->
<mat-slide-toggle
  [checked]="flagIsEnabled"
  (change)="onToggleChange($event.checked)"
  [aria-label]="'Enable the experimental feature'">
  My Feature
</mat-slide-toggle>
<p class="mat-caption">Enable the experimental feature.</p>
```

```typescript
// In component class
onToggleChange(enabled: boolean): void {
  this.settingsService.updateSetting('myNewProperty', enabled);
}
```

## Rule

When asked to add a setting, generate all four diffs (type, default, toggle, usage) with exact file paths and imports.

