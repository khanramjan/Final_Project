import React from 'react';
import { ArrowRightIcon, StarIcon, CheckIcon, HeartIcon } from '@heroicons/react/24/outline';

/**
 * Modern Premium Component Examples
 * Use these patterns throughout the application for consistent design
 */

// ============ BUTTON EXAMPLES ============

export const ButtonExamples = () => {
  return (
    <div className="p-8 bg-white space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-4">Primary Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <button className="btn-primary btn-sm">Small Button</button>
          <button className="btn-primary btn-md">Medium Button</button>
          <button className="btn-primary btn-lg shadow-elevated hover:shadow-floating">
            Large Button
          </button>
          <button className="btn-primary btn-lg gap-2 shadow-elevated hover:shadow-floating">
            With Icon
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-4">Secondary Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <button className="btn-outline btn-sm">Secondary</button>
          <button className="btn-outline btn-md">Secondary MD</button>
          <button className="btn-outline btn-lg gap-2">
            Learn More
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-4">Accent Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <button className="btn-accent btn-md">Accent</button>
          <button className="btn-accent btn-lg shadow-elevated">Accent Large</button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-4">Ghost Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <button className="btn-ghost btn-sm">Ghost</button>
          <button className="btn-ghost btn-md">Ghost Medium</button>
        </div>
      </div>
    </div>
  );
};

// ============ CARD EXAMPLES ============

export const CardExamples = () => {
  return (
    <div className="p-8 bg-white space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-4">Elevated Card (Interactive)</h3>
        <div className="card-elevated p-8 max-w-sm hover-lift">
          <div className="h-40 bg-gradient-to-br from-teal-500/10 to-slate-900/5 rounded-lg mb-6 flex items-center justify-center">
            <p className="text-slate-400">Image Placeholder</p>
          </div>
          <h3 className="text-lg font-serif font-semibold text-slate-900 mb-2">Card Title</h3>
          <p className="text-slate-600 text-sm mb-4">
            This is a premium card with elevation effects. It lifts slightly on hover.
          </p>
          <button className="btn-accent btn-sm">Learn More</button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-4">Minimal Card</h3>
        <div className="card-minimal p-6 max-w-sm">
          <h3 className="text-lg font-serif font-semibold text-slate-900 mb-2">Minimal Card</h3>
          <p className="text-slate-600 text-sm">
            This card has no border or shadow by default, but shows shadow on hover.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-4">Feature Card with Icon</h3>
        <div className="card-elevated p-8 max-w-sm">
          <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
            <HeartIcon className="h-6 w-6 text-teal-600" />
          </div>
          <h3 className="text-lg font-serif font-semibold text-slate-900 mb-2">Feature Title</h3>
          <p className="text-slate-600 text-sm">
            Cards with icons and proper spacing convey information clearly and elegantly.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============ FORM EXAMPLES ============

export const FormExamples = () => {
  return (
    <div className="p-8 bg-white max-w-md space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">Email Address</label>
        <input 
          type="email" 
          className="input" 
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">Message</label>
        <textarea 
          className="input resize-none h-24" 
          placeholder="Your message..."
        />
      </div>

      <div className="flex gap-3">
        <button className="btn-primary btn-md flex-1">Submit</button>
        <button className="btn-outline btn-md flex-1">Cancel</button>
      </div>
    </div>
  );
};

// ============ BADGE EXAMPLES ============

export const BadgeExamples = () => {
  return (
    <div className="p-8 bg-white space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-4">Badge Styles</h3>
        <div className="flex flex-wrap gap-3">
          <span className="badge badge-primary">Primary</span>
          <span className="badge badge-success">Success</span>
          <span className="badge badge-warning">Warning</span>
          <span className="badge badge-danger">Danger</span>
          <span className="badge badge-neutral">Neutral</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-4">Badges with Icons</h3>
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
  );
};

// ============ TESTIMONIAL CARD ============

export const TestimonialCard = ({ name, position, comment, rating, avatarUrl }: any) => {
  return (
    <div className="card-elevated p-8">
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <StarIcon key={i} className="h-4 w-4 text-amber-400 fill-current" />
        ))}
      </div>
      
      <blockquote className="text-slate-700 mb-6 leading-relaxed text-sm">
        "{comment}"
      </blockquote>
      
      <div className="flex items-center gap-3 pt-6 border-t border-slate-200">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-xs">
              {name.charAt(0)}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <div className="font-semibold text-sm text-slate-900">{name}</div>
          <div className="text-xs text-slate-500">{position}</div>
        </div>
      </div>
    </div>
  );
};

// ============ FEATURE CARD ============

