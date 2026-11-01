import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { SubmissionResult } from '../types';

// Default Supabase configuration
const DEFAULT_SUPABASE_URL = 'https://xkugwdizbjwaiyobmkbb.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_miWTR6peNtTovtgtO7Klrg_bro0M7d9';

// Retrieve configuration from Vite env, window, localStorage, or defaults
export const getSupabaseConfig = () => {
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const localUrl = localStorage.getItem('supabase_url');
    const localKey = localStorage.getItem('supabase_anon_key');
    const windowConfig = (window as any).__supabase_config || {};

    const url = envUrl || localUrl || windowConfig.url || DEFAULT_SUPABASE_URL;
    const anonKey = envKey || localKey || windowConfig.anonKey || DEFAULT_SUPABASE_ANON_KEY;

    return { url: url.trim(), anonKey: anonKey.trim() };
};

export const saveSupabaseConfigToStorage = (url: string, anonKey: string) => {
    localStorage.setItem('supabase_url', url.trim());
    localStorage.setItem('supabase_anon_key', anonKey.trim());
    // Reset client to reinitialize
    supabaseInstance = null;
};

export const clearSupabaseConfigFromStorage = () => {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_anon_key');
    supabaseInstance = null;
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
    if (supabaseInstance) return supabaseInstance;

    const { url, anonKey } = getSupabaseConfig();
    if (url && anonKey) {
        try {
            supabaseInstance = createClient(url, anonKey, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true
                }
            });
            return supabaseInstance;
        } catch (e) {
            console.error('Failed to initialize Supabase client:', e);
            return null;
        }
    }
    return null;
};

export const isSupabaseConfigured = (): boolean => {
    const { url, anonKey } = getSupabaseConfig();
    return Boolean(url && anonKey && url.startsWith('http'));
};

/**
 * Submit worksheet result to Supabase
 */
export const submitSupabaseResult = async (result: Omit<SubmissionResult, 'id' | 'timestamp'>): Promise<SubmissionResult> => {
    const client = getSupabaseClient();
    if (!client) {
        throw new Error('Supabase មិនទាន់បានកំណត់រចនាសម្ព័ន្ធ (Configuration Missing)។');
    }

    const payload = {
        student_info: result.studentInfo,
        total_score: result.totalScore,
        detailed_scores: result.detailedScores,
        selections: result.selections || {},
        timestamp: new Date().toISOString()
    };

    const { data, error } = await client
        .from('submissions')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error('Supabase Insert Error:', error);
        throw error;
    }

    return {
        id: data.id,
        timestamp: data.timestamp || data.created_at,
        studentInfo: data.student_info,
        totalScore: data.total_score,
        detailedScores: data.detailed_scores,
        selections: data.selections
    };
};

/**
 * Fetch all submissions from Supabase
 */
export const fetchSupabaseSubmissions = async (): Promise<SubmissionResult[]> => {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client
        .from('submissions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5000);

    if (error) {
        console.error('Supabase Fetch Error:', error);
        throw error;
    }

    return (data || []).map(row => ({
        id: String(row.id),
        timestamp: row.timestamp || row.created_at,
        studentInfo: row.student_info,
        totalScore: Number(row.total_score || 0),
        detailedScores: row.detailed_scores || {},
        selections: row.selections || {}
    }));
};

/**
 * Delete a submission by ID
 */
export const deleteSupabaseResult = async (id: string): Promise<void> => {
    const client = getSupabaseClient();
    if (!client) return;

    const { error } = await client
        .from('submissions')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Supabase Delete Error:', error);
        throw error;
    }
};

/**
 * Delete all submissions
 */
export const deleteAllSupabaseResults = async (): Promise<void> => {
    const client = getSupabaseClient();
    if (!client) return;

    // Delete all rows where id is not null
    const { error } = await client
        .from('submissions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
        console.error('Supabase Delete All Error:', error);
        throw error;
    }
};

/**
 * Realtime subscription to submissions table
 */
export const subscribeToSupabaseSubmissions = (
    onData: (data: SubmissionResult[]) => void
): (() => void) => {
    const client = getSupabaseClient();
    if (!client) return () => {};

    // Initial load
    fetchSupabaseSubmissions()
        .then(data => onData(data))
        .catch(err => console.error('Initial Supabase fetch error:', err));

    // Listen to changes in real-time
    const channel: RealtimeChannel = client
        .channel('public:submissions')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'submissions' },
            () => {
                // Whenever there is an insert/update/delete, re-fetch the latest data
                fetchSupabaseSubmissions()
                    .then(data => onData(data))
                    .catch(err => console.error('Supabase refresh error:', err));
            }
        )
        .subscribe();

    return () => {
        client.removeChannel(channel);
    };
};
