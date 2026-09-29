import * as XLSX from 'xlsx';
import type { Submission } from '../types';

export function exportSubmissionsToExcel(submissions: Submission[], campaignTitle: string = 'รายงานการส่งเอกสารวิชาการ') {
  const statusTranslations: Record<string, string> = {
    approved: 'ผ่านการตรวจ (Approved)',
    submitted: 'ส่งแล้ว/รอตรวจ (Submitted)',
    under_review: 'กำลังตรวจ (Under Review)',
    revision_required: 'ให้แก้ไข (Revision Required)',
    late: 'ส่งล่าช้า (Late)',
    not_submitted: 'ยังไม่ส่ง (Not Submitted)'
  };

  // Prepare table data
  const data = submissions.map((sub, index) => ({
    'ลำดับ': index + 1,
    'ชื่อ-สกุล ครูผู้ส่ง': sub.user_name || '-',
    'กลุ่มสาระการเรียนรู้': sub.department_name || '-',
    'รหัสวิชา': sub.subject_code,
    'ชื่อรายวิชา': sub.subject_name,
    'ระดับชั้น': sub.grade_level,
    'สถานะการส่ง': statusTranslations[sub.status] || sub.status,
    'วันเวลาที่ส่ง': sub.submitted_at ? new Date(sub.submitted_at).toLocaleString('th-TH') : '-',
    'ลิงก์เอกสาร Google Drive': sub.document_url,
    'ผลการตรวจ': sub.latest_review_status === 'approved' ? 'ผ่าน' : sub.latest_review_status === 'revision_required' ? 'ต้องแก้ไข' : 'รอตรวจ',
    'ข้อเสนอแนะ/หมายเหตุ': sub.latest_review_comment || '-'
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // ลำดับ
    { wch: 24 }, // ชื่อครู
    { wch: 32 }, // กลุ่มสาระ
    { wch: 12 }, // รหัสวิชา
    { wch: 28 }, // ชื่อรายวิชา
    { wch: 10 }, // ระดับชั้น
    { wch: 24 }, // สถานะ
    { wch: 22 }, // วันที่ส่ง
    { wch: 45 }, // ลิงก์
    { wch: 14 }, // ผลการตรวจ
    { wch: 40 }, // หมายเหตุ
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'รายงานการส่งเอกสาร');

  // Trigger download
  const dateStr = new Date().toISOString().slice(0, 10);
  const cleanTitle = campaignTitle.replace(/[/\\?%*:|"<>]/g, '-');
  XLSX.writeFile(workbook, `BJ3_${cleanTitle}_${dateStr}.xlsx`);
}
