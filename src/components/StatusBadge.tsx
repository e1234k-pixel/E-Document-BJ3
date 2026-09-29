import React from 'react';
import type { SubmissionStatus } from '../types';
import { CheckCircle2, Clock, AlertTriangle, FileX, Send, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: SubmissionStatus | string;
  isLate?: number | boolean;
  showIcon?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  isLate,
  showIcon = true,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  // Config mapping
  switch (status) {
    case 'approved':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 ${sizeClasses} ${className}`}>
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          <span>ผ่านการตรวจ</span>
        </span>
      );

    case 'submitted':
      return (
        <span className={`inline-flex items-center rounded-full bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/20 ${sizeClasses} ${className}`}>
          {showIcon && <Send className="w-3.5 h-3.5 text-blue-600" />}
          <span>ส่งแล้ว / รอตรวจ</span>
        </span>
      );

    case 'under_review':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/30 ${sizeClasses} ${className}`}>
          {showIcon && <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />}
          <span>กำลังตรวจ</span>
        </span>
      );

    case 'revision_required':
      return (
        <span className={`inline-flex items-center rounded-full bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/30 ${sizeClasses} ${className}`}>
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />}
          <span>ให้แก้ไข</span>
        </span>
      );

    case 'late':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 ${sizeClasses} ${className}`}>
          {showIcon && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
          <span>ส่งล่าช้า</span>
        </span>
      );

    case 'not_submitted':
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10 ${sizeClasses} ${className}`}>
          {showIcon && <FileX className="w-3.5 h-3.5 text-slate-400" />}
          <span>ยังไม่ส่ง</span>
        </span>
      );
  }
};
