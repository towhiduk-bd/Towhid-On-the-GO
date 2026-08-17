import { DistanceCategory } from '../types';

/**
 * Extract numeric distance in KM from string or number.
 * e.g., "21.1 KM" -> 21.1, "10K" -> 10, "Half Marathon" -> 21.1
 */
export function parseDistanceKm(raw: any): number {
  if (typeof raw === 'number') {
    return Math.round(raw * 100) / 100;
  }
  if (!raw) return 0;

  const str = String(raw).trim().toLowerCase();

  if (str.includes('half') || str.includes('hm')) return 21.1;
  if (str.includes('marathon') && !str.includes('half')) return 42.2;

  // Match floating point numbers or digits
  const match = str.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (match) {
    const val = parseFloat(match[1]);
    return isNaN(val) ? 0 : Math.round(val * 100) / 100;
  }

  return 0;
}

/**
 * Infer distance category based on KM value
 */
export function inferDistanceCategory(distKm: number): DistanceCategory | string {
  if (distKm >= 4.8 && distKm <= 5.3) return '5K';
  if (distKm >= 7.0 && distKm <= 8.0) return '7.5K';
  if (distKm >= 9.5 && distKm <= 10.8) return '10K';
  if (distKm >= 14.5 && distKm <= 15.8) return '15K';
  if (distKm >= 20.5 && distKm <= 21.8) return 'Half Marathon';
  if (distKm >= 24.5 && distKm <= 25.8) return '25K';
  if (distKm >= 29.5 && distKm <= 30.8) return '30K';
  if (distKm >= 41.5 && distKm <= 43.0) return 'Marathon';
  if (distKm > 43.0) return 'Ultra';
  if (distKm > 0) return `${distKm}K`;
  return 'Custom';
}

/**
 * Convert time string or number (HH:MM:SS or MM:SS or Xh Ym Zs or Excel day fraction) to total seconds
 */
export function timeToSeconds(timeStr?: string | number): number {
  if (timeStr === undefined || timeStr === null) return 0;

  if (typeof timeStr === 'number') {
    if (isNaN(timeStr) || timeStr <= 0) return 0;
    // Excel fraction of a 24-hour day (e.g. 0.0335069)
    if (timeStr > 0 && timeStr < 1) {
      return Math.round(timeStr * 86400);
    }
    return Math.round(timeStr);
  }

  let str = String(timeStr).trim().toLowerCase();
  if (!str || str === '-' || str === '--' || str === '--:--:--' || str === '--:--') return 0;

  // Extract time pattern HH:MM:SS from date/ISO strings e.g. "Sat Dec 30 1899 01:01:00 GMT..." or "1899-12-30T01:52:14"
  const timeMatch = str.match(/(\d{1,2}):(\d{2}):(\d{2})/);
  if (timeMatch) {
    const hrs = parseInt(timeMatch[1], 10);
    const mins = parseInt(timeMatch[2], 10);
    const secs = parseInt(timeMatch[3], 10);
    return hrs * 3600 + mins * 60 + secs;
  }

  // Handle period separator formatted times e.g. "01.52.14" or "48.32"
  if (!str.includes(':') && /^\d{1,2}\.\d{2}(\.\d{2})?$/.test(str)) {
    str = str.replace(/\./g, ':');
  }

  // Check if string is a numeric decimal (e.g., "0.0335069")
  const numVal = Number(str);
  if (!isNaN(numVal) && !str.includes(':')) {
    if (numVal > 0 && numVal < 1) {
      return Math.round(numVal * 86400);
    }
    return Math.round(numVal);
  }

  // Handle "1h 30m 15s" or "48m 15s" or "48m"
  if (str.includes('h') || str.includes('m') || str.includes('s')) {
    let hrs = 0, mins = 0, secs = 0;
    const hMatch = str.match(/(\d+)\s*h/);
    const mMatch = str.match(/(\d+)\s*m/);
    const sMatch = str.match(/(\d+)\s*s/);
    if (hMatch) hrs = parseInt(hMatch[1], 10);
    if (mMatch) mins = parseInt(mMatch[1], 10);
    if (sMatch) secs = parseInt(sMatch[1], 10);
    return hrs * 3600 + mins * 60 + secs;
  }

  // Strip trailing milliseconds or letters if present e.g. "01:52:14.00"
  str = str.replace(/\.\d+$/, '').replace(/[^\d:]/g, '');

  const parts = str.split(':').map((p) => parseFloat(p));
  if (parts.some((p) => isNaN(p))) return 0;

  if (parts.length === 3) {
    // HH:MM:SS
    return Math.round(parts[0] * 3600 + parts[1] * 60 + parts[2]);
  } else if (parts.length === 2) {
    // MM:SS
    return Math.round(parts[0] * 60 + parts[1]);
  } else if (parts.length === 1) {
    return Math.round(parts[0]);
  }
  return 0;
}

