# Modern Luxury Design System - Migration Guide

## Quick Start

The donation management platform has been completely redesigned with a modern, premium aesthetic. Here's how to migrate existing pages and maintain consistency across the application.

## What Changed

### Color System
- **Before**: Emerald green (emerald-600) as primary color
- **After**: Sophisticated slate palette with teal accents
  - Primary: Slate-900 (dark gray/charcoal)
  - Accent: Teal-600 (premium teal)
  - Backgrounds: White, Slate-50, Slate-100
  - Text: Slate-900, Slate-600, Slate-500

### Typography
- **Before**: Plus Jakarta Sans for everything
- **After**: Dual font system
  - Headers: Playfair Display (elegant serif)
  - Body/UI: Inter (clean sans-serif)
  - Monospace: JetBrains Mono (technical)

### Components
- **Before**: Simple colored boxes, generic cards
- **After**: Premium cards with subtle elevations, premium buttons, refined inputs

### Spacing & Layout
- **Before**: Compact, minimal whitespace
- **After**: Generous whitespace, thoughtful spacing, premium breathing room

## Migration Steps for Existing Pages

### 1. Update Color References

Replace all color references in your components:

```diff
- bg-emerald-600        → bg-slate-900
- text-emerald-700      → text-teal-600
- bg-emerald-50         → bg-teal-50
- border-emerald-200    → border-teal-200
- hover:bg-emerald-700  → hover:bg-teal-700
```

### 2. Update Button Styles

Replace button classes:

```diff
- className="bg-emerald-600 text-white px-8 py-3 rounded-lg"
+ className="btn-primary btn-lg"

- className="border-2 border-emerald-600"
+ className="btn-outline"

- className="bg-gray-200"
+ className="btn-secondary"
```

Available button classes:
- `btn-primary` - Primary action (slate-900)
- `btn-accent` - Accent action (teal-600)
- `btn-outline` - Secondary action (outline)
- `btn-secondary` - Light background
- `btn-ghost` - No background
- `btn-neutral` - Neutral gray

Sizes: `btn-sm`, `btn-md`, `btn-lg`

### 3. Update Card Styles

Replace card markup:

```diff
- className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md"
+ className="card-elevated p-6"

- className="p-6 bg-gray-50 rounded-lg"
+ className="card-minimal p-6"
```

Available card classes:
- `card-elevated` - With borders, shadows, and hover effects
- `card-interactive` - Elevated card that lifts on hover
- `card-minimal` - Minimal styling, shadow on hover

### 4. Update Typography

Add proper semantic HTML:

```jsx
// Instead of using generic sizes, use semantic elements:
<h1 className="font-serif">Main Heading</h1>
<h2 className="font-serif">Section Heading</h2>
<h3 className="font-serif">Subsection</h3>

<p className="text-lg text-slate-600">Large text</p>
<p className="text-base text-slate-700">Body text</p>

<span className="text-caption">SMALL LABEL</span>
```

### 5. Update Section Spacing

Replace padding utilities:

```diff
- <section className="py-16 bg-white">
+ <section className="section-pad bg-white">

- <section className="py-12 bg-white">
+ <section className="section-pad-sm bg-white">
```

### 6. Update Layout Containers

Replace container utilities:

```diff
- <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
+ <div className="container-max">
```

### 7. Add Animations

Enhance pages with entrance animations:

```jsx
// For fade-in effect:
<div className="animate-fade-in">Content</div>

// For lists/grids (automatic stagger):
<div className="grid gap-8 stagger-container">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// For specific elements:
<button className="hover-lift">Button</button>
<img className="image-hover" src="..." alt="..." />
```

### 8. Update Badge Styles

Replace badge markup:

```diff
- className="px-3 py-1 bg-emerald-50 text-emerald-700"
+ className="badge badge-success"

- className="px-3 py-1 bg-red-50 text-red-700"
+ className="badge badge-danger"
```

Available badge classes:
- `badge badge-primary`
- `badge badge-success`
- `badge badge-warning`
- `badge badge-danger`
- `badge badge-neutral`

### 9. Update Form Inputs

Replace input styling:

```diff
- className="px-4 py-2 border border-gray-300 rounded-lg"
+ className="input"

- className="h-12 px-4"
+ className="input-lg"
```

## Common Page Updates

### Dashboard Pages

Before:
```tsx
<div className="text-2xl font-bold text-gray-900">Dashboard</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {stats.map(stat => (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="text-3xl font-bold">{stat.value}</div>
      <div className="text-gray-600">{stat.label}</div>
    </div>
  ))}
</div>
```

After:
```tsx
<h1 className="font-serif text-slate-900 mb-8">Dashboard</h1>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-container">
  {stats.map((stat, i) => (
    <div key={i} className="card-elevated p-6">
      <div className="text-4xl font-serif font-bold text-slate-900 mb-2">
        {stat.value}
      </div>
      <div className="text-sm uppercase tracking-wider text-slate-500">
        {stat.label}
      </div>
    </div>
  ))}
</div>
```

### Form Pages

