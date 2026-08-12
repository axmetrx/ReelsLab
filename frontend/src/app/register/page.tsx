'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}