/**
 * Format 10K / 5K best time for display in minutes and seconds (e.g. "48:15" instead of "00:48:15")
 */
export function formatBest10KTime(timeStr?: string): string {
  if (!timeStr) return '--:--';
  const parsed = parseExcelTime(timeStr);
  let str = parsed || String(timeStr).trim();
  if (!str || str === '-' || str === '--') return '--:--';

  // "00:48:15" -> "48:15"
  if (/^00:\d{2}:\d{2}$/.test(str)) {
    return str.slice(3);
  }
  // "0:48:15" -> "48:15"
  if (/^0:\d{2}:\d{2}$/.test(str)) {
    return str.slice(2);
  }
  return str;
}

/**
 * Convert seconds back to HH:MM:SS format
 */
export function secondsToTimeStr(totalSec: number): string {
  if (!totalSec || totalSec <= 0 || isNaN(totalSec)) return '00:00:00';
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = Math.round(totalSec % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Automatically calculate pace per KM (e.g. "5:12 /km")
 */
export function calculatePace(distKm: number, timeStr?: string): string {
  if (!distKm || distKm <= 0 || !timeStr) return '-';
  const totalSec = timeToSeconds(timeStr);
  if (totalSec <= 0) return '-';

  const paceSec = totalSec / distKm;
  const mins = Math.floor(paceSec / 60);
  const secs = Math.floor(paceSec % 60);

  const padSec = secs.toString().padStart(2, '0');
  return `${mins}:${padSec} /km`;
}

/**
 * Parse date from string or Excel serial number
 */
export function parseExcelDate(raw: any): { dateStr: string; year: number } {
  const fallbackYear = new Date().getFullYear();

  if (raw === undefined || raw === null || raw === '') {
    return { dateStr: '', year: fallbackYear };
  }

  // If raw is an Excel serial number (e.g. 45223)
  if (typeof raw === 'number' && raw > 30000 && raw < 80000) {
    const dateObj = new Date(Math.round((raw - 25569) * 86400 * 1000));
    if (!isNaN(dateObj.getTime())) {
      const year = dateObj.getUTCFullYear();
      const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getUTCDate()).padStart(2, '0');
      return { dateStr: `${year}-${month}-${day}`, year };
    }
  }

  // If numeric 4-digit year (e.g. 2024)
  if (typeof raw === 'number' && raw >= 1990 && raw <= 2035) {
    return { dateStr: `${raw}-01-01`, year: raw };
  }

  const str = String(raw).trim();

  if (!str) {
    return { dateStr: '', year: fallbackYear };
  }

  // Just 4-digit year e.g. "2024"
  if (/^\d{4}$/.test(str)) {
    const yr = parseInt(str, 10);
    return { dateStr: `${yr}-01-01`, year: yr };
  }

  // Handle DD/MM/YYYY or DD-MM-YYYY
  if (/^\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4}$/.test(str)) {
    const parts = str.split(/[\/\.-]/);
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    const pad = (n: number) => String(n).padStart(2, '0');
    return { dateStr: `${year}-${pad(month)}-${pad(day)}`, year };
  }

  // Handle YYYY/MM/DD or YYYY-MM-DD
  if (/^\d{4}[\/\.-]\d{1,2}[\/\.-]\d{1,2}$/.test(str)) {
    const parts = str.split(/[\/\.-]/);
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    const pad = (n: number) => String(n).padStart(2, '0');
    return { dateStr: `${year}-${pad(month)}-${pad(day)}`, year };
  }

  // Standard JS Date parsing (e.g. "Oct 15 2024", "15 Oct 2024")
  const parsedDate = new Date(str);
  if (!isNaN(parsedDate.getTime())) {
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return { dateStr: `${year}-${month}-${day}`, year };
  }

  return { dateStr: '', year: fallbackYear };
}

/**
 * Parse time from string or Excel decimal time or Date object
 */
