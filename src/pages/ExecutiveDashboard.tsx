import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ExecutiveKPIs, DepartmentProgress, Campaign, MatrixRow } from '../types';
import { StatusDoughnutChart, DepartmentProgressBarChart, DailySubmissionsLineChart } from '../components/Charts';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileX,
  Tv,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  Filter
} from 'lucide-react';

interface ExecutiveDashboardProps {
  onOpenTvMode: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ onOpenTvMode }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number>(1);
  const [kpis, setKpis] = useState<ExecutiveKPIs | null>(null);
  const [deptProgress, setDeptProgress] = useState<DepartmentProgress[]>([]);
  const [matrixData, setMatrixData] = useState<{ campaigns: Campaign[]; matrix: MatrixRow[] }>({
    campaigns: [],
    matrix: [],
  });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campRes, kpiRes, deptRes, matRes] = await Promise.all([
        api.getCampaigns(),
        api.getKPIs(selectedCampaignId),
        api.getDepartmentProgress(selectedCampaignId),
        api.getMatrix(),
      ]);
      setCampaigns(campRes);
      setKpis(kpiRes);
      setDeptProgress(deptRes);
      setMatrixData(matRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCampaignId]);

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Executive Welcome & Mode Switch Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Executive Overview • แดชบอร์ดสำหรับผู้บริหาร</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            รายงานความก้าวหน้าการดำเนินงานทางวิชาการ
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            โรงเรียนบรรหารแจ่มใสวิทยา 3 อำเภอด่านช้าง จังหวัดสุพรรณบุรี • ติดตามการส่งแผนการสอน ว PA และงานวิจัยในชั้นเรียนแบบ Real-time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Campaign Selector */}
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 text-xs">
            <span className="text-slate-300 block text-[10px]">เลือกรอบการประเมิน:</span>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(Number(e.target.value))}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer mt-0.5"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id} className="text-slate-900">
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* TV Presentation Mode Button */}
          <button
            onClick={onOpenTvMode}
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition active:scale-95 shrink-0"
          >
            <Tv className="w-4 h-4" />
            <span>เปิด Presentation / TV Mode</span>
          </button>
        </div>
      </div>

      {/* School-wide Progress Bar Banner */}
      {kpis && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                ความก้าวหน้าการส่งเอกสารทั้งโรงเรียน ({selectedCampaign?.title})
              </h2>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-blue-600">{kpis.submissionRate}%</span>
              <span className="text-xs text-slate-500 ml-1">ส่งแล้ว</span>
            </div>
          </div>

          {/* Large Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${Math.min(100, Math.max(0, kpis.submissionRate))}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
            <span>ส่งแล้ว {kpis.totalSubmissions} ท่าน จากครูทั้งหมด {kpis.totalTeachers} ท่าน</span>
            <span>อนุมัติผ่านการตรวจแล้ว {kpis.approved} ฉบับ ({kpis.approvalRate}%)</span>
          </div>
        </div>
      )}

      {/* 6 Key Executive Metric Cards */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-2">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-slate-500">ครูทั้งหมด</span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{kpis.totalTeachers}</p>
            <span className="text-[10px] text-slate-400">คน</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-blue-600">ส่งแล้ว</span>
            <p className="text-2xl font-black text-blue-600 mt-0.5">{kpis.totalSubmissions}</p>
            <span className="text-[10px] text-blue-400">{kpis.submissionRate}%</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-2">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-amber-700">รอการตรวจสอบ</span>
            <p className="text-2xl font-black text-amber-600 mt-0.5">
              {kpis.submitted + kpis.underReview}
            </p>
            <span className="text-[10px] text-amber-500">ฉบับ</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-2">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-orange-700">ส่งกลับแก้ไข</span>
            <p className="text-2xl font-black text-orange-600 mt-0.5">{kpis.revisionRequired}</p>
            <span className="text-[10px] text-orange-500">รอส่งใหม่</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-700">ผ่านการตรวจแล้ว</span>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{kpis.approved}</p>
            <span className="text-[10px] text-emerald-500">{kpis.approvalRate}%</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 mb-2">
              <FileX className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-rose-700">ยังไม่ส่ง</span>
            <p className="text-2xl font-black text-rose-600 mt-0.5">{kpis.notSubmitted}</p>
            <span className="text-[10px] text-rose-500">คน</span>
          </div>
        </div>
      )}

      {/* 3 Analytics Charts */}
      {kpis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doughnut Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="font-bold text-sm text-slate-800">สัดส่วนสถานะการส่งเอกสาร</h3>
              <p className="text-xs text-slate-500">จำแนกตามสถานะการส่งและผลการตรวจ</p>
            </div>
            <StatusDoughnutChart kpis={kpis} />
          </div>

          {/* Department Progress Bar Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="font-bold text-sm text-slate-800">% ความก้าวหน้าแต่ละกลุ่มสาระฯ</h3>
              <p className="text-xs text-slate-500">เปรียบเทียบความพร้อมรายกลุ่มวิชา</p>
            </div>
            <DepartmentProgressBarChart progressList={deptProgress} />
          </div>

          {/* Daily Trend Line Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="font-bold text-sm text-slate-800">แนวโน้มการส่งงานรายวัน</h3>
              <p className="text-xs text-slate-500">จำนวนการส่งสะสม 7 วันย้อนหลัง</p>
            </div>
            <DailySubmissionsLineChart />
          </div>
        </div>
      )}

      {/* Department Progress Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              ตารางสรุปความก้าวหน้ารายกลุ่มสาระการเรียนรู้
            </h3>
            <p className="text-xs text-slate-500">
              จัดอันดับตามเปอร์เซ็นต์ความก้าวหน้าในการส่งเอกสาร
            </p>
          </div>
          <span className="text-xs text-slate-400">{deptProgress.length} กลุ่มสาระ/กิจกรรม</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">กลุ่มสาระการเรียนรู้</th>
                <th className="px-4 py-3 text-center">ครูทั้งหมด</th>
                <th className="px-4 py-3 text-center">ส่งแล้ว</th>
                <th className="px-4 py-3 text-center">อนุมัติแล้ว</th>
                <th className="px-4 py-3 text-center">ต้องแก้ไข</th>
                <th className="px-4 py-3 text-center">ยังไม่ส่ง</th>
                <th className="px-4 py-3 text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deptProgress
                .sort((a, b) => b.percentage - a.percentage)
                .map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3.5 font-bold text-slate-800">
                      <div>{dept.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        หัวหน้ากลุ่ม: {dept.head_name || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-medium text-slate-700">
                      {dept.totalTeachers}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-blue-600">
                      {dept.totalSubmitted}
                    </td>
                    <td className="px-4 py-3.5 text-center font-medium text-emerald-600">
                      {dept.approved}
                    </td>
                    <td className="px-4 py-3.5 text-center font-medium text-orange-600">
                      {dept.revision}
                    </td>
                    <td className="px-4 py-3.5 text-center font-medium text-rose-600">
                      {dept.notSubmitted}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              dept.percentage >= 80
                                ? 'bg-emerald-500'
                                : dept.percentage >= 50
                                ? 'bg-blue-500'
                                : 'bg-orange-500'
                            }`}
                            style={{ width: `${dept.percentage}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-slate-900 w-10 text-right">
                          {dept.percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
