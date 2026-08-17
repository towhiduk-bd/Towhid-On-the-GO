import { OverallStats, RunningRecord, StravaConfig, UserBio } from '../types';
import { timeToSeconds, secondsToTimeStr, parseDistanceKm, inferDistanceCategory, parseExcelDate } from '../utils/formatters';
import { INITIAL_RUNNING_LOG } from '../utils/sampleData';

const STORAGE_KEY = 'towhid_running_log_v1';
const STRAVA_CONFIG_KEY = 'towhid_strava_config_v1';
const ADMIN_PASS_KEY = 'towhid_admin_passcode_v1';
const USER_BIO_KEY = 'towhid_user_bio_v1';

export const DEFAULT_USER_BIO: UserBio = {
  name: 'Towhid',
  titleTagline: 'Verified Long-Distance Runner, Explorer & Tech Enthusiast',
  aboutMe: `Hello! I am Towhid, an avid long-distance runner, explorer, and software practitioner based in Dhaka, Bangladesh. Over the past several years, I have pursued endurance running across half marathons, 30K highway challenges, and speed 10Ks. Beyond the finish line, I love discovering scenic trails, coastal routes, tea garden tracks, and hilltop vistas.`,
  location: 'Dhaka, Bangladesh',
  email: 'towhid.uk@gmail.com',
  facebookUrl: 'https://www.facebook.com/towhid.uk',
  instagramUrl: 'https://www.instagram.com/towhid.uk',
  stravaUrl: 'https://www.strava.com/athletes/towhid',
  hobbies: [
    {
      title: 'Endurance & Road Running',
      category: 'Sports',
      description: 'Training for Half Marathons and 30K road challenges with a focus on negative split pacing and strength.',
      icon: 'Activity',
    },
    {
      title: 'Trekking & Hill Trails',
      category: 'Outdoor',
      description: 'Exploring cloud peaks in Sajek Valley, Bandarban hill tracks, and coastal trails along patenga sea beach.',
      icon: 'Compass',
    },
    {
      title: 'Travel Photography & Writing',
      category: 'Creative',
      description: 'Documenting race morning atmosphere, scenic landscape views, and local culture across Bangladesh.',
      icon: 'Camera',
    },
    {
      title: 'Tech & App Development',
      category: 'Technology',
      description: 'Building web tools, activity tracking platforms, data analytics visualizers, and responsive interfaces.',
      icon: 'Code',
    },
    {
      title: 'Specialty Coffee & Culinary Walks',
      category: 'Lifestyle',
      description: 'Discovering local cafes, artisanal espresso brews, and post-run culinary stops in Dhaka.',
      icon: 'Coffee',
    },
  ],
  travelBlogs: [
    {
      id: 'blog-1',
      title: 'Sajek Valley Trail & Cloud Peaks Exploration',
      location: 'Sajek Valley, Rangamati',
      date: 'November 2024',
      readTime: '4 min read',
      summary: 'A breathtaking weekend trekking along the winding mountain roads of Sajek Valley, surrounded by rolling green hills and morning cloud ocean views.',
      tags: ['Trekking', 'Mountains', 'Sajek', 'Clouds'],
      images: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      id: 'blog-2',
      title: 'Patenga Coastal Highway 25K Run & Sunset Vista',
      location: 'Patenga Sea Beach, Chittagong',
      date: 'December 2024',
      readTime: '3 min read',
      summary: 'Running 25 kilometers along the Patenga coastal road with the sea breeze and finishing at the Golden Beach sunset.',
      tags: ['Coastal Run', 'Chittagong', 'Sea Breeze'],
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      id: 'blog-3',
      title: 'Sreemangal Tea Garden Rainforest & Estate Trails',
      location: 'Sreemangal, Moulvibazar',
      date: 'January 2025',
      readTime: '5 min read',
      summary: 'Early morning strides through misty tea garden slopes, Lawachara rain forest trails, and sampling seven-layer tea.',
      tags: ['Tea Gardens', 'Nature', 'Misty Trails'],
      images: [
        'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      id: 'blog-4',
      title: 'Saint Martin’s Island Coral Shore Stroll',
      location: 'Saint Martin’s Island, Cox’s Bazar',
      date: 'February 2025',
      readTime: '4 min read',
      summary: 'Unwinding on the coral beaches, coastal cycling along coconut groves, and clear turquoise sea water walks.',
      tags: ['Island', 'Coral Beach', 'Ocean View'],
      images: [
        'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      ],
    },
  ],
};

export function getStoredBio(): UserBio {
  try {
    const raw = localStorage.getItem(USER_BIO_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_USER_BIO,
        ...parsed,
        hobbies: parsed.hobbies && parsed.hobbies.length > 0 ? parsed.hobbies : DEFAULT_USER_BIO.hobbies,
        travelBlogs: parsed.travelBlogs && parsed.travelBlogs.length > 0 ? parsed.travelBlogs : DEFAULT_USER_BIO.travelBlogs,
      };
    }
  } catch (e) {
    console.error('Failed to parse user bio from storage:', e);
  }
  return DEFAULT_USER_BIO;
}

export function saveBio(bio: UserBio): void {
  localStorage.setItem(USER_BIO_KEY, JSON.stringify(bio));
}

export function getAdminPasscode(): string {
  return localStorage.getItem(ADMIN_PASS_KEY) || 'towhid123';
}

export function setAdminPasscode(newPass: string): void {
  localStorage.setItem(ADMIN_PASS_KEY, newPass);
}

export function getStoredRecords(): RunningRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RUNNING_LOG));
      return INITIAL_RUNNING_LOG;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RUNNING_LOG));
    return INITIAL_RUNNING_LOG;
  } catch (e) {
    console.error('Failed to parse running log storage:', e);
    return INITIAL_RUNNING_LOG;
  }
}

