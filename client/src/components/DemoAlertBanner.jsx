import React from 'react';
import { Info } from 'lucide-react';

export default function DemoAlertBanner() {
  return (
    <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-xl p-3.5 flex items-start space-x-3 mb-6">
      <div className="p-1 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300 flex-shrink-0 mt-0.5">
        <Info className="w-4 h-4" />
      </div>
      <div className="text-xs text-sky-900 dark:text-sky-200 leading-relaxed">
        <span className="font-bold tracking-wide uppercase mr-1.5 text-sky-800 dark:text-sky-300">
          DEMO MODE — NO REAL MONEY IS MOVED
        </span>
        This is an academic simulated wallet. All balances, deposits, transfers, and bill payments are educational demonstrations.
      </div>
    </div>
  );
}
