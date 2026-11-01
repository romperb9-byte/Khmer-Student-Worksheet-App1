
import React, { useEffect, useState } from 'react';
import { SubmissionResult } from '../types';
import { subscribeToHistory } from '../services/firebase';
import { Loader2 } from 'lucide-react';

interface Props {
    userId: string | null;
}

const HistoryView: React.FC<Props> = ({ userId }) => {
    const [history, setHistory] = useState<SubmissionResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const unsubscribe = subscribeToHistory(userId, (data) => {
            setHistory(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    if (!userId) return <div className="text-center p-8 text-gray-500 dark:text-gray-400">កំពុងភ្ជាប់ទៅកាន់គណនី...</div>;
    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary dark:text-blue-400" size={32} /></div>;
    if (error) return <div className="text-center text-red-500 dark:text-red-400 p-4">{error}</div>;

    if (history.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                មិនទាន់មានប្រវត្តិបញ្ជូនលទ្ធផលនៅឡើយទេ។
            </div>
        );
    }

    return (
        <div className="space-y-4 mt-4">
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 border-b dark:border-gray-700 pb-2">ប្រវត្តិបញ្ជូនលទ្ធផល</h3>
            {history.map((item) => (
                <div key={item.id || item.timestamp} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">
                                {item.studentInfo.name || 'សិស្សមិនបញ្ចេញឈ្មោះ'} 
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">({item.studentInfo.class})</span>
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(item.timestamp).toLocaleString('km-KH')}
                            </p>
                        </div>
                        <div className="text-2xl font-bold text-secondary dark:text-emerald-400">
                            {item.totalScore} <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">ពិន្ទុ</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(item.detailedScores).map(([key, score]) => (
                            <span key={key} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                {key.replace(/sheet\d_/, '').replace(/_/g, ' ')}: <b className="ml-1">{score}</b>
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HistoryView;
