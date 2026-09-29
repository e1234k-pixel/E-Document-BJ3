import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Bell,
  LogOut,
  UserCheck,
  ChevronDown,
  Menu,
  X,
  Tv,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import type { UserRole, Notification } from '../types';
import { api } from '../services/api';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenTvMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenTvMode }) => {
  const { user, logout, switchRole } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user?.id) {
      api.getNotifications(user.id).then(setNotifications).catch(() => {});
    }
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => n.read_status === 0).length;

  const roleLabelMap: Record<UserRole, { label: string; bg: string }> = {
    teacher: { label: 'ครูผู้สอน', bg: 'bg-emerald-500' },
    department_head: { label: 'หัวหน้ากลุ่มสาระฯ', bg: 'bg-purple-600' },
    academic: { label: 'ฝ่ายวิชาการ', bg: 'bg-blue-600' },
    executive: { label: 'ผู้บริหาร', bg: 'bg-amber-600' },
    admin: { label: 'ผู้ดูแลระบบ', bg: 'bg-rose-600' },
  };

  const navItemsByRole = () => {
    switch (user?.role) {
      case 'teacher':
        return [
          { id: 'teacher_dashboard', label: 'งานที่ต้องส่ง' },
          { id: 'teacher_history', label: 'ประวัติการส่ง' },
        ];
      case 'department_head':
        return [
          { id: 'head_dashboard', label: 'ติดตามกลุ่มสาระ' },
          { id: 'head_reviews', label: 'ตรวจเอกสาร' },
        ];
      case 'academic':
        return [
          { id: 'academic_dashboard', label: 'ภาพรวมวิชาการ' },
          { id: 'academic_campaigns', label: 'จัดการรอบการส่ง' },
          { id: 'academic_matrix', label: 'ตารางติดตาม (Matrix)' },
          { id: 'academic_unsubmitted', label: 'ผู้ยังไม่ส่ง (LINE)' },
        ];
      case 'executive':
        return [
          { id: 'exec_dashboard', label: 'แดชบอร์ดบริหาร' },
          { id: 'exec_departments', label: 'ความก้าวหน้ารายกลุ่ม' },
          { id: 'exec_matrix', label: 'Matrix ติดตามงาน' },
        ];
      case 'admin':
        return [
          { id: 'admin_dashboard', label: 'แผงควบคุมหลัก' },
          { id: 'admin_users', label: 'จัดการผู้ใช้' },
          { id: 'admin_campaigns', label: 'จัดการ Campaign' },
        ];
      default:
        return [];
    }
  };

  const navItems = navItemsByRole();

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    setShowRoleDropdown(false);
    // Switch default tab
    if (role === 'teacher') setActiveTab('teacher_dashboard');
    else if (role === 'department_head') setActiveTab('head_dashboard');
    else if (role === 'academic') setActiveTab('academic_dashboard');
    else if (role === 'executive') setActiveTab('exec_dashboard');
    else if (role === 'admin') setActiveTab('admin_dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">BJ3 Academic</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  2569
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                ระบบส่งและติดตามเอกสารวิชาการออนไลน์ โรงเรียนบึงกาฬ
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* TV Mode Shortcut (for Academic & Exec) */}
            {(user?.role === 'executive' || user?.role === 'academic') && onOpenTvMode && (
              <button
                onClick={onOpenTvMode}
                title="เปิด Presentation / TV Mode"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 transition"
              >
                <Tv className="w-4 h-4 text-blue-400" />
                <span>TV Mode</span>
              </button>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>

              {/* Notifications Popover */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 overflow-hidden z-50 animate-fadeIn">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">การแจ้งเตือน</span>
                    <span className="text-[10px] text-blue-600 font-semibold">{unreadCount} รายการใหม่</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">ไม่มีการแจ้งเตือนในขณะนี้</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            api.markNotificationRead(n.id);
                            setShowNotifDropdown(false);
                          }}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition ${
                            n.read_status === 0 ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <p className="font-semibold text-slate-800">{n.title}</p>
                          <p className="text-slate-600 text-[11px] mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.created_at).toLocaleString('th-TH')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Fast Demo Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs transition"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    user ? roleLabelMap[user.role].bg : 'bg-slate-400'
                  }`}
                />
                <div className="text-left hidden sm:block">
                  <p className="text-[11px] font-semibold text-white leading-tight">
                    {user?.name || 'ผู้ใช้งาน'}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {user ? roleLabelMap[user.role].label : ''}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Role Dropdown Menu */}
              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 overflow-hidden z-50 animate-fadeIn">
                  <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200">
                    <p className="text-[11px] font-bold text-slate-700">สลับบทบาททดสอบ (Demo Switcher)</p>
                    <p className="text-[10px] text-slate-500">เปลี่ยนมุมมองเพื่อทดสอบระบบทันที</p>
                  </div>

                  <div className="p-1 space-y-0.5 text-xs">
                    <button
                      onClick={() => handleRoleSwitch('teacher')}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-slate-100 transition ${
                        user?.role === 'teacher' ? 'font-semibold text-blue-600 bg-blue-50' : 'text-slate-700'
                      }`}
                    >
                      <span>👨‍🏫 ครูผู้สอน (สมชาย)</span>
                      {user?.role === 'teacher' && <CheckCircle className="w-3.5 h-3.5 text-blue-600" />}
                    </button>

                    <button
                      onClick={() => handleRoleSwitch('department_head')}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-slate-100 transition ${
                        user?.role === 'department_head' ? 'font-semibold text-purple-600 bg-purple-50' : 'text-slate-700'
                      }`}
                    >
                      <span>🔬 หัวหน้ากลุ่มสาระฯ (เดชา)</span>
                      {user?.role === 'department_head' && <CheckCircle className="w-3.5 h-3.5 text-purple-600" />}
                    </button>

                    <button
                      onClick={() => handleRoleSwitch('academic')}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-slate-100 transition ${
                        user?.role === 'academic' ? 'font-semibold text-blue-600 bg-blue-50' : 'text-slate-700'
                      }`}
                    >
                      <span>📚 ฝ่ายวิชาการ (นภาพร)</span>
                      {user?.role === 'academic' && <CheckCircle className="w-3.5 h-3.5 text-blue-600" />}
                    </button>

                    <button
                      onClick={() => handleRoleSwitch('executive')}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-slate-100 transition ${
                        user?.role === 'executive' ? 'font-semibold text-amber-600 bg-amber-50' : 'text-slate-700'
                      }`}
                    >
                      <span>🎓 ผู้บริหาร / ผอ. (วิชาญ)</span>
                      {user?.role === 'executive' && <CheckCircle className="w-3.5 h-3.5 text-amber-600" />}
                    </button>

                    <button
                      onClick={() => handleRoleSwitch('admin')}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-slate-100 transition ${
                        user?.role === 'admin' ? 'font-semibold text-rose-600 bg-rose-50' : 'text-slate-700'
                      }`}
                    >
                      <span>⚙️ ผู้ดูแลระบบ (สมศักดิ์)</span>
                      {user?.role === 'admin' && <CheckCircle className="w-3.5 h-3.5 text-rose-600" />}
                    </button>
                  </div>

                  <div className="p-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        logout();
                        setShowRoleDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-rose-600 hover:bg-rose-50 text-xs font-medium transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg md:hidden text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-800 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition ${
                  activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
            {(user?.role === 'executive' || user?.role === 'academic') && onOpenTvMode && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTvMode();
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg text-blue-300 hover:bg-slate-800 flex items-center gap-2"
              >
                <Tv className="w-4 h-4" />
                <span>เปิด Presentation / TV Mode</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
