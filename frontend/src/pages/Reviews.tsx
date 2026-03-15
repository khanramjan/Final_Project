import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  SparklesIcon,
  HeartIcon,
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  MinusCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  UserCircleIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useAppSelector } from '../store/hooks';
import testimonialService, { Testimonial } from '../services/testimonialService';
import mlService from '../services/mlService';

// ─── Sentiment Helpers ──────────────────────────────────────────────────────

type SentimentLabel = 'positive' | 'neutral' | 'negative';

function SentimentBadge({
  label,
  confidence,
  size = 'md',
}: {
  label?: SentimentLabel;
  confidence?: number;
  size?: 'sm' | 'md';
}) {
  if (!label) return null;

  const cfg = {
    positive: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      icon: <FaceSmileIcon className={`${size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} mr-1`} />,
      label: 'Positive',
    },
    neutral: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      icon: <MinusCircleIcon className={`${size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} mr-1`} />,
      label: 'Neutral',
    },
    negative: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-700',
      icon: <FaceFrownIcon className={`${size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} mr-1`} />,
      label: 'Negative',
    },
  }[label];

  const pct = confidence !== undefined ? Math.round(confidence * 100) : null;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border font-semibold ${cfg.bg} ${cfg.border} ${cfg.text} ${size === 'sm' ? 'text-xs' : 'text-xs'}`}
      title={pct ? `AI Confidence: ${pct}%` : undefined}
    >
      {cfg.icon}
      {cfg.label}
      {pct !== null && (
        <span className="ml-1 opacity-70 font-medium">{pct}%</span>
      )}
    </span>
  );
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <StarSolid
          key={i}
          className={`h-4 w-4 ${i < rating ? 'text-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
}

// ─── Live AI Sentiment Preview ───────────────────────────────────────────────

function LiveSentimentPreview({ text }: { text: string }) {
  const [result, setResult] = useState<{ sentiment: string; confidence: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (text.trim().length < 10) {
      setResult(null);
      return;
    }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await mlService.analyzeSentiment(text);
        setResult({ sentiment: res.sentiment, confidence: res.confidence });
      } catch {
        setResult(null);
      } finally {
        setLoading(false);
      }
    }, 450);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text]);

  if (text.trim().length < 10) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
        <SparklesIcon className="h-3.5 w-3.5 animate-spin" />
        AI analysing…
      </div>
    );
  }

  if (!result) return null;

  const isPositive = result.sentiment === 'Positive';
  const isNegative = result.sentiment === 'Negative';

  return (
    <div className="mt-2 flex items-center gap-2">
      <SparklesIcon className="h-3.5 w-3.5 text-purple-500 shrink-0" />
      <span className="text-xs text-gray-500">AI Sentiment:</span>
      <SentimentBadge
        label={isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'}
        confidence={result.confidence}
        size="sm"
      />
    </div>
  );
}

// ─── Write Review Form ───────────────────────────────────────────────────────

