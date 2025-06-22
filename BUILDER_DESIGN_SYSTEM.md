# Builder.io Design System Integration

## Overview

This document outlines the comprehensive integration of Builder.io with the AMC Portal design system, ensuring consistent styling and component usage across all Builder.io content.

## Architecture

### 1. **Custom Components Library** ✅

Location: `src/lib/builderComponents.tsx`

Custom AMC Portal components registered with Builder.io:

- **AMCButton** - Styled buttons matching app design
- **AMCCard** - Consistent card components
- **AMCStatusBadge** - Status indicators for tasks/alerts
- **AMCAlert** - Alert messages with proper styling
- **AMCStatsCard** - Dashboard-style statistics cards
- **AMCHero** - Hero sections with gradient backgrounds
- **AMCFeatureGrid** - Feature showcase grids
- **AMCTeamMember** - Team member profiles

### 2. **Global Styling System** ✅

Location: `src/styles/builderStyles.css`

Comprehensive CSS overrides ensuring:

- Typography matches AMC Portal fonts and sizing
- Colors align with Tailwind config
- Spacing follows design system patterns
- Interactive elements use consistent hover states
- Form elements match app styling

### 3. **Design Tokens Integration** ✅

All Builder.io content uses AMC Portal design tokens:

```css
/* Primary Colors */
--amc-primary: 220 93% 56%; /* Indigo-600 */
--amc-success: 142 76% 36%; /* Green-600 */
--amc-warning: 38 92% 50%; /* Yellow-500 */
--amc-danger: 0 84% 60%; /* Red-500 */
--amc-info: 199 89% 48%; /* Blue-500 */
```

## Component Library

### AMC Button

```tsx
<AMCButton text="Get Started" variant="default" size="lg" href="/admin/tasks" />
```

**Variants**: `default` | `secondary` | `outline` | `ghost` | `destructive`
**Sizes**: `sm` | `default` | `lg`

### AMC Card

```tsx
<AMCCard
  title="Task Overview"
  description="Manage your daily tasks"
  variant="dashboard"
>
  <p>Card content goes here</p>
</AMCCard>
```

**Variants**: `default` | `dashboard` | `feature`

### AMC Status Badge

```tsx
<AMCStatusBadge status="completed" text="Task Complete" />
```

**Status Options**: `completed` | `in-progress` | `pending` | `overdue`

### AMC Alert

```tsx
<AMCAlert
  type="high"
  title="System Alert"
  message="Maintenance required on Equipment #123"
/>
```

**Types**: `high` | `medium` | `low`

### AMC Stats Card

```tsx
<AMCStatsCard
  title="Total Tasks"
  value="127"
  change="+12% from last week"
  trend="up"
  icon="chart"
/>
```

**Icons**: `users` | `chart` | `monitor` | `settings`
**Trends**: `up` | `down` | `neutral`

### AMC Hero Section

```tsx
<AMCHero
  title="Welcome to AMC Portal"
  subtitle="Maintenance Management"
  description="Streamline your maintenance workflows"
  buttonText="Get Started"
  buttonHref="/admin/dashboard"
/>
```

### AMC Feature Grid

```tsx
<AMCFeatureGrid
  columns={3}
  features={[
    {
      title: "Task Management",
      description: "Efficiently manage maintenance tasks",
      icon: "chart",
    },
  ]}
/>
```

### AMC Team Member

```tsx
<AMCTeamMember
  name="John Smith"
  role="Maintenance Manager"
  bio="Expert in industrial equipment maintenance"
/>
```

## Styling Classes

### Content Wrapper

All Builder.io content is wrapped with `builder-content` class:

```tsx
<div className="builder-content">
  <BuilderComponent model="page" />
</div>
```

### Typography Classes

- `.builder-heading-1` - Main headings (text-3xl md:text-4xl)
- `.builder-heading-2` - Section headings (text-2xl md:text-3xl)
- `.builder-text` - Body text (text-base text-gray-700)
- `.builder-text-large` - Large text (text-lg)
- `.builder-text-small` - Small text (text-sm)

