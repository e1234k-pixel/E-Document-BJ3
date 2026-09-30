import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { exportSubmissionsToExcel } from '../services/excelExport';
import type { Campaign, Submission, Department, MatrixRow, UnsubmittedResponse } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LineCopyModal } from '../components/LineCopyModal';
import { SubmissionHistoryModal } from '../components/SubmissionHistoryModal';
import {
  FileText,
  Calendar,
  ExternalLink,
  Plus,
  FileSpreadsheet,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  History,
  MessageSquare,
  Clock,
  LayoutGrid,
  ListOrdered
} from 'lucide-react';

interface AcademicDashboardProps {
  initialSubTab?: string;
}

export const AcademicDashboard: React.FC<AcademicDashboardProps> = ({ initialSubTab = 'overview' }) => {
  const { user } = useAuth();
  const [subTab, setSubTab] = useState<string>(initialSubTab);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number>(1);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Matrix Data
  const [matrixData, setMatrixData] = useState<{ campaigns: Campaign[]; matrix: MatrixRow[] }>({
    campaigns: [],
    matrix: [],
  });

  // Unsubmitted List State
  const [unsubmittedData, setUnsubmittedData] = useState<UnsubmittedResponse | null>(null);
  const [isLineModalOpen, setIsLineModalOpen] = useState<boolean>(false);

  // Campaign Create Modal
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState<boolean>(false);
  const [newCampTitle, setNewCampTitle] = useState<string>('');
  const [newCampDesc, setNewCampDesc] = useState<string>('');
  const [newCampYear, setNewCampYear] = useState<number>(2569);
  const [newCampSemester, setNewCampSemester] = useState<number>(2);
  const [newCampDocType, setNewCampDocType] = useState<string>('lesson_plan');
  const [newCampStartDate, setNewCampStartDate] = useState<string>('2026-10-01');
  const [newCampDueDate, setNewCampDueDate] = useState<string>('2026-11-30');
  const [isCreatingCamp, setIsCreatingCamp] = useState<boolean>(false);

  // Review Modal State
  const [reviewingSubmission, setReviewingSubmission] = useState<Submission | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'revision_required'>('approved');
  const [reviewComment, setReviewComment] = useState<string>('');

  // History Modal State
  const [historySubmissionId, setHistorySubmissionId] = useState<number | null>(null);

  const fetchBaseData = async () => {
    setLoading(true);
    try {
      const [campRes, deptRes] = await Promise.all([
        api.getCampaigns(),
        api.getDepartments(),
      ]);
      setCampaigns(campRes);
      setDepartments(deptRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const params: any = { campaign_id: selectedCampaignId };
      if (selectedDeptId !== 'all') params.department_id = selectedDeptId;
      const res = await api.getSubmissions(params);
      setSubmissions(res);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMatrix = async () => {
    try {
      const res = await api.getMatrix(selectedDeptId !== 'all' ? selectedDeptId : undefined);
      setMatrixData(res);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUnsubmitted = async () => {
    try {
      const res = await api.getUnsubmitted(
        selectedCampaignId,
        selectedDeptId !== 'all' ? selectedDeptId : undefined
      );
      setUnsubmittedData(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBaseData();
  }, []);

  useEffect(() => {
    if (subTab === 'overview' || subTab === 'submissions') {
      fetchSubmissions();
    } else if (subTab === 'matrix') {
      fetchMatrix();
    } else if (subTab === 'unsubmitted') {
      fetchUnsubmitted();
    }
  }, [selectedCampaignId, selectedDeptId, subTab]);

  // Export to Excel
  const handleExportExcel = () => {
    const currentCampaign = campaigns.find((c) => c.id === selectedCampaignId);
    exportSubmissionsToExcel(submissions, currentCampaign?.title || 'รายงานวิชาการ');
  };

  // Create Campaign Submit
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingCamp(true);
    try {
      await api.createCampaign({
        title: newCampTitle,
        description: newCampDesc,
        academic_year: newCampYear,
        semester: newCampSemester,
        doc_type: newCampDocType,
        start_date: newCampStartDate,
        due_date: newCampDueDate,
        status: 'active',
      });
      setIsCreateCampaignOpen(false);
      fetchBaseData();
      alert('สร้างรอบการส่งเอกสารใหม่เรียบร้อยแล้ว');
    } catch (err: any) {
      alert(err.message || 'สร้าง Campaign ไม่สำเร็จ');
    } finally {
      setIsCreatingCamp(false);
    }
  };

  // Review save
  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSubmission || !user) return;
    try {
      await api.reviewSubmission(reviewingSubmission.id, {
        reviewer_id: user.id,
        status: reviewAction,
        comment: reviewComment,
      });
      setReviewingSubmission(null);
      fetchSubmissions();
    } catch (err: any) {
      alert(err.message || 'บันทึกผลการตรวจไม่สำเร็จ');
    }
  };

  // Filtered submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchSearch =
      sub.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.subject_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>ฝ่ายวิชาการ โรงเรียนบรรหารแจ่มใสวิทยา 3 อำเภอด่านช้าง จังหวัดสุพรรณบุรี</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            ศูนย์กลางการติดตามและบริหารงานวิชาการ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ผู้ดูแล: {user?.title}{user?.name}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCreateCampaignOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>สร้าง Campaign ใหม่</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ส่งออก Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm text-xs font-semibold gap-1 overflow-x-auto">
        <button
          onClick={() => setSubTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            subTab === 'overview'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>รายการส่งเอกสารทั้งหมด</span>
        </button>

        <button
          onClick={() => setSubTab('matrix')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            subTab === 'matrix'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>ตารางติดตามการส่ง (Matrix)</span>
        </button>

        <button
          onClick={() => setSubTab('unsubmitted')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            subTab === 'unsubmitted'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-500" />
          <span>รายชื่อผู้ยังไม่ส่ง (Copy LINE)</span>
        </button>
      </div>

      {/* Campaign & Department Filter Selector */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">รอบการส่ง:</span>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-slate-300 font-medium bg-white focus:ring-2 focus:ring-blue-500"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">กลุ่มสาระฯ:</span>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 font-medium bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทุกกลุ่มสาระการเรียนรู้</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-slate-500 text-[11px]">
          แสดงข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH')}
        </span>
      </div>

      {/* TAB 1: Submissions Table */}
      {subTab === 'overview' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Search bar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อครู, กลุ่มสาระ, หรือวิชา..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="approved">ผ่านการตรวจ</option>
                <option value="submitted">รอตรวจ</option>
                <option value="revision_required">ให้แก้ไข</option>
                <option value="late">ส่งล่าช้า</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">ครูผู้ส่ง</th>
                  <th className="px-5 py-3">กลุ่มสาระการเรียนรู้</th>
                  <th className="px-5 py-3">รหัส / วิชา</th>
                  <th className="px-5 py-3">สถานะ</th>
                  <th className="px-5 py-3">วันที่ส่ง</th>
                  <th className="px-5 py-3 text-center">เอกสาร</th>
                  <th className="px-5 py-3 text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      ไม่พบข้อมูลการส่งเอกสารตามเงื่อนไข
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {sub.user_name}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {sub.department_name?.replace('กลุ่มสาระการเรียนรู้', '')}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-800">{sub.subject_code}</div>
                        <div className="text-[11px] text-slate-500">{sub.subject_name} ({sub.grade_level})</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={sub.status} size="sm" />
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                        {new Date(sub.submitted_at).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <a
                          href={sub.document_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>เปิด Drive</span>
                        </a>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setReviewingSubmission(sub);
                            setReviewAction('approved');
                            setReviewComment('');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-600 text-white font-semibold text-xs transition"
                        >
                          ตรวจงาน
                        </button>
                        <button
                          onClick={() => setHistorySubmissionId(sub.id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                          title="ดูประวัติ"
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
      )}

      {/* TAB 2: Submission Matrix (Teachers x Campaigns) */}
      {subTab === 'matrix' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                ตารางติดตามการส่งเอกสารทางวิชาการ (Submission Matrix)
              </h3>
              <p className="text-xs text-slate-500">
                แสดงสถานะการส่งของครูทุกคนเทียบกับทุกรอบ Campaign แบบภาพรวม
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">✅ ผ่าน</span>
              <span className="flex items-center gap-1">⏳ รอตรวจ</span>
              <span className="flex items-center gap-1">⚠️ แก้ไข</span>
              <span className="flex items-center gap-1">❌ ยังไม่ส่ง</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="p-3 border-r border-slate-200 w-12 text-center">#</th>
                  <th className="p-3 border-r border-slate-200 min-w-[180px]">ครูผู้สอน</th>
                  <th className="p-3 border-r border-slate-200 min-w-[180px]">กลุ่มสาระการเรียนรู้</th>
                  {matrixData.campaigns.map((camp) => (
                    <th key={camp.id} className="p-3 border-r border-slate-200 text-center min-w-[140px]">
                      {camp.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matrixData.matrix.map((row, idx) => (
                  <tr key={row.teacher.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 border-r border-slate-200 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="p-3 border-r border-slate-200 font-semibold text-slate-800">
                      {row.teacher.title}{row.teacher.name}
                    </td>
                    <td className="p-3 border-r border-slate-200 text-slate-600">
                      {row.teacher.department_name?.replace('กลุ่มสาระการเรียนรู้', '')}
                    </td>
                    {matrixData.campaigns.map((camp) => {
                      const statusObj = row.campaigns[camp.id];
                      const status = statusObj?.status || 'not_submitted';

                      return (
                        <td key={camp.id} className="p-3 border-r border-slate-200 text-center">
                          {status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                              ✅ ผ่าน
                            </span>
                          )}
                          {status === 'submitted' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                              ⏳ รอตรวจ
                            </span>
                          )}
                          {status === 'under_review' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
                              ⏳ กำลังตรวจ
                            </span>
                          )}
                          {status === 'revision_required' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 font-bold text-xs border border-orange-200">
                              ⚠️ ให้แก้ไข
                            </span>
                          )}
                          {status === 'late' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                              🔴 ส่งล่าช้า
                            </span>
                          )}
                          {status === 'not_submitted' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-400 font-medium text-xs">
                              ❌ ยังไม่ส่ง
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Unsubmitted List & LINE Notification Copy */}
      {subTab === 'unsubmitted' && unsubmittedData && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  เครื่องมือแจ้งเตือนผ่านกลุ่ม LINE
                </span>
              </div>
              <h3 className="font-bold text-lg text-emerald-950 mt-1">
                รายชื่อคุณครูที่ยังไม่ส่งงาน: {unsubmittedData.campaign.title}
              </h3>
              <p className="text-xs text-emerald-800 mt-1">
                {unsubmittedData.daysRemaining >= 0
                  ? `⏳ เหลือเวลาอีก ${unsubmittedData.daysRemaining} วัน (กำหนดส่ง ${new Date(unsubmittedData.campaign.due_date).toLocaleDateString('th-TH')})`
                  : `⚠️ เลยกำหนดเวลาส่งมาแล้ว ${Math.abs(unsubmittedData.daysRemaining)} วัน`}
              </p>
            </div>

            <button
              onClick={() => setIsLineModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs shadow-md hover:shadow-lg transition active:scale-95 flex items-center gap-2 shrink-0"
            >
              <MessageSquare className="w-5 h-5 fill-white" />
              <span>สร้างข้อความ & Copy ส่ง LINE</span>
            </button>
          </div>

          {/* List of Teachers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <span>รายชื่อคุณครูที่ยังไม่ส่ง ({unsubmittedData.teachers.length} ท่าน)</span>
            </h4>

            {unsubmittedData.teachers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm bg-slate-50 rounded-2xl border border-slate-100">
                🎉 ยอดเยี่ยมมาก! คุณครูส่งงานครบถ้วนทุกคนแล้ว
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {unsubmittedData.teachers.map((t, idx) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-900">
                        {idx + 1}. ครู{t.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {t.department_name.replace('กลุ่มสาระการเรียนรู้', '')}
                      </p>
                    </div>
                    {t.phone && (
                      <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded">
                        {t.phone}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {isCreateCampaignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">สร้างรอบการส่งเอกสารใหม่ (New Campaign)</h3>
                <p className="text-xs text-slate-400">รองรับแผนการสอน, วิจัย, PLC, SAR, PA, ID Plan</p>
              </div>
              <button
                onClick={() => setIsCreateCampaignOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อรอบการส่ง (Campaign Title) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCampTitle}
                  onChange={(e) => setNewCampTitle(e.target.value)}
                  placeholder="เช่น ส่งรายงาน PLC ภาคเรียนที่ 2/2569"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">คำอธิบายและแนวทาง</label>
                <textarea
                  rows={2}
                  value={newCampDesc}
                  onChange={(e) => setNewCampDesc(e.target.value)}
                  placeholder="รายละเอียดเอกสารที่ต้องส่ง..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ปีการศึกษา</label>
                  <input
                    type="number"
                    value={newCampYear}
                    onChange={(e) => setNewCampYear(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ภาคเรียน</label>
                  <select
                    value={newCampSemester}
                    onChange={(e) => setNewCampSemester(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ประเภทเอกสาร</label>
                  <select
                    value={newCampDocType}
                    onChange={(e) => setNewCampDocType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="lesson_plan">แผนการจัดการเรียนรู้</option>
                    <option value="research">งานวิจัยในชั้นเรียน</option>
                    <option value="plc">รายงาน PLC</option>
                    <option value="pa">ข้อตกลง ว PA</option>
                    <option value="sar">รายงาน SAR</option>
                    <option value="other">งานวิชาการอื่นๆ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันเปิดรับ</label>
                  <input
                    type="date"
                    required
                    value={newCampStartDate}
                    onChange={(e) => setNewCampStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันปิดรับ (Deadline)</label>
                  <input
                    type="date"
                    required
                    value={newCampDueDate}
                    onChange={(e) => setNewCampDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateCampaignOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCamp}
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow"
                >
                  {isCreatingCamp ? 'กำลังสร้าง...' : 'สร้าง Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LINE Copy Modal */}
      {unsubmittedData && (
        <LineCopyModal
          isOpen={isLineModalOpen}
          onClose={() => setIsLineModalOpen(false)}
          campaign={unsubmittedData.campaign}
          daysRemaining={unsubmittedData.daysRemaining}
          teachers={unsubmittedData.teachers}
        />
      )}

      {/* Review Modal */}
      {reviewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">ตรวจเอกสาร (ฝ่ายวิชาการ)</h3>
                <p className="text-xs text-slate-400">{reviewingSubmission.user_name} • {reviewingSubmission.subject_name}</p>
              </div>
              <button onClick={() => setReviewingSubmission(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveReview} className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-900">Google Drive Link</p>
                  <p className="text-[11px] text-blue-700 truncate max-w-xs">{reviewingSubmission.document_url}</p>
                </div>
                <a
                  href={reviewingSubmission.document_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg flex items-center gap-1 shadow-sm shrink-0"
                >
                  <span>เปิดดูไฟล์</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-2">ผลการพิจารณา:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewAction('approved')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold ${
                      reviewAction === 'approved' ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500' : 'border-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>ผ่านการตรวจ (อนุมัติ)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction('revision_required')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold ${
                      reviewAction === 'revision_required' ? 'bg-orange-50 border-orange-500 text-orange-800 ring-2 ring-orange-500' : 'border-slate-200'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span>ให้แก้ไข (ส่งกลับ)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ข้อคิดเห็น / บันทึก:</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="ระบุคำแนะนำสำหรับคุณครู..."
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewingSubmission(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow"
                >
                  บันทึกผล
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
