'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useVendors, useRegisterVendor, useUpdateVendorStatus } from '@/features/contracts/hooks/useVendors';
import { VendorDTO } from './types';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  FileJson,
  FileText,
  Trash2,
  RefreshCcw,
  ArrowUpDown,
} from 'lucide-react';
import { logger } from '@/lib/logger';

interface ParsedVendorRow {
  name: string;
  category: string;
  contactEmail: string;
  valid: boolean;
  error?: string;
}

function parseCSV(text: string): ParsedVendorRow[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const hasHeader = header.includes('name') || header.includes('category') || header.includes('email');
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map((line) => {
    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    const name = cols[0] || '';
    const category = cols[1] || '';
    const contactEmail = cols[2] || '';

    let valid = true;
    let error: string | undefined;

    if (!name) {
      valid = false;
      error = 'Missing vendor name';
    } else if (!category) {
      valid = false;
      error = 'Missing category';
    } else if (!contactEmail || !contactEmail.includes('@')) {
      valid = false;
      error = 'Invalid or missing email';
    }

    return { name, category, contactEmail, valid, error };
  });
}

function vendorsToCSV(vendors: VendorDTO[]): string {
  const header = 'Name,Category,Contact Email,Status,Avg Score,Review Count,Owner Address';
  const rows = vendors.map(
    (v) => `"${v.name}","${v.category}","${v.contact_email}","${v.status}",${v.avg_score},${v.review_count},"${v.owner}"`
  );
  return [header, ...rows].join('\n');
}

