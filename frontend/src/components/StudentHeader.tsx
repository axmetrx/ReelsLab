'use client';

import React from 'react';
import Image from 'next/image';
import { BadgeCheck } from 'lucide-react';

export default function StudentHeader() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm mb-6">
      {/* Studio Cover Banner */}
      <div className="relative h-32 sm:h-44 w-full bg-slate-100">
        <Image
          src="/cover.jpg"
          alt="Studio Cover"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Avatar & Author Info */}
      <div className="relative px-6 pb-6 pt-0 text-center flex flex-col items-center">
        {/* Circular Avatar overlapping cover */}
        <div className="-mt-12 sm:-mt-14 relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-md bg-[#F4EFEA] flex flex-col items-center justify-center p-2 overflow-hidden">
          <div className="text-[13px] sm:text-[15px] font-serif tracking-widest text-[#7D6E63] uppercase leading-tight text-center font-bold">
            reels<br />lab
          </div>
        </div>

        {/* Title + Verified Badge */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            ReelsLab
          </h1>
          <BadgeCheck size={20} className="text-blue-600 fill-blue-600 text-white shrink-0" />
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm font-medium text-slate-400 mt-0.5 font-serif italic">
          by Madina Aldaniyaz
        </p>
      </div>
    </div>
  );
}
