# Modern Luxury Design System - Implementation Guide

## Overview
This document provides comprehensive guidance for implementing the modern, luxury, and premium aesthetic across all pages of the Donation Management Platform.

## Design Philosophy

### Core Principles
1. **Minimalism** - Less is more. Use generous whitespace and clean layouts
2. **Elegance** - Sophisticated, refined, and timeless designs
3. **Clarity** - Clear hierarchy, readable typography, intentional spacing
4. **Natural** - Handcrafted feel, not templated or AI-generated looking
5. **Premium** - Subtle luxury through thoughtful details, not flashy colors

## Color Palette

### Primary Colors
- **Slate-900** (#111827) - Primary text, headers, emphasis
- **Slate-600** (#4b5563) - Secondary text
- **Slate-500** (#6b7280) - Tertiary text, muted content

### Accent Colors
- **Teal-600** (#0d9488) - Primary action, highlights, focus states
- **Teal-500** (#14b8a6) - Secondary accents
- **Amber-500** (#f59e0b) - Testimonial ratings, special highlights

### Neutral Background
- **White** (#ffffff) - Primary background
- **Slate-50** (#fafbfc) - Secondary background
- **Slate-100** (#f3f4f6) - Tertiary background

### Text Colors
- Primary: Slate-900 (text-slate-900)
- Secondary: Slate-600 (text-slate-600)
- Tertiary: Slate-500 (text-slate-500)
- Inverse: White
- Accent: Teal-600 (text-teal-600)

## Typography

### Font Families
- **Headers (h1-h6)**: Playfair Display (serif) - elegant, premium feel
- **Body & UI**: Inter (sans-serif) - clean, modern, highly readable
- **Monospace**: JetBrains Mono - technical content, code blocks

### Type Scale
```
h1: 3rem (48px) / 3.75rem (60px) / 4.5rem (72px)
h2: 2.25rem (36px) / 3rem (48px) / 3.75rem (60px)
h3: 1.875rem (30px) / 2.25rem (36px)
h4: 1.5rem (24px)
Body: 1rem (16px)
Small: 0.875rem (14px)
Caption: 0.8125rem (13px)
```

### Font Weights
- Light (300) - secondary text, descriptions
- Normal (400) - body text
- Medium (500) - emphasis, UI labels
- Semibold (600) - subheadings, strong text
- Bold (700) - headers, strong emphasis

## Spacing System

### Key Spacing Values
```
0.5rem (8px)  - xs
1rem (16px)   - sm
1.5rem (24px) - md
2rem (32px)   - lg
2.5rem (40px) - xl
3rem (48px)   - 2xl
3.5rem (56px) - 3xl
4.5rem (72px) - 4xl
5.5rem (88px) - 5xl
7.5rem (120px) - 6xl
```

### Section Spacing
- Small sections: `py-16 md:py-20` (64px / 80px)
- Standard sections: `py-24 md:py-32` (96px / 128px)
- Large sections: `py-32 md:py-40` (128px / 160px)

## Button Styles

### Primary Button
```tsx
<button className="btn-primary btn-lg shadow-elevated hover:shadow-floating">
  Action
</button>
```
- Background: Slate-900
- Hover: Slate-800
- Text: White
- Shadow: Subtle elevation on hover
- Scale: Down 5% on active (active:scale-95)

### Secondary Button (Outline)
```tsx
<button className="btn-outline btn-md">
  Secondary
</button>
```
- Background: White
- Border: Slate-300
- Hover: Slate-50
- Text: Slate-900

### Accent Button
```tsx
<button className="btn-accent btn-lg">
  Accent
</button>
```
- Background: Teal-600
- Hover: Teal-700
- Text: White

### Sizes
- `btn-sm`: px-4 py-1.5 text-xs
- `btn-md`: px-6 py-2 text-sm
- `btn-lg`: px-8 py-3 text-base

## Card Styles

### Elevated Card (Interactive)
```tsx
<div className="card-elevated p-8">
  Content
</div>
```
- Background: White
- Border: Slate-200 (subtle)
- Shadow: Subtle, elevated on hover
- Hover: -translate-y-1 (lifts slightly)

### Minimal Card
```tsx
<div className="card-minimal p-6">
  Content
</div>
```
- Background: Transparent or Slate-50
- Border: None
- Shadow: None
- Hover: Subtle shadow on hover

### Card with Image
```tsx
<div className="card-elevated overflow-hidden">
  <img src="..." alt="..." className="image-hover h-48" />
  <div className="p-6">Content</div>
</div>
```
- Image scales 105% on hover
- Smooth 300-500ms transition

## Input & Form Elements

### Text Input
```tsx
<input 
  type="text" 
  className="input" 
  placeholder="Enter text..."
/>
```
- Height: 44px (h-11)
- Border: 1px slate-300
- Focus: ring-2 ring-slate-900, bg-slate-50
- Hover: border-slate-400

### Input Sizes
- `input-sm`: h-9 px-3 py-2
- `input`: h-11 px-4 py-2.5 (standard)
- `input-lg`: h-12 px-5 py-3

## Badges & Tags

### Badge Styles
```tsx
// Success
<span className="badge badge-success">Active</span>

// Warning
<span className="badge badge-warning">Pending</span>

// Primary
<span className="badge badge-primary">Featured</span>
```

### Colors
- Primary: Slate-100 background, slate-700 text
- Success: Teal-50 background, teal-700 text, teal-200 border
- Warning: Amber-50 background, amber-700 text, amber-200 border
- Danger: Red-50 background, red-700 text, red-200 border

## Animations & Transitions

### Entrance Animations
- `animate-fade-in` - Pure fade (600ms)
- `animate-fade-in-up` - Fade + slide up (700ms)
- `animate-fade-in-down` - Fade + slide down (700ms)
- `animate-scale-in` - Scale from 95% (500ms)

### Interactive Animations
- `hover-lift` - Hover: -translate-y-1
- `hover-scale` - Hover: scale-105
- `image-hover` - Image: scale-105 (500ms)

### Micro-interactions
- Button active: `active:scale-95`
- All state changes: 200-300ms transition
- Smooth scroll: Native browser scroll-smooth

### Using Stagger Animations
For lists and grids, use the `stagger-container` class:
```tsx
<div className="grid md:grid-cols-3 gap-8 stagger-container">
  <div>Item 1 - 100ms animation</div>
  <div>Item 2 - 200ms animation</div>
  <div>Item 3 - 300ms animation</div>
</div>
```

Each child receives 100ms staggered delay automatically.

## Layout Patterns

### Container
```tsx
<div className="container-max">
  Content constrained to 7xl (80rem)
</div>
```
- Max width: 80rem (1280px)
- Padding: 1rem (4px) / 1.5rem (6px) / 2rem (8px)

### Section Padding
```tsx
<section className="section-pad bg-white">
  <div className="container-max">
    Content with standard 96px/128px vertical padding
  </div>
</section>
```

### Grid Layouts
```tsx
// Hero Section
<div className="grid lg:grid-cols-2 gap-16 items-center">

// Feature Grid
<div className="grid lg:grid-cols-3 gap-8">

// Card Grid
<div className="grid md:grid-cols-3 gap-8 stagger-container">
```

## Shadow System

### Subtle Shadows
- `shadow-subtle` - Very light, barely visible (1px 2px)
- `shadow-soft` - Light shadow for hover states (2-4px)
- `shadow-elevated` - Standard elevated shadow (4-10px)
- `shadow-floating` - High-floating, dramatic shadow (10-25px)

### Usage
```tsx
// Navigation on scroll
className="shadow-subtle"

// Card hover
className="hover:shadow-elevated"

// Primary buttons
className="shadow-elevated hover:shadow-floating"
```

## Text Utilities

### Balance Text (prevents orphans)
```tsx
<h1 className="text-balance">Long heading that wraps nicely</h1>
```

### Subtitle Style
```tsx
<p className="text-subtitle">
  Large secondary text - 18-20px with better spacing
</p>
```

### Caption Style
```tsx
<span className="text-caption">SECTION LABEL</span>
```
- Uppercase, small, tracked (wide letter-spacing)

## Navigation Pattern

### Desktop Navigation
- Height: 64px
- Fixed: Yes, with backdrop blur on scroll
- Logo size: 40px square (h-10 w-10)
- Links: text-sm font-medium
- Spacing: gap-8 between links
- Buttons: btn-sm for secondary actions

### Responsive
- Collapse to hamburger below 768px (md breakpoint)
- Logo text hidden below 640px (sm breakpoint)
- Profile avatar hidden below 640px

## Footer

### Structure
```
Brand info | Platform | Company | Support
---
Copyright | Links
```

### Styling
- Background: Slate-950 (very dark)
- Text: Slate-300 (light gray)
- Links: Hover to white
- Grid: 4 columns desktop, stack mobile
- Spacing: py-16 with border-t

## Implementation Checklist

### For Each New Page
- [ ] Use `section-pad` for section spacing
- [ ] Use `container-max` for content width
- [ ] Use serif fonts (Playfair) for headings
- [ ] Use `animate-fade-in-up` for page entrance
- [ ] Update color scheme: slate/teal only
- [ ] Remove bright colors (emerald, green, yellow)
- [ ] Add proper whitespace and breathing room
- [ ] Use `stagger-container` for lists/grids
- [ ] Test dark mode contrast (not needed - light theme only)
- [ ] Verify mobile responsiveness
- [ ] Add meaningful animations, not filler

### For Components
- [ ] Use proper button classes (btn-primary, btn-outline, etc.)
- [ ] Use card-elevated or card-minimal appropriately
- [ ] Input fields use `input` class
- [ ] Badges use appropriate badge-* class
- [ ] Icons are 4-6px in size (h-4 w-4 to h-6 w-6)
- [ ] Proper spacing with gap-* utilities
- [ ] Transition all color changes (built-in via * rule)

## Common Patterns

### CTA Section
```tsx
<section className="section-pad bg-gradient-to-br from-slate-900 to-slate-800 text-white">
  <div className="container-max text-center">
    <h2 className="font-serif text-white mb-6">Heading</h2>
    <p className="text-lg text-slate-300 mb-10 font-light">Description</p>
    <button className="btn-primary btn-lg">Action</button>
  </div>
</section>
```

### Feature Grid
```tsx
<div className="grid lg:grid-cols-2 gap-8 stagger-container">
  {features.map((feature) => (
    <div key={feature.id} className="p-8 border border-slate-200/50 rounded-lg">
      <feature.Icon className="h-6 w-6 text-teal-600 mb-4" />
      <h3 className="font-serif text-slate-900 mb-2">{feature.title}</h3>
      <p className="text-slate-600 text-sm">{feature.description}</p>
    </div>
  ))}
</div>
```

### Stats Section
```tsx
<section className="py-16 border-y border-slate-200/50">
  <div className="container-max">
    <div className="grid md:grid-cols-3 gap-12">
      {stats.map((stat) => (
        <div key={stat.id} className="text-center md:text-left">
          <div className="text-5xl font-serif font-bold text-slate-900 mb-2">
            {stat.value}
          </div>
          <div className="text-sm uppercase tracking-wider text-slate-500">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

## Performance Tips

1. **Lazy load images**: Use next/image or intersection observer
2. **Optimize animations**: Use CSS transforms and opacity only
3. **Limit animations**: No more than 2-3 simultaneous animations
4. **Prefer Tailwind**: Don't add custom CSS unless absolutely necessary
5. **Mobile first**: Design mobile, enhance for desktop
6. **Accessibility**: Always test with keyboard and screen readers

## Accessibility

### Color Contrast
- Text on white: Slate-900 or darker
- Text on dark: White or slate-50
- All ratios: WCAG AA minimum (4.5:1)

### Interactive Elements
- All buttons/links: Visible focus ring
- Focus ring: `focus:ring-2 focus:ring-slate-900 focus:ring-offset-2`
- Minimum size: 44x44px

### Semantic HTML
- Use `<button>` not `<div role="button">`
- Use `<a>` for navigation
- Use `<form>` for inputs
- Proper heading hierarchy (h1 → h2 → h3)

## Future Enhancements

1. Dark mode support (consider adding via toggle)
2. Animation preferences (respects `prefers-reduced-motion`)
3. High contrast mode support
4. RTL language support (easy with Tailwind)
5. Print styles for donation receipts
