import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('กรุณากรอก Username และรหัสผ่าน');
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
                  placeholder="กรอกชื่อผู้ใช้งานของคุณ"
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
                  placeholder="กรอกรหัสผ่าน"
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

          {/* Information & Support Note */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-1.5">
              <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>คำแนะนำการเข้าใช้งานระบบ</span>
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                กรุณาเข้าสู่ระบบด้วย Username และรหัสผ่านที่ได้รับจากงานวิชาการ หากพบปัญหาการเข้าสู่ระบบ หรือต้องการขอสิทธิ์ใช้งาน กรุณาติดต่อผู้ดูแลระบบโรงเรียนบึงกาฬ
              </p>
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

export default LoginPage;
