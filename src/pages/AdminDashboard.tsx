import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { User, Department, Campaign, UserRole } from '../types';
import * as XLSX from 'xlsx';
import {
  ShieldCheck,
  Users,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  Database,
  Plus,
  Search,
  Server,
  Upload,
  UserPlus,
  Edit2,
  Trash2,
  Key,
  X,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Check,
  LayoutDashboard,
  ArrowRight,
  Clock,
  Activity,
  FileText
} from 'lucide-react';

export interface AdminDashboardProps {
  initialTab?: 'overview' | 'users' | 'campaigns' | 'departments' | 'system';
  onNavigate?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialTab = 'overview',
  onNavigate,
}) => {
  const { user, usersList, refreshUsers } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'campaigns' | 'departments' | 'system'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleSwitchTab = (tab: 'overview' | 'users' | 'campaigns' | 'departments' | 'system') => {
    setActiveTab(tab);
    if (onNavigate) {
      if (tab === 'overview') onNavigate('admin_dashboard');
      else if (tab === 'users') onNavigate('admin_users');
      else if (tab === 'campaigns') onNavigate('admin_campaigns');
    }
  };

  const [departments, setDepartments] = useState<Department[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [userFilterDept, setUserFilterDept] = useState<string>('all');
  const [userFilterRole, setUserFilterRole] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // Department Modal State (Add / Edit / Appoint Head)
  const [isDeptModalOpen, setIsDeptModalOpen] = useState<boolean>(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState<string>('');
  const [deptCode, setDeptCode] = useState<string>('');
  const [deptHeadUserId, setDeptHeadUserId] = useState<string>('');
  const [isSavingDept, setIsSavingDept] = useState<boolean>(false);

  // Single User Modal State (Add / Edit)
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [userTitle, setUserTitle] = useState<string>('ครู');
  const [userName, setUserName] = useState<string>('');
  const [userUsername, setUserUsername] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('123456');
  const [userDeptId, setUserDeptId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('teacher');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [userStatus, setUserStatus] = useState<'active' | 'inactive'>('active');
  const [isSavingUser, setIsSavingUser] = useState<boolean>(false);

  // Bulk Import Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [bulkText, setBulkText] = useState<string>('');
  const [bulkDefaultDept, setBulkDefaultDept] = useState<number | null>(1);
  const [bulkDefaultRole, setBulkDefaultRole] = useState<UserRole>('teacher');
  const [parsedUsers, setParsedUsers] = useState<Array<Partial<User> & { password?: string }>>([]);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<{ count: number; errors: string[] } | null>(null);

  // Bulk Selection & Edit State
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState<boolean>(false);
  const [bulkEditDeptEnabled, setBulkEditDeptEnabled] = useState<boolean>(false);
  const [bulkEditDeptId, setBulkEditDeptId] = useState<number | null>(null);
  const [bulkEditRoleEnabled, setBulkEditRoleEnabled] = useState<boolean>(false);
  const [bulkEditRole, setBulkEditRole] = useState<UserRole>('teacher');
  const [bulkEditStatusEnabled, setBulkEditStatusEnabled] = useState<boolean>(false);
  const [bulkEditStatus, setBulkEditStatus] = useState<'active' | 'inactive'>('active');
  const [bulkEditPasswordEnabled, setBulkEditPasswordEnabled] = useState<boolean>(false);
  const [bulkEditPassword, setBulkEditPassword] = useState<string>('123456');
  const [isSavingBulkEdit, setIsSavingBulkEdit] = useState<boolean>(false);

  // Campaign State (Add / Edit)
  const [isCampModalOpen, setIsCampModalOpen] = useState<boolean>(false);
  const [editingCampId, setEditingCampId] = useState<number | null>(null);
  const [campTitle, setCampTitle] = useState<string>('');
  const [campDesc, setCampDesc] = useState<string>('');
  const [campYear, setCampYear] = useState<number>(2569);
  const [campSemester, setCampSemester] = useState<number>(2);
  const [campDocType, setCampDocType] = useState<string>('lesson_plan');
  const [campStartDate, setCampStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [campDueDate, setCampDueDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [campStatus, setCampStatus] = useState<'active' | 'closed' | 'draft'>('active');
  const [campAllowLate, setCampAllowLate] = useState<number>(1);
  const [isSavingCamp, setIsSavingCamp] = useState<boolean>(false);

  const handleOpenAddCamp = () => {
    setEditingCampId(null);
    setCampTitle('');
    setCampDesc('');
    setCampYear(2569);
    setCampSemester(2);
    setCampDocType('lesson_plan');
    setCampStartDate(new Date().toISOString().split('T')[0]);
    setCampDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setCampStatus('active');
    setCampAllowLate(1);
    setIsCampModalOpen(true);
  };

  const handleOpenEditCamp = (c: Campaign) => {
    setEditingCampId(c.id);
    setCampTitle(c.title);
    setCampDesc(c.description || '');
    setCampYear(c.academic_year);
    setCampSemester(c.semester);
    setCampDocType(c.doc_type);
    setCampStartDate(c.start_date);
    setCampDueDate(c.due_date);
    setCampStatus(c.status);
    setCampAllowLate(c.allow_late ?? 1);
    setIsCampModalOpen(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campTitle.trim()) {
      alert('กรุณากรอกชื่อรอบการส่งเอกสาร');
      return;
    }
    setIsSavingCamp(true);
    try {
      if (editingCampId) {
        await api.updateCampaign(editingCampId, {
          title: campTitle.trim(),
          description: campDesc.trim(),
          academic_year: campYear,
          semester: campSemester,
          doc_type: campDocType,
          start_date: campStartDate,
          due_date: campDueDate,
          status: campStatus,
          allow_late: campAllowLate,
        });
        alert('แก้ไขรอบการส่งเอกสารเรียบร้อยแล้ว');
      } else {
        await api.createCampaign({
          title: campTitle.trim(),
          description: campDesc.trim(),
          academic_year: campYear,
          semester: campSemester,
          doc_type: campDocType,
          start_date: campStartDate,
          due_date: campDueDate,
          status: campStatus,
          allow_late: campAllowLate,
        });
        alert('สร้างรอบการส่งเอกสารใหม่เรียบร้อยแล้ว');
      }
      setIsCampModalOpen(false);
      const updated = await api.getCampaigns();
      setCampaigns(updated);
    } catch (err: any) {
      alert(err.message || 'บันทึก Campaign ไม่สำเร็จ');
    } finally {
      setIsSavingCamp(false);
    }
  };

  const handleToggleCampaignStatus = async (c: Campaign) => {
    const nextStatus = c.status === 'active' ? 'closed' : 'active';
    try {
      await api.updateCampaign(c.id, { status: nextStatus });
      setCampaigns((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, status: nextStatus } : item))
      );
      alert(`ปรับสถานะรอบ "${c.title}" เป็น ${nextStatus === 'active' ? 'เปิดรับ' : 'ปิดรับ'} เรียบร้อยแล้ว`);
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถปรับสถานะได้');
    }
  };

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

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    if (userFilterDept !== 'all') {
      if (userFilterDept === 'none') {
        if (u.department_id) return false;
      } else {
        if (String(u.department_id) !== userFilterDept) return false;
      }
    }
    if (userFilterRole !== 'all' && u.role !== userFilterRole) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.department_name && u.department_name.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Switch to Users tab and filter by department
  const handleViewDeptTeachers = (deptId: number) => {
    setUserFilterDept(String(deptId));
    setUserFilterRole('all');
    setSearchTerm('');
    handleSwitchTab('users');
  };

  // Open Add Department Modal
  const handleOpenAddDept = () => {
    setEditingDept(null);
    setDeptName('');
    setDeptCode('');
    setDeptHeadUserId('');
    setIsDeptModalOpen(true);
  };

  // Open Edit Department / Appoint Head Modal
  const handleOpenEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setDeptHeadUserId(dept.head_user_id ? String(dept.head_user_id) : '');
    setIsDeptModalOpen(true);
  };

  // Save Department (Add or Edit)
  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) {
      alert('กรุณากรอกชื่อกลุ่มสาระและรหัสย่อ');
      return;
    }

    setIsSavingDept(true);
    try {
      if (editingDept) {
        await api.updateDepartment(editingDept.id, {
          name: deptName.trim(),
          code: deptCode.trim().toUpperCase(),
          head_user_id: deptHeadUserId ? Number(deptHeadUserId) : null,
        });
        alert(`บันทึกข้อมูลและแต่งตั้งหัวหน้ากลุ่มสาระ "${deptName}" เรียบร้อยแล้ว`);
      } else {
        await api.createDepartment({
          name: deptName.trim(),
          code: deptCode.trim().toUpperCase(),
          head_user_id: deptHeadUserId ? Number(deptHeadUserId) : null,
        });
        alert(`เพิ่มกลุ่มสาระ "${deptName}" เรียบร้อยแล้ว`);
      }
      setIsDeptModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setIsSavingDept(false);
    }
  };

  // Open Add Single User Modal
  const handleOpenAddUser = () => {
    setEditingUserId(null);
    setUserTitle('ครู');
    setUserName('');
    setUserUsername('');
    setUserPassword('123456');
    setUserDeptId(departments[0]?.id ?? 1);
    setUserRole('teacher');
    setUserEmail('');
    setUserPhone('');
    setUserStatus('active');
    setIsUserModalOpen(true);
  };

  // Open Edit User Modal
  const handleOpenEditUser = (u: User) => {
    setEditingUserId(u.id);
    setUserTitle(u.title || 'ครู');
    setUserName(u.name);
    setUserUsername(u.username);
    setUserPassword(''); // blank means do not change password
    setUserDeptId(u.department_id ?? null);
    setUserRole(u.role);
    setUserEmail(u.email || '');
    setUserPhone(u.phone || '');
    setUserStatus(u.status);
    setIsUserModalOpen(true);
  };

  // Save Single User (Create or Update)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userUsername.trim()) {
      alert('กรุณากรอกชื่อและ Username ให้ครบถ้วน');
      return;
    }

    setIsSavingUser(true);
    try {
      if (editingUserId) {
        // Update
        await api.updateUser(editingUserId, {
          title: userTitle,
          name: userName.trim(),
          username: userUsername.trim(),
          password: userPassword ? userPassword.trim() : undefined,
          department_id: userDeptId,
          role: userRole,
          email: userEmail.trim(),
          phone: userPhone.trim(),
          status: userStatus,
        });
        alert('แก้ไขข้อมูลผู้ใช้งานเรียบร้อยแล้ว');
      } else {
        // Create
        await api.createUser({
          title: userTitle,
          name: userName.trim(),
          username: userUsername.trim(),
          password: userPassword.trim() || '123456',
          department_id: userDeptId,
          role: userRole,
          email: userEmail.trim(),
          phone: userPhone.trim(),
          status: userStatus,
        });
        alert('เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว');
      }
      setIsUserModalOpen(false);
      await refreshUsers();
    } catch (err: any) {
      alert(err.message || 'บันทึกข้อมูลไม่สำเร็จ');
    } finally {
      setIsSavingUser(false);
    }
  };

  // Delete User (Single)
  const handleDeleteUser = async (u: User) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี "${u.title}${u.name}" (${u.username})?\n\n(หากมีเอกสารหรือการตรวจที่เกี่ยวข้อง จะถูกลบออกอย่างปลอดภัยเพื่อไม่ให้ติด Foreign Key)`)) {
      try {
        await api.deleteUser(u.id);
        setSelectedUserIds((prev) => prev.filter((id) => id !== u.id));
        await refreshUsers();
        alert('ลบบัญชีผู้ใช้งานเรียบร้อยแล้ว');
      } catch (err: any) {
        alert(err.message || 'ไม่สามารถลบผู้ใช้งานได้');
      }
    }
  };

  // Toggle user selection
  const handleToggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const handleToggleUser = (id: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    if (
      !confirm(
        `⚠️ ยืนยันการลบบัญชีผู้ใช้งานที่เลือกจำนวน ${selectedUserIds.length} คน ใช่หรือไม่?\n\n(ข้อมูลเอกสารและการตั้งค่าทั้งหมดที่เกี่ยวข้องกับผู้ใช้เหล่านี้จะถูกลบออกอย่างสมบูรณ์)`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await api.bulkDeleteUsers(selectedUserIds);
      alert(`ลบผู้ใช้งานจำนวน ${selectedUserIds.length} คน เรียบร้อยแล้ว`);
      setSelectedUserIds([]);
      await refreshUsers();
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถลบผู้ใช้งานหลายคนได้');
    } finally {
      setLoading(false);
    }
  };

  // Open Bulk Edit Modal
  const handleOpenBulkEdit = () => {
    if (selectedUserIds.length === 0) {
      alert('กรุณาเลือกผู้ใช้งานที่ต้องการแก้ไขอย่างน้อย 1 คน');
      return;
    }
    setBulkEditDeptEnabled(false);
    setBulkEditDeptId(departments[0]?.id ?? null);
    setBulkEditRoleEnabled(false);
    setBulkEditRole('teacher');
    setBulkEditStatusEnabled(false);
    setBulkEditStatus('active');
    setBulkEditPasswordEnabled(false);
    setBulkEditPassword('123456');
    setIsBulkEditModalOpen(true);
  };

  // Save Bulk Edit
  const handleSaveBulkEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) return;
    if (!bulkEditDeptEnabled && !bulkEditRoleEnabled && !bulkEditStatusEnabled && !bulkEditPasswordEnabled) {
      alert('กรุณาติ๊กเลือกอย่างน้อย 1 หัวข้อที่ต้องการแก้ไขพร้อมกัน');
      return;
    }

    setIsSavingBulkEdit(true);
    try {
      await api.bulkUpdateUsers({
        user_ids: selectedUserIds,
        department_id: bulkEditDeptEnabled ? (bulkEditDeptId ?? null) : undefined,
        role: bulkEditRoleEnabled ? bulkEditRole : undefined,
        status: bulkEditStatusEnabled ? bulkEditStatus : undefined,
        password: bulkEditPasswordEnabled ? bulkEditPassword : undefined,
      });

      alert(`แก้ไขข้อมูลผู้ใช้งานจำนวน ${selectedUserIds.length} คน เรียบร้อยแล้ว`);
      setIsBulkEditModalOpen(false);
      setSelectedUserIds([]);
      await refreshUsers();
    } catch (err: any) {
      alert(err.message || 'บันทึกการแก้ไขไม่สำเร็จ');
    } finally {
      setIsSavingBulkEdit(false);
    }
  };

  // Parse Text for Bulk Import
  const handleParseBulkText = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n').filter((l) => l.trim().length > 0);
    const parsed: Array<Partial<User> & { password?: string }> = [];

    lines.forEach((line, idx) => {
      // Split by tab, comma, or pipe
      const parts = line.split(/[|\t,]/).map((p) => p.trim());
      const fullName = parts[0] || '';
      if (!fullName) return;

      // Extract title if present (นาย, นาง, น.ส., ดร.)
      let title = 'ครู';
      let name = fullName;
      const titles = ['นาย', 'นางสาว', 'น.ส.', 'นาง', 'ดร.', 'ว่าที่ร้อยตรี', 'ผศ.ดร.'];
      for (const t of titles) {
        if (fullName.startsWith(t)) {
          title = t;
          name = fullName.slice(t.length).trim();
          break;
        }
      }

      // Department code or name (if in column 2)
      let deptId = bulkDefaultDept;
      if (parts[1]) {
        const foundDept = departments.find(
          (d) =>
            d.code.toLowerCase() === parts[1].toLowerCase() ||
            d.name.includes(parts[1]) ||
            String(d.id) === parts[1]
        );
        if (foundDept) deptId = foundDept.id;
      }

      // Phone (column 3 or 4)
      const phone = parts[2] && parts[2].startsWith('0') ? parts[2] : parts[3] || '';
      const email = parts.find((p) => p.includes('@')) || '';

      // Username auto-generated
      const username = `teacher_${Date.now()}_${idx + 1}`;
      const password = 'password123';

      parsed.push({
        title,
        name,
        username,
        password,
        department_id: deptId,
        role: bulkDefaultRole,
        email,
        phone,
      });
    });

    setParsedUsers(parsed);
  };

  // Parse Excel File for Bulk Import
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        const parsed: Array<Partial<User> & { password?: string }> = [];

        json.forEach((row, idx) => {
          // Look for name columns: ชื่อ, Name, Fullname
          const fullName = row['ชื่อ-สกุล'] || row['ชื่อ'] || row['Name'] || row['name'] || Object.values(row)[0] || '';
          if (!fullName || typeof fullName !== 'string') return;

          let title = row['คำนำหน้า'] || 'ครู';
          let name = fullName;
          const titles = ['นาย', 'นางสาว', 'น.ส.', 'นาง', 'ดร.'];
          for (const t of titles) {
            if (fullName.startsWith(t)) {
              title = t;
              name = fullName.slice(t.length).trim();
              break;
            }
          }

          const deptVal = row['กลุ่มสาระ'] || row['กลุ่มสาระการเรียนรู้'] || row['Department'] || '';
          let deptId = bulkDefaultDept;
          if (deptVal) {
            const foundDept = departments.find(
              (d) =>
                d.name.includes(deptVal) ||
                d.code.toLowerCase() === String(deptVal).toLowerCase() ||
                String(d.id) === String(deptVal)
            );
            if (foundDept) deptId = foundDept.id;
          }

          const phone = String(row['เบอร์โทร'] || row['Phone'] || row['โทร'] || '');
          const email = String(row['อีเมล'] || row['Email'] || '');
          const username = row['Username'] || `teacher_${Date.now()}_${idx + 1}`;
          const password = row['Password'] || 'password123';

          parsed.push({
            title,
            name,
            username,
            password,
            department_id: deptId,
            role: bulkDefaultRole,
            email,
            phone,
          });
        });

        setParsedUsers(parsed);
      } catch (err: any) {
        alert('ไม่สามารถอ่านไฟล์ Excel ได้: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Submit Bulk Import
  const handleExecuteBulkImport = async () => {
    if (parsedUsers.length === 0) return;
    setIsImporting(true);
    setImportResult(null);

    try {
      const res = await api.bulkCreateUsers(parsedUsers);
      setImportResult({ count: res.insertedCount, errors: res.errors || [] });
      await refreshUsers();
      if (res.insertedCount > 0) {
        alert(`นำเข้าครูเรียบร้อยแล้วจำนวน ${res.insertedCount} ท่าน!`);
        setIsBulkModalOpen(false);
        setParsedUsers([]);
        setBulkText('');
      }
    } catch (err: any) {
      alert(err.message || 'นำเข้าไม่สำเร็จ');
    } finally {
      setIsImporting(false);
    }
  };

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
            การบริหารจัดการระบบและบุคลากร
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ผู้ดูแลระบบ: {user?.title}{user?.name} ({user?.username})
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'departments' ? (
            <button
              onClick={handleOpenAddDept}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มกลุ่มสาระใหม่</span>
            </button>
          ) : activeTab === 'campaigns' ? (
            <button
              onClick={handleOpenAddCamp}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ สร้างรอบการส่งใหม่ (Campaign)</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleOpenAddUser}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ เพิ่มครูรายบุคคล</span>
              </button>

              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>📥 นำเข้ารายชื่อครู (Excel / วางข้อความ)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm text-xs font-semibold gap-1 overflow-x-auto">
        <button
          onClick={() => handleSwitchTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>แผงควบคุมหลัก (Overview)</span>
        </button>

        <button
          onClick={() => handleSwitchTab('users')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>จัดการผู้ใช้ในระบบ ({usersList.length})</span>
        </button>

        <button
          onClick={() => handleSwitchTab('campaigns')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'campaigns' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>จัดการ Campaign ({campaigns.length})</span>
        </button>

        <button
          onClick={() => handleSwitchTab('departments')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'departments' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>กลุ่มสาระการเรียนรู้ ({departments.length})</span>
        </button>

        <button
          onClick={() => handleSwitchTab('system')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'system' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>ข้อมูลโครงสร้างระบบ</span>
        </button>
      </div>

      {/* TAB 0: Overview (แผงควบคุมหลัก) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">ผู้ใช้งานในระบบ</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{usersList.length} <span className="text-xs font-normal text-slate-500">คน</span></h3>
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                  ● ใช้งานอยู่ {usersList.filter(u => u.status === 'active').length} คน • ระงับ {usersList.filter(u => u.status === 'inactive').length} คน
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">กลุ่มสาระการเรียนรู้</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{departments.length} <span className="text-xs font-normal text-slate-500">กลุ่ม</span></h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  ครอบคลุมทุกหมวดวิชาหลัก 100%
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">รอบการส่งเอกสาร (Campaigns)</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{campaigns.length} <span className="text-xs font-normal text-slate-500">รอบ</span></h3>
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                  ● กำลังเปิดรับ {campaigns.filter(c => c.status === 'active').length} รอบ
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">ความพร้อมระบบ (Edge DB)</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">100%</h3>
                <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Cloudflare D1 & Pages Online</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Server className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                ⚡ Quick Actions
              </span>
              <h3 className="text-lg font-bold mt-1">ทางลัดการจัดการระบบสำหรับผู้ดูแล</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                เลือกคำสั่งด่วนเพื่อดำเนินการจัดการผู้ใช้หรือรอบเอกสาร
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleOpenAddUser}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ เพิ่มผู้ใช้ใหม่</span>
              </button>
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 flex items-center gap-1.5 transition active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>📥 นำเข้า Excel</span>
              </button>
              <button
                onClick={handleOpenAddCamp}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ สร้าง Campaign</span>
              </button>
            </div>
          </div>

          {/* Role Summary & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>สัดส่วนบทบาทในระบบ</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700">ครูผู้สอน (Teacher)</span>
                  <span className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-xs">
                    {usersList.filter(u => u.role === 'teacher').length} คน
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
                  <span className="font-medium text-purple-900">หัวหน้ากลุ่มสาระฯ (Dept Head)</span>
                  <span className="font-bold text-purple-900 bg-white px-2.5 py-0.5 rounded-lg border border-purple-200 shadow-xs">
                    {usersList.filter(u => u.role === 'department_head').length} คน
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
                  <span className="font-medium text-blue-900">ฝ่ายวิชาการ (Academic)</span>
                  <span className="font-bold text-blue-900 bg-white px-2.5 py-0.5 rounded-lg border border-purple-200 shadow-xs">
                    {usersList.filter(u => u.role === 'academic').length} คน
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                  <span className="font-medium text-amber-900">คณะผู้บริหาร (Executive)</span>
                  <span className="font-bold text-amber-900 bg-white px-2.5 py-0.5 rounded-lg border border-amber-200 shadow-xs">
                    {usersList.filter(u => u.role === 'executive').length} ท่าน
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
                  <span className="font-medium text-rose-900">ผู้ดูแลระบบ (Admin)</span>
                  <span className="font-bold text-rose-900 bg-white px-2.5 py-0.5 rounded-lg border border-rose-200 shadow-xs">
                    {usersList.filter(u => u.role === 'admin').length} คน
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleSwitchTab('users')}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>จัดการรายชื่อทั้งหมด</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Department Cards Overview */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span>กลุ่มสาระการเรียนรู้ ({departments.length} กลุ่มสาระ)</span>
                </h3>
                <button
                  onClick={() => handleSwitchTab('departments')}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  ดูทั้งหมด →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {departments.map((d) => {
                  const teacherCount = usersList.filter(u => u.department_id === d.id).length;
                  return (
                    <div
                      key={d.id}
                      onClick={() => handleViewDeptTeachers(d.id)}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-sm cursor-pointer transition bg-slate-50/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                          {d.code}
                        </span>
                        <span className="text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                          {teacherCount} คน
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mt-2">{d.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        หัวหน้ากลุ่ม: {d.head_name || 'ยังไม่กำหนด'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหาชื่อ, username..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Department Filter */}
              <select
                value={userFilterDept}
                onChange={(e) => setUserFilterDept(e.target.value)}
                className="py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">ทุกกลุ่มสาระการเรียนรู้</option>
                <option value="none">— ไม่สังกัดกลุ่มสาระ —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name.replace('กลุ่มสาระการเรียนรู้', '')} ({d.code})
                  </option>
                ))}
              </select>

              {/* Role Filter */}
              <select
                value={userFilterRole}
                onChange={(e) => setUserFilterRole(e.target.value)}
                className="py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">ทุกบทบาท</option>
                <option value="teacher">ครูผู้สอน</option>
                <option value="department_head">หัวหน้ากลุ่มสาระ</option>
                <option value="academic">ฝ่ายวิชาการ</option>
                <option value="executive">ผู้บริหาร</option>
                <option value="admin">ผู้ดูแลระบบ</option>
              </select>

              {(userFilterDept !== 'all' || userFilterRole !== 'all' || searchTerm) && (
                <button
                  onClick={() => {
                    setUserFilterDept('all');
                    setUserFilterRole('all');
                    setSearchTerm('');
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 underline"
                >
                  ล้างตัวกรอง
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">พบ {filteredUsers.length} บัญชี</span>
            </div>
          </div>

          {/* Bulk Selection Action Bar */}
          {selectedUserIds.length > 0 && (
            <div className="p-3.5 bg-blue-50/90 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                <span className="text-xs font-bold text-blue-900">
                  เลือกอยู่ {selectedUserIds.length} รายการ (จากทั้งหมด {filteredUsers.length} คน)
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleOpenBulkEdit}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>แก้ไขข้อมูลที่เลือก ({selectedUserIds.length})</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ลบที่เลือก ({selectedUserIds.length})</span>
                </button>
                <button
                  onClick={() => setSelectedUserIds([])}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold transition"
                >
                  ล้างการเลือก
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="w-10 px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      title="เลือกทั้งหมด / ยกเลิกทั้งหมด"
                    />
                  </th>
                  <th className="px-3 py-3">#</th>
                  <th className="px-4 py-3">ชื่อ - นามสกุล</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">บทบาท (Role)</th>
                  <th className="px-4 py-3">กลุ่มสาระการเรียนรู้</th>
                  <th className="px-4 py-3">เบอร์โทรศัพท์</th>
                  <th className="px-4 py-3 text-center">สถานะ</th>
                  <th className="px-4 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u, idx) => {
                  const isSelected = selectedUserIds.includes(u.id);
                  return (
                    <tr
                      key={u.id}
                      className={`transition ${isSelected ? 'bg-blue-50/70 font-medium' : 'hover:bg-slate-50/70'}`}
                    >
                      <td className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleUser(u.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {u.title}{u.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{u.username}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {u.role === 'teacher' && 'ครูผู้สอน'}
                          {u.role === 'department_head' && 'หัวหน้ากลุ่มสาระ'}
                          {u.role === 'academic' && 'ฝ่ายวิชาการ'}
                          {u.role === 'executive' && 'ผู้บริหาร'}
                          {u.role === 'admin' && 'ผู้ดูแลระบบ'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {u.department_name ? (
                          u.department_name.replace('กลุ่มสาระการเรียนรู้', '')
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">— ฝ่ายบริหาร / ส่วนกลาง —</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                        {u.phone || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {u.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ใช้งาน</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rose-500 font-semibold">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>ระงับ</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
                          title="ลบบัญชี"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Departments */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          {/* Header Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">
                  กลุ่มสาระการเรียนรู้ทั้งหมด ({departments.length} กลุ่ม)
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  เชื่อมโยงข้อมูลครูจริง {usersList.filter(u => u.status === 'active' && u.department_id).length} ท่าน
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                รายชื่อกลุ่มสาระ รหัสย่อ จำนวนครูผู้สอนในสังกัด และแต่งตั้งหัวหน้ากลุ่มสาระการเรียนรู้
              </p>
            </div>
            <button
              onClick={handleOpenAddDept}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มกลุ่มสาระใหม่</span>
            </button>
          </div>

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((d) => {
              const teachersInDept = usersList.filter(u => u.department_id === d.id && u.status === 'active');
              const headUser = teachersInDept.find(u => u.role === 'department_head');
              const currentHeadName = headUser ? `${headUser.title || ''}${headUser.name}` : (d.head_name || null);
              const teacherCount = d.teacher_count ?? teachersInDept.length;

              return (
                <div
                  key={d.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Code & Count */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 tracking-wider">
                        {d.code}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>ครูในกลุ่ม {teacherCount} ท่าน</span>
                      </span>
                    </div>

                    {/* Department Title */}
                    <div>
                      <h4 className="font-bold text-base text-slate-900 leading-snug">
                        {d.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        ลำดับที่ {d.id} • โรงเรียนบรรหารแจ่มใสวิทยา 3
                      </p>
                    </div>

                    {/* Head of Department Box */}
                    <div className={`p-3.5 rounded-2xl border transition ${
                      currentHeadName
                        ? 'bg-gradient-to-r from-blue-50/70 to-indigo-50/50 border-blue-200'
                        : 'bg-amber-50/60 border-amber-200'
                    }`}>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        หัวหน้ากลุ่มสาระการเรียนรู้
                      </span>
                      {currentHeadName ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            👑
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {currentHeadName}
                            </p>
                            <span className="text-[10px] text-blue-700 font-semibold">
                              {headUser?.username ? `@${headUser.username} • ` : ''}ได้รับแต่งตั้งแล้ว
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-800">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-amber-900">ยังไม่กำหนดหัวหน้ากลุ่ม</p>
                            <p className="text-[10px] text-amber-700">กดปุ่มแต่งตั้งเพื่อระบุหัวหน้ากลุ่มสาระ</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bottom */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleViewDeptTeachers(d.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-slate-200"
                    >
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>ดูรายชื่อครู ({teacherCount})</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditDept(d)}
                      className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-blue-200"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>แต่งตั้ง/แก้ไข</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Campaigns Management */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                รอบการส่งเอกสารวิชาการทั้งหมด ({campaigns.length} รายการ)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                จัดการรอบการส่งเอกสาร แผนการสอน งานวิจัย PLC SAR และ ว PA
              </p>
            </div>
            <button
              onClick={handleOpenAddCamp}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ สร้างรอบการส่งใหม่ (New Campaign)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((c) => {
              const isActive = c.status === 'active';
              return (
                <div
                  key={c.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          ภาคเรียน {c.semester}/{c.academic_year}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {c.doc_type === 'lesson_plan' && 'แผนการจัดการเรียนรู้'}
                          {c.doc_type === 'research' && 'งานวิจัยในชั้นเรียน'}
                          {c.doc_type === 'plc' && 'ชุมชน PLC'}
                          {c.doc_type === 'sar' && 'รายงานตนเอง SAR'}
                          {c.doc_type === 'pa' && 'ข้อตกลง ว PA'}
                          {c.doc_type === 'id_plan' && 'แผนพัฒนาตนเอง ID Plan'}
                          {!['lesson_plan', 'research', 'plc', 'sar', 'pa', 'id_plan'].includes(c.doc_type) && c.doc_type}
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-slate-900 mt-1">{c.title}</h4>
                      {c.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {isActive ? '● กำลังเปิดรับ' : '○ ปิดรับแล้ว'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">ระยะเวลารับเอกสาร</span>
                      <span className="font-medium text-slate-800">
                        {c.start_date} ถึง <strong className="text-rose-600">{c.due_date}</strong>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">ส่งช้า</span>
                      <span className="font-medium">
                        {c.allow_late ? '✅ ส่งได้' : '❌ ไม่อนุญาต'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleToggleCampaignStatus(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        isActive
                          ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {isActive ? 'ปิดรับรอบนี้' : 'เปิดรับรอบนี้'}
                    </button>
                    <button
                      onClick={() => handleOpenEditCamp(c)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>แก้ไขรอบ</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
              <p className="text-slate-600">GitHub Repository (e1234k-pixel/E-Document-BJ3)</p>
              <p className="font-bold text-slate-800 mt-2">Document Storage Policy</p>
              <p className="text-slate-600">Google Drive Links / QR Codes (Zero server file storage cost)</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Add / Edit Single User */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingUserId ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มครู / ผู้ใช้งานใหม่'}
                </h3>
                <p className="text-xs text-slate-400">กำหนดข้อมูลบัญชีและกลุ่มสาระการเรียนรู้</p>
              </div>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">คำนำหน้า</label>
                  <input
                    type="text"
                    required
                    value={userTitle}
                    onChange={(e) => setUserTitle(e.target.value)}
                    placeholder="เช่น ครู, นาย"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อ - นามสกุล <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                      if (!editingUserId && !userUsername) {
                        // generate clean username suggestion
                        setUserUsername(`teacher_${Date.now().toString().slice(-4)}`);
                      }
                    }}
                    placeholder="เช่น สมพร ใจดี"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">บทบาท (Role) <span className="text-rose-500">*</span></label>
                  <select
                    value={userRole}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setUserRole(newRole);
                      if (newRole === 'executive' || newRole === 'admin') {
                        setUserDeptId(null);
                      } else if (!userDeptId && departments.length > 0) {
                        setUserDeptId(departments[0].id);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="teacher">ครูผู้สอน</option>
                    <option value="department_head">หัวหน้ากลุ่มสาระฯ (ส่งงาน + ตรวจกลุ่มสาระ)</option>
                    <option value="academic">ฝ่ายวิชาการ (ตรวจทุกกลุ่ม + บริหาร)</option>
                    <option value="executive">ผู้บริหาร (ผอ. / รอง ผอ.)</option>
                    <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">สถานะ</label>
                  <select
                    value={userStatus}
                    onChange={(e) => setUserStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="active">เปิดใช้งาน (Active)</option>
                    <option value="inactive">ระงับ (Inactive)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">กลุ่มสาระการเรียนรู้</label>
                  {(userRole === 'executive' || userRole === 'admin') && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      ไม่จำเป็นสำหรับผู้บริหาร
                    </span>
                  )}
                </div>
                <select
                  value={userDeptId ?? ''}
                  onChange={(e) => setUserDeptId(e.target.value ? Number(e.target.value) : null)}
                  className={`w-full p-2.5 rounded-xl border bg-white ${
                    userRole === 'executive' || userRole === 'admin'
                      ? 'border-blue-300 bg-blue-50/20 text-slate-800'
                      : 'border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="">— ไม่สังกัดกลุ่มสาระ (คณะผู้บริหาร / ส่วนกลาง) —</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {(userRole === 'executive' || userRole === 'admin') && (
                  <p className="mt-1 text-[11px] text-blue-600">
                    ℹ️ คณะผู้บริหาร (ผู้อำนวยการ และรองผู้อำนวยการ) ไม่จำเป็นต้องเลือกกลุ่มสาระ เพื่อไม่ให้รายชื่อไปปะปนในตารางสรุปการส่งงานของกลุ่มสาระ
                  </p>
                )}
              </div>

              {userRole === 'department_head' && (
                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-[11px] leading-relaxed">
                  💡 <strong>ตำแหน่งควบ (2 ตำแหน่ง):</strong> บัญชีหัวหน้ากลุ่มสาระฯ สามารถส่งแผนการสอน/วิจัยของตนเอง และตรวจเอกสารของครูในกลุ่มสาระได้ในบัญชีเดียว โดยเอกสารของหัวหน้ากลุ่มสาระจะส่งต่อไปให้ฝ่ายวิชาการเป็นผู้ตรวจรับรอง
                </div>
              )}

              {userRole === 'executive' && (
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-[11px] leading-relaxed">
                  🏛️ <strong>บทบาทผู้บริหาร:</strong> สามารถติดตามภาพรวม สถิติความก้าวหน้าการส่งงานของทั้งโรงเรียน และลงนามอนุมัติเอกสารในขั้นตอนสุดท้ายได้
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={userUsername}
                    onChange={(e) => setUserUsername(e.target.value)}
                    placeholder="เช่น somporn.j"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {editingUserId ? 'รหัสผ่านใหม่ (ว่างไว้ถ้าไม่เปลี่ยน)' : 'รหัสผ่าน'}
                  </label>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder={editingUserId ? 'เว้นว่างถ้าไม่เปลี่ยน' : 'รหัสผ่าน'}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="08x-xxx-xxxx"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">อีเมล</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="name@bj3.ac.th"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow"
                >
                  {isSavingUser ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Bulk Import Users (Excel / Paste) */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base">นำเข้ารายชื่อครูหลายคน (Bulk Import)</h3>
                <p className="text-xs text-slate-400">อัปโหลดไฟล์ Excel (.xlsx) หรือคัดลอกรายชื่อมาวาง</p>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Option A: Upload Excel */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
                <h4 className="font-bold text-blue-900 flex items-center gap-1.5 mb-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span>วิธีที่ 1: เลือกไฟล์ Excel (.xlsx หรือ .csv)</span>
                </h4>
                <p className="text-[11px] text-blue-700 mb-3">
                  ไฟล์ควรมีคอลัมน์ชื่อ เช่น <code>ชื่อ-สกุล</code> หรือ <code>ชื่อ</code> (และสามารถมีคอลัมน์ <code>กลุ่มสาระ</code>, <code>เบอร์โทร</code>)
                </p>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelUpload}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
              </div>

              {/* Option B: Paste Lines */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800">วิธีที่ 2: วางรายชื่อครู (1 บรรทัดต่อ 1 คน)</h4>
                  <button
                    type="button"
                    onClick={handleParseBulkText}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    ตรวจข้อมูล (Parse)
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`ตัวอย่างการวางรายชื่อ:\nนายสมชาย ขยันสอน\nน.ส.ศิริพร ใจดี\nนายอนันต์ นวัตกรรม`}
                  className="w-full p-3 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Default Settings */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">กลุ่มสาระเริ่มต้น (หากไม่ระบุในไฟล์)</label>
                  <select
                    value={bulkDefaultDept ?? ''}
                    onChange={(e) => setBulkDefaultDept(e.target.value ? Number(e.target.value) : null)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">— ไม่สังกัดกลุ่มสาระ (คณะผู้บริหาร / ส่วนกลาง) —</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">บทบาทเริ่มต้น</label>
                  <select
                    value={bulkDefaultRole}
                    onChange={(e) => setBulkDefaultRole(e.target.value as UserRole)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="teacher">ครูผู้สอน (Teacher)</option>
                    <option value="department_head">หัวหน้ากลุ่มสาระ</option>
                    <option value="academic">ฝ่ายวิชาการ</option>
                  </select>
                </div>
              </div>

              {/* Preview Table */}
              {parsedUsers.length > 0 && (
                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      ตรวจดูรายชื่อที่พร้อมนำเข้า ({parsedUsers.length} ท่าน)
                    </span>
                    <span className="text-[11px] text-slate-500">รหัสผ่านเริ่มต้น: password123</span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                    {parsedUsers.map((u, i) => (
                      <div key={i} className="p-2.5 flex items-center justify-between hover:bg-slate-50 text-[11px]">
                        <div>
                          <span className="font-semibold text-slate-800">{i + 1}. {u.title}{u.name}</span>
                          <span className="text-slate-400 ml-2 font-mono">({u.username})</span>
                        </div>
                        <span className="text-slate-500">
                          {departments.find((d) => d.id === u.department_id)?.name.replace('กลุ่มสาระการเรียนรู้', '') || 'วิทย์'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                {parsedUsers.length > 0 ? `พร้อมนำเข้า ${parsedUsers.length} ท่าน` : 'ยังไม่มีข้อมูลพร้อมนำเข้า'}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ปิด
                </button>
                <button
                  type="button"
                  disabled={parsedUsers.length === 0 || isImporting}
                  onClick={handleExecuteBulkImport}
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow disabled:opacity-50"
                >
                  {isImporting ? 'กำลังนำเข้า...' : `ยืนยันนำเข้า (${parsedUsers.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal 3: Bulk Edit Users */}
      {isBulkEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-blue-400" />
                  <span>แก้ไขข้อมูลผู้ใช้พร้อมกัน (Bulk Edit)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  เลือกอยู่ {selectedUserIds.length} คน (ติ๊กเลือกหัวข้อที่ต้องการปรับเปลี่ยน)
                </p>
              </div>
              <button
                onClick={() => setIsBulkEditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBulkEdit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                💡 <strong>คำแนะนำ:</strong> ติ๊กเครื่องหมายถูกเฉพาะหัวข้อที่คุณต้องการปรับเปลี่ยนพร้อมกัน ระบบจะอัปเดตเฉพาะหัวข้อที่ถูกติ๊กเท่านั้น
              </div>

              {/* Field 1: Department */}
              <div className={`p-3.5 rounded-2xl border transition ${bulkEditDeptEnabled ? 'bg-blue-50/50 border-blue-300' : 'bg-slate-50 border-slate-200'}`}>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 mb-2">
                  <input
                    type="checkbox"
                    checked={bulkEditDeptEnabled}
                    onChange={(e) => setBulkEditDeptEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>1. ย้ายกลุ่มสาระการเรียนรู้</span>
                </label>
                <select
                  disabled={!bulkEditDeptEnabled}
                  value={bulkEditDeptId ?? ''}
                  onChange={(e) => setBulkEditDeptId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white disabled:bg-slate-100 disabled:text-slate-400 font-medium cursor-pointer"
                >
                  <option value="">— ไม่สังกัดกลุ่มสาระ (คณะผู้บริหาร / ส่วนกลาง) —</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 2: Role */}
              <div className={`p-3.5 rounded-2xl border transition ${bulkEditRoleEnabled ? 'bg-blue-50/50 border-blue-300' : 'bg-slate-50 border-slate-200'}`}>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 mb-2">
                  <input
                    type="checkbox"
                    checked={bulkEditRoleEnabled}
                    onChange={(e) => setBulkEditRoleEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>2. เปลี่ยนบทบาท (Role)</span>
                </label>
                <select
                  disabled={!bulkEditRoleEnabled}
                  value={bulkEditRole}
                  onChange={(e) => setBulkEditRole(e.target.value as UserRole)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white disabled:bg-slate-100 disabled:text-slate-400 font-medium cursor-pointer"
                >
                  <option value="teacher">ครูผู้สอน</option>
                  <option value="department_head">หัวหน้ากลุ่มสาระฯ (ส่งงาน + ตรวจกลุ่มสาระ)</option>
                  <option value="academic">ฝ่ายวิชาการ</option>
                  <option value="executive">ผู้บริหาร</option>
                  <option value="admin">ผู้ดูแลระบบ</option>
                </select>
              </div>

              {/* Field 3: Status */}
              <div className={`p-3.5 rounded-2xl border transition ${bulkEditStatusEnabled ? 'bg-blue-50/50 border-blue-300' : 'bg-slate-50 border-slate-200'}`}>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 mb-2">
                  <input
                    type="checkbox"
                    checked={bulkEditStatusEnabled}
                    onChange={(e) => setBulkEditStatusEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>3. เปลี่ยนสถานะการใช้งาน (Status)</span>
                </label>
                <select
                  disabled={!bulkEditStatusEnabled}
                  value={bulkEditStatus}
                  onChange={(e) => setBulkEditStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white disabled:bg-slate-100 disabled:text-slate-400 font-medium cursor-pointer"
                >
                  <option value="active">เปิดใช้งาน (Active)</option>
                  <option value="inactive">ระงับการใช้งาน (Inactive)</option>
                </select>
              </div>

              {/* Field 4: Reset Password */}
              <div className={`p-3.5 rounded-2xl border transition ${bulkEditPasswordEnabled ? 'bg-blue-50/50 border-blue-300' : 'bg-slate-50 border-slate-200'}`}>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 mb-2">
                  <input
                    type="checkbox"
                    checked={bulkEditPasswordEnabled}
                    onChange={(e) => setBulkEditPasswordEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>4. รีเซ็ตรหัสผ่านใหม่ให้กับทุกคนที่เลือก (Reset Password)</span>
                </label>
                <input
                  type="text"
                  disabled={!bulkEditPasswordEnabled}
                  value={bulkEditPassword}
                  onChange={(e) => setBulkEditPassword(e.target.value)}
                  placeholder="เช่น 123456"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <span className="text-slate-500">
                  กำลังจะอัปเดต <strong className="text-blue-600">{selectedUserIds.length}</strong> คน
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBulkEditModalOpen(false)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingBulkEdit || (!bulkEditDeptEnabled && !bulkEditRoleEnabled && !bulkEditStatusEnabled && !bulkEditPasswordEnabled)}
                    className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow disabled:opacity-50 transition"
                  >
                    {isSavingBulkEdit ? 'กำลังบันทึก...' : `บันทึกการแก้ไข (${selectedUserIds.length})`}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Add / Edit Campaign */}
      {isCampModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingCampId ? 'แก้ไขรอบการส่งเอกสาร' : 'สร้างรอบการส่งเอกสารใหม่'}
                </h3>
                <p className="text-xs text-slate-400">กำหนดรายละเอียด วันเปิด-ปิดรับเอกสารวิชาการ</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCampModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อรอบการส่ง (Campaign Title) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={campTitle}
                  onChange={(e) => setCampTitle(e.target.value)}
                  placeholder="เช่น ส่งแผนการจัดการเรียนรู้ ภาคเรียนที่ 2/2569"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">คำอธิบายและแนวทางการส่ง</label>
                <textarea
                  rows={2}
                  value={campDesc}
                  onChange={(e) => setCampDesc(e.target.value)}
                  placeholder="ระบุข้อกำหนด เช่น แนบลิงก์โฟลเดอร์ Google Drive หรือ QR Code..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ปีการศึกษา</label>
                  <input
                    type="number"
                    value={campYear}
                    onChange={(e) => setCampYear(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ภาคเรียน</label>
                  <select
                    value={campSemester}
                    onChange={(e) => setCampSemester(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ประเภทเอกสาร</label>
                  <select
                    value={campDocType}
                    onChange={(e) => setCampDocType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="lesson_plan">แผนการจัดการเรียนรู้</option>
                    <option value="research">งานวิจัยในชั้นเรียน</option>
                    <option value="plc">บันทึกชุมชน PLC</option>
                    <option value="sar">รายงานตนเอง (SAR)</option>
                    <option value="pa">ข้อตกลง ว PA</option>
                    <option value="id_plan">แผนพัฒนาตนเอง ID Plan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันเริ่มเปิดรับ</label>
                  <input
                    type="date"
                    required
                    value={campStartDate}
                    onChange={(e) => setCampStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันกำหนดปิดรับ (Due Date)</label>
                  <input
                    type="date"
                    required
                    value={campDueDate}
                    onChange={(e) => setCampDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-rose-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">สถานะรอบการส่ง</label>
                  <select
                    value={campStatus}
                    onChange={(e) => setCampStatus(e.target.value as 'active' | 'closed' | 'draft')}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                  >
                    <option value="active">เปิดรับเอกสาร (Active)</option>
                    <option value="closed">ปิดรับเอกสาร (Closed)</option>
                    <option value="draft">แบบร่าง (Draft)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">การส่งล่าช้า</label>
                  <select
                    value={campAllowLate}
                    onChange={(e) => setCampAllowLate(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value={1}>อนุญาตให้ส่งหลังกำหนด (ติดสถานะส่งช้า)</option>
                    <option value={0}>ไม่อนุญาตให้ส่งหลังกำหนด</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCampModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingCamp}
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow transition"
                >
                  {isSavingCamp ? 'กำลังบันทึก...' : editingCampId ? 'บันทึกการแก้ไข' : 'สร้างรอบการส่ง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Modal (Add / Edit / Appoint Head) */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingDept ? 'แก้ไขกลุ่มสาระ / แต่งตั้งหัวหน้ากลุ่มสาระ' : 'เพิ่มกลุ่มสาระการเรียนรู้ใหม่'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingDept ? `รหัสกลุ่มสาระ: ${editingDept.code}` : 'กำหนดข้อมูลกลุ่มสาระและหัวหน้ากลุ่ม'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeptModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อกลุ่มสาระการเรียนรู้ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  รหัสย่อกลุ่มสาระ (Code) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น SCI, MATH, THAI, ACT"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">ตัวอักษรภาษาอังกฤษตัวพิมพ์ใหญ่ เช่น SCI, MATH, THAI</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>แต่งตั้งหัวหน้ากลุ่มสาระการเรียนรู้</span>
                  {deptHeadUserId && (
                    <span className="text-[10px] text-emerald-600 font-bold">● กำหนดแล้ว</span>
                  )}
                </label>
                <select
                  value={deptHeadUserId}
                  onChange={(e) => setDeptHeadUserId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— ยังไม่กำหนดหัวหน้ากลุ่มสาระ —</option>
                  {editingDept && (
                    <optgroup label={`ครูในกลุ่มสาระนี้ (${usersList.filter(u => u.department_id === editingDept.id && u.status === 'active').length} ท่าน)`}>
                      {usersList
                        .filter((u) => u.department_id === editingDept.id && u.status === 'active')
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.title}{u.name} ({u.username}) {u.role === 'department_head' ? '👑 [หัวหน้ากลุ่มปัจจุบัน]' : ''}
                          </option>
                        ))}
                    </optgroup>
                  )}
                  <optgroup label="ครูท่านอื่นในโรงเรียน">
                    {usersList
                      .filter((u) => (!editingDept || u.department_id !== editingDept.id) && u.status === 'active' && u.role !== 'admin' && u.role !== 'executive')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.title}{u.name} ({u.department_name || 'ไม่สังกัด'})
                        </option>
                      ))}
                  </optgroup>
                </select>

                <div className="mt-2.5 p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-800 text-[11px] leading-relaxed">
                  💡 <strong>ระบบ 2 ตำแหน่งอัตโนมัติ:</strong> เมื่อแต่งตั้งครูท่านใดเป็นหัวหน้ากลุ่มสาระ ระบบจะปรับบทบาทเป็น <strong>หัวหน้ากลุ่มสาระ (Department Head)</strong> ทันที โดยครูจะสามารถตรวจเอกสารของครูในกลุ่มสาระ และส่งแผนการสอน/วิจัยของตนเองได้ในบัญชีเดียว (ส่งต่อให้วิชาการตรวจ)
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingDept}
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow transition"
                >
                  {isSavingDept ? 'กำลังบันทึก...' : editingDept ? 'บันทึกการแต่งตั้ง/แก้ไข' : 'สร้างกลุ่มสาระ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
