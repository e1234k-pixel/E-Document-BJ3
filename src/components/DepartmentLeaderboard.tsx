import React, { useState, useEffect } from 'react';
import type { DepartmentProgress } from '../types';
import { Confetti } from './Confetti';
import {
  Trophy,
  Award,
  Crown,
  Sparkles,
  TrendingUp,
  Flame,
  Rocket,
  CheckCircle2,
  Users,
  ChevronRight,
  PartyPopper
} from 'lucide-react';

interface DepartmentLeaderboardProps {
  deptProgress: DepartmentProgress[];
  campaignTitle?: string;
  highlightDeptId?: number | null;
  isDark?: boolean;
}

export const DepartmentLeaderboard: React.FC<DepartmentLeaderboardProps> = ({
  deptProgress,
  campaignTitle,
  highlightDeptId,
  isDark = false,
}) => {
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Sort departments by percentage descending, then totalSubmitted descending
  const sortedDepts = [...deptProgress].sort((a, b) => {
    if (b.percentage !== a.percentage) {
      return b.percentage - a.percentage;
    }
    return b.totalSubmitted - a.totalSubmitted;
  });

  const top1 = sortedDepts[0];
  const top2 = sortedDepts[1];
  const top3 = sortedDepts[2];

  const has100Percent = sortedDepts.some((d) => d.percentage >= 100);

  // Trigger celebration confetti on mount if any dept is 100%
  useEffect(() => {
    if (has100Percent) {
      setShowConfetti(true);
    }
  }, [has100Percent]);

  const handleManualCelebration = () => {
    setShowConfetti(false);
    setTimeout(() => setShowConfetti(true), 50);
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-500/30">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-900 font-black text-xs flex items-center justify-center shadow-md shadow-slate-400/20">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-700 to-orange-400 text-white font-black text-xs flex items-center justify-center shadow-md shadow-orange-500/20">
          🥉
        </span>
      );
    }
    return (
      <span
        className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center border ${
          isDark
            ? 'bg-slate-800 text-slate-400 border-slate-700'
            : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}
      >
        {rank}
      </span>
    );
  };

  const getGamificationBadge = (percentage: number) => {
    if (percentage >= 100) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black">
          <Trophy className="w-3 h-3 text-yellow-400" />
          <span>สำเร็จ 100% สมบูรณ์แบบ!</span>
        </span>
      );
    }
    if (percentage >= 80) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold">
          <Rocket className="w-3 h-3 text-blue-400" />
          <span>สปีดแรง 80%+</span>
        </span>
      );
    }
    if (percentage >= 50) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>ครึ่งทางแล้ว 50%+</span>
        </span>
      );
    }
    if (percentage > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
          <Flame className="w-3 h-3 text-amber-400" />
          <span>กำลังเร่งเครื่อง</span>
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
          isDark
            ? 'bg-slate-800 text-slate-500 border-slate-700'
            : 'bg-slate-100 text-slate-500 border-slate-200'
        }`}
      >
        <span>รอการส่ง</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Confetti Particle Effect */}
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}

      {/* Header Banner */}
      <div
        className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
          isDark
            ? 'bg-slate-900/80 border-slate-800'
            : 'bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/60 border-blue-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20 shrink-0">
            <Trophy className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-black text-base sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                กระดานแข่งขันกลุ่มสาระส่งงาน (Leaderboard Race)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                🏆 ชิงเหรียญทอง
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {campaignTitle ? `รอบ: ${campaignTitle} • ` : ''}
              ส่งเสริมความร่วมมือและการส่งเอกสารวิชาการตรงเวลา
            </p>
          </div>
        </div>

        <button
          onClick={handleManualCelebration}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 active:scale-95 shadow-xs ${
            isDark
              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
              : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
          }`}
          title="จุดพลุเฉลิมฉลอง"
        >
          <PartyPopper className="w-4 h-4 text-amber-500 animate-bounce" />
          <span>🎉 จุดพลุฉลอง</span>
        </button>
      </div>

      {/* Podium Top 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top 2: Silver (Left) */}
        {top2 && (
          <div
            className={`rounded-3xl p-5 border flex flex-col justify-between order-2 md:order-1 transition hover:scale-[1.01] ${
              isDark
                ? 'bg-slate-900/70 border-slate-700/80 shadow-lg'
                : 'bg-gradient-to-b from-slate-50 to-white border-slate-300 shadow-sm'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-xl bg-slate-200 text-slate-800 font-black text-xs border border-slate-300 flex items-center gap-1">
                  🥈 อันดับ 2 (เหรียญเงิน)
                </span>
                <span className="font-mono text-xs font-bold text-slate-400">{top2.code}</span>
              </div>

              <div>
                <h4 className={`font-bold text-sm leading-snug line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {top2.name}
                </h4>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  หัวหน้ากลุ่ม: {top2.head_name || 'ยังไม่กำหนด'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/20 mt-4 flex items-center justify-between">
              <div>
                <span className={`text-2xl font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {top2.percentage}%
                </span>
                <span className="text-[10px] text-slate-400 block">
                  ส่งแล้ว {top2.totalSubmitted}/{top2.totalTeachers} ท่าน
                </span>
              </div>
              {getGamificationBadge(top2.percentage)}
            </div>
          </div>
        )}

        {/* Top 1: Gold Champion (Center & Highlighted) */}
        {top1 && (
          <div
            className={`rounded-3xl p-6 border-2 flex flex-col justify-between order-1 md:order-2 shadow-xl relative overflow-hidden transition hover:scale-[1.02] ${
              isDark
                ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/60 shadow-amber-500/10'
                : 'bg-gradient-to-b from-amber-50 via-yellow-50/50 to-white border-amber-400 shadow-amber-400/20'
            }`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-400/20 to-transparent rounded-bl-full pointer-events-none" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs shadow-sm flex items-center gap-1.5 animate-pulse">
                  <Crown className="w-3.5 h-3.5" />
                  <span>🥇 อันดับ 1 (เหรียญทอง)</span>
                </span>
                <span className="font-mono text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
                  {top1.code}
                </span>
              </div>

              <div>
                <h4 className={`font-black text-base leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {top1.name}
                </h4>
                <p className={`text-xs mt-1 flex items-center gap-1.5 ${isDark ? 'text-amber-300' : 'text-amber-900 font-semibold'}`}>
                  👑 หัวหน้ากลุ่ม: {top1.head_name || 'ยังไม่กำหนด'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-amber-500/20 mt-4 flex items-center justify-between">
              <div>
                <span className="text-3xl sm:text-4xl font-black text-amber-500">
                  {top1.percentage}%
                </span>
                <span className={`text-xs block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  ส่งแล้ว {top1.totalSubmitted} จาก {top1.totalTeachers} ท่าน
                </span>
              </div>
              {getGamificationBadge(top1.percentage)}
            </div>
          </div>
        )}

        {/* Top 3: Bronze (Right) */}
        {top3 && (
          <div
            className={`rounded-3xl p-5 border flex flex-col justify-between order-3 transition hover:scale-[1.01] ${
              isDark
                ? 'bg-slate-900/70 border-slate-700/80 shadow-lg'
                : 'bg-gradient-to-b from-orange-50/50 to-white border-orange-200 shadow-sm'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-xl bg-orange-100 text-orange-900 font-black text-xs border border-orange-200 flex items-center gap-1">
                  🥉 อันดับ 3 (เหรียญทองแดง)
                </span>
                <span className="font-mono text-xs font-bold text-slate-400">{top3.code}</span>
              </div>

              <div>
                <h4 className={`font-bold text-sm leading-snug line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {top3.name}
                </h4>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  หัวหน้ากลุ่ม: {top3.head_name || 'ยังไม่กำหนด'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/20 mt-4 flex items-center justify-between">
              <div>
                <span className={`text-2xl font-black ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>
                  {top3.percentage}%
                </span>
                <span className="text-[10px] text-slate-400 block">
                  ส่งแล้ว {top3.totalSubmitted}/{top3.totalTeachers} ท่าน
                </span>
              </div>
              {getGamificationBadge(top3.percentage)}
            </div>
          </div>
        )}
      </div>

      {/* 100% Celebration Banner (If any) */}
      {has100Percent && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border border-emerald-500/40 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold text-xs sm:text-sm text-emerald-400">
                ยินดีกับกลุ่มสาระที่ส่งครบ 100% สมบูรณ์แบบแล้ว!
              </p>
              <p className="text-[11px] text-emerald-300">
                {sortedDepts
                  .filter((d) => d.percentage >= 100)
                  .map((d) => d.name)
                  .join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={handleManualCelebration}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shrink-0 transition shadow-xs"
          >
            ฉลองอีกครั้ง 🎊
          </button>
        </div>
      )}

      {/* Full Race Table (Rank 1 to 9) */}
      <div
        className={`rounded-3xl border overflow-hidden ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div
          className={`p-4 border-b flex items-center justify-between text-xs font-bold ${
            isDark ? 'border-slate-800 text-slate-300 bg-slate-900/80' : 'border-slate-100 text-slate-700 bg-slate-50/50'
          }`}
        >
          <span>ลำดับการแข่งขันทุกกลุ่มสาระ (Rankings)</span>
          <span className="text-[11px] text-slate-400 font-normal">เรียงตามเปอร์เซ็นต์การส่งงาน</span>
        </div>

        <div className="divide-y divide-slate-100">
          {sortedDepts.map((d, idx) => {
            const rank = idx + 1;
            const isUserDept = highlightDeptId && highlightDeptId === d.id;

            return (
              <div
                key={d.id}
                className={`p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isUserDept
                    ? isDark
                      ? 'bg-blue-950/60 border-l-4 border-blue-500'
                      : 'bg-blue-50/80 border-l-4 border-blue-600'
                    : isDark
                    ? 'hover:bg-slate-800/40'
                    : 'hover:bg-slate-50/60'
                }`}
              >
                {/* Left Info */}
                <div className="flex items-center gap-3 min-w-0">
                  {getRankBadge(rank)}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        <span className={isDark ? 'text-white' : 'text-slate-900'}>{d.name}</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200">
                        {d.code}
                      </span>
                      {isUserDept && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-blue-600 text-white font-bold animate-pulse">
                          👥 กลุ่มสาระของคุณ
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      หัวหน้ากลุ่ม: {d.head_name || 'ยังไม่กำหนด'} • ครูในกลุ่ม {d.totalTeachers} ท่าน
                    </p>
                  </div>
                </div>

                {/* Right Progress & Badge */}
                <div className="flex items-center gap-4 shrink-0 sm:w-72 justify-between sm:justify-end">
                  {/* Progress bar container */}
                  <div className="flex-1 max-w-[160px]">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                        {d.totalSubmitted}/{d.totalTeachers} ท่าน
                      </span>
                      <span
                        className={`font-black ${
                          d.percentage >= 100
                            ? 'text-emerald-500'
                            : d.percentage >= 80
                            ? 'text-blue-500'
                            : d.percentage >= 50
                            ? 'text-purple-500'
                            : 'text-amber-500'
                        }`}
                      >
                        {d.percentage}%
                      </span>
                    </div>

                    <div
                      className={`w-full rounded-full h-2 overflow-hidden ${
                        isDark ? 'bg-slate-800' : 'bg-slate-100'
                      }`}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          d.percentage >= 100
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                            : d.percentage >= 80
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-400'
                            : d.percentage >= 50
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-400'
                            : 'bg-gradient-to-r from-amber-500 to-orange-400'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, d.percentage))}%` }}
                      />
                    </div>
                  </div>

                  <div className="shrink-0">{getGamificationBadge(d.percentage)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DepartmentLeaderboard;
