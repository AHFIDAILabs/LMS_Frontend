import { useState, useEffect, useCallback } from 'react';
import { instructorService } from '../services/instructorService';

export const useInstructor = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await instructorService.getProfile();
      if (res.success) setProfile(res.data);
      else setError('Failed to fetch profile');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);


const createCourse = () => {
  return async (data: Parameters<typeof instructorService.createCourse>[0]) => {
    // Type guard to check programId exists
    const programId = data instanceof FormData 
      ? data.get('programId') 
      : data.programId;
    
    if (!programId) {
      throw new Error('Program ID is required to create a course');
    }
    
    const res = await instructorService.createCourse(data);
    return res.data;
  };
};

  useEffect(() => {
    fetchProfile();
    createCourse();
  }, [fetchProfile, createCourse]);

  return {
    profile,
    createCourse,
    loading,
    error,
    refreshProfile: fetchProfile
  };
};