Before:
```tsx
<div className="max-w-md">
  <h2 className="text-2xl font-bold text-gray-900 mb-6">Register</h2>
  <input type="email" className="px-4 py-2 border border-gray-300" />
  <button className="bg-emerald-600 text-white px-8 py-2">Register</button>
</div>
```

After:
```tsx
<div className="container-prose">
  <h2 className="font-serif text-slate-900 mb-8">Register</h2>
  <form className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-slate-900 mb-2">Email</label>
      <input type="email" className="input w-full" />
    </div>
    <button type="submit" className="btn-primary btn-lg w-full">
      Register
    </button>
  </form>
</div>
```

### List/Table Pages

Before:
```tsx
<div className="grid grid-cols-3 gap-4">
  {items.map(item => (
    <div className="p-4 bg-white border border-gray-200">
      <h3 className="text-lg font-bold">{item.title}</h3>
      <p className="text-gray-600 text-sm">{item.description}</p>
    </div>
  ))}
</div>
```

After:
```tsx
<div className="grid md:grid-cols-3 gap-8 stagger-container">
  {items.map((item, i) => (
    <div key={i} className="card-elevated p-6">
      <h3 className="text-lg font-serif font-semibold text-slate-900 mb-2">
        {item.title}
      </h3>
      <p className="text-slate-600 text-sm">{item.description}</p>
    </div>
  ))}
</div>
```

## Navigation Update

Update the navigation component to match new design:

```tsx
<nav className={`fixed w-full z-50 transition-all duration-300 ${
  scrolled ? 'bg-white/95 backdrop-blur-md shadow-subtle' : 'bg-white'
}`}>
  <div className="container-max">
    <div className="flex justify-between items-center h-16">
      {/* Logo */}
      <div className="h-10 w-10 bg-slate-900 rounded-md flex items-center justify-center">
        <HeartIcon className="h-5 w-5 text-white" />
      </div>
      
      {/* Links */}
      <div className="hidden md:flex gap-8">
        <a href="/link" className="text-sm text-slate-600 hover:text-slate-900">Link</a>
      </div>
      
      {/* Actions */}
      <div className="flex gap-4">
        <button className="btn-primary btn-sm">Button</button>
      </div>
    </div>
  </div>
</nav>
```

## Global Settings to Update

### Rename CSS Classes

If you have old component-specific classes, update them:

```css
/* Remove */
.btn-primary { }

/* Already defined in index.css with proper styling */
```

### Update Component Imports

No new imports needed! All styles use Tailwind classes defined in:
- `tailwind.config.js` - Configuration and color palette
- `src/index.css` - Component and utility classes
- `src/App.css` - Application-specific styles

## Testing Checklist

For each updated page, verify:

- [ ] Colors use new slate/teal palette
- [ ] Typography uses serif fonts for headings
- [ ] Buttons use `btn-*` classes
- [ ] Cards use `card-*` classes
- [ ] Forms use `input` class
- [ ] Spacing is generous with breathing room
- [ ] Animations are smooth and meaningful
- [ ] Mobile responsive works correctly
- [ ] Dark mode is not needed (light theme only)
- [ ] Performance is optimized
- [ ] Accessibility is maintained

## Common Issues & Solutions

### Issue: Colors don't match
**Solution**: Make sure you're using the exact slate/teal color names. Check DESIGN_SYSTEM.md for correct color codes.

### Issue: Text looks wrong
**Solution**: Use `font-serif` class for headings (h1-h6) and default sans-serif for body. See Typography section.

### Issue: Buttons don't fit properly
**Solution**: Use size variants: `btn-sm`, `btn-md`, `btn-lg` instead of custom padding.

### Issue: Animations feel jarring
**Solution**: Use built-in animation classes from Tailwind. Check index.css for available animations.

### Issue: Shadow not visible
**Solution**: Use `shadow-subtle`, `shadow-soft`, `shadow-elevated`, or `shadow-floating` instead of generic `shadow-sm`.

### Issue: Mobile layout broken
**Solution**: Test with `md:` and `lg:` breakpoints. Use mobile-first approach: `block md:flex`.

## Additional Resources

1. **DESIGN_SYSTEM.md** - Complete design system documentation
2. **PremiumComponentExamples.tsx** - Component examples and patterns
3. **index.css** - All CSS utilities and custom classes
4. **tailwind.config.js** - Extended Tailwind configuration

## Need Help?

Refer to:
1. Look up specific component in DESIGN_SYSTEM.md
2. Check PremiumComponentExamples.tsx for usage patterns
3. Verify colors in tailwind.config.js
4. Test locally with `npm run dev`

## Next Steps

1. **Update other pages** one at a time using this guide
2. **Maintain consistency** by following the patterns
3. **Add new pages** using the new design system from the start
4. **Gather feedback** on the new aesthetic
5. **Fine-tune spacing** based on user testing

## Future Enhancements

- [ ] Create Storybook components for documentation
- [ ] Add dark mode support
- [ ] Create animation library components
- [ ] Build component library for reuse
- [ ] Add accessibility improvements
- [ ] Performance optimization pass
