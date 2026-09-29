import React, { useState, useEffect } from 'react';
import { X, History, CheckCircle2, AlertTriangle, Send, RefreshCw, Clock } from 'lucide-react';
import { api } from '../services/api';
import type { Submission, Review, SubmissionHistory } from '../types';

interface SubmissionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: number | null;
}

export const SubmissionHistoryModal: React.FC<SubmissionHistoryModalProps> = ({
  isOpen,
  onClose,
  submissionId,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [history, setHistory] = useState<SubmissionHistory[]>([]);

  useEffect(() => {
    if (!isOpen || !submissionId) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.getSubmissionDetail(submissionId);
        setSubmission(res.submission);
        setReviews(res.reviews || []);
        setHistory(res.history || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, submissionId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-semibold text-base">ประวัติและบันทึกการส่งเอกสาร</h3>
              <p className="text-xs text-slate-400">
                {submission?.subject_name ? `${submission.subject_code} ${submission.subject_name}` : 'กำลังโหลด...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm animate-pulse">
              กำลังดึงประวัติการส่งเอกสาร...
            </div>
          ) : (
            <>
              {/* Review Feedback Box (If any) */}
              {reviews.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    ผลการตรวจและข้อเสนอแนะ ({reviews.length})
                  </h4>
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                        r.status === 'approved'
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                          : 'bg-orange-50/70 border-orange-200 text-orange-950'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1.5">
                          {r.status === 'approved' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                          )}
                          {r.reviewer_name || 'ผู้ตรวจ'}{' '}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 font-normal">
                            {r.status === 'approved' ? 'อนุมัติ' : 'ส่งกลับแก้ไข'}
                          </span>
                        </span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          {new Date(r.reviewed_at).toLocaleString('th-TH')}
                        </span>
                      </div>
                      {r.comment ? (
                        <p className="pl-5 text-slate-700 italic">"{r.comment}"</p>
                      ) : (
                        <p className="pl-5 text-slate-500 italic">- ไม่ได้ระบุข้อความเพิ่มเติม -</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  ลำดับเหตุการณ์ (Timeline)
                </h4>

                <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {history.map((item) => (
                    <div key={item.id} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center text-[10px]">
                        {item.action.includes('approve') ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        ) : item.action.includes('revision') ? (
                          <span className="w-2 h-2 rounded-full bg-orange-500" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>

                      <div className="text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">
                            {item.action === 'submit' && '📤 ส่งเอกสาร'}
                            {item.action === 'resubmit' && '🔄 ส่งเอกสารฉบับแก้ไข'}
                            {item.action === 'review_approve' && '✅ อนุมัติผ่านการตรวจ'}
                            {item.action === 'review_revision' && '⚠️ ส่งกลับเพื่อแก้ไข'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(item.created_at).toLocaleString('th-TH')}
                          </span>
                        </div>
                        {item.note && (
                          <p className="text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
