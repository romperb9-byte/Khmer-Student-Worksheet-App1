import { 
    isSupabaseConfigured, 
    submitSupabaseResult, 
    deleteSupabaseResult, 
    deleteAllSupabaseResults, 
    subscribeToSupabaseSubmissions 
} from './supabase';
import { 
    isFirebaseConfigured, 
    initAuth, 
    submitGlobalResult, 
    deleteGlobalResult, 
    subscribeToGlobalSubmissions 
} from './firebase';
import { SubmissionResult } from '../types';

export type BackendType = 'supabase' | 'firebase' | 'local';

export const getActiveBackend = (): BackendType => {
    if (isSupabaseConfigured()) return 'supabase';
    if (isFirebaseConfigured()) return 'firebase';
    return 'local';
};

export const isCloudDatabaseConfigured = (): boolean => {
    return isSupabaseConfigured() || isFirebaseConfigured();
};

/**
 * Initialize database / auth
 */
export const initDatabaseAuth = async (): Promise<{ uid: string; backend: BackendType }> => {
    const backend = getActiveBackend();
    
    if (backend === 'supabase') {
        // Supabase connects directly via Anon Key, no anonymous auth roadblock
        return { uid: 'supabase-user', backend: 'supabase' };
    }
    
    if (backend === 'firebase') {
        const user = await initAuth();
        return { uid: user.uid, backend: 'firebase' };
    }

    return { uid: 'offline-local-user', backend: 'local' };
};

/**
 * Submit worksheet result to active cloud database
 */
export const submitWorksheetResult = async (
    result: Omit<SubmissionResult, 'id' | 'timestamp'>
): Promise<void> => {
    const backend = getActiveBackend();

    if (backend === 'supabase') {
        await submitSupabaseResult(result);
        return;
    }

    if (backend === 'firebase') {
        await submitGlobalResult(result);
        return;
    }
    
    // In local mode, saving is done to localStorage by the app
};

/**
 * Delete a specific record from active cloud database
 */
export const deleteWorksheetResult = async (id: string): Promise<void> => {
    const backend = getActiveBackend();

    if (backend === 'supabase') {
        await deleteSupabaseResult(id);
        return;
    }

    if (backend === 'firebase') {
        await deleteGlobalResult(id);
        return;
    }
};

/**
 * Clear all records from cloud database
 */
export const clearAllWorksheetResults = async (items: SubmissionResult[]): Promise<void> => {
    const backend = getActiveBackend();

    if (backend === 'supabase') {
        await deleteAllSupabaseResults();
        return;
    }

    if (backend === 'firebase') {
        const promises = items.map(item => {
            if (item.id) return deleteGlobalResult(item.id);
            return Promise.resolve();
        });
        await Promise.all(promises);
    }
};

/**
 * Subscribe to cloud updates in real-time
 */
export const subscribeToWorksheetResults = (
    onData: (data: SubmissionResult[]) => void
): (() => void) => {
    const backend = getActiveBackend();

    if (backend === 'supabase') {
        return subscribeToSupabaseSubmissions(onData);
    }

    if (backend === 'firebase') {
        return subscribeToGlobalSubmissions(onData);
    }

    return () => {};
};
