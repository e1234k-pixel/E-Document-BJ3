import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Submission, Campaign, DepartmentProgress } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SubmissionHistoryModal } from '../components/SubmissionHistoryModal';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Search,
  Filter,
  Check,
  MessageSquare,
  History,
  FileCheck2,
  Clock
} from 'lucide-react';

export const DeptHeadDashboard: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number>(1);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Review Modal State
  const [reviewingSubmission, setReviewingSubmission] = useState<Submission | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'revision_required'>('approved');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // History Modal State
  const [historySubmissionId, setHistorySubmissionId] = useState<number | null>(null);

  const fetchData = async () => {
    if (!user?.department_id) return;
    setLoading(true);
    try {
      const [campRes, subRes] = await Promise.all([
        api.getCampaigns(),
        api.getSubmissions({
          campaign_id: selectedCampaignId,
          department_id: user.department_id,
        }),
      ]);
      setCampaigns(campRes);
      setSubmissions(subRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.department_id, selectedCampaignId]);

  // Filter Submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchSearch =
      sub.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.subject_code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'all' || sub.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // Department Stats
  const totalSubmissions = submissions.length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const underReviewCount = submissions.filter((s) => s.status === 'submitted' || s.status === 'under_review').length;
  const revisionCount = submissions.filter((s) => s.status === 'revision_required').length;

  const handleOpenReview = (sub: Submission) => {
    setReviewingSubmission(sub);
    setReviewAction('approved');
    setReviewComment('');
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSubmission || !user) return;

    setSubmittingReview(true);
    try {
      await api.reviewSubmission(reviewingSubmission.id, {
        reviewer_id: user.id,
        status: reviewAction,
        comment: reviewComment,
      });

      setReviewingSubmission(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'บันทึกผลการตรวจไม่สำเร็จ');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Department Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>{user?.department_name || 'กลุ่มสาระการเรียนรู้'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            ระบบตรวจสอบและรับรองเอกสารวิชาการ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            หัวหน้ากลุ่มสาระฯ: {user?.title}{user?.name}
          </p>
        </div>

        {/* Campaign Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            เลือกรอบการส่ง:
          </label>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(Number(e.target.value))}
            className="text-xs font-medium px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">ส่งแล้วทั้งหมด</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalSubmissions}</p>
          <span className="text-[10px] text-slate-400">ในกลุ่มสาระนี้</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-blue-600">รอการตรวจสอบ</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{underReviewCount}</p>
          <span className="text-[10px] text-blue-400">ต้องดำเนินการ</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-600">ผ่านการตรวจแล้ว</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</p>
          <span className="text-[10px] text-emerald-400">รับรองเรียบร้อย</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-orange-600">ส่งกลับแก้ไข</span>
          <p className="text-2xl font-bold text-orange-600 mt-1">{revisionCount}</p>
          <span className="text-[10px] text-orange-400">รอครูส่งใหม่</span>
        </div>
      </div>

      {/* Table & Filters */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อครู, รหัสวิชา, หรือชื่อวิชา..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="submitted">ส่งแล้ว / รอตรวจ</option>
              <option value="under_review">กำลังตรวจ</option>
              <option value="approved">ผ่านการตรวจ</option>
              <option value="revision_required">ให้แก้ไข</option>
              <option value="late">ส่งล่าช้า</option>
            </select>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">ครูผู้สอน</th>
                <th className="px-5 py-3">รหัส / รายวิชา</th>
                <th className="px-5 py-3">ชั้น</th>
                <th className="px-5 py-3">สถานะ</th>
                <th className="px-5 py-3">ส่งเมื่อ</th>
                <th className="px-5 py-3 text-center">เอกสาร</th>
                <th className="px-5 py-3 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 animate-pulse">
                    กำลังโหลดข้อมูลเอกสารในกลุ่มสาระ...
                  </td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    ไม่พบรายการเอกสารที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <div>{sub.user_name}</div>
                      <div className="text-[11px] text-slate-400">{sub.user_phone || '-'}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">{sub.subject_code}</div>
                      <div className="text-[11px] text-slate-500">{sub.subject_name}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">
                      {sub.grade_level}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={sub.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                      {new Date(sub.submitted_at).toLocaleString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <a
                        href={sub.document_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition"
                        title="เปิด Google Drive Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>เปิด Drive</span>
                      </a>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {/* Review Button */}
                      <button
                        onClick={() => handleOpenReview(sub)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-600 text-white font-semibold text-xs shadow-sm transition active:scale-95"
                      >
                        ตรวจเอกสาร
                      </button>

                      {/* History */}
                      <button
                        onClick={() => setHistorySubmissionId(sub.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                        title="ประวัติการส่ง"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {reviewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">ตรวจและรับรองเอกสาร</h3>
                <p className="text-xs text-slate-400">
                  {reviewingSubmission.user_name} • {reviewingSubmission.subject_code} {reviewingSubmission.subject_name}
                </p>
              </div>
              <button
                onClick={() => setReviewingSubmission(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveReview} className="p-6 space-y-4">
              {/* Drive Link Access Box */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-blue-900">ลิงก์เอกสาร Google Drive</p>
                  <p className="text-[11px] text-blue-700 truncate max-w-xs">{reviewingSubmission.document_url}</p>
                </div>
                <a
                  href={reviewingSubmission.document_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm shrink-0 transition"
                >
                  <span>เปิดตรวจเอกสาร</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Action Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  ผลการตรวจสอบ:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewAction('approved')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                      reviewAction === 'approved'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>✅ ผ่านการตรวจ (อนุมัติ)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewAction('revision_required')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                      reviewAction === 'revision_required'
                        ? 'bg-orange-50 border-orange-500 text-orange-800 ring-2 ring-orange-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span>⚠️ ให้แก้ไข (ส่งกลับ)</span>
                  </button>
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ข้อคิดเห็น / บันทึกข้อเสนอแนะ {reviewAction === 'revision_required' && <span className="text-rose-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  required={reviewAction === 'revision_required'}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={
                    reviewAction === 'approved'
                      ? 'ระบุข้อคิดเห็นเพื่อชื่นชมหรือให้คำแนะนำเพิ่มเติม (ถ้ามี)...'
                      : 'ระบุจุดที่ต้องแก้ไขอย่างชัดเจน เช่น กรุณาเพิ่มบันทึกหลังแผน หรือเปิดสิทธิ์ลิงก์ Drive...'
                  }
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewingSubmission(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow transition ${
                    reviewAction === 'approved'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {submittingReview ? 'กำลังบันทึก...' : 'บันทึกผลการตรวจ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      <SubmissionHistoryModal
        isOpen={historySubmissionId !== null}
        onClose={() => setHistorySubmissionId(null)}
        submissionId={historySubmissionId}
      />
    </div>
  );
};
