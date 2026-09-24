'use client';

import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('./MapContainerComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-400 gap-3">
      <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm font-medium tracking-wide">Loading GIS Map Engine...</span>
    </div>
  ),
});

export default function MapWrapper() {
  return <DynamicMap />;
}