function vendorsToJSON(vendors: VendorDTO[]): string {
  return JSON.stringify(
    vendors.map((v) => ({
      name: v.name,
      category: v.category,
      contactEmail: v.contact_email,
      status: v.status,
      avgScore: v.avg_score,
      reviewCount: v.review_count,
      owner: v.owner,
      createdAt: new Date(v.created_at * 1000).toISOString(),
    })),
    null,
    2
  );
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function BulkOperations() {
  const { data: vendors = [] } = useVendors();
  const registerMutation = useRegisterVendor();
  const statusMutation = useUpdateVendorStatus();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'batch'>('import');
  const [parsedRows, setParsedRows] = useState<ParsedVendorRow[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'done' | 'error'>('idle');
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });

  // Batch status update
  const [batchStatus, setBatchStatus] = useState<string>('Active');
  const [batchSelectedIds, setBatchSelectedIds] = useState<Set<number>>(new Set());
  const [batchProcessing, setBatchProcessing] = useState(false);

  const validRows = parsedRows.filter((r) => r.valid);
  const invalidRows = parsedRows.filter((r) => !r.valid);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const rows = parseCSV(text);
      setParsedRows(rows);
      setImportStatus('idle');
      setImportProgress(0);
      setImportResults({ success: 0, failed: 0 });
      logger.info('CSV file parsed for bulk import', { totalRows: rows.length, validRows: rows.filter((r) => r.valid).length });
    };
    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (validRows.length === 0) return;
    setImportStatus('importing');
    let success = 0;
    let failed = 0;

    for (let i = 0; i < validRows.length; i++) {
      try {
        await registerMutation.mutateAsync({
          name: validRows[i].name,
          category: validRows[i].category,
          contactEmail: validRows[i].contactEmail,
        });
        success++;
      } catch {
        failed++;
      }
      setImportProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    setImportResults({ success, failed });
    setImportStatus(failed > 0 ? 'error' : 'done');
    logger.info('Bulk import completed', { success, failed });
  };

  const handleExportCSV = () => {
    downloadFile(vendorsToCSV(vendors), 'vendorpulse_vendors.csv', 'text/csv');
  };

  const handleExportJSON = () => {
    downloadFile(vendorsToJSON(vendors), 'vendorpulse_vendors.json', 'application/json');
  };

  const toggleBatchSelect = (id: number) => {
    const next = new Set(batchSelectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setBatchSelectedIds(next);
  };

  const selectAllBatch = () => {
    if (batchSelectedIds.size === vendors.length) {
      setBatchSelectedIds(new Set());
    } else {
      setBatchSelectedIds(new Set(vendors.map((v) => v.id)));
    }
  };

  const handleBatchStatusUpdate = async () => {
    if (batchSelectedIds.size === 0) return;
    setBatchProcessing(true);
    for (const id of batchSelectedIds) {
      try {
        await statusMutation.mutateAsync({ vendorId: id, status: batchStatus });
      } catch {
        // continue on error
      }
    }
    setBatchProcessing(false);
    setBatchSelectedIds(new Set());
    logger.info('Batch status update completed', { count: batchSelectedIds.size, newStatus: batchStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <ArrowUpDown className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Bulk Operations</h2>
          <p className="text-xs text-slate-400">Import, export, and batch manage vendors at scale</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'import' as const, label: 'CSV Import', Icon: Upload },
          { id: 'export' as const, label: 'Export Data', Icon: Download },
          { id: 'batch' as const, label: 'Batch Update', Icon: RefreshCcw },
        ].map((tab) => {
          const Icon = tab.Icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800/80'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center">
            <FileSpreadsheet className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400 mb-1">Upload a CSV file to bulk-register vendors</p>
            <p className="text-xs text-slate-600 mb-4">Format: Name, Category, Contact Email (one per line)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
            >
              Select CSV File
            </button>
          </div>

          {parsedRows.length > 0 && (
            <>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {validRows.length} valid
                </span>
                {invalidRows.length > 0 && (
                  <span className="flex items-center gap-1.5 text-red-400">
                    <XCircle className="w-3.5 h-3.5" /> {invalidRows.length} invalid
                  </span>
                )}
              </div>

              {/* Preview Table */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="px-4 py-2 text-left text-slate-400">Status</th>
                      <th className="px-4 py-2 text-left text-slate-400">Name</th>
                      <th className="px-4 py-2 text-left text-slate-400">Category</th>
                      <th className="px-4 py-2 text-left text-slate-400">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {parsedRows.slice(0, 20).map((row, i) => (
                      <tr key={i} className={row.valid ? '' : 'bg-red-500/5'}>
                        <td className="px-4 py-2">
                          {row.valid ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <span className="flex items-center gap-1 text-red-400">
                              <XCircle className="w-3.5 h-3.5" />
                              <span className="text-[10px]">{row.error}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-slate-300">{row.name || '—'}</td>
                        <td className="px-4 py-2 text-slate-400">{row.category || '—'}</td>
                        <td className="px-4 py-2 text-slate-400">{row.contactEmail || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {importStatus === 'importing' && (
                <div className="space-y-2">
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${importProgress}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 text-center">{importProgress}% complete</p>
                </div>
              )}

              {importStatus === 'done' && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Import complete: {importResults.success} vendors registered successfully
                </div>
              )}

              {importStatus !== 'importing' && validRows.length > 0 && importStatus !== 'done' && (
                <button
                  type="button"
                  onClick={handleBulkImport}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Import {validRows.length} Vendors
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleExportCSV}
            className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition text-left group"
          >
            <FileSpreadsheet className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition" />
            <h4 className="text-sm font-bold text-white mb-1">Export as CSV</h4>
            <p className="text-xs text-slate-400">
              Download all {vendors.length} vendors as a comma-separated values file
            </p>
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition text-left group"
          >
            <FileJson className="w-8 h-8 text-indigo-400 mb-3 group-hover:scale-110 transition" />
            <h4 className="text-sm font-bold text-white mb-1">Export as JSON</h4>
            <p className="text-xs text-slate-400">
              Download all {vendors.length} vendors as a structured JSON document
            </p>
          </button>
        </div>
      )}

      {/* Batch Status Tab */}
      {activeTab === 'batch' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select
              value={batchStatus}
              onChange={(e) => setBatchStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-xs text-slate-200 font-mono"
            >
              <option value="Active">Active</option>
              <option value="Probation">Probation</option>
              <option value="Suspended">Suspended</option>
              <option value="Deactivated">Deactivated</option>
            </select>
            <button
              type="button"
              onClick={handleBatchStatusUpdate}
              disabled={batchSelectedIds.size === 0 || batchProcessing}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-white text-xs font-semibold transition flex items-center gap-2"
            >
              {batchProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
              Update {batchSelectedIds.size} Selected
            </button>
            <button
              type="button"
              onClick={selectAllBatch}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition"
            >
              {batchSelectedIds.size === vendors.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 divide-y divide-slate-800/60">
            {vendors.map((v) => (
              <label key={v.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/20 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={batchSelectedIds.has(v.id)}
                  onChange={() => toggleBatchSelect(v.id)}
                  className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs font-medium text-slate-200 flex-1">{v.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  v.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400'
                    : v.status === 'Probation' ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {v.status}
                </span>
                <span className="text-xs text-slate-500 font-mono w-8 text-right">{v.avg_score}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
