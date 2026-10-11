/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  getProductReviews, 
  submitProductReview, 
  updateProductReview, 
  deleteProductReview 
} from '@/lib/apiClient';
import { Review } from '@/types';
import { Star, MessageSquare, Edit3, Trash2, CheckCircle2, AlertCircle, Send, X, Clock, User as UserIcon } from 'lucide-react';
import { format as formatJalali } from 'date-fns-jalali';
import { toPersianNumbers } from '@/components/PriceDisplay';

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit states
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editHoverRating, setEditHoverRating] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editComment, setEditComment] = useState('');
  const [updating, setUpdating] = useState(false);

  // Toast / Feedback states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const loadReviews = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const data = await getProductReviews(productId);
      setReviews(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError('خطا در بارگذاری نظرات.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Find if current logged-in user has an existing review for this product
  const userReview = user ? reviews.find(r => {
    const reviewerId = r.user?.id || (r as any).userId || (r as any).product_id;
    const currentUserId = (user as any).id || (user as any)._id;
    return reviewerId && currentUserId && String(reviewerId) === String(currentUserId);
  }) : null;

  // Format Date using date-fns-jalali
  const formatReviewDate = (dateStr?: string) => {
    if (!dateStr) return 'تاریخ نامشخص';
    try {
      const d = new Date(dateStr);
      return formatJalali(d, 'd MMMM yyyy');
    } catch (e) {
      return toPersianNumbers(dateStr);
    }
  };

  // 1. Submit Review Action
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      showToast('برای ثبت نظر ابتدا باید وارد حساب کاربری خود شوید.', 'error');
      return;
    }
    if (!comment.trim()) {
      showToast('لطفاً متن نظر خود را وارد کنید.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await submitProductReview(token, productId, rating, title, comment);
      showToast('نظر شما ثبت شد و پس از تایید مدیریت نمایش داده خواهد شد.', 'success');
      setTitle('');
      setComment('');
      setRating(5);
      // Reload list to sync state
      await loadReviews();
    } catch (err: any) {
      console.error('Submit review error:', err);
      const msg = err.message || '';
      if (msg.includes('قبلاً') || msg.includes('duplicate') || msg.includes('400')) {
        showToast('شما قبلاً برای این محصول نظر ثبت کردهاید', 'error');
      } else {
        showToast(err.message || 'خطا در ثبت نظر جدید.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Open Edit Form Action
  const startEdit = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating || 5);
    setEditTitle(review.title || '');
    setEditComment(review.comment || '');
  };

  // 3. Update Review Action
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview || !token) return;
    if (!editComment.trim()) {
      showToast('لطفاً متن نظر خود را وارد کنید.', 'error');
      return;
    }

    setUpdating(true);
    try {
      await updateProductReview(token, editingReview.id, editRating, editTitle, editComment);
      showToast('نظر شما ویرایش شد و پس از تایید مجدد مدیریت نمایش داده خواهد شد.', 'success');
      setEditingReview(null);
      await loadReviews();
    } catch (err: any) {
      console.error('Update review error:', err);
      showToast(err.message || 'خطا در ویرایش نظر.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // 4. Delete Review Action
  const handleDelete = async (reviewId: string) => {
    if (!token) return;
    if (!window.confirm('آیا از حذف این نظر اطمینان دارید؟')) return;

    try {
      await deleteProductReview(token, reviewId);
      showToast('نظر شما با موفقیت حذف شد.', 'success');
      setEditingReview(null);
      await loadReviews();
    } catch (err: any) {
      console.error('Delete review error:', err);
      showToast(err.message || 'خطا در حذف نظر.', 'error');
    }
  };

  const renderStars = (count: number, interactive = false, isEdit = false) => {
    const activeVal = isEdit ? editRating : rating;
    const hoverVal = isEdit ? editHoverRating : hoverRating;
    const currentVal = hoverVal !== null ? hoverVal : activeVal;

    return (
      <div className="flex items-center gap-1">
        {Array(5)
          .fill(0)
          .map((_, idx) => {
            const starValue = idx + 1;
            const isFilled = starValue <= currentVal;

            return (
              <button
                key={idx}
                type="button"
                disabled={!interactive}
                aria-label={`Rate ${starValue} stars`}
                onClick={() => isEdit ? setEditRating(starValue) : setRating(starValue)}
                onMouseEnter={() => interactive && (isEdit ? setEditHoverRating(starValue) : setHoverRating(starValue))}
                onMouseLeave={() => interactive && (isEdit ? setEditHoverRating(null) : setHoverRating(null))}
                className={`${interactive ? 'cursor-pointer hover:scale-110 active:scale-95 transition-transform' : 'cursor-default'}`}
              >
                <Star
                  className={`w-5 h-5 transition-colors ${
                    isFilled ? 'fill-amber-500 text-amber-500' : 'text-brand-pink/25'
                  }`}
                />
              </button>
            );
          })}
      </div>
    );
  };

  return (
    <div className="bg-white border border-brand-pink/15 rounded-[32px] p-6 md:p-8 space-y-8 text-right relative" dir="rtl">
      
      {/* Dynamic Toast Message Container */}
      {toast && (
        <div 
          className={`fixed bottom-6 right-6 md:right-10 z-50 flex items-center gap-3 px-5 py-4 rounded-[20px] shadow-xl border text-xs font-bold animate-bounce ${
            toast.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} aria-label="Close notification" className="mr-3 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-brand-pink/10 pb-4">
        <div className="bg-brand-pink-light p-2.5 rounded-[18px]">
          <MessageSquare className="w-5 h-5 text-brand-pink-dark" />
        </div>
        <div>
          <h3 className="text-base md:text-lg font-bold text-brand-charcoal">نظرات و امتیاز خریداران</h3>
          <p className="text-[11px] text-brand-stone">نظرات خود را با کاربران مرموریس به اشتراک بگذارید</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: REVIEWS LIST (Lg: col-span-7) */}
        <div className="lg:col-span-7 space-y-5">
          <h4 className="text-sm font-bold text-brand-charcoal border-r-3 border-brand-pink-dark pr-2">
            لیست نظرات ثبت شده ({toPersianNumbers(reviews.length)})
          </h4>

          {loading ? (
            <div className="space-y-4">
              {Array(2).fill(0).map((_, i) => (
                <div key={i} className="border border-brand-pink/10 rounded-[24px] p-5 space-y-3 animate-pulse bg-brand-cream/10">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-28 bg-brand-cream rounded-full" />
                    <div className="h-4 w-20 bg-brand-cream rounded-full" />
                  </div>
                  <div className="h-4 w-1/3 bg-brand-cream rounded-full" />
                  <div className="h-10 w-full bg-brand-cream rounded-[16px]" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center text-rose-500 bg-rose-50/50 rounded-[20px] text-xs font-semibold border border-rose-100 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center text-brand-stone bg-brand-cream/20 rounded-[24px] border border-dashed border-brand-pink/20 space-y-2">
              <MessageSquare className="w-8 h-8 text-brand-pink/30 mx-auto" />
              <p className="text-xs font-bold text-brand-charcoal">هنوز هیچ نظری برای این محصول ثبت نشده است.</p>
              <p className="text-[10px] text-brand-stone/80">شما اولین کسی باشید که نظر خود را ثبت می‌کنید!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
              {reviews.map((review) => {
                const reviewerName = review.user?.full_name || review.userName || 'کاربر مرموریس';
                const isApproved = review.status === 'approved' || !review.status;

                return (
                  <div 
                    key={review.id} 
                    className="border border-gray-100 bg-white rounded-[24px] p-5 space-y-3 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] relative group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-pink-light flex items-center justify-center text-brand-pink-dark">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-brand-charcoal">{reviewerName}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-brand-stone/70 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{formatReviewDate(review.created_at || review.date)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Rating value display */}
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-0.5">
                          {Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < (review.rating || 5) ? 'fill-amber-500 text-amber-500' : 'text-brand-pink/15'
                                }`}
                              />
                            ))}
                        </div>
                        {!isApproved && (
                          <span className="text-[9px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                            در انتظار تایید مدیریت
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {review.title && (
                        <h5 className="text-xs font-black text-brand-charcoal">{review.title}</h5>
                      )}
                      <p className="text-xs text-brand-stone leading-relaxed whitespace-pre-line">{review.comment}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INTERACTIVE FORM (Lg: col-span-5) */}
        <div className="lg:col-span-5 bg-brand-cream/35 border border-brand-pink/10 rounded-[24px] p-5 md:p-6 space-y-5">
          
          {/* Active Edit Form Panel */}
          {editingReview ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-brand-charcoal flex items-center gap-1 text-brand-pink-dark">
                  <Edit3 className="w-4 h-4" />
                  <span>ویرایش نظر قبلی شما</span>
                </h4>
                <button 
                  type="button" 
                  onClick={() => setEditingReview(null)} 
                  aria-label="انصراف از ویرایش نظر"
                  className="p-1 rounded-lg hover:bg-brand-pink/10 text-brand-stone transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Edit Star Rating Selection */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-brand-stone font-bold">امتیاز شما به کالا:</label>
                {renderStars(5, true, true)}
              </div>

              {/* Edit Title */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-brand-stone font-bold">عنوان نظر (اختیاری):</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="مثال: طراحی ارگونومیک، دوخت ضعیف و..."
                  className="w-full bg-white border border-brand-pink/15 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-brand-pink-dark transition-all placeholder:text-brand-stone/40"
                />
              </div>

              {/* Edit Comment */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-brand-stone font-bold">متن نظر شما:</label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={4}
                  placeholder="تجربه خرید خود را در چند جمله بنویسید..."
                  className="w-full bg-white border border-brand-pink/15 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-pink-dark transition-all placeholder:text-brand-stone/40 resize-none"
                />
              </div>

              {/* Edit Actions */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 liquid-glass-btn-accent text-xs font-black py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>{updating ? 'در حال بروزرسانی...' : 'بروزرسانی نظر'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="liquid-glass-btn text-brand-stone text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          ) : userReview ? (
            /* User already left a review -> Display the user's review with edit/delete buttons */
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-brand-pink-dark">
                <CheckCircle2 className="w-4 h-4" />
                <h4 className="text-xs font-black">نظر ثبت شده توسط شما</h4>
              </div>

              <div className="bg-white border border-brand-pink/10 rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-brand-stone/70">{formatReviewDate(userReview.created_at || userReview.date)}</span>
                  <div className="flex items-center gap-0.5">
                    {Array(5).fill(0).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < (userReview.rating || 5) ? 'fill-amber-500 text-amber-500' : 'text-brand-pink/15'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  {userReview.title && (
                    <h5 className="text-xs font-bold text-brand-charcoal">{userReview.title}</h5>
                  )}
                  <p className="text-[11px] text-brand-stone leading-relaxed whitespace-pre-line">{userReview.comment}</p>
                </div>

                <div className="flex gap-2.5 pt-2 border-t border-brand-pink/10">
                  <button
                    type="button"
                    onClick={() => startEdit(userReview)}
                    className="flex-1 border border-brand-pink/15 hover:border-brand-pink-dark/30 hover:text-brand-pink-dark text-brand-stone text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>ویرایش نظر</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(userReview.id)}
                    aria-label="حذف نظر"
                    className="border border-rose-100 hover:bg-rose-50 hover:text-rose-600 text-brand-stone text-xs font-bold p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                    title="حذف نظر"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-brand-stone leading-relaxed text-center">
                طبق قوانین مرموریس، هر کاربر مجاز به ثبت یک نظر برای هر محصول است. جهت تغییر می‌توانید نظر خود را ویرایش یا حذف کنید.
              </p>
            </div>
          ) : (
            /* Normal submission form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="text-xs font-black text-brand-charcoal">
                ثبت نظر جدید برای این محصول
              </h4>

              {/* Star Rating Selection */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-brand-stone font-bold">امتیاز شما به کالا:</label>
                {renderStars(5, true)}
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-brand-stone font-bold">عنوان نظر (اختیاری):</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: بسیار جادار، رنگ زیبا و..."
                  className="w-full bg-white border border-brand-pink/15 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-brand-pink-dark transition-all placeholder:text-brand-stone/40"
                />
              </div>

              {/* Comment */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-brand-stone font-bold">متن نظر شما:</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="کیفیت دوخت، جنس مواد استفاده شده و احساس خود را بنویسید..."
                  className="w-full bg-white border border-brand-pink/15 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-pink-dark transition-all placeholder:text-brand-stone/40 resize-none"
                />
              </div>

              {/* Actions */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full liquid-glass-btn-accent text-xs font-black py-3 rounded-xl transition-all shadow-md shadow-brand-pink/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'در حال ثبت...' : 'ارسال نظر مرموریس'}</span>
              </button>

              {!user && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-[10px] text-amber-800 leading-normal">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    برای ثبت نظر جدید یا ویرایش آن ابتدا باید وارد حساب کاربری خود شوید.
                  </span>
                </div>
              )}
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