export const FeatureCard = ({ icon: Icon, title, description }: any) => {
  return (
    <div className="flex gap-6 p-8 rounded-lg border border-slate-200/50 hover:border-teal-200/50 hover:shadow-subtle transition-all duration-300">
      <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
        <Icon className="h-6 w-6 text-teal-600" />
      </div>
      <div>
        <h3 className="text-lg font-serif font-semibold text-slate-900 mb-2">
          {title}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

// ============ CAMPAIGN CARD ============

export const CampaignCard = ({ campaign, href }: any) => {
  const progress = Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100);
  const progressPercent = ((campaign.currentAmount / campaign.goalAmount) * 100).toFixed(1);
  
  return (
    <a href={href} className="group card-interactive p-6 block">
      {campaign.imageUrl && (
        <div className="relative h-48 -m-6 mb-6 overflow-hidden rounded-t-lg">
          <img 
            src={campaign.imageUrl} 
            alt={campaign.title}
            className="w-full h-full object-cover image-hover"
          />
          <div className="absolute top-4 right-4">
            <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-slate-900 rounded">
              {progressPercent}%
            </span>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <span className="badge badge-primary">
            {campaign.category}
          </span>
        </div>
        
        <div>
          <h3 className="text-lg font-serif font-semibold text-slate-900 group-hover:text-teal-600 transition-colors mb-2">
            {campaign.title}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-2">
            {campaign.description}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-slate-600">Goal</span>
            <span className="font-semibold text-slate-900">
              ৳{(campaign.goalAmount / 1000).toFixed(0)}K
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-xs text-slate-500">
              {campaign.donorCount} supporter{campaign.donorCount !== 1 ? 's' : ''}
            </span>
            <span className="text-xs font-medium text-teal-600">
              ৳{(campaign.currentAmount / 1000).toFixed(0)}K raised
            </span>
          </div>
        </div>
      </div>
    </a>
  );
};

// ============ SECTION HEADERS ============

export const SectionHeader = ({ 
  label, 
  title, 
  description 
}: { 
  label: string; 
  title: string; 
  description: string; 
}) => {
  return (
    <div className="mb-16">
      <div className="inline-block mb-4">
        <span className="text-xs uppercase tracking-wider font-semibold text-teal-600">
          {label}
        </span>
      </div>
      <h2 className="font-serif text-slate-900 mb-6">
        {title}
      </h2>
      <p className="text-lg text-slate-600 max-w-2xl font-light">
        {description}
      </p>
    </div>
  );
};

// ============ STAT CARD ============

export const StatCard = ({ 
  number, 
  suffix = '', 
  label 
}: { 
  number: number | string; 
  suffix?: string; 
  label: string; 
}) => {
  return (
    <div className="text-center md:text-left">
      <div className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-2">
        {number}{suffix}
      </div>
      <div className="text-sm uppercase tracking-wider text-slate-500 font-medium">
        {label}
      </div>
    </div>
  );
};

// ============ EMPTY STATE ============

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) => {
  return (
    <div className="text-center py-16">
      <Icon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
      <h3 className="text-xl font-serif font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-8 max-w-2xl mx-auto">{description}</p>
      {action && (
        <a 
          href={action.href} 
          className="btn-primary btn-lg gap-2 inline-flex items-center"
        >
          {action.label}
          <ArrowRightIcon className="h-4 w-4" />
        </a>
      )}
    </div>
  );
};

// ============ SECTION WITH GRADIENT BACKGROUND ============

export const GradientCTASection = ({ 
  title, 
  description, 
  primaryAction, 
  secondaryAction 
}: {
  title: string;
  description: string;
  primaryAction: { label: string; onClick?: () => void };
  secondaryAction: { label: string; onClick?: () => void };
}) => {
  return (
    <section className="section-pad bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-600 rounded-full blur-3xl" />
      </div>

      <div className="container-max relative z-10 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-slate-50 mb-6">{title}</h2>
          <p className="text-lg text-slate-300 mb-10 font-light">{description}</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary btn-lg gap-2 shadow-elevated hover:shadow-floating">
              {primaryAction.label}
              <ArrowRightIcon className="h-4 w-4" />
            </button>
            <button className="btn-outline btn-lg gap-2 border-slate-400 text-slate-50 hover:bg-slate-800">
              {secondaryAction.label}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default {
  ButtonExamples,
  CardExamples,
  FormExamples,
  BadgeExamples,
  TestimonialCard,
  FeatureCard,
  CampaignCard,
  SectionHeader,
  StatCard,
  EmptyState,
  GradientCTASection,
};
