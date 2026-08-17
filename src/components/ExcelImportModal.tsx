import React, { useState } from 'react';
import { ImportPreviewRow, RunningRecord } from '../types';
import { parseExcelFile, revalidatePreviewRow } from '../utils/excelImporter';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  CheckSquare,
  Square,
  ArrowRight,
  Info,
  Pencil,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingRecords: RunningRecord[];
  onImportConfirmed: (recordsToInsert: RunningRecord[]) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  existingRecords,
  onImportConfirmed,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [importDoneMsg, setImportDoneMsg] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setErrorMsg('');
    setLoading(true);

    try {
      const rows = await parseExcelFile(selected, existingRecords);
      if (!rows || rows.length === 0) {
        setErrorMsg('No readable rows found in file. Please check Excel headers.');
        setPreviewRows([]);
      } else {
        setPreviewRows(rows);
      }
    } catch (err: any) {
      console.error('Excel parse error:', err);
      setErrorMsg('Failed to parse Excel file. Please ensure it is a valid .xlsx or .csv.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (index: number, field: keyof RunningRecord, value: any) => {
    setPreviewRows((prevRows) => {
      return prevRows.map((row) => {
        if (row.index !== index) return row;

        const updatedMapped = {
          ...row.mapped,
          [field]: value,
        };

        const revalidated = revalidatePreviewRow(
          updatedMapped,
          index,
          prevRows,
          existingRecords
        );

        return {
          ...row,
          mapped: revalidated.enrichedMapped,
          isValid: revalidated.isValid,
          validationErrors: revalidated.validationErrors,
          isDuplicate: revalidated.isDuplicate,
          duplicateReason: revalidated.duplicateReason,
          // Auto-select if it just became valid and is not duplicate
          selected: revalidated.isValid && !revalidated.isDuplicate ? true : row.selected,
        };
      });
    });
  };

  const toggleSelectAll = () => {
    const allSelected = previewRows.every((r) => r.selected);
    setPreviewRows(previewRows.map((r) => ({ ...r, selected: !allSelected })));
  };

  const selectValidOnly = () => {
    setPreviewRows(
      previewRows.map((r) => ({
        ...r,
        selected: r.isValid && !r.isDuplicate,
      }))
    );
  };

  const deselectDuplicates = () => {
    setPreviewRows(
      previewRows.map((r) => ({
        ...r,
        selected: r.isDuplicate ? false : r.selected,
      }))
    );
  };

  const quickFillMissingDates = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    previewRows.forEach((row) => {
      if (!row.mapped.event_date) {
        handleFieldChange(row.index, 'event_date', todayStr);
      }
    });
  };

  const toggleRowSelect = (index: number) => {
    setPreviewRows(
      previewRows.map((r) => (r.index === index ? { ...r, selected: !r.selected } : r))
    );
  };

  const selectedCount = previewRows.filter((r) => r.selected && r.isValid).length;
  const validCount = previewRows.filter((r) => r.isValid && !r.isDuplicate).length;
  const missingCount = previewRows.filter((r) => !r.isValid).length;
  const duplicateCount = previewRows.filter((r) => r.isDuplicate).length;

  const handleConfirmImport = () => {
    const recordsToInsert: RunningRecord[] = previewRows
      .filter((r) => r.selected && r.isValid)
      .map((r) => r.mapped as RunningRecord);

    if (recordsToInsert.length === 0) {
      setErrorMsg('No valid rows selected for import.');
      return;
    }

    onImportConfirmed(recordsToInsert);
    setImportDoneMsg(`Successfully imported ${recordsToInsert.length} running records!`);
    setTimeout(() => {
      setImportDoneMsg('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0A0A0A] border border-white/20 p-6 sm:p-8 max-w-6xl w-full relative text-white max-h-[92vh] flex flex-col shadow-2xl space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#D9FF00] text-black">
              <FileSpreadsheet className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-white">Import Excel / CSV</h3>
              <p className="text-xs uppercase tracking-wider text-white/40 font-bold mt-0.5">
                Auto-column mapping, duplicate prevention & inline missing data editor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white p-1 border border-white/10 hover:border-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          
          {/* File Upload Zone */}
          {previewRows.length === 0 && (
            <div className="border-2 border-dashed border-white/20 hover:border-[#D9FF00] p-12 text-center bg-black/50 transition-all cursor-pointer relative group">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="max-w-md mx-auto space-y-4">
                <div className="h-12 w-12 mx-auto bg-[#D9FF00] text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <p className="text-base font-black uppercase italic tracking-tighter text-white">
                    Click or Drag Excel / CSV File Here
                  </p>
                  <p className="text-xs uppercase tracking-wider text-white/40 font-bold mt-1">
                    Auto-maps: SL NO, Event Name, Date, Distance/Category, BIB, Strava Link, Finish Time
                  </p>
                </div>
                <span className="inline-block px-3 py-1 bg-white/10 text-white font-bold text-[10px] uppercase tracking-wider">
                  Supports .xlsx, .xls, .csv
                </span>
              </div>
            </div>
          )}

          {loading && (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-[#D9FF00] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-bold uppercase tracking-wider text-white/60">Parsing Excel columns & checking duplicates...</p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {importDoneMsg && (
            <div className="p-4 bg-[#D9FF00]/10 border border-[#D9FF00]/30 text-[#D9FF00] text-sm font-black uppercase tracking-wider flex items-center gap-2 justify-center">
              <CheckCircle2 className="w-5 h-5" />
              <span>{importDoneMsg}</span>
            </div>
          )}

          {/* Preview Table & Inline Editor Section */}
          {previewRows.length > 0 && !loading && (
            <div className="space-y-4">
              
              {/* Summary Stats Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-black/60 p-3 border border-white/10 flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Total Rows</span>
                  <span className="text-xl font-black text-white font-mono">{previewRows.length}</span>
                </div>
                <div className="bg-black/60 p-3 border border-[#D9FF00]/30 flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9FF00]">Ready to Import</span>
                  <span className="text-xl font-black text-[#D9FF00] font-mono">{validCount}</span>
                </div>
                <div className={`p-3 border flex flex-col justify-between ${missingCount > 0 ? 'bg-red-950/30 border-red-500/40' : 'bg-black/60 border-white/10'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Incomplete (Fixable)</span>
                  <span className="text-xl font-black text-red-400 font-mono">{missingCount}</span>
                </div>
                <div className={`p-3 border flex flex-col justify-between ${duplicateCount > 0 ? 'bg-amber-950/30 border-amber-500/40' : 'bg-black/60 border-white/10'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Duplicates (Excluded)</span>
                  <span className="text-xl font-black text-amber-400 font-mono">{duplicateCount}</span>
                </div>
              </div>

              {/* Incomplete / Missing Data Tip */}
              {missingCount > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D9FF00] shrink-0" />
                    <span>
                      {missingCount} row{missingCount > 1 ? 's' : ''} have missing data. Type into highlighted red input fields directly below or click &quot;Edit Row&quot; to complete and import all in one go!
                    </span>
                  </div>
                  <button
                    onClick={quickFillMissingDates}
                    type="button"
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider border border-white/20 shrink-0 transition-colors"
                  >
                    Set Today Date for Missing
                  </button>
                </div>
              )}

              {/* Toolbar Controls */}
              <div className="bg-black/60 p-3 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center flex-wrap gap-2">
                  <button
                    onClick={selectValidOnly}
                    className="flex items-center gap-1 text-black font-black uppercase tracking-tighter italic bg-[#D9FF00] px-3 py-1.5 hover:brightness-110"
                  >
                    <CheckSquare className="w-4 h-4 stroke-[3]" />
                    <span>Select Valid Only</span>
                  </button>

                  <button
                    onClick={deselectDuplicates}
                    className="flex items-center gap-1 text-white font-bold uppercase tracking-wider bg-white/10 px-3 py-1.5 border border-white/20 hover:bg-white/20"
                  >
                    <span>Deselect Duplicates</span>
                  </button>

                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-1 text-white/60 font-bold uppercase tracking-wider bg-black px-3 py-1.5 border border-white/10 hover:text-white"
                  >
                    <span>Toggle All ({previewRows.length})</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-white/60 font-bold uppercase tracking-wider">
                    Checked for Import: <strong className="text-[#D9FF00] font-mono text-sm">{selectedCount}</strong>
                  </span>
                  <label className="text-[#D9FF00] hover:underline font-bold uppercase tracking-wider cursor-pointer">
                    Change File
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Table Container */}
              <div className="border border-white/10 overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-white/5 text-white/40 font-bold uppercase tracking-[0.2em] border-b border-white/10 text-[10px]">
                    <tr>
                      <th className="py-3 px-3 w-10 text-center">Import</th>
                      <th className="py-3 px-3 w-12">SL</th>
                      <th className="py-3 px-3 min-w-[200px]">Event Name</th>
                      <th className="py-3 px-3 min-w-[140px]">Date</th>
                      <th className="py-3 px-3 min-w-[110px]">Distance (KM)</th>
                      <th className="py-3 px-3 min-w-[90px]">BIB</th>
                      <th className="py-3 px-3 min-w-[110px]">Finish Time</th>
                      <th className="py-3 px-3 min-w-[120px]">Status</th>
                      <th className="py-3 px-3 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-black/40">
                    {previewRows.map((row) => {
                      const isExpanded = expandedIndex === row.index;
                      const hasMissingName = !row.mapped.event_name;
                      const hasMissingDate = !row.mapped.event_date;
                      const hasMissingDist = !row.mapped.distance_km || row.mapped.distance_km <= 0;

                      return (
                        <React.Fragment key={row.index}>
                          <tr
                            className={`hover:bg-white/5 transition-colors ${
                              !row.isValid
                                ? 'bg-red-950/20'
                                : row.isDuplicate
                                ? 'bg-amber-950/20'
                                : row.selected
                                ? 'bg-white/5'
                                : ''
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={row.selected}
                                disabled={!row.isValid}
                                onChange={() => toggleRowSelect(row.index)}
                                className="bg-black border-white/20 text-[#D9FF00] focus:ring-0 cursor-pointer disabled:opacity-30"
                              />
                            </td>

                            {/* SL NO */}
                            <td className="py-2.5 px-3 font-mono text-white/40">{row.mapped.sl_no}</td>

                            {/* Event Name Input / Display */}
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={row.mapped.event_name || ''}
                                onChange={(e) => handleFieldChange(row.index, 'event_name', e.target.value)}
                                placeholder="Enter missing event name..."
                                className={`w-full px-2.5 py-1 text-xs font-bold outline-none transition-all ${
                                  hasMissingName
                                    ? 'bg-red-500/20 border border-red-500 text-white placeholder-red-400/80 animate-pulse'
                                    : 'bg-transparent hover:bg-white/10 border border-transparent focus:border-[#D9FF00] focus:bg-black/80 text-white'
                                }`}
                              />
                            </td>

                            {/* Date Input / Display */}
                            <td className="py-2.5 px-3">
                              <input
                                type="date"
                                value={row.mapped.event_date || ''}
                                onChange={(e) => handleFieldChange(row.index, 'event_date', e.target.value)}
                                className={`w-full px-2 py-1 text-xs font-mono outline-none transition-all ${
                                  hasMissingDate
                                    ? 'bg-red-500/20 border border-red-500 text-white animate-pulse'
                                    : 'bg-transparent hover:bg-white/10 border border-transparent focus:border-[#D9FF00] focus:bg-black/80 text-white/80'
                                }`}
                              />
                            </td>

                            {/* Distance KM Input / Display */}
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={row.mapped.distance_km || ''}
                                  onChange={(e) => handleFieldChange(row.index, 'distance_km', parseFloat(e.target.value) || 0)}
                                  placeholder="0.0"
                                  className={`w-16 px-2 py-1 text-xs font-black font-mono outline-none transition-all ${
                                    hasMissingDist
                                      ? 'bg-red-500/20 border border-red-500 text-white animate-pulse'
                                      : 'bg-transparent hover:bg-white/10 border border-transparent focus:border-[#D9FF00] focus:bg-black/80 text-[#D9FF00]'
                                  }`}
                                />
                                <span className="text-[10px] text-white/40 uppercase font-bold">
                                  {row.mapped.distance_category}
                                </span>
                              </div>
                            </td>

                            {/* BIB Number */}
                            <td className="py-2.5 px-3 font-mono text-white/60">
                              <input
                                type="text"
                                value={row.mapped.bib_number || ''}
                                onChange={(e) => handleFieldChange(row.index, 'bib_number', e.target.value)}
                                placeholder="BIB..."
                                className="w-16 px-1.5 py-1 text-xs font-mono bg-transparent hover:bg-white/10 border border-transparent focus:border-[#D9FF00] focus:bg-black/80 text-white/70 outline-none"
                              />
                            </td>

                            {/* Finish Time */}
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={row.mapped.official_time || row.mapped.strava_time || ''}
                                onChange={(e) => handleFieldChange(row.index, 'official_time', e.target.value)}
                                placeholder="00:00:00"
                                className="w-24 px-2 py-1 text-xs font-mono font-bold bg-transparent hover:bg-white/10 border border-transparent focus:border-[#D9FF00] focus:bg-black/80 text-white outline-none"
                              />
                            </td>

                            {/* Status */}
                            <td className="py-2.5 px-3">
                              {row.isValid && !row.isDuplicate && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[#D9FF00]">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                                </span>
                              )}
                              {row.isDuplicate && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-amber-400" title={row.duplicateReason}>
                                  <AlertTriangle className="w-3.5 h-3.5" /> Duplicate
                                </span>
                              )}
                              {!row.isValid && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-red-400">
                                  <XCircle className="w-3.5 h-3.5" /> Fix Data
                                </span>
                              )}
                            </td>

                            {/* Expand Row Button */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => setExpandedIndex(isExpanded ? null : row.index)}
                                className={`p-1 border transition-colors ${
                                  isExpanded
                                    ? 'bg-[#D9FF00] text-black border-[#D9FF00]'
                                    : 'bg-white/10 hover:bg-white/20 text-white/70 border-white/20'
                                }`}
                                title="Expand to edit location, organizer, links, notes..."
                              >
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Full-Field Inline Editor Row */}
                          {isExpanded && (
                            <tr className="bg-black/90 border-b border-[#D9FF00]/40">
                              <td colSpan={9} className="p-4">
                                <div className="space-y-3 text-xs bg-white/[0.03] p-4 border border-white/10">
                                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                    <span className="font-black uppercase tracking-wider text-[#D9FF00] flex items-center gap-1.5">
                                      <Pencil className="w-3.5 h-3.5" /> Full Row Data Editor — Row #{row.index}
                                    </span>
                                    {row.duplicateReason && (
                                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                                        ⚠️ {row.duplicateReason}
                                      </span>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                      <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">
                                        Location
                                      </label>
                                      <input
                                        type="text"
                                        value={row.mapped.location || ''}
                                        onChange={(e) => handleFieldChange(row.index, 'location', e.target.value)}
                                        placeholder="e.g. Hatirjheel, Dhaka"
                                        className="w-full bg-black border border-white/20 focus:border-[#D9FF00] px-2.5 py-1.5 text-xs text-white outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">
                                        Organizer
                                      </label>
                                      <input
                                        type="text"
                                        value={row.mapped.organizer || ''}
                                        onChange={(e) => handleFieldChange(row.index, 'organizer', e.target.value)}
                                        placeholder="e.g. Dhaka Run Lords"
                                        className="w-full bg-black border border-white/20 focus:border-[#D9FF00] px-2.5 py-1.5 text-xs text-white outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">
                                        Strava URL
                                      </label>
                                      <input
                                        type="url"
                                        value={row.mapped.strava_url || ''}
                                        onChange={(e) => handleFieldChange(row.index, 'strava_url', e.target.value)}
                                        placeholder="https://www.strava.com/activities/..."
                                        className="w-full bg-black border border-white/20 focus:border-[#D9FF00] px-2.5 py-1.5 text-xs text-white outline-none"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div>
                                      <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">
                                        Official Time vs Strava Time
                                      </label>
                                      <div className="grid grid-cols-2 gap-2">
                                        <input
                                          type="text"
                                          value={row.mapped.official_time || ''}
                                          onChange={(e) => handleFieldChange(row.index, 'official_time', e.target.value)}
                                          placeholder="Official HH:MM:SS"
                                          className="bg-black border border-white/20 focus:border-[#D9FF00] px-2.5 py-1.5 text-xs font-mono text-white outline-none"
                                        />
                                        <input
                                          type="text"
                                          value={row.mapped.strava_time || ''}
                                          onChange={(e) => handleFieldChange(row.index, 'strava_time', e.target.value)}
                                          placeholder="Strava HH:MM:SS"
                                          className="bg-black border border-white/20 focus:border-[#D9FF00] px-2.5 py-1.5 text-xs font-mono text-white outline-none"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-bold uppercase text-white/40 mb-1">
                                        Auto Calculated Pace
                                      </label>
                                      <div className="h-8 bg-black border border-white/10 px-3 flex items-center justify-between text-xs font-black font-mono text-[#D9FF00]">
                                        <span>{row.mapped.pace || '-'}</span>
                                        <span className="text-[9px] text-white/40 font-sans uppercase">Min/KM</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Actions */}
        {previewRows.length > 0 && (
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <p className="text-xs text-white/40 font-bold uppercase tracking-wider">
              Only checked, valid rows will be imported into Towhid Running Log.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={selectedCount === 0}
                className="px-6 py-2.5 bg-[#D9FF00] text-black font-black uppercase tracking-tighter italic text-xs hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <span>Approve & Import ({selectedCount})</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

