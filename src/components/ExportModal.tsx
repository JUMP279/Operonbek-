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
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  dateRange,
  metrics,
  totalProfit
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

  const handleDownload = () => {
    setExporting(true);
    setTimeout(() => {
      triggerConfetti();

      // Generate downloadable data
      const dataRows = [
        ['Metric', 'Value', 'Change', 'Period'],
        ...metrics.map((m) => [m.label, m.value, m.change, m.comparisonText]),
        ['Total Profit', totalProfit, '+24.4%', 'vs. last period'],
        ['Repeat Customer Rate', '68%', 'On track', '80% target'],
        ['Peak Day', 'Tuesday', '8,162 active', 'Highest activity']
      ];

      const csvContent = 'data:text/csv;charset=utf-8,' + dataRows.map((e) => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Operon_Analytics_${dateRange.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExporting(false);
    }, 600);
  };

  const handleCopy = () => {
    const summary = `📊 Operon Analytics Report (${dateRange})\n` +
      `• Total Profit: ${totalProfit} (+24.4%)\n` +
      metrics.map((m) => `• ${m.label}: ${m.value} (${m.change})`).join('\n') +
      `\n• Repeat Customer Rate: 68%\n• Peak Day Active: Tuesday (8,162 sessions)`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