export function saveRecords(records: RunningRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function resetToSeedData(): RunningRecord[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RUNNING_LOG));
  return INITIAL_RUNNING_LOG;
}

export function getStravaConfig(): StravaConfig {
  try {
    const raw = localStorage.getItem(STRAVA_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse Strava config:', e);
  }
  return { isConnected: false };
}

export function saveStravaConfig(config: StravaConfig): void {
  localStorage.setItem(STRAVA_CONFIG_KEY, JSON.stringify(config));
}

/**
 * Calculate overall stats from running records
 */
export function computeStats(records: RunningRecord[]): OverallStats {
  if (!records || records.length === 0) {
    return {
      totalRuns: 0,
      totalDistanceKm: 0,
      halfMarathonCount: 0,
      tenKCount: 0,
      longestRunKm: 0,
      longestRunEvent: '',
      runsByYear: [],
      recentRuns: [],
    };
  }

  // Sort by date descending
  const sortedByDate = [...records].sort((a, b) => {
    const timeA = Date.parse(a.event_date) || 0;
    const timeB = Date.parse(b.event_date) || 0;
    return timeB - timeA;
  });

  const totalRuns = records.length;
  const totalDistanceKm =
    Math.round(
      records.reduce((acc, r) => acc + (parseDistanceKm(r.distance_km) || 0), 0) * 100
    ) / 100;

  let halfMarathonCount = 0;
  let tenKCount = 0;
  let longestRunKm = 0;
  let longestRunEvent = '';
  let longestRunRecord: RunningRecord | undefined;

  // Best time trackers (lowest seconds)
  let best10KSec = Infinity;
  let best10KTime = '';
  let best10KEvent = '';
  let best10KRecord: RunningRecord | undefined;

  let bestHMSec = Infinity;
  let bestHMTime = '';
  let bestHMEvent = '';
  let bestHMRecord: RunningRecord | undefined;

  let best5KSec = Infinity;
  let best5KTime = '';
  let best5KEvent = '';

  let best25KSec = Infinity;
  let best25KTime = '';
  let best25KEvent = '';

  let best30KSec = Infinity;
  let best30KTime = '';
  let best30KEvent = '';

  let bestMarathonSec = Infinity;
  let bestMarathonTime = '';
  let bestMarathonEvent = '';
  let bestMarathonRecord: RunningRecord | undefined;

  const yearlyMap: Record<number, { count: number; distance: number }> = {};

  records.forEach((r) => {
    const dist = parseDistanceKm(r.distance_km);
    const cat = (r.distance_category || '').toLowerCase().trim();
    const eventName = (r.event_name || 'Running Event').trim();
    const fullText = `${cat} ${eventName.toLowerCase()}`;

    let yr = r.year;
    if (!yr) {
      const parsed = parseExcelDate(r.event_date);
      yr = parsed.year || (r.event_date ? new Date(r.event_date).getFullYear() : 2025);
    }

    // Category detection flags
    const isHM =
      fullText.includes('half') ||
      fullText.includes('hm') ||
      fullText.includes('21.1') ||
      fullText.includes('21k') ||
      fullText.includes('21 k') ||
      fullText.includes('21km') ||
      cat.includes('half') ||
      cat === 'hm' ||
      cat === '21' ||
      cat === '21k' ||
      cat === '21.1' ||
      (dist >= 17.5 && dist <= 24.0) ||
      inferDistanceCategory(dist) === 'Half Marathon';

    const is10K =
      fullText.includes('10k') ||
      fullText.includes('10 k') ||
      fullText.includes('10km') ||
      fullText.includes('10 km') ||
      fullText.includes('10.0') ||
      cat.includes('10k') ||
      cat === '10' ||
      cat === '10km' ||
      cat === '10.0' ||
      (dist >= 8.0 && dist <= 13.0) ||
      inferDistanceCategory(dist) === '10K';

    const is5K =
      fullText.includes('5k') ||
      fullText.includes('5 k') ||
      fullText.includes('5km') ||
      fullText.includes('5 km') ||
      cat.includes('5k') ||
      cat === '5' ||
      (dist >= 3.5 && dist <= 7.0) ||
      inferDistanceCategory(dist) === '5K';

    const is25K =
      fullText.includes('25k') ||
      fullText.includes('25 k') ||
      fullText.includes('25km') ||
      cat.includes('25k') ||
      cat === '25' ||
      (dist >= 23.5 && dist <= 27.5) ||
      inferDistanceCategory(dist) === '25K';

    const is30K =
      fullText.includes('30k') ||
      fullText.includes('30 k') ||
      fullText.includes('30km') ||
      cat.includes('30k') ||
      cat === '30' ||
      (dist >= 27.6 && dist <= 35.0) ||
      inferDistanceCategory(dist) === '30K';

    const isMarathon =
      (fullText.includes('marathon') && !fullText.includes('half') && !fullText.includes('hm')) ||
      fullText.includes('42.2') ||
      fullText.includes('42k') ||
      cat === '42' ||
      cat === '42.2' ||
      cat === 'marathon' ||
      (dist >= 35.1 && dist <= 46.0) ||
      inferDistanceCategory(dist) === 'Marathon';

    // Distance category counts
    if (isHM) {
      halfMarathonCount++;
    }
    if (is10K) {
      tenKCount++;
    }

    // Longest run
    if (dist > longestRunKm) {
      longestRunKm = dist;
      longestRunEvent = `${eventName} (${yr})`;
      longestRunRecord = r;
    }

    // Extract fastest valid time from official_time or strava_time
    const rawTimes = [r.official_time, r.strava_time];
    let activeTime = '';
    let activeSec = Infinity;

    for (const rawT of rawTimes) {
      if (rawT !== undefined && rawT !== null) {
        const strT = String(rawT).trim();
        if (
          strT !== '' &&
          strT !== '-' &&
          strT !== '--' &&
          strT !== '--:--' &&
          strT !== '--:--:--'
        ) {
          const s = timeToSeconds(strT);
          if (s > 0 && s < activeSec) {
            activeSec = s;
            activeTime = secondsToTimeStr(s);
          }
        }
      }
    }

    if (activeSec > 0 && activeSec < Infinity) {
      const eventLabel = `${eventName} (${yr})`;

      // 10K PB
      if (is10K && activeSec < best10KSec) {
        best10KSec = activeSec;
        best10KTime = activeTime;
        best10KEvent = eventLabel;
        best10KRecord = r;
      }

      // HM PB
      if (isHM && activeSec < bestHMSec) {
        bestHMSec = activeSec;
        bestHMTime = activeTime;
        bestHMEvent = eventLabel;
        bestHMRecord = r;
      }

      // 5K PB
      if (is5K && activeSec < best5KSec) {
        best5KSec = activeSec;
        best5KTime = activeTime;
        best5KEvent = eventLabel;
      }

      // 25K PB
      if (is25K && activeSec < best25KSec) {
        best25KSec = activeSec;
        best25KTime = activeTime;
        best25KEvent = eventLabel;
      }

      // 30K PB
      if (is30K && activeSec < best30KSec) {
        best30KSec = activeSec;
        best30KTime = activeTime;
        best30KEvent = eventLabel;
      }

      // Marathon PB
      if (isMarathon && activeSec < bestMarathonSec) {
        bestMarathonSec = activeSec;
        bestMarathonTime = activeTime;
        bestMarathonEvent = eventLabel;
        bestMarathonRecord = r;
      }
    }

    // Yearly aggregates
    if (!yearlyMap[yr]) {
      yearlyMap[yr] = { count: 0, distance: 0 };
    }
    yearlyMap[yr].count += 1;
    yearlyMap[yr].distance += dist;
  });

  const runsByYear = Object.keys(yearlyMap)
    .map((yStr) => {
      const y = parseInt(yStr, 10);
      return {
        year: y,
        count: yearlyMap[y].count,
        distance: Math.round(yearlyMap[y].distance * 10) / 10,
      };
    })
    .sort((a, b) => b.year - a.year);

  return {
    totalRuns,
    totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
    halfMarathonCount,
    tenKCount,
    longestRunKm: Math.round(longestRunKm * 100) / 100,
    longestRunEvent,
    longestRunRecord,
    latestRun: sortedByDate[0],
    best10KTime: best10KTime || undefined,
    best10KEvent: best10KEvent || undefined,
    best10KRecord,
    bestHalfMarathonTime: bestHMTime || undefined,
    bestHalfMarathonEvent: bestHMEvent || undefined,
    bestHalfMarathonRecord: bestHMRecord,
    best5KTime: best5KTime || undefined,
    best5KEvent: best5KEvent || undefined,
    best25KTime: best25KTime || undefined,
    best25KEvent: best25KEvent || undefined,
    best30KTime: best30KTime || undefined,
    best30KEvent: best30KEvent || undefined,
    bestMarathonTime: bestMarathonTime || undefined,
    bestMarathonEvent: bestMarathonEvent || undefined,
    bestMarathonRecord,
    runsByYear,
    recentRuns: sortedByDate.slice(0, 5),
  };
}

/**
 * Export records as CSV downloadable file
 */
export function exportToCSV(records: RunningRecord[]): void {
  const headers = [
    'SL NO',
    'Event Name',
    'Event Date',
    'Year',
    'Distance KM',
    'Category',
    'BIB Number',
    'Official Time',
    'Strava Time',
    'Pace',
    'Strava Link',
    'Location',
    'Organizer',
    'Event Type',
    'Visibility',
    'Notes',
  ];

  const rows = records.map((r, i) => [
    r.sl_no || i + 1,
    `"${(r.event_name || '').replace(/"/g, '""')}"`,
    r.event_date,
    r.year,
    r.distance_km,
    `"${r.distance_category}"`,
    `"${r.bib_number || ''}"`,
    r.official_time || '',
    r.strava_time || '',
    r.pace || '',
    `"${r.strava_url || ''}"`,
    `"${(r.location || '').replace(/"/g, '""')}"`,
    `"${(r.organizer || '').replace(/"/g, '""')}"`,
    r.event_type,
    r.visibility,
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Towhid_Running_Log_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export complete site backup JSON (Records, User Bio, Travel Blogs, Showcase Photos)
 */
export function exportFullSiteBackupJSON(): void {
  const records = getStoredRecords();
  const userBio = getStoredBio();
  let showcasePhotos = [];
  try {
    const rawPhotos = localStorage.getItem('towhid_running_showcase_photos_v2');
    if (rawPhotos) showcasePhotos = JSON.parse(rawPhotos);
  } catch (e) {
    console.error('Failed to parse showcase photos for backup', e);
  }
  const stravaConfig = getStravaConfig();

  const backupPayload = {
    appName: "Towhid's Running Event Log & Personal Site",
    exportedAt: new Date().toISOString(),
    version: '1.0',
    data: {
      records,
      userBio,
      showcasePhotos,
      stravaConfig,
    },
  };

  const jsonStr = JSON.stringify(backupPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Towhid_Site_Full_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Import complete site backup JSON into localStorage
 */
export function importFullSiteBackupJSON(jsonContent: string): {
  records: RunningRecord[];
  userBio: UserBio;
} {
  const parsed = JSON.parse(jsonContent);
  const payload = parsed.data || parsed;

  if (payload.records && Array.isArray(payload.records)) {
    saveRecords(payload.records);
  }
  if (payload.userBio && typeof payload.userBio === 'object') {
    saveBio(payload.userBio);
  }
  if (payload.showcasePhotos && Array.isArray(payload.showcasePhotos)) {
    localStorage.setItem('towhid_running_showcase_photos_v2', JSON.stringify(payload.showcasePhotos));
  }
  if (payload.stravaConfig) {
    saveStravaConfig(payload.stravaConfig);
  }

  return {
    records: getStoredRecords(),
    userBio: getStoredBio(),
  };
}

/**
 * Automatically fetches /data.json from server if present to sync initial state across devices
 */
export async function syncWithPublicDataJson(): Promise<{
  records?: RunningRecord[];
  userBio?: UserBio;
} | null> {
  try {
    const res = await fetch('/data.json?t=' + Date.now());
    if (!res.ok) return null;
    const json = await res.json();
    const payload = json.data || json;

    if (!payload || (!payload.records && !payload.userBio)) return null;

    let updated = false;

    if (payload.records && Array.isArray(payload.records) && payload.records.length > 0) {
      const existingRaw = localStorage.getItem(STORAGE_KEY);
      if (!existingRaw || JSON.parse(existingRaw).length <= payload.records.length) {
        saveRecords(payload.records);
        updated = true;
      }
    }

    if (payload.userBio && typeof payload.userBio === 'object') {
      const existingBioRaw = localStorage.getItem(USER_BIO_KEY);
      if (!existingBioRaw) {
        saveBio(payload.userBio);
        updated = true;
      }
    }

    if (payload.showcasePhotos && Array.isArray(payload.showcasePhotos)) {
      const photoKey = 'towhid_running_showcase_photos_v2';
      if (!localStorage.getItem(photoKey)) {
        localStorage.setItem(photoKey, JSON.stringify(payload.showcasePhotos));
        updated = true;
      }
    }

    if (updated) {
      return {
        records: getStoredRecords(),
        userBio: getStoredBio(),
      };
    }
  } catch (e) {
    console.warn('Auto-sync with public data.json skipped:', e);
  }
  return null;
}

/**
 * Generate Supabase PostgreSQL Schema SQL for user reference
 */
export function generateSupabaseSqlSchema(): string {
  return `-- ===============================================
-- SUPABASE / POSTGRESQL SCHEMA FOR TOWHID RUNNING LOG
-- ===============================================

-- 1. Create enum types
CREATE TYPE event_type_enum AS ENUM ('Road', 'Trail', 'Virtual', 'Other');
CREATE TYPE record_source_enum AS ENUM ('Manual', 'Excel Import', 'Strava');
CREATE TYPE record_visibility_enum AS ENUM ('Public', 'Private');

-- 2. Create running_records table
CREATE TABLE IF NOT EXISTS public.running_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sl_no INT,
    event_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    year INT GENERATED ALWAYS AS (EXTRACT(YEAR FROM event_date)) STORED,
    distance_km NUMERIC(5,2) NOT NULL,
    distance_category TEXT NOT NULL,
    bib_number TEXT,
    official_time TEXT,
    strava_time TEXT,
    pace TEXT,
    strava_url TEXT,
    location TEXT,
    organizer TEXT,
    event_type event_type_enum DEFAULT 'Road',
    notes TEXT,
    source record_source_enum DEFAULT 'Manual',
    visibility record_visibility_enum DEFAULT 'Public',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.running_records ENABLE ROW LEVEL SECURITY;

-- 4. Public Policy: Anyone can read records marked as 'Public'
CREATE POLICY "Public read-only access" 
ON public.running_records 
FOR SELECT 
USING (visibility = 'Public');

-- 5. Admin Policy: Authenticated admin can read all records (including Private)
CREATE POLICY "Admin read all records" 
ON public.running_records 
FOR SELECT 
TO authenticated 
USING (true);

-- 6. Admin Write Policy: Only authenticated admin can insert, update, delete records
CREATE POLICY "Admin full write access" 
ON public.running_records 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- 7. Indexes for speedy filtering & sorting
CREATE INDEX idx_running_records_date ON public.running_records(event_date DESC);
CREATE INDEX idx_running_records_visibility ON public.running_records(visibility);
CREATE INDEX idx_running_records_category ON public.running_records(distance_category);
`;
}
