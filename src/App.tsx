import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { DeptHeadDashboard } from './pages/DeptHeadDashboard';
import { AcademicDashboard } from './pages/AcademicDashboard';
import { ExecutiveDashboard } from './pages/ExecutiveDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { TvModePage } from './pages/TvModePage';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('');
  const [isTvMode, setIsTvMode] = useState<boolean>(false);

  // Set default tab when user or role changes
  useEffect(() => {
    if (!user) return;
    switch (user.role) {
      case 'teacher':
        setActiveTab('teacher_dashboard');
        break;
      case 'department_head':
        setActiveTab('head_dashboard');
        break;
      case 'academic':
        setActiveTab('academic_dashboard');
        break;
      case 'executive':
        setActiveTab('exec_dashboard');
        break;
      case 'admin':
        setActiveTab('admin_dashboard');
        break;
      default:
        setActiveTab('teacher_dashboard');
    }
  }, [user?.role]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide">กำลังเชื่อมต่อ BJ3 Academic System...</p>
      </div>
    );
  }

  // Not logged in -> Show Login
  if (!user) {
    return <LoginPage />;
  }

  // TV / Presentation Mode
  if (isTvMode) {
    return <TvModePage onClose={() => setIsTvMode(false)} />;
  }

  // Render Page based on activeTab
  const renderCurrentPage = () => {
    switch (activeTab) {
      // Teacher
      case 'teacher_dashboard':
      case 'teacher_history':
        return <TeacherDashboard />;

      // Department Head
      case 'head_dashboard':
      case 'head_reviews':
        return <DeptHeadDashboard onNavigateToTeacher={() => setActiveTab('teacher_dashboard')} />;

      // Academic
      case 'academic_dashboard':
        return <AcademicDashboard initialSubTab="overview" />;
      case 'academic_matrix':
        return <AcademicDashboard initialSubTab="matrix" />;
      case 'academic_unsubmitted':
        return <AcademicDashboard initialSubTab="unsubmitted" />;
      case 'academic_campaigns':
        return <AcademicDashboard initialSubTab="overview" />;

      // Executive
      case 'exec_dashboard':
      case 'exec_departments':
      case 'exec_matrix':
        return <ExecutiveDashboard onOpenTvMode={() => setIsTvMode(true)} />;

      // Admin
      case 'admin_dashboard':
        return <AdminDashboard initialTab="overview" onNavigate={(tab) => setActiveTab(tab)} />;
      case 'admin_users':
        return <AdminDashboard initialTab="users" onNavigate={(tab) => setActiveTab(tab)} />;
      case 'admin_campaigns':
        return <AdminDashboard initialTab="campaigns" onNavigate={(tab) => setActiveTab(tab)} />;

      default:
        // Default to teacher dashboard
        return <TeacherDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenTvMode={() => setIsTvMode(true)}
        />
        <main className="pb-12">{renderCurrentPage()}</main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            BJ3 Academic Submission & Progress Tracking System
          </p>
          <p>
            ระบบส่งและติดตามเอกสารวิชาการออนไลน์ • โรงเรียนบรรหารแจ่มใสวิทยา 3 อำเภอด่านช้าง จังหวัดสุพรรณบุรี • ปีการศึกษา 2569
          </p>
          <p className="text-[11px] text-slate-400">
            Cloudflare Pages & D1 Database • Powered by Google Drive & QR Code Verification
          </p>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