export function parseExcelTime(raw: any): string {
  if (raw === undefined || raw === null || raw === '') return '';

  // If Date object (from XLSX cellDates or JS Date)
  if (raw instanceof Date) {
    if (isNaN(raw.getTime())) return '';
    const hrs = String(raw.getHours()).padStart(2, '0');
    const mins = String(raw.getMinutes()).padStart(2, '0');
    const secs = String(raw.getSeconds()).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }

  // If numeric decimal representing fraction of a 24-hour day (e.g., 0.089583 -> 02:09:00)
  if (typeof raw === 'number' && raw >= 0 && raw < 1) {
    const totalSeconds = Math.round(raw * 86400);
    return secondsToTimeStr(totalSeconds);
  }

  const str = String(raw).trim();

  // If long string containing time (e.g. "Sat Dec 30 1899 01:01:00 GMT+0553 (Bangladesh Standard Time)" or "1899-12-30T01:01:00.000Z")
  const fullTimeMatch = str.match(/(\d{1,2}):(\d{2}):(\d{2})/);
  if (fullTimeMatch) {
    const p1 = fullTimeMatch[1].padStart(2, '0');
    const p2 = fullTimeMatch[2];
    const p3 = fullTimeMatch[3];
    return `${p1}:${p2}:${p3}`;
  }

  // If time in "HH:MM:SS" or "MM:SS"
  const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
  const match = str.match(timeRegex);

  if (match) {
    const p1 = match[1].padStart(2, '0');
    const p2 = match[2];
    const p3 = match[3];

    if (p3 !== undefined) {
      return `${p1}:${p2}:${p3}`;
    } else {
      return `00:${p1}:${p2}`;
    }
  }

  return str;
}

/**
 * Format YYYY-MM-DD into human friendly string (e.g. "Oct 24, 2025")
 */
export function formatDateFriendly(dateStr: string): string {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  
  // Extract pure date part before 'T', ' ', or 'GMT'
  const cleanStr = str.split('T')[0].split(' ')[0];

  // Try YYYY-MM-DD
  const ymdMatch = cleanStr.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }

  // Try DD/MM/YYYY
  const dmyMatch = cleanStr.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }

  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Automatically generates maximum 5 relevant hashtags based on travel blog title, location, and summary/content.
 */
export function generateAutoHashtags(
  title: string = '',
  location: string = '',
  summary: string = '',
  manualTags: string[] = []
): string[] {
  const combined = `${title} ${location} ${summary}`.toLowerCase();
  const tagsSet = new Set<string>();

  const sanitizeTag = (val: string): string => {
    if (!val) return '';
    const clean = val.replace(/#/g, '').replace(/[^a-zA-Z0-9\s-]/g, '').trim();
    if (!clean) return '';
    return clean
      .split(/[\s-]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('');
  };

  const addTag = (rawTag: string) => {
    if (tagsSet.size >= 5) return;
    const formatted = sanitizeTag(rawTag);
    if (formatted && formatted.length >= 2) {
      tagsSet.add(formatted);
    }
  };

  // High priority domain keywords
  const keywordMappings: [RegExp, string][] = [
    [/\b(trek|trekking|hike|hiking|trail|peak|summit|slope)\b/i, 'Trekking'],
    [/\b(mountain|hill|hills|valley|ridge)\b/i, 'Mountains'],
    [/\b(run|running|marathon|runner|stride|race|jog|25k|10k|5k|half|hm)\b/i, 'Running'],
    [/\b(beach|sea|ocean|coast|coastal|shore|wave|coral)\b/i, 'CoastalRun'],
    [/\b(island|coral|atoll|bay)\b/i, 'Island'],
    [/\b(tea|teagarden|garden|estate)\b/i, 'TeaGardens'],
    [/\b(forest|jungle|rainforest|nature|green|misty|park)\b/i, 'Nature'],
    [/\b(sunset|sunrise|sky|cloud|clouds|vista|view)\b/i, 'SunsetViews'],
    [/\b(lake|river|waterfall|fall|falls|water)\b/i, 'Waterfalls'],
    [/\b(adventure|camp|camping|tour|explore)\b/i, 'Adventure'],
  ];

  for (const [regex, label] of keywordMappings) {
    if (regex.test(combined)) {
      addTag(label);
    }
  }

  // Location words
  if (location) {
    const locParts = location.split(/[,/-]+/);
    for (const p of locParts) {
      if (tagsSet.size >= 5) break;
      if (p.trim().length >= 2) {
        addTag(p.trim());
      }
    }
  }

  // Important title words
  if (title) {
    const words = title.split(/[\s,.:;!?"'()-]+/);
    const ignoreWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
      'with', 'by', 'from', 'up', 'about', 'into', 'over', 'after', 'is', 'are',
      'was', 'were', 'be', 'been', 'being', 'this', 'that', 'these', 'those', 'my', 'our'
    ]);
    for (const w of words) {
      if (tagsSet.size >= 5) break;
      if (w.length >= 3 && !ignoreWords.has(w.toLowerCase())) {
        addTag(w);
      }
    }
  }

  // User provided custom/manual tags
  if (manualTags && manualTags.length > 0) {
    for (const mt of manualTags) {
      if (tagsSet.size >= 5) break;
      addTag(mt);
    }
  }

  // Fallbacks if fewer than 2 tags
  if (tagsSet.size < 1) addTag('Travel');
  if (tagsSet.size < 2) addTag('Adventure');

  return Array.from(tagsSet).slice(0, 5);
}

