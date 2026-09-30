import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Campaign, Submission, DepartmentProgress } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { UrlChecker } from '../components/UrlChecker';
import { QrScannerModal } from '../components/QrScannerModal';
import { SubmissionHistoryModal } from '../components/SubmissionHistoryModal';
import { DepartmentLeaderboard } from '../components/DepartmentLeaderboard';
import { Confetti } from '../components/Confetti';
import {
  FileText,
  Calendar,
  ExternalLink,
  PlusCircle,
  QrCode,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  History,
  Send,
  Sparkles,
  ChevronRight,
  Trophy,
  Flame,
  Award
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [deptProgress, setDeptProgress] = useState<DepartmentProgress[]>([]);
  const [activeTab, setActiveTab] = useState<'tasks' | 'leaderboard'>('tasks');
  const [selectedLeaderboardCampaignId, setSelectedLeaderboardCampaignId] = useState<number>(1);
  const [showSubmissionConfetti, setShowSubmissionConfetti] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Submit Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [subjectName, setSubjectName] = useState<string>('');
  const [subjectCode, setSubjectCode] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState<string>('ม.1');
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [submissionType, setSubmissionType] = useState<'google_drive' | 'qr_code'>('google_drive');
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // History Modal State
  const [historySubmissionId, setHistorySubmissionId] = useState<number | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [cList, sList, dProg] = await Promise.all([
        api.getCampaigns(),
        api.getSubmissions({ user_id: user.id }),
        api.getDepartmentProgress(selectedLeaderboardCampaignId),
      ]);
      setCampaigns(cList);
      setSubmissions(sList);
      setDeptProgress(dProg);
      if (cList.length > 0 && selectedLeaderboardCampaignId === 1 && cList[0].id !== 1) {
        setSelectedLeaderboardCampaignId(cList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id, selectedLeaderboardCampaignId]);

  // Submission map by campaign id
  const submissionMap = new Map<number, Submission>();
  submissions.forEach((s) => submissionMap.set(s.campaign_id, s));

  // Personal Progress
  const totalCampaigns = campaigns.length;
  const submittedCount = submissions.filter((s) => s.status !== 'not_submitted').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const completionPercentage = totalCampaigns > 0 ? Math.round((submittedCount / totalCampaigns) * 100) : 0;

  // Department Ranking calculation
  const sortedDepts = [...deptProgress].sort((a, b) => {
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    return b.totalSubmitted - a.totalSubmitted;
  });
  const myDeptRankIndex = sortedDepts.findIndex((d) => d.id === user?.department_id);
  const myDeptRank = myDeptRankIndex !== -1 ? myDeptRankIndex + 1 : null;
  const myDeptData = deptProgress.find((d) => d.id === user?.department_id);

  // Open submit modal
  const handleOpenSubmit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    const existing = submissionMap.get(campaign.id);
    if (existing) {
      setSubjectName(existing.subject_name);
      setSubjectCode(existing.subject_code);
      setGradeLevel(existing.grade_level);
      setDocumentUrl(existing.document_url);
      setSubmissionType(existing.submission_type === 'qr_code' ? 'qr_code' : 'google_drive');
    } else {
      setSubjectName('');
      setSubjectCode('');
      setGradeLevel('ม.1');
      setDocumentUrl('');
      setSubmissionType('google_drive');
    }
    setSubmitSuccess(null);
    setIsSubmitModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || !user) return;

    if (!documentUrl || !documentUrl.trim()) {
      alert('กรุณาระบุ Google Drive Link หรือสแกน QR Code');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitDocument({
        campaign_id: selectedCampaign.id,
        user_id: user.id,
        subject_name: subjectName,
        subject_code: subjectCode,
        grade_level: gradeLevel,
        document_url: documentUrl.trim(),
        submission_type: submissionType,
      });

      setSubmitSuccess('🎉 ส่งเอกสารเรียบร้อยแล้ว! คะแนนกลุ่มสาระของคุณขยับขึ้นแล้ว!');
      setShowSubmissionConfetti(true);
      setTimeout(() => {
        setIsSubmitModalOpen(false);
        fetchData();
      }, 1600);
    } catch (err: any) {
      alert(err.message || 'ส่งเอกสารไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative">
      {/* Celebration Confetti */}
      {showSubmissionConfetti && (
        <Confetti duration={4000} onComplete={() => setShowSubmissionConfetti(false)} />
      )}

      {/* Teacher Profile & Progress Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{user?.department_name || 'กลุ่มสาระการเรียนรู้'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              สวัสดี {user?.title}{user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 mt-1">
              ปีการศึกษา 2569 • ส่งเอกสารวิชาการได้ง่ายและรวดเร็วภายใน 1 นาที
            </p>
          </div>

          {/* Cards: Personal Progress + Department Rank Pill */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 items-stretch">
            {myDeptRank && (
              <button
                type="button"
                onClick={() => setActiveTab('leaderboard')}
                className="bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 rounded-2xl p-4 text-left transition active:scale-95 flex flex-col justify-between group cursor-pointer min-w-[150px]"
                title="คลิกเพื่อดูตารางอันดับกลุ่มสาระทั้งหมด"
              >
                <div className="flex items-center justify-between text-xs text-amber-200 gap-2 mb-1">
                  <span className="flex items-center gap-1 font-semibold text-[11px]">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    อันดับกลุ่มสาระ
                  </span>
                  <span className="text-[10px] text-amber-300 group-hover:translate-x-0.5 transition-transform">
                    ดูตาราง ➔
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 my-1">
                  <span className="text-2xl font-black text-amber-300">
                    {myDeptRank === 1 ? '🥇 อันดับ 1' : myDeptRank === 2 ? '🥈 อันดับ 2' : myDeptRank === 3 ? '🥉 อันดับ 3' : `อันดับ ${myDeptRank}`}
                  </span>
                </div>
                <span className="text-[11px] text-amber-200/90 block font-medium truncate">
                  ส่งแล้ว {myDeptData?.percentage || 0}% ({myDeptData?.totalSubmitted}/{myDeptData?.totalTeachers} ท่าน)
                </span>
              </button>
            )}

            {/* Personal Progress Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 sm:min-w-[210px] flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-medium text-blue-200 mb-2">
                <span>ความสำเร็จของคุณ</span>
                <span className="font-bold text-white text-sm">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-black/30 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-400 h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-blue-300 mt-2">
                <span>ส่งแล้ว {submittedCount} จาก {totalCampaigns} งาน</span>
                <span>(อนุมัติ {approvedCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === 'tasks'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>รายการงานที่ต้องส่ง ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === 'leaderboard'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-300" />
          <span>ตารางอันดับกลุ่มสาระ (Leaderboard Race)</span>
          {myDeptRank && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeTab === 'leaderboard' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}
            >
              อันดับ {myDeptRank}
            </span>
          )}
        </button>
      </div>

      {/* Campaigns List (Cards) */}
      {activeTab === 'tasks' && (
      <div className="space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>รายการงานที่ต้องส่ง ประจำปีการศึกษา 2569</span>
          </h2>
          <span className="text-xs text-slate-500">
            {campaigns.length} รายการ
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
            กำลังโหลดรายการงาน...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            ยังไม่มีรอบการส่งเอกสารที่เปิดรับในขณะนี้
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((campaign) => {
              const submission = submissionMap.get(campaign.id);
              const status = submission ? submission.status : 'not_submitted';

              // Calculate days remaining
              const now = new Date();
              const dueDate = new Date(campaign.due_date + 'T23:59:59');
              const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={campaign.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Title & Status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block mb-1">
                          เทอม {campaign.semester} / {campaign.academic_year}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base leading-snug">
                          {campaign.title}
                        </h3>
                      </div>
                      <StatusBadge status={status} size="sm" />
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {campaign.description || 'ส่งเอกสารทางวิชาการตามแบบฟอร์มที่กำหนด'}
                    </p>

                    {/* Deadline & Submission details */}
                    <div className="space-y-2 py-3 border-t border-b border-slate-100 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          กำหนดส่ง:
                        </span>
                        <span className="font-medium text-slate-800">
                          {new Date(campaign.due_date).toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">เวลาที่เหลือ:</span>
                        <span
                          className={`font-semibold ${
                            diffDays < 0
                              ? 'text-rose-600'
                              : diffDays <= 3
                              ? 'text-orange-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {diffDays > 0
                            ? `เหลืออีก ${diffDays} วัน`
                            : diffDays === 0
                            ? 'วันสุดท้าย'
                            : `เลยกำหนด ${Math.abs(diffDays)} วัน`}
                        </span>
                      </div>

                      {submission && (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-slate-500">วิชาที่ส่ง:</span>
                          <span className="font-medium text-slate-800">
                            {submission.subject_code} {submission.subject_name} ({submission.grade_level})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Feedback alert (if revision required) */}
                    {status === 'revision_required' && submission?.latest_review_comment && (
                      <div className="mt-3 p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-orange-800">
                          <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
                          <span>ข้อเสนอแนะจากผู้ตรวจ:</span>
                        </div>
                        <p className="pl-5 italic">"{submission.latest_review_comment}"</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 flex flex-wrap items-center gap-2">
                    {/* Primary Button */}
                    <button
                      onClick={() => handleOpenSubmit(campaign)}
                      className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95 ${
                        status === 'not_submitted'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : status === 'revision_required'
                          ? 'bg-orange-600 hover:bg-orange-700 text-white'
                          : 'bg-slate-800 hover:bg-slate-900 text-white'
                      }`}
                    >
                      {status === 'not_submitted' ? (
                        <>
                          <Send className="w-4 h-4" />
                          <span>ส่งเอกสาร</span>
                        </>
                      ) : status === 'revision_required' ? (
                        <>
                          <Send className="w-4 h-4" />
                          <span>ส่งฉบับแก้ไข</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4" />
                          <span>แก้ไขข้อมูล / ลิงก์</span>
                        </>
                      )}
                    </button>

                    {/* View external link (if submitted) */}
                    {submission && submission.document_url && (
                      <a
                        href={submission.document_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                        title="เปิดดูเอกสาร Google Drive"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-500" />
                        <span className="hidden sm:inline">เปิดเอกสาร</span>
                      </a>
                    )}

                    {/* Timeline & Feedback */}
                    {submission && (
                      <button
                        onClick={() => setHistorySubmissionId(submission.id)}
                        className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                        title="ดูประวัติการส่ง & บันทึกผู้ตรวจ"
                      >
                        <History className="w-4 h-4 text-slate-500" />
                        <span className="hidden sm:inline">ประวัติ</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* Department Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4 animate-fadeIn">
          {campaigns.length > 1 && (
            <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm text-xs">
              <span className="font-semibold text-slate-700">เลือกรอบการประเมิน:</span>
              <select
                value={selectedLeaderboardCampaignId}
                onChange={(e) => {
                  const cId = Number(e.target.value);
                  setSelectedLeaderboardCampaignId(cId);
                  api.getDepartmentProgress(cId).then(setDeptProgress);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:outline-none"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <DepartmentLeaderboard
            deptProgress={deptProgress}
            campaignTitle={campaigns.find((c) => c.id === selectedLeaderboardCampaignId)?.title || campaigns[0]?.title}
            highlightDeptId={user?.department_id}
          />
        </div>
      )}
      {isSubmitModalOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {submissionMap.has(selectedCampaign.id) ? 'แก้ไข / ส่งเอกสารฉบับใหม่' : 'ส่งเอกสารวิชาการ'}
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">{selectedCampaign.title}</p>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {submitSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{submitSuccess}</span>
                </div>
              )}

              {/* Subject Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสวิชา <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    placeholder="เช่น ว31102"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ระดับชั้น <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="ม.1">มัธยมศึกษาปีที่ 1</option>
                    <option value="ม.2">มัธยมศึกษาปีที่ 2</option>
                    <option value="ม.3">มัธยมศึกษาปีที่ 3</option>
                    <option value="ม.4">มัธยมศึกษาปีที่ 4</option>
                    <option value="ม.5">มัธยมศึกษาปีที่ 5</option>
                    <option value="ม.6">มัธยมศึกษาปีที่ 6</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อรายวิชา <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="เช่น วิทยาศาสตร์กายภาพ 2"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Submission Method Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  วิธีแนบเอกสาร (เลือก Google Drive หรือ QR Code)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSubmissionType('google_drive')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition ${
                      submissionType === 'google_drive'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>วาง Google Drive Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmissionType('qr_code');
                      setIsQrModalOpen(true);
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition ${
                      submissionType === 'qr_code'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>แนบด้วย QR Code</span>
                  </button>
                </div>
              </div>

              {/* Link Input & Smart URL Checker */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    URL ลิงก์เอกสาร Google Drive <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsQrModalOpen(true)}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>สแกน QR Code</span>
                  </button>
                </div>

                <input
                  type="url"
                  required
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />

                {/* Real-time Google Drive URL Checker */}
                <UrlChecker url={documentUrl} />
              </div>

              {/* Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการส่งเอกสาร'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      <QrScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onScanSuccess={(decodedUrl) => {
          setDocumentUrl(decodedUrl);
          setSubmissionType('qr_code');
        }}
      />

      {/* Submission Timeline / History Modal */}
      <SubmissionHistoryModal
        isOpen={historySubmissionId !== null}
        onClose={() => setHistorySubmissionId(null)}
        submissionId={historySubmissionId}
      />
    </div>
  );
};
