import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  GraduationCap,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Search,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  X,
  Users,
  Building2
} from 'lucide-react';

interface PublicTeacher {
  id: number;
  title: string;
  name: string;
  username: string;
  role: string;
  department_id: number;
  department_name: string;
  department_code: string;
}

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Quick Teacher Directory & Search
  const [teachers, setTeachers] = useState<PublicTeacher[]>([]);
  const [isQuickPickerOpen, setIsQuickPickerOpen] = useState<boolean>(false);
  const [teacherSearch, setTeacherSearch] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  useEffect(() => {
    api.getPublicTeachers().then(setTeachers).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('กรุณากรอก Username/ชื่อ และรหัสผ่าน');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(username.trim(), password.trim());
    } catch (err: any) {
      setError(err.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeacher = (t: PublicTeacher) => {
    setUsername(t.username);
    setPassword('1234');
    setIsQuickPickerOpen(false);
    setError(null);
  };

  const handleQuickLoginAs = async (t: PublicTeacher) => {
    setUsername(t.username);
    setPassword('1234');
    setIsQuickPickerOpen(false);
    setError(null);
    setLoading(true);
    try {
      await login(t.username, '1234');
    } catch (err: any) {
      setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  // Filtered teachers list for quick picker
  const filteredTeachers = teachers.filter((t) => {
    if (selectedDeptFilter !== 'all' && t.department_code !== selectedDeptFilter) {
      return false;
    }
    if (!teacherSearch.trim()) return true;
    const q = teacherSearch.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.username.toLowerCase().includes(q) ||
      (t.department_name && t.department_name.toLowerCase().includes(q))
    );
  });

  // Unique departments for filter
  const departmentsList = Array.from(
    new Set(teachers.map((t) => t.department_code).filter(Boolean))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-center py-10 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Emblem */}
        <div className="inline-flex p-3.5 rounded-3xl bg-white shadow-2xl backdrop-blur-md mb-4 border border-blue-400/30">
          <img
            src="/logo.png"
            alt="ตราประจำโรงเรียนบรรหารแจ่มใสวิทยา 3"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          โรงเรียนบรรหารแจ่มใสวิทยา ๓
        </h1>
        <p className="mt-1 text-sm text-blue-200">
          ระบบส่งและติดตามเอกสารวิชาการออนไลน์ (BJ3 Academic)
        </p>
        <div className="inline-block mt-2 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
          อำเภอด่านช้าง จังหวัดสุพรรณบุรี • ภาคเรียนที่ 2/2569
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-xl py-7 px-6 sm:px-9 shadow-2xl rounded-3xl text-slate-800 border border-white/20 space-y-4">
          
          {/* Quick Teacher Selector Banner */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                ⚡
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-blue-900 truncate">
                  เข้าสู่ระบบง่ายๆ สำหรับครูผู้สอน
                </p>
                <p className="text-[10px] text-blue-700">
                  รหัสผ่าน: <strong className="text-blue-950 font-black">1234</strong> หรือค้นหาชื่อได้ทันที
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsQuickPickerOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 transition shadow-xs active:scale-95 flex items-center gap-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>ค้นหาชื่อครู</span>
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>ชื่อผู้ใช้งาน (Username หรือ ชื่อ-นามสกุล)</span>
                <span className="text-[10px] text-slate-400 font-normal">พิมพ์ชื่อไทยหรือรหัสสั้นๆ</span>
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
                  placeholder="เช่น sci01, math01 หรือ พิมพ์ชื่อ เช่น สมเกียรติ"
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>รหัสผ่าน (Password)</span>
                <span className="text-[10px] text-blue-600 font-bold">ครูผู้สอน: 1234</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="รหัสผ่าน (ค่าเริ่มต้น 1234)"
                  className="block w-full pl-10 pr-10 py-2.5 sm:text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
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


        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          โรงเรียนบรรหารแจ่มใสวิทยา ๓ อำเภอด่านช้าง จังหวัดสุพรรณบุรี
        </p>
      </div>

      {/* Quick Teacher Picker Modal */}
      {isQuickPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 text-slate-800 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">เลือกลงชื่อเข้าใช้ด่วนสำหรับครูผู้สอน</h3>
                  <p className="text-[10px] text-slate-400">
                    คลิกที่ชื่อของคุณเพื่อกรอกข้อมูลและเข้าสู่ระบบทันที (รหัสผ่าน 1234)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickPickerOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search & Filters */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-2 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  placeholder="พิมพ์ค้นหาชื่อ หรือรหัส Username..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Department pill filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedDeptFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                    selectedDeptFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  ทั้งหมด ({teachers.length})
                </button>
                {departmentsList.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedDeptFilter(code)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap ${
                      selectedDeptFilter === code
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Teachers List */}
            <div className="overflow-y-auto divide-y divide-slate-100 p-2 flex-1">
              {filteredTeachers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  ไม่พบรายชื่อครูที่ค้นหา
                </div>
              ) : (
                filteredTeachers.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 hover:bg-blue-50/70 rounded-2xl transition flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-blue-900">
                          {t.title}{t.name}
                        </span>
                        {t.role === 'department_head' && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-100 text-purple-700 font-bold border border-purple-200">
                            👑 หัวหน้ากลุ่มสาระ
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          {t.username}
                        </span>
                        <span>•</span>
                        <span className="truncate">{t.department_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSelectTeacher(t)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 text-[11px] font-semibold text-slate-600 hover:bg-white transition"
                      >
                        เลือกใส่ฟอร์ม
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickLoginAs(t)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition shadow-xs flex items-center gap-1"
                      >
                        <span>เข้าทันที</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
              <span>แสดง {filteredTeachers.length} ท่าน (รหัสผ่าน 1234)</span>
              <button
                type="button"
                onClick={() => setIsQuickPickerOpen(false)}
                className="px-3 py-1 rounded-lg text-slate-600 hover:bg-slate-200 font-semibold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
