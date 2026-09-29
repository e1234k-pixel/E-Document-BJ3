import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { User, Department, Campaign } from '../types';
import {
  ShieldCheck,
  Users,
  Building2,
  Calendar,
  KeyRound,
  CheckCircle2,
  XCircle,
  Database,
  Plus,
  Search,
  Server
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, usersList, refreshUsers } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'departments' | 'campaigns' | 'system'>('users');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, campRes] = await Promise.all([
        api.getDepartments(),
        api.getCampaigns(),
        refreshUsers(),
      ]);
      setDepartments(deptRes);
      setCampaigns(campRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Admin Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Console • ระบบดูแลและตั้งค่า</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            การบริหารจัดการระบบและผู้ใช้งาน
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ผู้ดูแลระบบ: {user?.title}{user?.name} ({user?.username})
          </p>
        </div>

        {/* System Status Pill */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>Cloudflare D1 Database: ออนไลน์</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm text-xs font-semibold gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ผู้ใช้งานในระบบ ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'departments' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>กลุ่มสาระการเรียนรู้ ({departments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'campaigns' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>รอบการส่ง (Campaigns) ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'system' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>ข้อมูลโครงสร้างระบบ</span>
        </button>
      </div>

      {/* TAB 1: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ, username หรือบทบาท..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-xs text-slate-400">พบ {filteredUsers.length} บัญชีผู้ใช้</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">ชื่อ - นามสกุล</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">บทบาท (Role)</th>
                  <th className="px-4 py-3">กลุ่มสาระการเรียนรู้</th>
                  <th className="px-4 py-3 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {u.title}{u.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{u.username}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.department_name ? u.department_name.replace('กลุ่มสาระการเรียนรู้', '') : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>เปิดใช้งาน</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Departments */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {departments.map((d) => (
            <div key={d.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                {d.code}
              </span>
              <h3 className="font-bold text-sm text-slate-900 leading-snug">{d.name}</h3>
              <p className="text-xs text-slate-500">หัวหน้ากลุ่ม: {d.head_name || 'ยังไม่กำหนด'}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Campaigns */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600">
                  ภาคเรียน {c.semester}/{c.academic_year}
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-0.5">{c.title}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  เปิดรับ: {c.start_date} • ปิดรับ: {c.due_date}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● กำลังเปิดรับ
              </span>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: System Architecture Details */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 text-xs">
          <h3 className="font-bold text-base text-slate-900">รายละเอียดสถาปัตยกรรมระบบ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="font-bold text-slate-800">Hosting & Edge CDN</p>
              <p className="text-slate-600">Cloudflare Pages (Global Network, SSL อัตโนมัติ)</p>
              <p className="font-bold text-slate-800 mt-2">Serverless Database</p>
              <p className="text-slate-600">Cloudflare D1 (Edge Relational SQLite)</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="font-bold text-slate-800">Source Control & CI/CD</p>
              <p className="text-slate-600">GitHub Repository + GitHub Actions Workflow</p>
              <p className="font-bold text-slate-800 mt-2">Document Storage Policy</p>
              <p className="text-slate-600">Google Drive Links / QR Codes (Zero server file storage cost)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