### Layout Classes

- `.builder-container` - Max-width container with padding
- `.builder-section` - Section spacing (py-12 md:py-16)
- `.builder-columns-3` - 3-column responsive grid
- `.page-container` - Standard page container
- `.section-spacing` - Consistent section spacing

### Component Classes

- `.builder-card` - Standard card styling
- `.builder-button-primary` - Primary button styling
- `.amc-hero` - Hero section background
- `.amc-stats-grid` - Stats grid layout
- `.amc-feature-section` - Feature section background

## Navigation Integration ✅

Builder.io pages are accessible via sidebar navigation:

### Admin Routes

- **Dashboard** → **Builder.io** → `/admin/builder`

### User Routes

- **Dashboard** → **Builder.io** → `/user/builder`

### Public Route

- Direct access: `/home`

## Usage in Builder.io Dashboard

### 1. **Create New Page**

1. Go to Builder.io dashboard
2. Create new Page model
3. Set URL targeting:
   - `/home` for public content
   - `/admin/builder` for admin content
   - `/user/builder` for user content

### 2. **Use Custom Components**

- Drag custom AMC components from component library
- Components maintain consistent styling automatically
- All props are configurable in Builder.io interface

### 3. **Apply Styling Classes**

Use predefined classes for consistent styling:

```html
<div class="page-container">
  <div class="section-spacing">
    <h1 class="builder-heading-1">Page Title</h1>
    <p class="builder-text">Content goes here</p>
  </div>
</div>
```

## Responsive Design

All components and styles are fully responsive:

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid System**: Responsive column layouts
- **Typography**: Scaling text sizes across breakpoints

## Dark Mode Support

Builder.io content respects system dark mode:

- CSS variables automatically adjust
- Components maintain readability
- Colors follow design system tokens

## Performance Optimization

- **CSS**: Scoped to `.builder-content` to avoid conflicts
- **Components**: Lazy loaded when Builder.io content renders
- **Assets**: Optimized image loading via Builder.io CDN
- **Caching**: Builder.io handles content caching automatically

## Development Workflow

### 1. **Local Development**

```bash
npm run dev
# Visit /home, /admin/builder, or /user/builder
```

### 2. **Adding New Components**

1. Create component in `src/lib/builderComponents.tsx`
2. Register with `Builder.registerComponent()`
3. Add to `registerAMCComponents()` function
4. Document in this file

### 3. **Updating Styles**

1. Modify `src/styles/builderStyles.css`
2. Test across all Builder.io routes
3. Ensure responsive behavior
4. Verify design system compliance

## Best Practices

### Content Creation

- Use semantic HTML structure
- Apply consistent spacing classes
- Leverage custom AMC components
- Test across different screen sizes

### Styling Guidelines

- Use existing design tokens
- Follow AMC Portal color scheme
- Maintain consistent typography scale
- Ensure sufficient color contrast

### Component Usage

- Prefer custom AMC components over generic ones
- Configure props for reusability
- Test component variants
- Document custom configurations

## Troubleshooting

### Common Issues

1. **Components Not Showing**

   - Verify API key is configured
   - Check Builder.io initialization logs
   - Ensure components are registered

2. **Styling Conflicts**

   - Check CSS specificity
   - Verify `.builder-content` wrapper
   - Review custom CSS imports

3. **Responsive Issues**
   - Test across breakpoints
   - Verify grid configurations
   - Check mobile-first approach

### Debug Mode

Enable debug mode in development:

```typescript
// In builderConfig
canTrack: false,        // Disable tracking in dev
isDevelopment: true,    // Enable debug info
```

## Future Enhancements

- **Animation Components**: Smooth transitions and micro-interactions
- **Advanced Layouts**: Complex grid systems and masonry layouts
- **Integration Components**: Direct AMC Portal data integration
- **Theme Variants**: Multiple color schemes and themes
- **A/B Testing**: Built-in experimentation framework

This design system integration ensures that all Builder.io content seamlessly matches the AMC Portal's visual identity and user experience standards.
