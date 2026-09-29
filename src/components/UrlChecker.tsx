import React, { useMemo } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ExternalLink, ShieldAlert } from 'lucide-react';

interface UrlCheckerProps {
  url: string;
}

export const UrlChecker: React.FC<UrlCheckerProps> = ({ url }) => {
  const validation = useMemo(() => {
    if (!url || !url.trim()) return null;

    const trimmed = url.trim();

    // Check valid URL pattern
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmed);
    } catch {
      return {
        status: 'invalid' as const,
        message: 'รูปแบบ URL ไม่ถูกต้อง (ต้องขึ้นต้นด้วย https:// หรือ http://)',
        isDrive: false,
      };
    }

    const host = parsedUrl.hostname.toLowerCase();

    // Check Google Drive / Google Docs
    const isGoogleDrive =
      host.includes('drive.google.com') ||
      host.includes('docs.google.com') ||
      host.includes('sheets.google.com') ||
      host.includes('slides.google.com');

    if (isGoogleDrive) {
      return {
        status: 'valid' as const,
        message: '✓ ลิงก์ Google Drive ถูกต้อง พร้อมส่ง',
        isDrive: true,
        type: host.includes('folder') || url.includes('/folders/') ? 'Folder' : 'File / Document'
      };
    }

    // Other valid links
    return {
      status: 'warning' as const,
      message: '⚠️ ลิงก์เปิดได้ แต่ไม่ใช่ Google Drive กรุณาตรวจสอบว่าผู้ตรวจสามารถเข้าถึงได้',
      isDrive: false,
    };
  }, [url]);

  if (!validation) return null;

  return (
    <div className="mt-2.5 space-y-2 animate-fadeIn">
      {/* Validation Status Pill */}
      <div
        className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-medium border ${
          validation.status === 'valid'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : validation.status === 'warning'
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}
      >
        <div className="flex items-center gap-2">
          {validation.status === 'valid' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          {validation.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
          {validation.status === 'invalid' && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span>{validation.message}</span>
        </div>

        {validation.status !== 'invalid' && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline shrink-0 ml-2"
          >
            <span>ทดสอบเปิดลิงก์</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Google Drive Permission Reminder */}
      {validation.isDrive && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-blue-800">คำแนะนำการแชร์ Google Drive: </span>
            กรุณาตั้งค่าสิทธิ์การแชร์ใน Google Drive เป็น{' '}
            <strong className="underline decoration-blue-400 font-semibold">"ทุกคนที่มีลิงก์ (ผู้มีสิทธิ์อ่าน)"</strong>{' '}
            หรือใช้อีเมลโรงเรียน เพื่อให้หัวหน้ากลุ่มสาระและฝ่ายวิชาการสามารถเปิดตรวจเอกสารได้ทันที
          </div>
        </div>
      )}
    </div>
  );
};
