
import React from 'react';
import { SheetSection, McqQuestion, ListItem, StudentInfo, SubmissionResult } from '../types';
import { Check, ChevronDown, Pencil, Trash2, RefreshCw, Cloud, Database } from 'lucide-react';

// --- Grid Section ---
interface GridProps {
    section: SheetSection;
    selections: string[];
    onToggle: (item: string) => void;
}

export const GridSection: React.FC<GridProps> = ({ section, selections, onToggle }) => {
    const items = section.items as string[];
    
    // Determine if we need larger font based on title
    // Sub-consonants, Dependent Vowels, Independent Vowels, and Punctuation are typically larger in the worksheet
    const isLargeText = section.title.includes('ជើងព្យញ្ជនៈ') || 
                        section.title.includes('ស្រៈនិស្ស័យ') ||
                        section.title.includes('ស្រៈពេញតួ') || 
                        section.title.includes('សញ្ញាវណ្ណយុត្តិ');
    
    const fontSize = isLargeText ? 'text-3xl' : 'text-xl';

    return (
        <div className={`grid ${section.gridClass || 'grid-cols-5'} border-2 border-black dark:border-gray-500 bg-white dark:bg-gray-800 transition-colors`}>
            {items.map((item, idx) => {
                const isGray = item === 'gray';
                const isSelected = selections.includes(item) && !isGray;
                
                return (
                    <div
                        key={`${idx}-${item}`}
                        onClick={() => !isGray && onToggle(item)}
                        className={`
                            border border-black dark:border-gray-500 flex justify-center items-center h-16
                            ${fontSize} transition-all duration-200 select-none dark:text-white
                            ${isGray ? 'bg-gray-400 dark:bg-gray-600 cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'}
                            ${isSelected ? 'bg-green-100 dark:bg-green-900/50 shadow-[inset_0_0_0_3px_#0f5132] dark:shadow-[inset_0_0_0_3px_#34d399]' : ''}
                        `}
                    >
                        {item !== 'gray' ? item : ''}
                    </div>
                );
            })}
        </div>
    );
};

// --- Assessment Grid Section ---
interface AssessmentProps {
    section: SheetSection;
    selections: { row: number; isCorrect: boolean }[];
    onToggle: (row: number, isCorrect: boolean) => void;
}