function WriteReviewForm({ onSuccess }: { onSuccess: () => void }) {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    rating: 5,
    comment: '',
    position: '',
    organization: '',
    badgeType: '',
  });
  const [hovered, setHovered] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (form.comment.trim().length < 10) {
      setMsg({ type: 'error', text: 'Please write at least 10 characters.' });
      return;
    }
    setSubmitting(true);
    setMsg(null);
    try {
      await testimonialService.submitTestimonial({
        rating: form.rating,
        comment: form.comment,
        position: form.position,
        organization: form.organization,
        badgeType: form.badgeType || undefined,
      });
      setMsg({ type: 'success', text: 'Thank you! Your review has been published. 🎉' });
      setForm({ rating: 5, comment: '', position: '', organization: '', badgeType: '' });
      setTimeout(() => {
        setMsg(null);
        onSuccess();
      }, 2500);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setMsg({ type: 'error', text: e?.message || 'Failed to submit review.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl border-2 border-emerald-200 shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow">
          <PencilSquareIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
          <p className="text-sm text-gray-500">Share your experience with our community</p>
        </div>
        {!isAuthenticated && (
          <span className="ml-auto text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full font-medium">
            Requires login
          </span>
        )}
      </div>

      {msg && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-5 text-sm font-medium ${
            msg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircleIcon className="h-4 w-4" />
          ) : (
            <XCircleIcon className="h-4 w-4" />
          )}
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setForm((f) => ({ ...f, rating: star }))}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <StarSolid
                  className={`h-8 w-8 transition-colors ${
                    star <= (hovered || form.rating) ? 'text-amber-400' : 'text-gray-200'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 self-center text-sm text-gray-500">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hovered || form.rating]}
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Comment <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={form.comment}
            onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
            rows={4}
            maxLength={500}
            placeholder="Share your experience with our donation platform…"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none resize-none text-sm transition-all"
          />
          <div className="flex items-center justify-between mt-1">
            <LiveSentimentPreview text={form.comment} />
            <span className={`text-xs ml-auto ${form.comment.length > 450 ? 'text-rose-500' : 'text-gray-400'}`}>
              {form.comment.length}/500
            </span>
          </div>
        </div>

        {/* Position & Org */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Your Role / Position
            </label>
            <input
              type="text"
              value={form.position}
              onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
              placeholder="e.g., Student, Donor"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Organization / Department
            </label>
            <input
              type="text"
              value={form.organization}
              onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
              placeholder="e.g., CS Department"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <HeartIcon className="h-5 w-5" />
              {isAuthenticated ? 'Submit Review' : 'Sign in to Submit'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// ─── Sentiment Stats Bar ─────────────────────────────────────────────────────

function SentimentStatsBar({ reviews }: { reviews: Testimonial[] }) {
  const total = reviews.length;
  if (total === 0) return null;

  const positive = reviews.filter((r) => r.sentimentLabel === 'positive').length;
  const neutral = reviews.filter((r) => r.sentimentLabel === 'neutral').length;
  const negative = reviews.filter((r) => r.sentimentLabel === 'negative').length;
  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / total;

  const pct = (n: number) => Math.round((n / total) * 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-10">
      <div className="flex items-center gap-2 mb-5">
        <ChartBarIcon className="h-5 w-5 text-emerald-600" />
        <h3 className="font-bold text-gray-900">Community Sentiment Overview</h3>
        <span className="ml-auto text-xs text-gray-500">{total} review{total !== 1 ? 's' : ''}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {/* Positive */}
        <div className="flex flex-col items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <FaceSmileIcon className="h-8 w-8 text-emerald-500 mb-1" />
          <span className="text-2xl font-extrabold text-emerald-700">{pct(positive)}%</span>
          <span className="text-xs text-emerald-600 font-medium">Positive</span>
          <span className="text-xs text-gray-400">{positive} review{positive !== 1 ? 's' : ''}</span>
        </div>
        {/* Neutral */}
        <div className="flex flex-col items-center p-4 bg-amber-50 rounded-xl border border-amber-100">
          <MinusCircleIcon className="h-8 w-8 text-amber-500 mb-1" />
          <span className="text-2xl font-extrabold text-amber-700">{pct(neutral)}%</span>
          <span className="text-xs text-amber-600 font-medium">Neutral</span>
          <span className="text-xs text-gray-400">{neutral} review{neutral !== 1 ? 's' : ''}</span>
        </div>
        {/* Negative */}
        <div className="flex flex-col items-center p-4 bg-rose-50 rounded-xl border border-rose-100">
          <FaceFrownIcon className="h-8 w-8 text-rose-500 mb-1" />
          <span className="text-2xl font-extrabold text-rose-700">{pct(negative)}%</span>
          <span className="text-xs text-rose-600 font-medium">Negative</span>
          <span className="text-xs text-gray-400">{negative} review{negative !== 1 ? 's' : ''}</span>
        </div>
      </div>
      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden gap-px mb-3">
        {positive > 0 && (
          <div
            className="bg-emerald-400 transition-all"
            style={{ width: `${pct(positive)}%` }}
            title={`Positive: ${pct(positive)}%`}
          />
        )}
        {neutral > 0 && (
          <div
            className="bg-amber-400 transition-all"
            style={{ width: `${pct(neutral)}%` }}
            title={`Neutral: ${pct(neutral)}%`}
          />
        )}
        {negative > 0 && (
          <div
            className="bg-rose-400 transition-all"
            style={{ width: `${pct(negative)}%` }}
            title={`Negative: ${pct(negative)}%`}
          />
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Positive</div>
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Neutral</div>
        <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Negative</div>
        <div className="ml-auto font-semibold text-gray-700">
          Avg. Rating: {avgRating.toFixed(1)} ⭐
        </div>
      </div>
    </div>
  );
}

// ─── Review Card ─────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Testimonial }) {
  const date = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-base">{review.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 leading-tight">{review.name}</p>
            {review.position && (
              <p className="text-xs text-gray-500">{review.position}{review.organization ? ` · ${review.organization}` : ''}</p>
            )}
          </div>
        </div>
        <SentimentBadge label={review.sentimentLabel} confidence={review.sentimentConfidence} />
      </div>

      {/* Stars */}
      <StarRating rating={review.rating} />

      {/* Comment */}
      <blockquote className="text-gray-700 text-sm leading-relaxed italic flex-1">
        "{review.comment}"
      </blockquote>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <span className="text-xs text-gray-400">{date}</span>
        <div className="flex gap-2 flex-wrap justify-end">
          {review.badgeType && (
            <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-full font-medium">
              {review.badgeType}
            </span>
          )}
          {review.riskLabel === 'complaint' && (
            <span className="inline-flex items-center px-2 py-0.5 bg-orange-50 border border-orange-200 text-orange-700 text-xs rounded-full font-medium">
              Complaint
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const FILTERS = ['all', 'positive', 'neutral', 'negative'] as const;
type Filter = typeof FILTERS[number];

const Reviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await testimonialService.getPublicTestimonials(100);
      setReviews(data);
    } catch {
      /* swallow */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = filter === 'all' ? reviews : reviews.filter((r) => r.sentimentLabel === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* ── Nav ─────────────────────────────────────────── */}
      <nav className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-700 transition-colors text-sm font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </button>
          <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
            <HeartIcon className="h-4 w-4 text-white" />
          </div>
          <Link to="/" className="text-base font-bold text-gray-900 hover:text-emerald-700 transition-colors">
            Donation Management System
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/campaigns" className="text-sm text-gray-600 hover:text-emerald-700 font-medium transition-colors">
              Campaigns
            </Link>
            <button
              onClick={() => { setShowForm(true); setTimeout(() => document.getElementById('write-review')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-sm font-bold hover:from-emerald-600 hover:to-green-700 transition-all shadow-sm"
            >
              Write a Review
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="py-16 text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full text-emerald-700 text-sm font-bold mb-5 shadow-sm border border-emerald-200">
          <ChatBubbleLeftRightIcon className="h-4 w-4" />
          Community Reviews
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          What Our{' '}
          <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
            Community Says
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Real reviews from students, donors and volunteers — each analysed by our AI for authenticity
          and sentiment.
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        {/* ── Stats ────────────────────────────────────── */}
        {!loading && reviews.length > 0 && <SentimentStatsBar reviews={reviews} />}

        {/* ── Filters ──────────────────────────────────── */}
        {!loading && reviews.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {FILTERS.map((f) => {
              const count = f === 'all' ? reviews.length : reviews.filter((r) => r.sentimentLabel === f).length;
              const isActive = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all capitalize ${
                    isActive
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700'
                  }`}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* ── Review Grid ──────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 font-medium">Loading reviews…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <UserCircleIcon className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium text-lg">
              {filter === 'all' ? 'No reviews yet. Be the first!' : `No ${filter} reviews found.`}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
            {filtered.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}

        {/* ── Write a Review ───────────────────────────── */}
        <div id="write-review">
          {showForm ? (
            <WriteReviewForm onSuccess={() => { load(); }} />
          ) : (
            <div className="text-center py-10 bg-white/60 rounded-2xl border-2 border-dashed border-emerald-200">
              <SparklesIcon className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-800 mb-1">Share Your Experience</h3>
              <p className="text-gray-500 text-sm mb-5">Your review is analysed by AI for sentiment in real-time.</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all shadow-md inline-flex items-center gap-2"
              >
                <PencilSquareIcon className="h-5 w-5" />
                Write a Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
