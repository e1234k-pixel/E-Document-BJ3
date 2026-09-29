import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Camera, QrCode, AlertCircle, CheckCircle2 } from 'lucide-react';
import jsQR from 'jsqr';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (url: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup camera on unmount
      if (html5QrCodeRef.current && isCameraActive) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [isCameraActive]);

  if (!isOpen) return null;

  // Handle Image File Upload Decode
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDecoding(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setErrorMsg('ไม่สามารถประมวลผลรูปภาพได้');
          setIsDecoding(false);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        setIsDecoding(false);

        if (code && code.data) {
          onScanSuccess(code.data);
          onClose();
        } else {
          setErrorMsg('ไม่พบ QR Code ในรูปภาพนี้ กรุณาตรวจสอบว่ารูปภาพชัดเจนและเป็น QR Code ที่ถูกต้อง');
        }
      };
      img.onerror = () => {
        setIsDecoding(false);
        setErrorMsg('รูปภาพไม่ถูกต้องหรือไม่สามารถเปิดได้');
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  // Toggle Camera
  const startCamera = async () => {
    setErrorMsg(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-region');
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Success callback
          if (html5QrCodeRef.current) {
            html5QrCodeRef.current.stop().catch(() => {});
          }
          setIsCameraActive(false);
          onScanSuccess(decodedText);
          onClose();
        },
        () => {
          // ignore scan frame errors
        }
      );
      setIsCameraActive(true);
    } catch (err: any) {
      setErrorMsg('ไม่สามารถเปิดกล้องได้: ' + (err.message || 'โปรดอนุญาตให้เข้าถึงกล้องในเบราว์เซอร์'));
      setIsCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && isCameraActive) {
      await html5QrCodeRef.current.stop().catch(() => {});
      setIsCameraActive(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-base">แนบด้วย QR Code</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('upload');
            }}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>อัปโหลดรูปภาพ QR Code</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('camera');
              startCamera();
            }}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'camera'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>สแกนด้วยกล้องมือถือ</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'upload' ? (
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-14 h-14 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center text-blue-600 transition">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    คลิกเพื่อเลือกภาพ QR Code หรือลากไฟล์มาวางที่นี่
                  </p>
                  <p className="text-xs text-slate-500 mt-1">รองรับไฟล์ PNG, JPG หรือภาพถ่าย QR Code</p>
                </div>
                {isDecoding && (
                  <div className="flex items-center gap-2 text-xs font-medium text-blue-600 animate-pulse mt-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    กำลังอ่านข้อมูล URL จาก QR Code...
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-3">
                ระบบจะถอดรหัส URL ทันทีในเบราว์เซอร์ของคุณ โดยไม่เปลืองพื้นที่จัดเก็บภาพ
              </p>
            </div>
          ) : (
            <div>
              <div
                id="qr-reader-region"
                className="w-full bg-slate-900 rounded-xl overflow-hidden min-h-[260px] flex items-center justify-center text-slate-400"
              />
              <p className="text-xs text-center text-slate-500 mt-3">
                ส่องกล้องไปที่ QR Code ของ Google Drive หรือเอกสารของคุณ
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};