export const AssessmentSection: React.FC<AssessmentProps> = ({ section, selections, onToggle }) => {
    const items = section.items as string[][]; // Array of rows, each row has 3 words

    return (
        <div className="grid grid-cols-[1fr_1fr_1fr_80px_80px] border-2 border-black dark:border-gray-500 bg-white dark:bg-gray-800 transition-colors">
            {items.map((words, rowIndex) => {
                const rowSelection = selections.find(s => s.row === rowIndex);
                
                return (
                    <React.Fragment key={rowIndex}>
                        {/* Words */}
                        {words.map((word, wordIndex) => (
                            <div key={wordIndex} className="border border-black dark:border-gray-500 flex justify-center items-center h-16 text-xl p-2 dark:text-white">
                                {word}
                            </div>
                        ))}
                        
                        {/* True Checkbox */}
                        <div 
                            onClick={() => onToggle(rowIndex, true)}
                            className={`
                                border border-black dark:border-gray-500 flex flex-col justify-center items-center cursor-pointer
                                ${rowSelection?.isCorrect === true ? 'bg-green-100 dark:bg-green-900/50 shadow-[inset_0_0_0_2px_#0f5132] dark:shadow-[inset_0_0_0_2px_#34d399]' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                                dark:text-white
                            `}
                        >
                            <div className="flex items-center gap-1">
                                <div className={`w-4 h-4 border border-gray-500 flex items-center justify-center ${rowSelection?.isCorrect === true ? 'bg-secondary border-secondary dark:bg-emerald-600 dark:border-emerald-600' : 'bg-white dark:bg-gray-700'}`}>
                                    {rowSelection?.isCorrect === true && <Check size={12} color="white" />}
                                </div>
                                <span className="text-sm">ត្រូវ</span>
                            </div>
                        </div>

                        {/* False Checkbox */}
                        <div 
                            onClick={() => onToggle(rowIndex, false)}
                            className={`
                                border border-black dark:border-gray-500 flex flex-col justify-center items-center cursor-pointer
                                ${rowSelection?.isCorrect === false ? 'bg-green-100 dark:bg-green-900/50 shadow-[inset_0_0_0_2px_#0f5132] dark:shadow-[inset_0_0_0_2px_#34d399]' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                                dark:text-white
                            `}
                        >
                            <div className="flex items-center gap-1">
                                <div className={`w-4 h-4 border border-gray-500 flex items-center justify-center ${rowSelection?.isCorrect === false ? 'bg-secondary border-secondary dark:bg-emerald-600 dark:border-emerald-600' : 'bg-white dark:bg-gray-700'}`}>
                                    {rowSelection?.isCorrect === false && <Check size={12} color="white" />}
                                </div>
                                <span className="text-sm">ខុស</span>
                            </div>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

// --- Rubric Grid Section ---
interface RubricGridProps {
    section: SheetSection;
    selections: Record<number, number>; // rowIndex -> colIndex
    onSelect: (rowIndex: number, colIndex: number) => void;
}

export const RubricGridSection: React.FC<RubricGridProps> = ({ section, selections, onSelect }) => {
    const items = section.items as ListItem[];
    const headers = section.headers || [];
    const isEmoji = section.isEmojiGrid;

    return (
        <div className="space-y-4">
            {/* Long text info block if present */}
            {section.textInfo && (
                <div className={`
                    p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg text-gray-800 dark:text-gray-200 whitespace-pre-wrap
                    ${isEmoji ? 'text-4xl md:text-6xl text-center leading-[1.6] tracking-wider' : 'text-lg leading-relaxed'}
                `}>
                    {section.textInfo}
                </div>
            )}
            
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                {/* Header Row (Hidden on small screens, shown as labels on small) */}
                <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr] border-b border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                    <div className="p-3 font-bold text-gray-700 dark:text-gray-200">សកម្មភាព</div>
                    {headers.map((header, idx) => (
                        <div key={idx} className="p-3 font-bold text-center text-gray-700 dark:text-gray-200 border-l border-gray-300 dark:border-gray-600">
                            {header}
                        </div>
                    ))}
                </div>

                {items.map((item, rIdx) => (
                    <div key={rIdx} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] border-b last:border-b-0 border-gray-300 dark:border-gray-600">
                        {/* Item Text */}
                        <div className="p-3 font-medium text-gray-800 dark:text-gray-100 flex items-center">
                            {item.text}
                            {item.weight && <span className="text-xs text-gray-500 ml-2">({item.weight} ពិន្ទុ)</span>}
                        </div>
                        
                        {/* Options */}
                        <div className="grid grid-cols-3 md:contents">
                            {headers.map((header, cIdx) => {
                                const isSelected = selections[rIdx] === cIdx;
                                return (
                                    <div 
                                        key={cIdx} 
                                        onClick={() => onSelect(rIdx, cIdx)}
                                        className={`
                                            p-3 flex flex-col md:flex-row items-center justify-center cursor-pointer border-l-0 md:border-l border-gray-300 dark:border-gray-600
                                            ${isSelected ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-100' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                                        `}
                                    >
                                        {/* Mobile Label */}
                                        <span className="md:hidden text-xs text-gray-500 mb-1">{header}</span>
                                        
                                        <div className={`
                                            w-6 h-6 rounded-full border flex items-center justify-center
                                            ${isSelected ? 'border-indigo-600 bg-indigo-600 dark:border-indigo-400 dark:bg-indigo-500' : 'border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800'}
                                        `}>
                                            {isSelected && <Check size={14} color="white" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- List Checkbox Section ---
interface ListProps {
    section: SheetSection;
    selections: number[]; // Array of selected indices
    onToggle: (index: number) => void;
}

export const ListSection: React.FC<ListProps> = ({ section, selections, onToggle }) => {
    const items = section.items as ListItem[];
    const isGrid = !!section.gridClass;

    return (
        <div className={isGrid ? `grid ${section.gridClass} gap-4` : "border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 transition-colors"}>
            {items.map((item, index) => {
                const isSelected = selections.includes(index);

                // If grid mode (e.g. Kindergarten), render as cards
                if (isGrid) {
                    return (
                        <div 
                            key={index}
                            onClick={() => onToggle(index)}
                            className={`
                                flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all h-full text-center gap-3
                                ${isSelected 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-secondary dark:border-emerald-500 shadow-md ring-1 ring-secondary dark:ring-emerald-500' 
                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}
                            `}
                        >
                             <div className={`
                                w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                                ${isSelected ? 'border-secondary dark:border-emerald-500 bg-secondary dark:bg-emerald-600' : 'border-gray-400 dark:border-gray-500 bg-transparent'}
                            `}>
                                {isSelected && <Check size={14} color="white" />}
                            </div>
                            <span className="text-lg font-medium text-gray-800 dark:text-gray-100">{item.text}</span>
                        </div>
                    );
                }

                // Default List Mode
                return (
                    <div 
                        key={index}
                        onClick={() => onToggle(index)}
                        className={`
                            flex items-center p-3 border-b dark:border-gray-600 last:border-b-0 cursor-pointer transition-colors
                            ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                        `}
                    >
                        <div className={`
                            w-5 h-5 mr-4 border rounded flex-shrink-0 flex items-center justify-center
                            ${isSelected ? 'bg-secondary border-secondary dark:bg-emerald-600 dark:border-emerald-600' : 'border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700'}
                        `}>
                            {isSelected && <Check size={14} color="white" />}
                        </div>
                        <div className="flex-grow">
                            <span className="text-lg text-gray-800 dark:text-gray-100">{item.text}</span>
                            {item.weight && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({item.weight} ពិន្ទុ)</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// --- MCQ Image Section ---
interface McqProps {
    section: SheetSection;
    selections: Record<number, number>; // Question Index -> Option Index
    onSelect: (qIndex: number, oIndex: number) => void;
}

export const McqSection: React.FC<McqProps> = ({ section, selections, onSelect }) => {
    const questions = section.questions as McqQuestion[];

    return (
        <div className="space-y-6">
            {questions.map((q, qIndex) => (
                <div key={qIndex} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-green-50/50 dark:bg-green-900/10 transition-colors">
                    <p className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-100">{q.text}</p>
                    
                    {q.iconEmoji && (
                        <div className="flex justify-center items-center w-32 h-32 mx-auto mb-4 text-[80px] bg-white dark:bg-gray-700 rounded shadow-sm">
                            {q.iconEmoji}
                        </div>
                    )}

                    <div className="space-y-2">
                        {q.options.map((opt, oIndex) => {
                            const isSelected = selections[qIndex] === oIndex;
                            return (
                                <div 
                                    key={oIndex}
                                    onClick={() => onSelect(qIndex, oIndex)}
                                    className={`
                                        flex items-center p-3 rounded-md border cursor-pointer transition-all
                                        ${isSelected 
                                            ? 'bg-green-100 dark:bg-green-900/40 border-green-700 dark:border-green-500 font-semibold text-green-900 dark:text-green-100' 
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'}
                                    `}
                                >
                                    <div className={`
                                        w-4 h-4 rounded-full border mr-3 flex items-center justify-center
                                        ${isSelected ? 'border-green-600 dark:border-green-500' : 'border-gray-400 dark:border-gray-500'}
                                    `}>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-500" />}
                                    </div>
                                    <span>{opt}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- MCQ Text Only Section ---
interface McqTextProps {
    section: SheetSection;
    selections: Record<number, number>;
    onSelect: (qIndex: number, oIndex: number) => void;
}

export const McqTextSection: React.FC<McqTextProps> = ({ section, selections, onSelect }) => {
    const questions = section.questions as McqQuestion[];
    const isGrid = !!section.gridClass;

    return (
        <div className="space-y-6">
            {/* Optional Passage Text */}
            {section.textInfo && (
                <div className="mb-6 p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg text-lg leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {section.textInfo}
                </div>
            )}

            {questions.map((q, qIndex) => (
                <div key={qIndex} className="mb-6">
                    <p className="font-bold text-lg mb-3 text-gray-800 dark:text-gray-100">{q.text}</p>
                    <div className={isGrid ? `grid gap-3 ${section.gridClass}` : "space-y-3"}>
                        {q.options.map((opt, oIndex) => {
                            const isSelected = selections[qIndex] === oIndex;
                            return (
                                <div 
                                    key={oIndex}
                                    onClick={() => onSelect(qIndex, oIndex)}
                                    className={`
                                        flex items-center p-3 rounded-lg border cursor-pointer transition-all
                                        ${isSelected 
                                            ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-600 dark:border-indigo-400 text-indigo-900 dark:text-indigo-100 font-medium shadow-sm' 
                                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
                                    `}
                                >
                                    <div className={`
                                        w-5 h-5 rounded flex items-center justify-center border mr-3 flex-shrink-0
                                        ${isSelected ? 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500' : 'bg-white dark:bg-gray-700 border-gray-400 dark:border-gray-500'}
                                    `}>
                                        {isSelected && <Check size={14} color="white" />}
                                    </div>
                                    <span>{opt}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- Summary Table Section ---
interface SummaryTableProps {
    section: SheetSection;
    results: Array<SubmissionResult>;
    filters: Record<string, string>;
    onFilterChange: (key: string, value: string) => void;
    onDelete?: (item: SubmissionResult) => void;
    onEdit?: (item: SubmissionResult) => void;
    onRefresh?: () => void;
    isOffline?: boolean;
    isLoading?: boolean;
}

export const SummaryTableSection: React.FC<SummaryTableProps> = ({ section, results, filters, onFilterChange, onDelete, onEdit, onRefresh, isOffline, isLoading }) => {
    const columns = section.items as ListItem[];

    // Helper to get value from result entry
    const getValue = (entry: SubmissionResult, col: ListItem) => {
        if (!col.key) return '';
        if (col.isScore) {
             return entry.detailedScores[col.key]?.toString() || '0';
        }
        return (entry.studentInfo[col.key as keyof StudentInfo] as string) || '';
    };

    // Filter rows
    const visibleRows = results.filter(row => {
        return columns.every(col => {
            if (!col.key || col.key === 'actions') return true;
            const filterValue = filters[col.key];
            if (!filterValue || filterValue === 'all') return true;
            return getValue(row, col) === filterValue;
        });
    });

    // Get options for select dropdown based on ALL results (not just filtered)
    const getOptions = (col: ListItem) => {
        if (!col.key || col.key === 'actions') return [];
        const values = new Set<string>();
        results.forEach(r => {
            const v = getValue(r, col);
            if (v) values.add(v);
        });
        return Array.from(values).sort();
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-1 gap-3 md:gap-0">
                 <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                    <div className={`flex items-center gap-2 px-2 py-1 rounded ${!isOffline ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'}`}>
                        {isOffline ? <Database size={14} /> : <Cloud size={14} />}
                        <span className="text-sm font-bold">
                            {isOffline ? 'Local Data (Offline)' : 'Global Data (Online)'}
                        </span>
                    </div>
                    
                    {!isOffline && onRefresh && (
                        <button 
                            onClick={onRefresh}
                            className={`
                                flex items-center gap-1 px-3 py-1 rounded shadow-sm text-sm font-bold text-white transition-all
                                ${isLoading 
                                    ? 'bg-blue-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}
                            `}
                            title="Refresh Data from Cloud"
                            disabled={isLoading}
                        >
                            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                            <span>Refresh Data</span>
                        </button>
                    )}
                    {isLoading && <span className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">កំពុងទាញទិន្នន័យ...</span>}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    សរុបសិស្ស: <span className="text-primary dark:text-blue-400 font-bold text-lg">{visibleRows.length}</span> នាក់
                </div>
            </div>
            
            <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-300 dark:border-gray-600 transition-colors">
                <table className="min-w-full border-collapse border border-gray-400 dark:border-gray-600">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                            {columns.map((col, idx) => (
                                <th 
                                    key={idx} 
                                    className="border border-black dark:border-gray-500 px-2 py-2 text-xs md:text-sm font-bold text-center text-black dark:text-white min-w-[100px] break-words leading-tight align-top"
                                >
                                    <div className="flex flex-col items-center gap-1">
                                        <span>{col.text}</span>
                                        {col.key && col.key !== 'actions' && (
                                            <div className="relative w-full">
                                                <select
                                                    className="w-full text-xs p-1 border border-gray-300 dark:border-gray-600 rounded appearance-none pr-4 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:border-primary"
                                                    value={filters[col.key] || 'all'}
                                                    onChange={(e) => onFilterChange(col.key!, e.target.value)}
                                                >
                                                    <option value="all">ទាំងអស់</option>
                                                    {getOptions(col).map((val, vIdx) => (
                                                        <option key={vIdx} value={val}>{val}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={12} />
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {visibleRows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    មិនមានទិន្នន័យ (សូមបញ្ជូនលទ្ធផលជាមុន)
                                </td>
                            </tr>
                        ) : (
                            visibleRows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    {columns.map((col, cIdx) => (
                                        <td key={cIdx} className="border border-black dark:border-gray-500 px-2 py-3 text-center text-sm text-gray-900 dark:text-gray-100 h-12 whitespace-nowrap">
                                            {col.key === 'actions' ? (
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => onEdit?.(row)}
                                                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                                        title="កែប្រែ"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete?.(row)}
                                                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                                                        title="លុប"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                getValue(row, col)
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
