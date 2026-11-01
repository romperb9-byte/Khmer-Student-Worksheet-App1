import React, { useState, useEffect } from 'react';
import { 
    getSupabaseConfig, 
    saveSupabaseConfigToStorage, 
    clearSupabaseConfigFromStorage, 
    getSupabaseClient 
} from '../services/supabase';
import { getActiveBackend } from '../services/db';
import { Database, CheckCircle, XCircle, X, ExternalLink, RefreshCw } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfigChanged: () => void;
}

export const DatabaseConfigModal: React.FC<Props> = ({ isOpen, onClose, onConfigChanged }) => {
    const [url, setUrl] = useState('');
    const [anonKey, setAnonKey] = useState('');
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const activeBackend = getActiveBackend();

    useEffect(() => {
        if (isOpen) {
            const config = getSupabaseConfig();
            setUrl(config.url || '');
            setAnonKey(config.anonKey || '');
            setTestStatus('idle');
            setStatusMessage('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!url.trim() || !anonKey.trim()) {
            setStatusMessage('សូមបញ្ចូលទាំង Supabase URL និង Anon Key');
            setTestStatus('error');
            return;
        }

        setTestStatus('testing');
        setStatusMessage('កំពុងផ្ទៀងផ្ទាត់ការតភ្ជាប់...');

        saveSupabaseConfigToStorage(url, anonKey);

        try {
            const client = getSupabaseClient();
            if (!client) throw new Error('មិនអាចបង្កើត Supabase Client បានទេ');

            // Quick test query to verify connection
            const { error } = await client.from('submissions').select('id').limit(1);
            if (error && error.code !== 'PGRST116') {
                console.warn('Supabase test warning:', error);
            }

            setTestStatus('success');
            setStatusMessage('ការតភ្ជាប់បានជោគជ័យ! ទិន្នន័យនឹងត្រូវរក្សាទុកក្នុង Supabase។');
            onConfigChanged();
            setTimeout(() => {
                onClose();
            }, 1200);
        } catch (e: any) {
            console.error('Connection error:', e);
            setTestStatus('error');
            setStatusMessage('ការតភ្ជាប់បរាជ័យ៖ ' + (e.message || 'សូមពិនិត្យ URL & Key ម្តងទៀត'));
            onConfigChanged();
        }
    };

    const handleReset = () => {
        if (window.confirm('តើអ្នកចង់លុបការកំណត់ Supabase នេះមែនទេ?')) {
            clearSupabaseConfigFromStorage();
            setUrl('');
            setAnonKey('');
            setTestStatus('idle');
            setStatusMessage('បានលុបការកំណត់។');
            onConfigChanged();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-200 dark:border-gray-700 relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    title="បិទ"
                >
                    <X size={22} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
                        <Database size={26} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                            ការកំណត់ Supabase (Database)
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            ស្ថានភាពបច្ចុប្បន្ន: <b className="uppercase text-emerald-600">{activeBackend}</b>
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Supabase Project URL
                        </label>
                        <input 
                            type="text"
                            placeholder="https://your-project-id.supabase.co"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Supabase Anon Public API Key
                        </label>
                        <textarea 
                            rows={3}
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            value={anonKey}
                            onChange={(e) => setAnonKey(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs font-mono"
                        />
                    </div>

                    {statusMessage && (
                        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                            testStatus === 'success' 
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                : testStatus === 'error'
                                ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                            {testStatus === 'testing' && <RefreshCw size={16} className="animate-spin" />}
                            {testStatus === 'success' && <CheckCircle size={16} />}
                            {testStatus === 'error' && <XCircle size={16} />}
                            <span>{statusMessage}</span>
                        </div>
                    )}

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div className="font-semibold text-gray-700 dark:text-gray-300">💡 របៀបយក URL និង Anon Key ពី Supabase:</div>
                        <div>១. បង្កើតគណនី និងគម្រោងថ្មីនៅ <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline inline-flex items-center gap-0.5">supabase.com <ExternalLink size={10} /></a></div>
                        <div>២. ចូលទៅ <b>Project Settings → Data API</b> រួចចម្លង Project URL & anon/public key</div>
                        <div>៣. ចូល <b>SQL Editor</b> រួច Copy កូដក្នុងឯកសារ <code>supabase_schema.sql</code> ទៅ Run</div>
                    </div>
                </div>

                <div className="flex gap-2 mt-6 justify-end">
                    <button 
                        type="button"
                        onClick={handleReset}
                        className="px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-xl text-sm transition"
                    >
                        កំណត់ឡើងវិញ
                    </button>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-sm transition"
                    >
                        បោះបង់
                    </button>
                    <button 
                        type="button"
                        onClick={handleSave}
                        disabled={testStatus === 'testing'}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition flex items-center gap-2 shadow-md"
                    >
                        {testStatus === 'testing' ? <RefreshCw size={16} className="animate-spin" /> : null}
                        រក្សាទុក & ភ្ជាប់
                    </button>
                </div>
            </div>
        </div>
    );
};
