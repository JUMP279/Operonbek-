import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText, CheckCircle2, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateRange: string;
  metrics: any[];
  totalProfit: string;
  retention?: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  dateRange,
  metrics,
  totalProfit,
  retention
}) => {
  const { t, language } = useLanguage();
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'csv' | 'pdf' | 'json'>('csv');

  if (!isOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  // RFC 4180 quoting. Several values contain commas ("vs. 14,653 last period"),
  // which previously shifted every following column in the generated CSV.
  const toCsvCell = (value: string) => `"${String(value ?? '').replace(/"/g, '""')}"`;

  const buildReport = () => {
    const header = ['Metric', 'Value', 'Change', 'Period'];
    const rows = [
      ...metrics.map((m) => [m.label, m.value, m.change, m.comparisonText]),
      ['Revenue', totalProfit, '', dateRange],
      ['Repeat Customer Rate', `${retention ?? 0}%`, '', dateRange]
    ];
    return { header, rows };
  };

  const handleDownload = () => {
    setExporting(true);
    setTimeout(() => {
      triggerConfetti();

      const { header, rows } = buildReport();
      const safeRange = dateRange.replace(/[^\w-]+/g, '_');
      let blob: Blob;
      let extension: string;

      // Previously the picker was cosmetic: every format downloaded a .csv file.
      if (format === 'json') {
        const payload = {
          report: 'Operon Analytics',
          dateRange,
          generatedAt: new Date().toISOString(),
          rows: rows.map((r) => ({
            metric: r[0],
            value: r[1],
            change: r[2],
            period: r[3]
          }))
        };
        blob = new Blob([JSON.stringify(payload, null, 2)], {
          type: 'application/json;charset=utf-8'
        });
        extension = 'json';
      } else if (format === 'pdf') {
        // No PDF engine is bundled, so emit a printable HTML report the browser
        // can save as PDF instead of silently handing back a CSV.
        const tableRows = rows
          .map(
            (r) =>
              `<tr>${r
                .map((cell) => `<td>${String(cell ?? '').replace(/[<>&]/g, '')}</td>`)
                .join('')}</tr>`
          )
          .join('');
        const html = `<!doctype html><html><head><meta charset="utf-8">
<title>Operon Analytics — ${dateRange}</title>
<style>
body{font-family:system-ui,sans-serif;padding:32px;color:#0f172a}
h1{font-size:20px;margin:0 0 4px}p{color:#64748b;margin:0 0 20px;font-size:13px}
table{border-collapse:collapse;width:100%;font-size:13px}
th,td{border:1px solid #e2e8f0;padding:8px 10px;text-align:left}
th{background:#f1f5f9}
@media print{@page{margin:16mm}}
</style></head><body>
<h1>Operon Analytics Report</h1><p>${dateRange}</p>
<table><thead><tr>${header.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
<tbody>${tableRows}</tbody></table>
<script>window.onload=function(){window.print()}</script>
</body></html>`;
        blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        extension = 'html';
      } else {
        // Leading BOM so Excel opens the Cyrillic labels in UTF-8.
        const csv =
          '﻿' +
          [header, ...rows].map((row) => row.map(toCsvCell).join(',')).join('\r\n');
        blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        extension = 'csv';
      }

      // Blob + object URL: encodeURI() on a data: URI mangles '#' and the ▲/▼ glyphs.
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Operon_Analytics_${safeRange}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExporting(false);
    }, 600);
  };

  const handleCopy = async () => {
    const summary = `📊 Operon Analytics Report (${dateRange})\n` +
      `• Revenue: ${totalProfit}\n` +
      metrics.map((m) => `• ${m.label}: ${m.value} (${m.change})`).join('\n') +
      `\n• Repeat Customer Rate: ${retention ?? 0}%`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // clipboard API is unavailable outside secure contexts — don't leave an
      // unhandled rejection and don't flash a false "copied" confirmation.
      console.warn('Clipboard write failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.export}</h3>
              <p className="text-xs text-slate-400">{dateRange}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selection */}
        <div className="my-4">
          <label className="text-xs font-semibold text-slate-600 block mb-2">Select Export Format</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setFormat('csv')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                format === 'csv'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold ring-1 ring-blue-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="text-xs">CSV Data</span>
            </button>

            <button
              onClick={() => setFormat('pdf')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                format === 'pdf'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold ring-1 ring-blue-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-xs">PDF Report</span>
            </button>

            <button
              onClick={() => setFormat('json')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                format === 'json'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold ring-1 ring-blue-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Download className="w-4 h-4" />
              <span className="text-xs">JSON Raw</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            id="btn-confirm-export"
            onClick={handleDownload}
            disabled={exporting}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
          >
            {exporting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {language === 'ru' ? 'Формирование файла...' : 'Файл жасалуда...'}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                {language === 'ru' ? `Скачать ${format.toUpperCase()}` : `${format.toUpperCase()} жүктеп алу`}
              </span>
            )}
          </button>

          <button
            onClick={handleCopy}
            className="w-full py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all"
          >
            {copied ? (
              <span className="text-emerald-600 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> {language === 'ru' ? 'Скопировано в буфер!' : 'Буферге көшірілді!'}
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5" /> {language === 'ru' ? 'Копировать отчет' : 'Есепті көшіріп алу'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
