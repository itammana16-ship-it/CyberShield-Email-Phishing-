
import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur px-4 py-4 mt-auto">
      <div className="max-w-7xl mx-auto space-y-3">

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-semibold text-slate-200">
            PhishGuard
          </span>
        </div>

        <div className="border-t border-slate-800/80 pt-3">
          <p className="text-center text-xs text-cyan-400 font-semibold mb-3">
            Developed by
          </p>

          <div className="flex items-center justify-center max-w-xl mx-auto">
            <div className="flex-1 text-center px-2">
              <p className="text-xs sm:text-sm font-semibold text-slate-200">
                Nusrat Jahan Tamanna
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1 break-all">
                nusrattamanna@gmail.com
              </p>
            </div>

            <div className="w-px h-10 bg-slate-700 shrink-0" />

            <div className="flex-1 text-center px-2">
              <p className="text-xs sm:text-sm font-semibold text-slate-200">
                Prite Das Tondra
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1 break-all">
                pritetondra@gmail.com
              </p>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
