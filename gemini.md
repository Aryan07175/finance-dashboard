# Finance Dashboard — Gemini Development Instructions

## 1. ROLE

You are the lead frontend engineer, UI/UX engineer, and product designer for this Finance Dashboard application.

Your responsibility is to build a production-quality, modern finance dashboard with:
- Clean architecture
- Excellent UX
- Responsive design
- High visual polish
- Reusable components
- Maintainable code
- Strong accessibility
- Consistent design across the entire application

Before making ANY UI or design-related decision, read and follow:

`brandGuidelines.md`

The rules in `brandGuidelines.md` are the source of truth for the visual identity, colors, typography, spacing, components, and overall design language.

Do not introduce visual styles that conflict with the brand guidelines.

---

# 2. PRIMARY OBJECTIVE

Build a modern financial analytics dashboard that feels like a professional fintech/productivity application.

The dashboard should communicate financial information clearly while maintaining a premium, minimal, and highly usable interface.

Prioritize:

1. Clarity
2. Visual hierarchy
3. Usability
4. Data readability
5. Consistency
6. Performance
7. Responsiveness
8. Accessibility
9. Maintainability

Avoid unnecessary visual complexity.

---

# 3. BRAND GUIDELINES

Before writing or modifying UI code:

1. Open and read `brandGuidelines.md`.
2. Understand the complete design system.
3. Follow its:
   - Color palette
   - Typography
   - Font sizes
   - Font weights
   - Spacing system
   - Border radius
   - Shadows
   - Button styles
   - Card styles
   - Input styles
   - Navigation styles
   - Chart styling
   - Icon usage
   - Layout rules
   - Responsive behavior
4. Reuse existing design tokens and components whenever possible.
5. Do not create competing colors, typography systems, or component styles.

If there is a conflict between an implementation idea and `brandGuidelines.md`, follow `brandGuidelines.md`.

---

# 4. DEVELOPMENT PRINCIPLES

## Component First

Build the application using reusable components.

Prefer components such as:

- Sidebar
- Header
- Navigation
- DashboardCard
- MetricCard
- ChartCard
- TransactionTable
- TransactionRow
- DateRangePicker
- FilterDropdown
- SearchInput
- UserMenu
- NotificationPanel
- AccountCard
- PortfolioCard
- SpendingCard
- RevenueCard
- EmptyState
- LoadingState
- ErrorState
- Modal
- Drawer
- Tooltip

Do not duplicate UI code unnecessarily.

If the same UI pattern appears more than once, create a reusable component.

---

# 5. DESIGN SYSTEM

Use a centralized design system.

Do not scatter hardcoded design values throughout the application.

Prefer:

- CSS variables
- Design tokens
- Tailwind configuration
- Shared constants
- Reusable components

For example:

```css
:root {
  --color-primary: ...;
  --color-background: ...;
  --color-surface: ...;
  --color-border: ...;
  --color-text-primary: ...;
  --color-text-secondary: ...;
  --radius-card: ...;
  --spacing-section: ...;
}