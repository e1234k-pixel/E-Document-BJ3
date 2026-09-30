import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ExecutiveKPIs, DepartmentProgress, Campaign } from '../types';
import {
  Tv,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  GraduationCap,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileX
} from 'lucide-react';
import { StatusDoughnutChart, DepartmentProgressBarChart } from '../components/Charts';

interface TvModePageProps {
  onClose: () => void;
}

export const TvModePage: React.FC<TvModePageProps> = ({ onClose }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number>(1);
  const [kpis, setKpis] = useState<ExecutiveKPIs | null>(null);
  const [deptProgress, setDeptProgress] = useState<DepartmentProgress[]>([]);
  const [privacyMode, setPrivacyMode] = useState<boolean>(true); // Hide teacher names by default for public displays
  const [refreshCountdown, setRefreshCountdown] = useState<number>(30);

  const fetchData = async () => {
    try {
      const [campRes, kpiRes, deptRes] = await Promise.all([
        api.getCampaigns(),
        api.getKPIs(selectedCampaignId),
        api.getDepartmentProgress(selectedCampaignId),
      ]);
      setCampaigns(campRes);
      setKpis(kpiRes);
      setDeptProgress(deptRes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCampaignId]);

  // Auto-refresh countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchData();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedCampaignId]);

  // Handle ESC key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1528] text-white overflow-y-auto p-6 sm:p-10 font-sans flex flex-col justify-between select-none">
      {/* Top TV Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="ตราประจำโรงเรียนบรรหารแจ่มใสวิทยา 3"
            className="w-14 h-14 object-contain rounded-2xl bg-white p-1 shadow-lg shadow-blue-500/20 border border-slate-700"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                โรงเรียนบรรหารแจ่มใสวิทยา ๓
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 animate-pulse">
                ● LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              ศูนย์ติดตามความก้าวหน้าเอกสารวิชาการ อำเภอด่านช้าง จังหวัดสุพรรณบุรี • ปีการศึกษา 2569
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Privacy Toggle (Section 30) */}
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
              privacyMode
                ? 'bg-blue-950/60 border-blue-500/50 text-blue-300'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
            title="สลับโหมดประชาสัมพันธ์ (ซ่อนชื่อเพื่อความเป็นส่วนตัว)"
          >
            {privacyMode ? <EyeOff className="w-4 h-4 text-blue-400" /> : <Eye className="w-4 h-4" />}
            <span>{privacyMode ? 'โหมดประชาสัมพันธ์ (ซ่อนชื่อ)' : 'โหมดห้องบริหาร'}</span>
          </button>

          {/* Auto Refresh Indicator */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
            <span>อัปเดตใน {refreshCountdown}s</span>
          </div>

          {/* Exit TV Mode Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition"
            title="ออกจาก TV Mode (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main KPI Big Numbers Banner */}
      {kpis && (
        <div className="py-6 space-y-6">
          {/* Top Headline Progress Bar */}
          <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest block mb-1">
                  ภาพรวมทั้งโรงเรียน ({selectedCampaign?.title})
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  ความก้าวหน้าการส่งเอกสารวิชาการ
                </h2>
              </div>
              <div className="text-right">
                <span className="text-4xl sm:text-5xl font-black text-blue-400">
                  {kpis.submissionRate}%
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  ส่งแล้ว {kpis.totalSubmissions} / {kpis.totalTeachers} ท่าน
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-950 rounded-full h-5 overflow-hidden p-1 border border-slate-800">
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-1000 shadow-lg shadow-blue-500/20"
                style={{ width: `${Math.min(100, Math.max(0, kpis.submissionRate))}%` }}
              />
            </div>
          </div>

          {/* 5 Giant KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-slate-900/60 rounded-3xl p-5 border border-slate-800/80 text-center">
              <span className="text-xs font-semibold text-slate-400 uppercase">ครูทั้งหมด</span>
              <p className="text-4xl sm:text-5xl font-black text-white mt-1">{kpis.totalTeachers}</p>
              <span className="text-xs text-slate-500 mt-1 block">คน</span>
            </div>

            <div className="bg-blue-950/40 rounded-3xl p-5 border border-blue-900/50 text-center">
              <span className="text-xs font-semibold text-blue-400 uppercase">ส่งแล้ว (รวม)</span>
              <p className="text-4xl sm:text-5xl font-black text-blue-400 mt-1">{kpis.totalSubmissions}</p>
              <span className="text-xs text-blue-300 mt-1 block">{kpis.submissionRate}%</span>
            </div>

            <div className="bg-emerald-950/40 rounded-3xl p-5 border border-emerald-900/50 text-center">
              <span className="text-xs font-semibold text-emerald-400 uppercase">ผ่านการตรวจแล้ว</span>
              <p className="text-4xl sm:text-5xl font-black text-emerald-400 mt-1">{kpis.approved}</p>
              <span className="text-xs text-emerald-300 mt-1 block">{kpis.approvalRate}%</span>
            </div>

            <div className="bg-orange-950/40 rounded-3xl p-5 border border-orange-900/50 text-center">
              <span className="text-xs font-semibold text-orange-400 uppercase">ส่งกลับแก้ไข</span>
              <p className="text-4xl sm:text-5xl font-black text-orange-400 mt-1">{kpis.revisionRequired}</p>
              <span className="text-xs text-orange-300 mt-1 block">รอส่งใหม่</span>
            </div>

            <div className="bg-rose-950/40 rounded-3xl p-5 border border-rose-900/50 text-center col-span-2 sm:col-span-1">
              <span className="text-xs font-semibold text-rose-400 uppercase">ยังไม่ส่ง</span>
              <p className="text-4xl sm:text-5xl font-black text-rose-400 mt-1">{kpis.notSubmitted}</p>
              <span className="text-xs text-rose-300 mt-1 block">คน</span>
            </div>
          </div>

          {/* Department Rankings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deptProgress
              .sort((a, b) => b.percentage - a.percentage)
              .map((dept, index) => (
                <div
                  key={dept.id}
                  className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-blue-400 font-black text-xs flex items-center justify-center border border-slate-700">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-bold text-sm text-white">{dept.name}</p>
                      <p className="text-xs text-slate-400">
                        ส่งแล้ว {dept.totalSubmitted} จาก {dept.totalTeachers} คน (อนุมัติ {dept.approved})
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xl font-black ${
                        dept.percentage >= 80
                          ? 'text-emerald-400'
                          : dept.percentage >= 50
                          ? 'text-blue-400'
                          : 'text-orange-400'
                      }`}
                    >
                      {dept.percentage}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <span>โรงเรียนบรรหารแจ่มใสวิทยา 3 อำเภอด่านช้าง จังหวัดสุพรรณบุรี • ฝ่ายบริหารวิชาการ • BJ3 Academic</span>
        <span>กด ESC เพื่อออกจากโหมดเต็มหน้าจอ</span>
      </div>
    </div>
  );
};
