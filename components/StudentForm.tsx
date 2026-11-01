
import React from 'react';
import { StudentInfo } from '../types';

interface Props {
    info: StudentInfo;
    onChange: (field: keyof StudentInfo, value: string) => void;
    onViewResults: () => void;
}

const StudentForm: React.FC<Props> = ({ info, onChange, onViewResults }) => {
    const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-base bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-800 dark:focus:border-indigo-400 transition-colors";
    const labelClass = "block text-gray-700 dark:text-gray-200 font-semibold mb-1";

    return (
        <div className="mb-6 p-4 border border-indigo-200 dark:border-indigo-800 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/20 shadow-sm transition-colors">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <label className="block">
                    <span className={labelClass}>សាលារៀន:</span>
                    <input 
                        type="text" 
                        value={info.school}
                        onChange={(e) => onChange('school', e.target.value)}
                        className={inputClass} 
                        placeholder="ឈ្មោះសាលា" 
                    />
                </label>
                <label className="block">
                    <span className={labelClass}>គ្រូបង្រៀន:</span>
                    <input 
                        type="text" 
                        value={info.teacherName || ''}
                        onChange={(e) => onChange('teacherName', e.target.value)}
                        className={inputClass} 
                        placeholder="ឈ្មោះគ្រូ" 
                    />
                </label>
                <label className="block">
                    <span className={labelClass}>ថ្នាក់:</span>
                    <select
                        value={info.class}
                        onChange={(e) => onChange('class', e.target.value)}
                        className={inputClass}
                    >
                        <option value="">ជ្រើសរើសថ្នាក់...</option>
                        <option value="K">មត្តេយ្យ</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                    </select>
                </label>
                <label className="block">
                    <span className={labelClass}>លេខតុ:</span>
                    <input 
                        type="text" 
                        value={info.deskNumber}
                        onChange={(e) => onChange('deskNumber', e.target.value)}
                        className={inputClass} 
                        placeholder="លេខតុ" 
                    />
                </label>
                <label className="block">
                    <span className={labelClass}>ឈ្មោះ:</span>
                    <input 
                        type="text" 
                        value={info.name}
                        onChange={(e) => onChange('name', e.target.value)}
                        className={inputClass} 
                        placeholder="ឈ្មោះសិស្ស" 
                    />
                </label>
                <label className="block">
                    <span className={labelClass}>ភេទ:</span>
                    <div className="flex gap-2">
                        <select
                            value={info.gender}
                            onChange={(e) => onChange('gender', e.target.value)}
                            className={inputClass}
                        >
                            <option value="">ជ្រើសរើស...</option>
                            <option value="ប្រុស">ប្រុស</option>
                            <option value="ស្រី">ស្រី</option>
                        </select>
                        <button
                            type="button"
                            onClick={onViewResults}
                            className="mt-1 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm text-sm font-medium whitespace-nowrap transition-colors"
                            title="ទៅកាន់តារាងលទ្ធផល (View Results)"
                        >
                            មើលលទ្ធផល
                        </button>
                    </div>
                </label>
            </div>
        </div>
    );
};

export default StudentForm;
