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
  Check
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, usersList, refreshUsers } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'departments' | 'campaigns' | 'system'>('users');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

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
  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department_name && u.department_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <span>รายชื่อครูและผู้ใช้ในระบบ ({usersList.length})</span>
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
                placeholder="ค้นหาชื่อ, username, กลุ่มสาระ หรือบทบาท..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
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
    </div>
  );
};
