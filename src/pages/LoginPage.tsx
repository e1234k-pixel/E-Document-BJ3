import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, User, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import type { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, switchRole, usersList } = useAuth();
  const [username, setUsername] = useState<string>('teacher_somchai');
  const [password, setPassword] = useState<string>('teacher123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleFastDemoLogin = (role: UserRole) => {
    switchRole(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Emblem */}
        <div className="inline-flex p-4 rounded-3xl bg-blue-600/30 border border-blue-400/30 shadow-2xl backdrop-blur-md mb-4 text-white">
          <GraduationCap className="w-12 h-12 text-blue-400" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          BJ3 Academic Submission
        </h1>
        <p className="mt-1 text-sm text-blue-200">
          ระบบส่งและติดตามเอกสารวิชาการออนไลน์
        </p>
        <div className="inline-block mt-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
          โรงเรียนบึงกาฬ • ปีการศึกษา 2569
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl text-slate-800 border border-white/20">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้ใช้งาน (Username)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="เช่น teacher_somchai หรือ admin"
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสผ่าน (Password)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="รหัสผ่าน"
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition active:scale-[0.99] disabled:opacity-50"
            >
              <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo 1-Click Fast Switcher */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>เข้าใช้งานทดสอบทันที (1-Click Demo)</span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleFastDemoLogin('teacher')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-950 font-medium transition text-left"
              >
                <div>
                  <p className="font-semibold text-emerald-900">👨‍🏫 ครูสมชาย ขยันสอน</p>
                  <p className="text-[10px] text-emerald-700">ส่งแผน 2/69, วิจัย 1/69, ตรวจเช็ค Drive</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-200 text-emerald-800 font-bold shrink-0">
                  ครู
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleFastDemoLogin('department_head')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 text-purple-950 font-medium transition text-left"
              >
                <div>
                  <p className="font-semibold text-purple-900">🔬 นายเดชา วิทยากร</p>
                  <p className="text-[10px] text-purple-700">หัวหน้ากลุ่มสาระฯ วิทยาศาสตร์ (ตรวจเอกสาร/อนุมัติ)</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-purple-200 text-purple-800 font-bold shrink-0">
                  หัวหน้ากลุ่ม
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleFastDemoLogin('academic')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-950 font-medium transition text-left"
              >
                <div>
                  <p className="font-semibold text-blue-900">📚 นางนภาพร วิชาการเลิศ</p>
                  <p className="text-[10px] text-blue-700">ฝ่ายวิชาการ (เปิด Campaign, Matrix, Copy LINE, Export Excel)</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-200 text-blue-800 font-bold shrink-0">
                  วิชาการ
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleFastDemoLogin('executive')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-amber-950 font-medium transition text-left"
              >
                <div>
                  <p className="font-semibold text-amber-900">🎓 ดร.วิชาญ บริหารการศึกษา</p>
                  <p className="text-[10px] text-amber-700">ผู้อำนวยการโรงเรียน (แดชบอร์ด KPI, 4 ชาร์ต, TV Mode)</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-200 text-amber-800 font-bold shrink-0">
                  ผู้บริหาร
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleFastDemoLogin('admin')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium transition text-left"
              >
                <div>
                  <p className="font-semibold text-slate-900">⚙️ นายสมศักดิ์ พัฒนาระบบ</p>
                  <p className="text-[10px] text-slate-500">ผู้ดูแลระบบ (จัดการสิทธิ์, บุคลากร, Campaign)</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold shrink-0">
                  Admin
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          งานวิชาการ โรงเรียนบึงกาฬ • โครงการติดตามเอกสาร ว PA และงานวิจัย
        </p>
      </div>
    </div>
  );
};
