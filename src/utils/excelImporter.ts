import * as XLSX from 'xlsx';
import { ImportPreviewRow, RunningRecord } from '../types';
import {
  calculatePace,
  inferDistanceCategory,
  parseDistanceKm,
  parseExcelDate,
  parseExcelTime,
} from './formatters';

/**
 * Fuzzy column header finder
 */
function findHeaderKey(headers: string[], candidates: string[]): string | null {
  const normalizedHeaders = headers.map((h) => String(h).trim().toLowerCase());

  for (const cand of candidates) {
    const candNorm = cand.toLowerCase();
    const exactIndex = normalizedHeaders.indexOf(candNorm);
    if (exactIndex !== -1) return headers[exactIndex];

    // Substring match
    const foundIndex = normalizedHeaders.findIndex((h) => h.includes(candNorm));
    if (foundIndex !== -1) return headers[foundIndex];
  }
  return null;
}

/**
 * Parse an uploaded Excel / CSV File and return mapped rows with preview metadata
 */
export async function parseExcelFile(
  file: File,
  existingRecords: RunningRecord[]
): Promise<ImportPreviewRow[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // 1. Detect header row by scanning top 10 rows for keywords
  const rawMatrix: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  if (!rawMatrix || rawMatrix.length === 0) {
    return [];
  }

  let headerRowIndex = 0;
  let maxScore = -1;
  const headerKeywords = [
    'event',
    'date',
    'distance',
    'km',
    'bib',
    'time',
    'sl',
    'run',
    'race',
    'title',
    'name',
    'year',
    'strava',
    'cert',
    'location',
    'organizer',
  ];

  for (let i = 0; i < Math.min(10, rawMatrix.length); i++) {
    const row = rawMatrix[i];
    if (!Array.isArray(row)) continue;
    let score = 0;
    row.forEach((cell) => {
      const cellStr = String(cell).toLowerCase().trim();
      if (headerKeywords.some((kw) => cellStr.includes(kw))) {
        score++;
      }
    });
    if (score > maxScore && score > 0) {
      maxScore = score;
      headerRowIndex = i;
    }
  }

  // 2. Parse using detected header row range
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
    range: headerRowIndex,
    defval: '',
  });

  if (!rawRows || rawRows.length === 0) {
    return [];
  }

  // Get headers from detected header row
  const headers = Object.keys(rawRows[0] || {});

  // Find header mappings
  const slNoKey = findHeaderKey(headers, ['sl no', 'sl_no', 'sl', 'serial', 'no', '#', 'id', 'sn']);
  const eventNameKey = findHeaderKey(headers, [
    'event name',
    'event_name',
    'event',
    'race name',
    'race_name',
    'race',
    'run name',
    'run_name',
    'run',
    'title',
    'name of event',
    'name of run',
    'event/race',
    'activity name',
    'activity',
    'marathon',
    'description',
    'particulars',
    'details',
    'name',
  ]);
  const yearKey = findHeaderKey(headers, ['year', 'yr']);
  const dateKey = findHeaderKey(headers, ['date', 'event date', 'event_date', 'run date', 'race date']);
  const catDistKey = findHeaderKey(headers, [
    'category/distance',
    'category',
    'distance',
    'dist',
    'km',
    'distance km',
    'dist (km)',
    'distance(km)',
  ]);
  const bibKey = findHeaderKey(headers, ['bib', 'bib no', 'bib number', 'bib_number', 'bib#']);
  const stravaLinkKey = findHeaderKey(headers, [
    'strava link',
    'strava url',
    'strava_url',
    'strava',
    'link',
    'activity link',
  ]);
  const certificateLinkKey = findHeaderKey(headers, [
    'certificate',
    'certificate url',
    'certificate_url',
    'certificate link',
    'cert link',
    'cert',
    'drive link',
    'google drive link',
  ]);
  const stravaTimeKey = findHeaderKey(headers, [
    'strava time',
    'strava_time',
    'strava finish time',
    'strava total time',
    'moving time',
  ]);
  const officialTimeKey = findHeaderKey(headers, [
    'official time',
    'official_time',
    'finish time',
    'time',
    'chip time',
    'gun time',
    'net time',
  ]);
  const locationKey = findHeaderKey(headers, ['location', 'place', 'venue', 'city']);
  const organizerKey = findHeaderKey(headers, ['organizer', 'host', 'club']);

  const previewRows: ImportPreviewRow[] = [];

  rawRows.forEach((row, idx) => {
    // Check if row is completely empty
    const allVals = Object.values(row).map((v) => String(v).trim()).filter(Boolean);
    if (allVals.length === 0) return; // Skip totally blank lines

    // 1. SL NO
    const rawSlNo = slNoKey ? row[slNoKey] : idx + 1;
    const sl_no = typeof rawSlNo === 'number' ? rawSlNo : parseInt(String(rawSlNo).replace(/\D/g, ''), 10) || (idx + 1);

    // 2. Event Name Extraction with multi-tiered fallback
    let event_name = eventNameKey && row[eventNameKey] ? String(row[eventNameKey]).trim() : '';

    // Fallback Tier 1: Search headers containing name / event / run / race / title
    if (!event_name) {
      for (const k of Object.keys(row)) {
        const kLower = k.toLowerCase();
        if (
          kLower.includes('event') ||
          kLower.includes('name') ||
          kLower.includes('race') ||
          kLower.includes('run') ||
          kLower.includes('title') ||
          kLower.includes('desc') ||
          kLower.includes('activity')
        ) {
          const val = String(row[k]).trim();
          if (val && !val.match(/^\d{4}-\d{2}-\d{2}$/) && !val.match(/^\d+(\.\d+)?$/)) {
            event_name = val;
            break;
          }
        }
      }
    }

    // Fallback Tier 2: Search any cell in row for string text that isn't a date, time, distance or URL
    if (!event_name) {
      for (const [k, v] of Object.entries(row)) {
        if (!v) continue;
        const strVal = String(v).trim();
        if (
          strVal.length >= 3 &&
          !strVal.match(/^\d+$/) &&
          !strVal.match(/^\d{4}-\d{2}-\d{2}$/) &&
          !strVal.match(/^\d{1,2}:\d{2}(:\d{2})?$/) &&
          !strVal.toLowerCase().startsWith('http')
        ) {
          event_name = strVal;
          break;
        }
      }
    }

    // Fallback Tier 3: If still blank, label with Row number so it shows clearly in table
    if (!event_name) {
      event_name = `Run Event (Row #${idx + 1})`;
    }

    // 3. Date & Year calculation
    const rawDate = dateKey ? row[dateKey] : '';
    const { dateStr: event_date, year: autoYear } = parseExcelDate(rawDate);
    const rawYear = yearKey ? parseInt(String(row[yearKey]), 10) : undefined;
    const year = autoYear || rawYear || new Date().getFullYear();

    // 4. Distance & Distance Category
    const rawDist = catDistKey ? row[catDistKey] : '';
    const distance_km = parseDistanceKm(rawDist);
    const distance_category = inferDistanceCategory(distance_km);

    // 5. BIB
    const bib_number = bibKey && row[bibKey] !== undefined ? String(row[bibKey]).trim() : '';

    // 6. Strava Link & Certificate Link
    const strava_url = stravaLinkKey && row[stravaLinkKey] ? String(row[stravaLinkKey]).trim() : '';
    const certificate_url = certificateLinkKey && row[certificateLinkKey] ? String(row[certificateLinkKey]).trim() : '';

    // 7. Strava Time & Official Time
    const rawStravaTime = stravaTimeKey ? row[stravaTimeKey] : '';
    const strava_time = parseExcelTime(rawStravaTime);

    const rawOfficialTime = officialTimeKey ? row[officialTimeKey] : '';
    const official_time = parseExcelTime(rawOfficialTime);

    // 8. Auto calculate pace
    const pace = calculatePace(distance_km, official_time || strava_time);

    // 9. Location & Organizer
    const location = locationKey && row[locationKey] ? String(row[locationKey]).trim() : '';
    const organizer = organizerKey && row[organizerKey] ? String(row[organizerKey]).trim() : '';

    // Validation checks
    const validationErrors: string[] = [];
    if (!event_name || event_name.startsWith('Run Event (Row #')) validationErrors.push('Event name needs confirmation');
    if (!event_date) validationErrors.push('Event date is missing/invalid');
    if (!distance_km || distance_km <= 0) validationErrors.push('Distance must be > 0');

    const isValid = validationErrors.length === 0;

    // Check duplicate against existing records or current batch
    let isDuplicate = false;
    let duplicateReason = '';

    if (isValid) {
      // 1. Check existing log records
      const matchInExisting = existingRecords.find(
        (rec) =>
          rec.event_name.toLowerCase().trim() === event_name.toLowerCase().trim() &&
          rec.event_date === event_date &&
          Math.abs(rec.distance_km - distance_km) < 0.1
      );

      if (matchInExisting) {
        isDuplicate = true;
        duplicateReason = `Matches existing log: "${matchInExisting.event_name}" on ${matchInExisting.event_date}`;
      } else {
        // 2. Check intra-batch duplicate (earlier rows in the same sheet)
        const matchInBatch = previewRows.find(
          (prev) =>
            prev.isValid &&
            prev.mapped.event_name?.toLowerCase().trim() === event_name.toLowerCase().trim() &&
            prev.mapped.event_date === event_date &&
            Math.abs((prev.mapped.distance_km || 0) - distance_km) < 0.1
        );
        if (matchInBatch) {
          isDuplicate = true;
          duplicateReason = `Duplicate row within the same file (Row ${matchInBatch.index})`;
        }
      }
    }

    const mappedRecord: Partial<RunningRecord> = {
      id: `imported-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      sl_no,
      event_name,
      event_date,
      year,
      distance_km,
      distance_category,
      bib_number,
      official_time,
      strava_time,
      pace,
      strava_url,
      certificate_url,
      location: location || 'Bangladesh',
      organizer,
      event_type: 'Road',
      notes: slNoKey && row[slNoKey] ? `Imported Ref SL: ${row[slNoKey]}` : 'Imported from Excel',
      source: 'Excel Import',
      visibility: 'Public',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    previewRows.push({
      index: idx + 1,
      raw: row,
      mapped: mappedRecord,
      isValid,
      validationErrors,
      isDuplicate,
      duplicateReason,
      selected: isValid && !isDuplicate, // Default auto-check valid & non-duplicates
    });
  });

  return previewRows;
}

/**
 * Re-validate a single preview row after user inline edits
 */
export function revalidatePreviewRow(
  updatedMapped: Partial<RunningRecord>,
  index: number,
  allPreviewRows: ImportPreviewRow[],
  existingRecords: RunningRecord[]
): {
  isValid: boolean;
  validationErrors: string[];
  isDuplicate: boolean;
  duplicateReason: string;
  enrichedMapped: Partial<RunningRecord>;
} {
  const event_name = (updatedMapped.event_name || '').trim();
  const event_date = (updatedMapped.event_date || '').trim();
  const distance_km = typeof updatedMapped.distance_km === 'number' ? updatedMapped.distance_km : parseFloat(String(updatedMapped.distance_km || 0)) || 0;

  // Auto recalculate pace, category, and year
  const year = event_date && !isNaN(new Date(event_date).getTime())
    ? new Date(event_date).getFullYear()
    : updatedMapped.year || new Date().getFullYear();

  const distance_category = inferDistanceCategory(distance_km);
  const pace = calculatePace(distance_km, updatedMapped.official_time || updatedMapped.strava_time || '');

  const validationErrors: string[] = [];
  if (!event_name) validationErrors.push('Event name is missing');
  if (!event_date) validationErrors.push('Event date is missing/invalid');
  if (!distance_km || distance_km <= 0) validationErrors.push('Distance must be > 0');

  const isValid = validationErrors.length === 0;

  let isDuplicate = false;
  let duplicateReason = '';

  if (isValid) {
    // 1. Check existing log records
    const matchInExisting = existingRecords.find(
      (rec) =>
        rec.event_name.toLowerCase().trim() === event_name.toLowerCase().trim() &&
        rec.event_date === event_date &&
        Math.abs(rec.distance_km - distance_km) < 0.1
    );

    if (matchInExisting) {
      isDuplicate = true;
      duplicateReason = `Matches existing log: "${matchInExisting.event_name}" on ${matchInExisting.event_date}`;
    } else {
      // 2. Check other preview rows
      const matchInOtherRows = allPreviewRows.find(
        (row) =>
          row.index !== index &&
          row.isValid &&
          row.mapped.event_name?.toLowerCase().trim() === event_name.toLowerCase().trim() &&
          row.mapped.event_date === event_date &&
          Math.abs((row.mapped.distance_km || 0) - distance_km) < 0.1
      );
      if (matchInOtherRows) {
        isDuplicate = true;
        duplicateReason = `Duplicate with Row ${matchInOtherRows.index}`;
      }
    }
  }

  const enrichedMapped: Partial<RunningRecord> = {
    ...updatedMapped,
    event_name,
    event_date,
    year,
    distance_km,
    distance_category,
    pace,
  };

  return {
    isValid,
    validationErrors,
    isDuplicate,
    duplicateReason,
    enrichedMapped,
  };
}
