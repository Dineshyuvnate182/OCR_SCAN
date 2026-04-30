import React from 'react';
import { motion } from 'framer-motion';

const DataTable = ({ data }) => {
  if (!data || !data.headers || !data.rows) return null;

  return (
    <div className="w-full mt-6 overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
      <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
          {data.title || 'Extracted Data Preview'}
        </h3>
        <span className="text-xs font-medium px-2 py-1 bg-slate-700/50 text-slate-400 rounded-md uppercase tracking-wider">
          {data.rows.length} Rows Detected
        </span>
      </div>
      
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 sticky top-0 z-10">
              {data.headers.map((header, i) => (
                <th 
                  key={i} 
                  className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-slate-700"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.rows.map((row, rowIndex) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIndex * 0.05 }}
                key={rowIndex} 
                className="hover:bg-slate-800/40 transition-colors group"
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 text-sm text-slate-400 font-medium group-hover:text-white transition-colors border-r border-slate-800/30 last:border-0">
                    {cell || <span className="text-slate-600 italic">empty</span>}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.summary && (
        <div className="p-3 bg-slate-800/50 border-t border-slate-700/50 flex gap-4 overflow-x-auto">
          {Object.entries(data.summary).map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold">{key}</span>
              <span className="text-xs text-indigo-400 font-mono">{String(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DataTable;
 pocket-table
