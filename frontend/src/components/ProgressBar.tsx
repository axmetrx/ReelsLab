'use client';

import React from 'react';

interface ProgressBarProps {
  percent: number;
  size?: 'sm' | 'lg';
}

export default function ProgressBar({ percent, size = 'lg' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const isLg = size === 'lg';

  return (
    <div className="w-full">
      <div
        className="w-full overflow-hidden rounded-full bg-slate-200"
        style={{
          height: isLg ? '8px' : '4px',
        }}
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
          style={{
            width: `${clamped}%`,
          }}
        />
      </div>
    </div>
  );
}
