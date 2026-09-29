import React, { useState } from 'react';
import { Copy, Check, X, MessageSquare, Bell, Calendar, Users } from 'lucide-react';
import type { Campaign } from '../types';

interface LineCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  daysRemaining: number;
  teachers: Array<{
    id: number;
    title: string;
    name: string;
    phone?: string;
    department_name: string;
    department_code: string;
  }>;
}

export const LineCopyModal: React.FC<LineCopyModalProps> = ({
  isOpen,
  onClose,
  campaign,
  daysRemaining,
  teachers,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !campaign) return null;

  // Format LINE message template
  const dueDateStr = new Date(campaign.due_date).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const remainingText =
    daysRemaining > 0
      ? `⏳ เหลือเวลาอีก ${daysRemaining} วัน (กำหนดส่งภายใน ${dueDateStr})`
      : daysRemaining === 0
      ? `🚨 วันนี้เป็นวันสุดท้ายของการส่งงาน (ปิดรับ 23:59 น.)`
      : `⚠️ เลยกำหนดส่งแล้ว ${Math.abs(daysRemaining)} วัน`;

  const teacherListText =
    teachers.length > 0
      ? teachers
          .map((t, idx) => `${idx + 1}. ครู${t.name} (${t.department_name.replace('กลุ่มสาระการเรียนรู้', '')})`)
          .join('\n')
      : 'ยินดีด้วยครับ คุณครูส่งเอกสารครบทุกคนแล้ว! 🎉';

  const fullLineMessage = `📢 [แจ้งเตือนงานวิชาการ โรงเรียนบึงกาฬ]
เรื่อง: ขอความอนุเคราะห์ส่ง ${campaign.title}
${remainingText}

📋 รายชื่อคุณครูที่ยังไม่พบการส่งเอกสารในระบบ (${teachers.length} ท่าน):
${teacherListText}

📌 คุณครูสามารถส่งเอกสารโดยแนบ Google Drive Link หรือ QR Code ได้ที่:
👉 https://bj3-academic.pages.dev

ขอขอบพระคุณคุณครูทุกท่านครับ 🙏
งานวิชาการ โรงเรียนบึงกาฬ`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullLineMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = fullLineMessage;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#06C755] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 fill-white text-white" />
            <div>
              <h3 className="font-semibold text-base">คัดลอกข้อความแจ้งเตือนใน LINE</h3>
              <p className="text-xs text-emerald-100">สำหรับนำไปวางในกลุ่มไลน์ครูเพื่อติดตามงาน</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-black/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-slate-500" />
              ยังไม่ส่ง: <strong className="text-rose-600 text-sm">{teachers.length}</strong> คน
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Calendar className="w-4 h-4" />
              {daysRemaining >= 0 ? `เหลืออีก ${daysRemaining} วัน` : 'เลยกำหนด'}
            </span>
          </div>

          <div className="relative">
            <textarea
              readOnly
              rows={11}
              value={fullLineMessage}
              className="w-full text-xs font-mono p-4 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none select-all leading-relaxed resize-none shadow-inner"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
          >
            ปิดหน้าต่าง
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`px-5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition active:scale-95 ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-[#06C755] hover:bg-[#05b34c] text-white hover:shadow'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>คัดลอกข้อความเรียบร้อยแล้ว!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>คัดลอกข้อความสำหรับ LINE</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
