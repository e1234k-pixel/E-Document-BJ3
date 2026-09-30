export type UserRole = 'teacher' | 'department_head' | 'academic' | 'executive' | 'admin';

export type SubmissionStatus =
  | 'not_submitted'
  | 'submitted'
  | 'under_review'
  | 'revision_required'
  | 'approved'
  | 'late';

export interface Department {
  id: number;
  name: string;
  code: string;
  head_name?: string;
}

export interface User {
  id: number;
  username: string;
  title: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  department_id?: number | null;
  department_name?: string;
  department_code?: string;
  status: 'active' | 'inactive';
  avatar_url?: string;
}

export interface Campaign {
  id: number;
  title: string;
  description?: string;
  academic_year: number;
  semester: number;
  doc_type: string;
  start_date: string;
  due_date: string;
  status: 'active' | 'closed' | 'draft';
  allow_late: number;
}

export interface Submission {
  id: number;
  campaign_id: number;
  campaign_title?: string;
  campaign_due_date?: string;
  user_id: number;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  department_id?: number | null;
  department_name?: string;
  department_code?: string;
  subject_name: string;
  subject_code: string;
  grade_level: string;
  document_url: string;
  submission_type: 'google_drive' | 'qr_code' | 'other';
  status: SubmissionStatus;
  is_late: number;
  submitted_at: string;
  updated_at: string;
  latest_review_status?: string;
  latest_review_comment?: string;
  reviewer_name?: string;
}

export interface Review {
  id: number;
  submission_id: number;
  reviewer_id: number;
  reviewer_name?: string;
  reviewer_role?: string;
  status: 'approved' | 'revision_required' | 'under_review';
  comment?: string;
  reviewed_at: string;
}

export interface SubmissionHistory {
  id: number;
  submission_id: number;
  user_id: number;
  user_name?: string;
  action: string;
  old_status?: string;
  new_status: string;
  note?: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  read_status: number;
  link?: string;
  created_at: string;
}

export interface ExecutiveKPIs {
  totalTeachers: number;
  totalSubmissions: number;
  submitted: number;
  underReview: number;
  revisionRequired: number;
  approved: number;
  late: number;
  notSubmitted: number;
  submissionRate: number;
  approvalRate: number;
}

export interface DepartmentProgress {
  id: number;
  name: string;
  code: string;
  head_name?: string;
  totalTeachers: number;
  totalSubmitted: number;
  approved: number;
  underReview: number;
  revision: number;
  notSubmitted: number;
  percentage: number;
}

export interface MatrixRow {
  teacher: {
    id: number;
    title: string;
    name: string;
    role: string;
    department_id: number;
    department_name: string;
    department_code: string;
  };
  campaigns: Record<number, {
    submission_id?: number;
    status: SubmissionStatus;
    document_url?: string;
    updated_at?: string;
  }>;
}

export interface UnsubmittedResponse {
  campaign: Campaign;
  daysRemaining: number;
  isOverdue: boolean;
  unsubmittedCount: number;
  teachers: Array<{
    id: number;
    title: string;
    name: string;
    phone?: string;
    email?: string;
    department_name: string;
    department_code: string;
  }>;
}
