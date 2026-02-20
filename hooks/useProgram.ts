import { useState, useEffect, useCallback, useRef } from 'react';
import { programService } from '@/services/programService';
import { Program } from '@/types';

interface UseProgramsReturn {
  programs: Program[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseProgramReturn {
  program: Program | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// --------------------------
// In-memory caches
// --------------------------
const programsCache = new Map<string, { data: Program[]; timestamp: number }>();
const programCache = new Map<string, { data: Program; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 min

const getCacheKey = (params?: any) => (params ? JSON.stringify(params) : 'all');

// --------------------------
// usePrograms
// --------------------------
export const usePrograms = (params?: {
  page?: number;
  limit?: number;
  isPublished?: boolean;
  instructorId?: string;
  category?: string;
  tags?: string[];
}): UseProgramsReturn => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);
  const isMounted = useRef(true);

  const fetchPrograms = useCallback(async () => {
    if (fetchingRef.current) return;

    const cacheKey = getCacheKey(params);
    const cached = programsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setPrograms(cached.data);
      setLoading(false);
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);

      const response = await programService.getPrograms(params);

      if (!isMounted.current) return;

      if (response.success && response.data) {
        setPrograms(response.data);
        programsCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
      } else {
        setError(response.error || 'Failed to fetch programs');
      }
    } catch (err: any) {
      if (isMounted.current) setError(err.message || 'Error fetching programs');
    } finally {
      if (isMounted.current) setLoading(false);
      fetchingRef.current = false;
    }
  }, [params]);

  useEffect(() => {
    isMounted.current = true;
    fetchPrograms();
    return () => { isMounted.current = false; };
  }, [fetchPrograms]);

  return { programs, loading, error, refetch: fetchPrograms };
};

// --------------------------
// useProgram
// --------------------------
export const useProgram = (programId: string): UseProgramReturn => {
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);
  const isMounted = useRef(true);

  const fetchProgram = useCallback(async () => {
    if (!programId || fetchingRef.current) return;

    const cached = programCache.get(programId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setProgram(cached.data);
      setLoading(false);
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);

      const response = await programService.getProgramById(programId);

      if (!isMounted.current) return;

      if (response.success && response.data) {
        setProgram(response.data);
        programCache.set(programId, { data: response.data, timestamp: Date.now() });
      } else {
        setError(response.error || 'Failed to fetch program');
      }
    } catch (err: any) {
      if (isMounted.current) setError(err.message || 'Error fetching program');
    } finally {
      if (isMounted.current) setLoading(false);
      fetchingRef.current = false;
    }
  }, [programId]);

  useEffect(() => {
    isMounted.current = true;
    if (programId) fetchProgram();
    return () => { isMounted.current = false; };
  }, [fetchProgram, programId]);

  return { program, loading, error, refetch: fetchProgram };
};

// --------------------------
// useProgramBySlug
// --------------------------
export const useProgramBySlug = (slug?: string): UseProgramReturn => {
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);
  const isMounted = useRef(true);

  const fetchProgram = useCallback(async () => {
    if (!slug || fetchingRef.current) return;

    const cacheKey = `slug:${slug}`;
    const cached = programCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setProgram(cached.data);
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);

      const response = await programService.getProgramBySlug(slug);

      if (!isMounted.current) return;

      if (response.success && response.data) {
        setProgram(response.data);
        programCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
      } else {
        setError(response.error || 'Failed to fetch program');
      }
    } catch (err: any) {
      if (isMounted.current) setError(err.message || 'Error fetching program');
    } finally {
      if (isMounted.current) setLoading(false);
      fetchingRef.current = false;
    }
  }, [slug]);

  useEffect(() => {
    isMounted.current = true;
    if (slug) fetchProgram();
    return () => { isMounted.current = false; };
  }, [slug, fetchProgram]);

  return { program, loading, error, refetch: fetchProgram };
};

// --------------------------
// Helper hooks
// --------------------------
export const useFeaturedPrograms = (limit: number = 3): UseProgramsReturn => {
  return usePrograms({ isPublished: true, limit });
};

export const useProgramsByCategory = (category: string): UseProgramsReturn => {
  return usePrograms({ isPublished: true, category });
};

// --------------------------
// Cache utility
// --------------------------
export const clearProgramsCache = () => {
  programsCache.clear();
  programCache.clear();
};
