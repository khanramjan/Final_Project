import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  TrashIcon, 
  ExclamationTriangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import testimonialService, { Testimonial } from '../../services/testimonialService';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'scam-risk' | 'negative'>('all');

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      // We load more generously for moderation
      const response: any = await testimonialService.getAllTestimonials(1, 100);
      setTestimonials(response.data?.testimonials || response.testimonials || []);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, isApproved: boolean) => {
    try {
      await testimonialService.updateTestimonialStatus(id, { isApproved });
      setTestimonials(prev => 
        prev.map(t => t.id === id ? { ...t, isApproved } : t)
      );
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await testimonialService.deleteTestimonial(id);
      setTestimonials(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('Failed to delete testimonial');
    }
  };

  const filteredTestimonials = testimonials.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !t.isApproved; // Assuming we want a pending view? Not standard but useful
    if (filter === 'approved') return t.isApproved;
    if (filter === 'scam-risk') return t.isScamRisk;
    if (filter === 'negative') return t.sentimentLabel === 'negative';
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonial Moderation</h1>
          <p className="text-gray-500 mt-1">Review community stories and manage AI-flagged high-risk content.</p>
        </div>
        <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="w-full pl-3 pr-8 py-2 text-sm border-0 focus:ring-0 text-gray-700 bg-transparent cursor-pointer font-medium"
          >
            <option value="all">All Testimonials</option>
            <option value="approved">Approved</option>
            <option value="scam-risk">⚠️ Scam-Risk</option>
            <option value="negative">👎 Negative Sentiment</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No testimonials found</h3>
          <p className="text-gray-500">Try changing your filters.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredTestimonials.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden relative">
              {/* Status Border Decoration */}
              {t.isScamRisk && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
              )}
              {!t.isScamRisk && t.sentimentLabel === 'negative' && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-400"></div>
              )}

              <div className="flex flex-col md:flex-row justify-between gap-6">
                {/* Content Side */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-semibold text-gray-900">{t.name}</span>
                    <span className="text-gray-400 text-sm">•</span>
                    <span className="text-gray-600 text-sm">{new Date(t.createdAt).toLocaleDateString()}</span>
                    
                    {/* Tags */}
                    <div className="flex gap-2 ml-auto md:ml-0 md:pl-2">
                      {t.isScamRisk && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                          <ExclamationTriangleIcon className="w-3 h-3 mr-1" /> Scam Risk
                        </span>
                      )}
                      {t.sentimentLabel === 'negative' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                          Complaint
                        </span>
                      )}
                      {t.sentimentLabel === 'positive' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                          Positive
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <blockquote className="text-gray-700 italic bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
                    "{t.comment}"
                  </blockquote>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 px-4 py-3 rounded-lg">
                    <div>
                      <span className="block text-gray-500 text-xs uppercase">Role</span>
                      <span className="font-medium text-gray-900">{t.position || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase">Rating</span>
                      <span className="font-medium text-gray-900">{t.rating}/5</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase">Sentiment</span>
                      <span className="font-medium text-gray-900 capitalize">{t.sentimentLabel}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase">AI Confidence</span>
                      <span className="font-medium text-gray-900">{Math.round((t.sentimentConfidence || 0) * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* Action Side */}
                <div className="flex md:flex-col gap-3 justify-end items-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  {t.isApproved ? (
                    <button
                      onClick={() => handleUpdateStatus(t.id, false)}
                      className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <XCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
                      Revoke
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(t.id, true)}
                      className="w-full flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Approve
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                  >
                    <TrashIcon className="h-5 w-5 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
