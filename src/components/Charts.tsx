import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import type { ExecutiveKPIs, DepartmentProgress } from '../types';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
);

interface StatusDoughnutChartProps {
  kpis: ExecutiveKPIs;
}

export const StatusDoughnutChart: React.FC<StatusDoughnutChartProps> = ({ kpis }) => {
  const data = {
    labels: ['ผ่านการตรวจ', 'รอตรวจ', 'ให้แก้ไข', 'ส่งล่าช้า', 'ยังไม่ส่ง'],
    datasets: [
      {
        data: [
          kpis.approved,
          kpis.submitted + kpis.underReview,
          kpis.revisionRequired,
          kpis.late,
          kpis.notSubmitted,
        ],
        backgroundColor: [
          '#16A34A', // Green
          '#2563EB', // Blue
          '#F97316', // Orange
          '#E11D48', // Red
          '#94A3B8', // Gray
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          font: { family: 'Prompt', size: 11 },
          padding: 12,
        },
      },
    },
    cutout: '68%',
  };

  return (
    <div className="relative h-64 w-full flex items-center justify-center">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
        <span className="text-2xl font-bold text-slate-800">{kpis.submissionRate}%</span>
        <span className="text-[11px] text-slate-500">อัตราการส่ง</span>
      </div>
    </div>
  );
};

interface DepartmentProgressBarChartProps {
  progressList: DepartmentProgress[];
}

export const DepartmentProgressBarChart: React.FC<DepartmentProgressBarChartProps> = ({ progressList }) => {
  const labels = progressList.map((d) => d.code);
  const percentages = progressList.map((d) => d.percentage);

  const data = {
    labels,
    datasets: [
      {
        label: '% ความก้าวหน้า',
        data: percentages,
        backgroundColor: percentages.map((p) => (p >= 80 ? '#2563EB' : p >= 50 ? '#38BDF8' : '#F97316')),
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items: any[]) => {
            const idx = items[0]?.dataIndex;
            return progressList[idx]?.name || '';
          },
          label: (item: any) => `ความก้าวหน้า: ${item.raw}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (val: any) => `${val}%`,
          font: { family: 'Prompt', size: 10 },
        },
        grid: { color: '#f1f5f9' },
      },
      x: {
        ticks: { font: { family: 'Prompt', size: 11 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Bar data={data} options={options} />
    </div>
  );
};

export const DailySubmissionsLineChart: React.FC = () => {
  // Sample daily trend over the last 7 days
  const labels = ['23 ก.ย.', '24 ก.ย.', '25 ก.ย.', '26 ก.ย.', '27 ก.ย.', '28 ก.ย.', '29 ก.ย.'];
  const submissionsData = [2, 5, 8, 12, 19, 28, 35];

  const data = {
    labels,
    datasets: [
      {
        label: 'จำนวนการส่งสะสม (ฉบับ)',
        data: submissionsData,
        borderColor: '#1E3A8A',
        backgroundColor: 'rgba(30, 58, 138, 0.08)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#2563EB',
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { font: { family: 'Prompt', size: 11 } },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { font: { family: 'Prompt', size: 10 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Prompt', size: 10 } },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={data} options={options} />
    </div>
  );
};
