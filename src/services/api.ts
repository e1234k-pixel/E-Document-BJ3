import type {
  User,
  Department,
  Campaign,
  Submission,
  Review,
  SubmissionHistory,
  ExecutiveKPIs,
  DepartmentProgress,
  MatrixRow,
  UnsubmittedResponse,
  Notification,
  UserRole
} from '../types';

const API_BASE = '/api';

export const api = {
  // Auth
  async login(username: string, password: string):Promise<{ success: boolean; user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err: any = await res.json().catch(() => ({ error: 'เข้าสู่ระบบไม่สำเร็จ' }));
      throw new Error(err?.error || 'เข้าสู่ระบบไม่สำเร็จ');
    }
    return res.json();
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/auth/users`);
    if (!res.ok) return [];
    return res.json();
  },

  async createUser(data: Partial<User> & { password?: string }): Promise<{ success: boolean; id: number }> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err: any = await res.json().catch(() => ({ error: 'ไม่สามารถเพิ่มผู้ใช้งานได้' }));
      throw new Error(err?.error || 'ไม่สามารถเพิ่มผู้ใช้งานได้');
    }
    return res.json();
  },

  async bulkCreateUsers(users: Array<Partial<User> & { password?: string }>): Promise<{ success: boolean; insertedCount: number; errors: string[] }> {
    const res = await fetch(`${API_BASE}/admin/users/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users })
    });
    if (!res.ok) {
      const err: any = await res.json().catch(() => ({ error: 'ไม่สามารถนำเข้ารายชื่อได้' }));
      throw new Error(err?.error || 'ไม่สามารถนำเข้ารายชื่อได้');
    }
    return res.json();
  },

  async updateUser(id: number, data: Partial<User> & { password?: string }): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err: any = await res.json().catch(() => ({ error: 'ไม่สามารถแก้ไขข้อมูลผู้ใช้งานได้' }));
      throw new Error(err?.error || 'ไม่สามารถแก้ไขข้อมูลผู้ใช้งานได้');
    }
    return res.json();
  },

  async deleteUser(id: number): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err: any = await res.json().catch(() => ({ error: 'ไม่สามารถลบผู้ใช้งานได้' }));
      throw new Error(err?.error || 'ไม่สามารถลบผู้ใช้งานได้');
    }
    return res.json();
  },

  async bulkDeleteUsers(userIds: number[]): Promise<{ success: boolean; deletedCount: number }> {
    const res = await fetch(`${API_BASE}/admin/users/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_ids: userIds })
    });
    if (!res.ok) {
      const err: any = await res.json().catch(() => ({ error: 'ไม่สามารถลบผู้ใช้งานหลายคนได้' }));
      throw new Error(err?.error || 'ไม่สามารถลบผู้ใช้งานหลายคนได้');
    }
    return res.json();
  },

  async bulkUpdateUsers(data: {
    user_ids: number[];
    department_id?: number | null;
    role?: UserRole;
    status?: 'active' | 'inactive';
    password?: string;
  }): Promise<{ success: boolean; updatedCount: number }> {
    const res = await fetch(`${API_BASE}/admin/users/bulk-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err: any = await res.json().catch(() => ({ error: 'ไม่สามารถแก้ไขข้อมูลหลายคนได้' }));
      throw new Error(err?.error || 'ไม่สามารถแก้ไขข้อมูลหลายคนได้');
    }
    return res.json();
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    const res = await fetch(`${API_BASE}/departments`);
    if (!res.ok) return [];
    return res.json();
  },

  async createDepartment(data: { name: string; code: string; head_user_id?: number | null }): Promise<{ success: boolean; id: number }> {
    const res = await fetch(`${API_BASE}/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err: any = await res.json().catch(() => ({ error: 'ไม่สามารถเพิ่มกลุ่มสาระได้' }));
      throw new Error(err?.error || 'ไม่สามารถเพิ่มกลุ่มสาระได้');
    }
    return res.json();
  },

  async updateDepartment(id: number, data: { name?: string; code?: string; head_user_id?: number | null }): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/departments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err: any = await res.json().catch(() => ({ error: 'ไม่สามารถบันทึกข้อมูลกลุ่มสาระได้' }));
      throw new Error(err?.error || 'ไม่สามารถบันทึกข้อมูลกลุ่มสาระได้');
    }
    return res.json();
  },

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    const res = await fetch(`${API_BASE}/campaigns`);
    if (!res.ok) return [];
    return res.json();
  },

  async createCampaign(data: Partial<Campaign>): Promise<{ success: boolean; id: number }> {
    const res = await fetch(`${API_BASE}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('ไม่สามารถสร้างรอบการส่งเอกสารได้');
    return res.json();
  },

  async updateCampaign(id: number, data: Partial<Campaign>): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/campaigns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('ไม่สามารถแก้ไขรอบการส่งเอกสารได้');
    return res.json();
  },

  // Submissions
  async getSubmissions(params?: {
    campaign_id?: number | string;
    department_id?: number | string;
    user_id?: number | string;
    status?: string;
  }): Promise<Submission[]> {
    const query = new URLSearchParams();
    if (params?.campaign_id) query.append('campaign_id', String(params.campaign_id));
    if (params?.department_id) query.append('department_id', String(params.department_id));
    if (params?.user_id) query.append('user_id', String(params.user_id));
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`${API_BASE}/submissions?${query.toString()}`);
    if (!res.ok) return [];
    return res.json();
  },

  async getSubmissionDetail(id: number): Promise<{
    submission: Submission;
    reviews: Review[];
    history: SubmissionHistory[];
  }> {
    const res = await fetch(`${API_BASE}/submissions/${id}`);
    if (!res.ok) throw new Error('ไม่พบข้อมูลเอกสาร');
    return res.json();
  },

  async submitDocument(data: {
    campaign_id: number;
    user_id: number;
    subject_name: string;
    subject_code: string;
    grade_level: string;
    document_url: string;
    submission_type?: string;
  }) {
    const res = await fetch(`${API_BASE}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err: any = await res.json().catch(() => ({ error: 'ส่งเอกสารไม่สำเร็จ' }));
      throw new Error(err?.error || 'ส่งเอกสารไม่สำเร็จ');
    }
    return res.json();
  },

  async reviewSubmission(
    submissionId: number,
    data: {
      reviewer_id: number;
      status: 'approved' | 'revision_required' | 'under_review';
      comment?: string;
    }
  ) {
    const res = await fetch(`${API_BASE}/submissions/${submissionId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err: any = await res.json().catch(() => ({ error: 'บันทึกผลการตรวจไม่สำเร็จ' }));
      throw new Error(err?.error || 'บันทึกผลการตรวจไม่สำเร็จ');
    }
    return res.json();
  },

  // Analytics & Dashboards
  async getKPIs(campaignId: number | string = 1, departmentId?: number | string): Promise<ExecutiveKPIs> {
    const query = new URLSearchParams({ campaign_id: String(campaignId) });
    if (departmentId) query.append('department_id', String(departmentId));

    const res = await fetch(`${API_BASE}/analytics/kpis?${query.toString()}`);
    if (!res.ok) {
      return {
        totalTeachers: 0,
        totalSubmissions: 0,
        submitted: 0,
        underReview: 0,
        revisionRequired: 0,
        approved: 0,
        late: 0,
        notSubmitted: 0,
        submissionRate: 0,
        approvalRate: 0
      };
    }
    return res.json();
  },

  async getDepartmentProgress(campaignId: number | string = 1): Promise<DepartmentProgress[]> {
    const res = await fetch(`${API_BASE}/analytics/department-progress?campaign_id=${campaignId}`);
    if (!res.ok) return [];
    return res.json();
  },

  async getMatrix(departmentId?: number | string): Promise<{ campaigns: Campaign[]; matrix: MatrixRow[] }> {
    const query = new URLSearchParams();
    if (departmentId) query.append('department_id', String(departmentId));

    const res = await fetch(`${API_BASE}/analytics/matrix?${query.toString()}`);
    if (!res.ok) return { campaigns: [], matrix: [] };
    return res.json();
  },

  async getUnsubmitted(campaignId: number | string = 1, departmentId?: number | string): Promise<UnsubmittedResponse> {
    const query = new URLSearchParams({ campaign_id: String(campaignId) });
    if (departmentId) query.append('department_id', String(departmentId));

    const res = await fetch(`${API_BASE}/analytics/unsubmitted?${query.toString()}`);
    if (!res.ok) {
      throw new Error('ไม่สามารถดึงรายชื่อผู้ยังไม่ส่งได้');
    }
    return res.json();
  },

  // Notifications
  async getNotifications(userId: number): Promise<Notification[]> {
    const res = await fetch(`${API_BASE}/notifications?user_id=${userId}`);
    if (!res.ok) return [];
    return res.json();
  },

  async markNotificationRead(id: number) {
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' });
  }
};
