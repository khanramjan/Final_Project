import {
  HeartIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

/**
 * Design System Showcase Page
 * Reference page showing all design elements and patterns
 * Use as a guide when implementing new components
 */

const DesignShowcase = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed w-full z-50 bg-white/95 backdrop-blur-md shadow-subtle border-b border-slate-200/50">
        <div className="container-max h-16 flex items-center justify-between">
          <h1 className="font-serif text-xl font-bold text-slate-900">Design System</h1>
          <nav className="hidden md:flex gap-8">
            <a href="#colors" className="text-sm text-slate-600 hover:text-slate-900">Colors</a>
            <a href="#typography" className="text-sm text-slate-600 hover:text-slate-900">Typography</a>
            <a href="#buttons" className="text-sm text-slate-600 hover:text-slate-900">Buttons</a>
            <a href="#cards" className="text-sm text-slate-600 hover:text-slate-900">Cards</a>
          </nav>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="section-pad bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="container-max text-center">
            <h2 className="font-serif text-5xl md:text-6xl text-white mb-6">
              Modern Luxury Design System
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light">
              Premium, elegant, and minimalist. Designed for sophisticated applications.
            </p>
          </div>
        </section>

        {/* Colors Section */}
        <section id="colors" className="section-pad-sm bg-white">
          <div className="container-max">
            <h2 className="font-serif text-4xl text-slate-900 mb-12">Color Palette</h2>

            {/* Primary Colors */}
            <div className="mb-16">
              <h3 className="text-lg font-semibold text-slate-900 mb-8">Primary Colors</h3>
              <div className="grid md:grid-cols-5 gap-6">
                {[
                  { name: 'Slate-900', color: '#111827', code: 'bg-slate-900' },
                  { name: 'Slate-700', color: '#2d3748', code: 'bg-slate-700' },
                  { name: 'Slate-600', color: '#4b5563', code: 'bg-slate-600' },
                  { name: 'Slate-500', color: '#6b7280', code: 'bg-slate-500' },
                  { name: 'Slate-400', color: '#9ca3af', code: 'bg-slate-400' },
                ].map((c) => (
                  <div key={c.name}>
                    <div
                      className="h-24 rounded-lg mb-3 shadow-md border border-slate-200"
                      style={{ backgroundColor: c.color }}
                    />
                    <div className="text-sm">
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{c.code}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accent Colors */}
            <div className="mb-16">
              <h3 className="text-lg font-semibold text-slate-900 mb-8">Accent Colors</h3>
              <div className="grid md:grid-cols-5 gap-6">
                {[
                  { name: 'Teal-600', color: '#0d9488', code: 'text-teal-600' },
                  { name: 'Teal-500', color: '#14b8a6', code: 'text-teal-500' },
                  { name: 'Amber-500', color: '#f59e0b', code: 'text-amber-500' },
                  { name: 'Red-600', color: '#dc2626', code: 'text-red-600' },
                  { name: 'Green-600', color: '#16a34a', code: 'text-green-600' },
                ].map((c) => (
                  <div key={c.name}>
                    <div
                      className="h-24 rounded-lg mb-3 shadow-md border border-slate-200"
                      style={{ backgroundColor: c.color }}
                    />
                    <div className="text-sm">
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{c.code}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section id="typography" className="section-pad-sm bg-slate-50">
          <div className="container-max">
            <h2 className="font-serif text-4xl text-slate-900 mb-12">Typography</h2>

            <div className="space-y-12">
              <div>
                <p className="text-caption mb-4">SERIF FONT - PLAYFAIR DISPLAY</p>
                <h1 className="font-serif text-slate-900">Heading One</h1>
                <p className="text-sm text-slate-600 mt-2">48px / 60px / 72px - Used for main headers</p>
              </div>

              <div>
                <p className="text-caption mb-4">SERIF FONT - PLAYFAIR DISPLAY</p>
                <h2 className="font-serif text-slate-900">Heading Two</h2>
                <p className="text-sm text-slate-600 mt-2">36px / 48px / 60px - Used for section headers</p>
              </div>

              <div>
                <p className="text-caption mb-4">SANS-SERIF FONT - INTER</p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  This is body text using Inter sans-serif. It's designed for readability and clarity.
                  This is the primary font for all non-heading content including paragraphs, UI labels,
                  and descriptions. It comes in weights from 100 to 900.
                </p>
              </div>

              <div>
                <p className="text-caption mb-4">CAPTION / LABEL TEXT</p>
                <p className="text-caption text-slate-600">
                  SMALL UPPERCASE TEXT - USED FOR LABELS AND SECTION MARKERS
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section id="buttons" className="section-pad-sm bg-white">
          <div className="container-max">
            <h2 className="font-serif text-4xl text-slate-900 mb-12">Buttons</h2>

            {/* Primary Buttons */}
            <div className="mb-16">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Primary Buttons</h3>
              <div className="flex flex-wrap gap-4 p-8 bg-slate-50 rounded-lg">
                <button className="btn-primary btn-sm">Small</button>
                <button className="btn-primary btn-md">Medium</button>
                <button className="btn-primary btn-lg shadow-elevated hover:shadow-floating">Large</button>
                <button className="btn-primary btn-lg gap-2 shadow-elevated hover:shadow-floating">
                  With Icon
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div className="mb-16">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Secondary (Outline) Buttons</h3>
              <div className="flex flex-wrap gap-4 p-8 bg-slate-50 rounded-lg">
                <button className="btn-outline btn-sm">Small</button>
                <button className="btn-outline btn-md">Medium</button>
                <button className="btn-outline btn-lg gap-2">
                  Large with Icon
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Accent Buttons */}
            <div className="mb-16">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Accent Buttons</h3>
              <div className="flex flex-wrap gap-4 p-8 bg-slate-50 rounded-lg">
                <button className="btn-accent btn-sm">Small</button>
                <button className="btn-accent btn-md">Medium</button>
                <button className="btn-accent btn-lg shadow-elevated">Large</button>
              </div>
            </div>

            {/* Ghost Buttons */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Ghost Buttons</h3>
              <div className="flex flex-wrap gap-4 p-8 bg-slate-50 rounded-lg">
                <button className="btn-ghost btn-sm">Small</button>
                <button className="btn-ghost btn-md">Medium</button>
                <button className="btn-ghost btn-lg">Large</button>
              </div>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section id="cards" className="section-pad-sm bg-slate-50">
          <div className="container-max">
            <h2 className="font-serif text-4xl text-slate-900 mb-12">Cards & Components</h2>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Elevated Card */}
              <div className="card-elevated p-8 hover-lift">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <HeartIcon className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-slate-900 mb-2">Elevated Card</h3>
                <p className="text-slate-600 text-sm">
                  This is a premium elevated card with subtle shadows and hover effects. Perfect for interactive content.
                </p>
              </div>

              {/* Feature Card */}
              <div className="p-8 rounded-lg border border-slate-200/50 hover:border-teal-200/50 hover:shadow-subtle transition-all duration-300">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <SparklesIcon className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-slate-900 mb-2">Feature Card</h3>
                <p className="text-slate-600 text-sm">
                  A border card that subtly changes on hover, great for feature grids and lists.
                </p>
              </div>
            </div>

            {/* Testimonial Card */}
            <div className="max-w-sm card-elevated p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4 text-amber-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-slate-700 mb-6 leading-relaxed text-sm">
                "This is an exceptional component with beautiful typography and refined hover states. Simply elegant."
              </blockquote>
              <div className="flex items-center gap-3 pt-6 border-t border-slate-200">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-xs">JD</span>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-slate-900">John Designer</div>
                  <div className="text-xs text-slate-500">UI/UX Designer</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Badges Section */}
        <section className="section-pad-sm bg-white">
          <div className="container-max">
            <h2 className="font-serif text-4xl text-slate-900 mb-12">Badges & Labels</h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Badge Styles</h3>
                <div className="flex flex-wrap gap-3">
                  <span className="badge badge-primary">Primary</span>
                  <span className="badge badge-success">Success</span>
                  <span className="badge badge-warning">Warning</span>
                  <span className="badge badge-danger">Danger</span>
                  <span className="badge badge-neutral">Neutral</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Badges with Icons</h3>
                <div className="flex flex-wrap gap-3">
                  <span className="badge badge-success gap-1">
                    <CheckIcon className="h-3 w-3" />
                    Active
                  </span>
                  <span className="badge badge-warning gap-1">
                    <span className="inline-block w-2 h-2 bg-current rounded-full" />
                    Pending
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Animations Section */}
        <section className="section-pad-sm bg-slate-50">
          <div className="container-max">
            <h2 className="font-serif text-4xl text-slate-900 mb-12">Animations</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-slate-900">Entrance Animations</h3>
                <div className="animate-fade-in p-8 bg-white rounded-lg border border-slate-200">
                  <p className="text-slate-600 text-sm">Fade In (600ms)</p>
                </div>
                <div className="animate-fade-in-up p-8 bg-white rounded-lg border border-slate-200">
                  <p className="text-slate-600 text-sm">Fade In Up (700ms)</p>
                </div>
                <div className="animate-scale-in p-8 bg-white rounded-lg border border-slate-200">
                  <p className="text-slate-600 text-sm">Scale In (500ms)</p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-slate-900">Interactive States</h3>
                <button className="w-full p-8 bg-white rounded-lg border border-slate-200 hover-lift text-left">
                  <p className="text-slate-600 text-sm">Hover Lift</p>
                </button>
                <div className="p-8 bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <img
                    src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22100%22%3E%3Crect%20fill%3D%22%23d1d5db%22%20width%3D%22200%22%20height%3D%22100%22%2F%3E%3C%2Fsvg%3E"
                    alt="placeholder"
                    className="image-hover"
                  />
                  <p className="text-slate-600 text-sm mt-4">Image Hover (105% scale)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Forms Section */}
        <section className="section-pad-sm bg-white">
          <div className="container-max">
            <h2 className="font-serif text-4xl text-slate-900 mb-12">Forms & Inputs</h2>

            <div className="max-w-md space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Email Address</label>
                <input 
                  type="email" 
                  className="input w-full" 
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Message</label>
                <textarea 
                  className="input w-full resize-none h-24" 
                  placeholder="Your message..."
                />
              </div>

              <div className="flex gap-3">
                <button className="btn-primary btn-md flex-1">Submit</button>
                <button className="btn-outline btn-md flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </section>

        {/* Layout Patterns */}
        <section className="section-pad-sm bg-slate-50">
          <div className="container-max">
            <h2 className="font-serif text-4xl text-slate-900 mb-12">Layout Patterns</h2>

            {/* Hero with Image */}
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-16 p-8 bg-white rounded-lg border border-slate-200">
              <div>
                <h3 className="text-2xl font-serif font-semibold text-slate-900 mb-4">Hero + Image Pattern</h3>
                <p className="text-slate-600 mb-4">
                  Two-column layout with content on left and visual on right. Responsive stacking on mobile.
                </p>
                <button className="btn-primary btn-md gap-2">
                  Learn More
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="h-48 bg-gradient-to-br from-teal-500/10 to-slate-900/5 rounded-lg flex items-center justify-center">
                <p className="text-slate-400">Visual Content</p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="mb-12">
              <h3 className="text-2xl font-serif font-semibold text-slate-900 mb-8">Features Grid with Stagger</h3>
              <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-6 border border-slate-200/50 rounded-lg hover:border-teal-200/50 transition-all"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <HeartIcon className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Feature {i}</h4>
                      <p className="text-sm text-slate-600">Description of the feature</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="p-8 bg-white rounded-lg border border-slate-200">
              <h3 className="text-2xl font-serif font-semibold text-slate-900 mb-8">Stats Pattern</h3>
              <div className="grid md:grid-cols-3 gap-12">
                <div className="text-center md:text-left">
                  <div className="text-5xl font-serif font-bold text-slate-900 mb-2">1000+</div>
                  <div className="text-sm uppercase tracking-wider text-slate-500 font-medium">Users</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-5xl font-serif font-bold text-slate-900 mb-2">99.9%</div>
                  <div className="text-sm uppercase tracking-wider text-slate-500 font-medium">Uptime</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-5xl font-serif font-bold text-slate-900 mb-2">24/7</div>
                  <div className="text-sm uppercase tracking-wider text-slate-500 font-medium">Support</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-pad bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="container-max text-center">
            <h2 className="font-serif text-4xl text-white mb-6">Ready to Build?</h2>
            <p className="text-lg text-slate-300 mb-8 font-light max-w-2xl mx-auto">
              Use these patterns and components to create beautiful, consistent user interfaces.
            </p>
            <button className="btn-primary btn-lg gap-2 shadow-elevated hover:shadow-floating">
              Get Started
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-950 text-slate-300 py-16">
          <div className="container-max">
            <div className="text-center text-sm">
              <p>&copy; 2025 Modern Design System. All rights reserved.</p>
              <p className="text-xs text-slate-500 mt-2">Last updated: March 2025</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default DesignShowcase;
