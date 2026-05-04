'use client';

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { ChartPoint } from '@/types';

interface ChartProps {
  data: ChartPoint[];
  height?: number;
}

const BLUE  = '#2563EB';
const RED   = '#C53030';
const GRID  = 'rgba(255,255,255,0.06)';

const tooltipStyle = {
  backgroundColor: 'rgba(13, 18, 33, 0.85)',
  border:          '1px solid rgba(255,255,255,0.12)',
  borderRadius:    '12px',
  backdropFilter:  'blur(20px)',
  color:           '#f1f5f9',
  fontSize:        12,
  boxShadow:       '0 8px 32px rgba(0,0,0,0.4)',
};

export function OrdersAreaChart({ data, height = 220 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={BLUE} stopOpacity={0.4} />
            <stop offset="100%" stopColor={BLUE} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={BLUE}
          strokeWidth={2}
          fill="url(#blueGrad)"
          name="Commandes"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RevenueBarChart({ data, height = 220 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }} barSize={12}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="value2" name="Revenus (FCFA)" fill={RED} radius={[4, 4, 0, 0]} opacity={0.85} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DualLineChart({ data, height = 220 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="blueGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={BLUE} stopOpacity={0.3} />
            <stop offset="100%" stopColor={BLUE} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={RED} stopOpacity={0.3} />
            <stop offset="100%" stopColor={RED} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Area type="monotone" dataKey="value"  stroke={BLUE} strokeWidth={2} fill="url(#blueGrad2)" name="Commandes" />
        <Area type="monotone" dataKey="value2" stroke={RED}  strokeWidth={2} fill="url(#redGrad)"   name="Revenus"   />
      </AreaChart>
    </ResponsiveContainer>
  );
}
