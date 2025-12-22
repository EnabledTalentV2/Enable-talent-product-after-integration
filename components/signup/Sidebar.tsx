'use client';

import Image from 'next/image';
import { AlertCircle, Check } from 'lucide-react';
import type { Step } from './types';

type SidebarProps = {
  steps: Step[];
};

export default function Sidebar({ steps }: SidebarProps) {
  return (
    <aside className="md:col-span-3 bg-white rounded-3xl p-6 shadow-lg flex flex-col justify-between h-fit min-h-[620px]">
      <ul className="space-y-4">
        {steps.map((step, idx) => {
          const isActive = step.isActive;
          return (
            <li
              key={step.id}
              className={`flex items-center justify-between rounded-2xl px-3 py-2.5 transition-colors ${
                isActive ? 'bg-orange-50 border border-orange-100' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {step.status === 'completed' ? (
                  <span className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                    <Check size={15} className="text-white" strokeWidth={3} />
                  </span>
                ) : step.status === 'error' ? (
                  <span className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shadow-sm">
                    <AlertCircle size={15} className="text-white" strokeWidth={3} />
                  </span>
                ) : (
                  <span className="w-7 h-7 rounded-full border border-slate-200 bg-white flex items-center justify-center shadow-sm text-sm text-slate-400">
                    {idx + 1}
                  </span>
                )}
                <span className={`text-base ${isActive ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'}`}>{step.label}</span>
              </div>
              {step.status === 'error' && step.errorText ? (
                <span className="text-sm font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">{step.errorText}</span>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="mt-10 pt-6 border-t border-gray-100 flex justify-center">
        <Image src="/logo/et-new.svg" alt="Enable Talent" width={140} height={36} className="h-9 w-auto opacity-85" />
      </div>
    </aside>
  );
}


