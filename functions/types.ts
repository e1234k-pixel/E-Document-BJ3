/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

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
  head_user_id?: number | null;
  teacher_count?: number;
  created_at?: string;
}

export interface User {
  id: number;
  username: string;
  password_hash: string;
  title: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  department_id?: number | null;
  department_name?: string;
  status: 'active' | 'inactive';
  avatar_url?: string;
  created_at?: string;
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
  created_at?: string;
}

export interface Submission {
  id: number;
  campaign_id: number;
  campaign_title?: string;
  user_id: number;
  user_name?: string;
  department_id?: number;
  department_name?: string;
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
