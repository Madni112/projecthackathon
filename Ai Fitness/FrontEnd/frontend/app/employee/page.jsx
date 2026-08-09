"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployeeRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/user');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#e7e5e4] border-t-[#292524] rounded-full animate-spin" />
    </div>
  );
}
