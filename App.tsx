
import React, { useState, useEffect, useMemo } from 'react';
import { SHEETS } from './constants';
import { StudentInfo, SubmissionResult, ListItem } from './types';
import StudentForm from './components/StudentForm';
import { GridSection, AssessmentSection, ListSection, McqSection, McqTextSection, SummaryTableSection, RubricGridSection } from './components/SectionComponents';
import { 
    initDatabaseAuth, 
    submitWorksheetResult, 
    deleteWorksheetResult, 
    clearAllWorksheetResults, 
    subscribeToWorksheetResults, 
    isCloudDatabaseConfigured, 
    getActiveBackend,
    BackendType 
} from './services/db';
import { DatabaseConfigModal } from './components/DatabaseConfigModal';
import { Loader2, AlertTriangle, WifiOff, FileSpreadsheet, RotateCcw, Trash2, Moon, Sun, Users, Home, RefreshCw, Globe, Baby, GraduationCap, Database } from 'lucide-react';

// Define initial empty state
const initialStudentInfo: StudentInfo = {
    school: '',
    teacherName: '',
    name: '',
    gender: '',
    class: '',
    deskNumber: ''
};

function App() {
    // --- State for Landing Page ---
    const [showLanding, setShowLanding] = useState(true);

    const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
    const [studentInfo, setStudentInfo] = useState<StudentInfo>(initialStudentInfo);
    
    // Selections State: key = scoreKey, value = selection data
    const [selections, setSelections] = useState<Record<string, any>>({});
    
    // Auth & Database State
    const [userId, setUserId] = useState<string | null>(null);
    const [activeBackend, setActiveBackend] = useState<BackendType>(() => getActiveBackend());
    const [isDbModalOpen, setIsDbModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [isAuthInitializing, setIsAuthInitializing] = useState(true);
    
    // New State for Offline Mode
    const [isOffline, setIsOffline] = useState(false);

    // State for Table Filters (Sheet 5)
    const [tableFilters, setTableFilters] = useState<Record<string, string>>({});

    // Dark Mode State
    const [isDarkMode, setIsDarkMode] = useState(() => {
        try {
            const saved = localStorage.getItem('khmer_app_theme');
            return saved === 'dark';
        } catch (e) {
            return false;
        }
    });

    // Toggle Theme
    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            localStorage.setItem('khmer_app_theme', newMode ? 'dark' : 'light');
            return newMode;
        });
    };

    // State for accumulated results on Sheet 5 (Local session storage -> localStorage)
    const [accumulatedResults, setAccumulatedResults] = useState<Array<SubmissionResult>>(() => {
        // Initialize from localStorage if available
        try {
            const saved = localStorage.getItem('khmer_app_accumulated_results');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load from local storage", e);
            return [];
        }
    });

    // State for Global Results (Synced from Supabase or Firebase)
    const [globalResults, setGlobalResults] = useState<SubmissionResult[]>([]);
    const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);
    
    // Trigger to manually refresh global subscriptions
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // View Mode for Global Results: 'none' (normal flow), 'general' (Grades 1-6), 'kindergarten' (K)
    const [summaryViewMode, setSummaryViewMode] = useState<'none' | 'general' | 'kindergarten'>('none');

    // Save to localStorage whenever accumulatedResults changes
    useEffect(() => {
        try {
            localStorage.setItem('khmer_app_accumulated_results', JSON.stringify(accumulatedResults));
        } catch (e) {
            console.error("Failed to save to local storage", e);
        }
    }, [accumulatedResults]);

    // Setup Cloud Database / Auth on mount & when config changes
    useEffect(() => {
        setIsAuthInitializing(true);
        const currentBackend = getActiveBackend();
        setActiveBackend(currentBackend);

        initDatabaseAuth()
            .then(res => {
                setUserId(res.uid);
                setActiveBackend(res.backend);
                setErrorMessage('');
                setSubmissionStatus('idle');
                setIsOffline(res.backend === 'local');
            })
            .catch((error) => {
                console.warn("Database connection notice:", error);
                setIsOffline(true);
                setSubmissionStatus('idle');
                setErrorMessage(`ដំណើរការទម្រង់ Offline៖ ${error.message || 'មិនទាន់បានភ្ជាប់ Cloud Database'}`);
            })
            .finally(() => {
                setIsAuthInitializing(false);
            });
    }, [refreshTrigger]);

    // Subscribe to Global Results when connected
    useEffect(() => {
        if (isCloudDatabaseConfigured()) {
            setIsLoadingGlobal(true);
            const unsubscribe = subscribeToWorksheetResults((data) => {
                setGlobalResults(data);
                setIsLoadingGlobal(false);
                setIsOffline(false);
            });
            return () => unsubscribe();
        } else {
            setIsLoadingGlobal(false);
        }
    }, [refreshTrigger, userId]);

    // --- Logic for Visibility ---
    const visibleSheets = useMemo(() => {
        // If viewing summary directly
        if (summaryViewMode === 'general') {
             return SHEETS.filter((_, i) => i === 13); // Index 13 is Summary Table (General 1-6)
        }
        if (summaryViewMode === 'kindergarten') {
            return SHEETS.filter((_, i) => i === 15); // Index 15 is Summary Table (Kindergarten)
        }

        const cls = studentInfo.class;
        // SHEETS indices mapping (Updated for Class 6):
        // 0=S1, 1=S2, 2=S3, 3=S4, 4=S5, 5=S6, 6=S7, 7=S_G3_1, 8=S_G3_2, 9=S_G3_3, 
        // 10=S_G4_1, 11=S_G5_1, 12=S_G6_1, 13=Summary_Main, 14=Kindergarten, 15=Summary_K
        
        if (cls === '1') {
            return SHEETS.filter((_, i) => [0, 1, 2, 3, 13].includes(i));
        } else if (cls === '2') {
            return SHEETS.filter((_, i) => [0, 4, 5, 6, 13].includes(i));
        } else if (cls === '3') {
            return SHEETS.filter((_, i) => [0, 7, 8, 9, 13].includes(i));
        } else if (cls === '4') {
            return SHEETS.filter((_, i) => [0, 10, 13].includes(i));
        } else if (cls === '5') {
            return SHEETS.filter((_, i) => [0, 11, 13].includes(i));
        } else if (cls === '6') {
            return SHEETS.filter((_, i) => [0, 12, 13].includes(i));
        } else if (cls === 'K') {
            return SHEETS.filter((_, i) => [14, 15].includes(i));
        }
        // Default: Show all sheets
        return SHEETS;
    }, [studentInfo.class, summaryViewMode]);

    // --- Logic for Scoring ---
    const calculateScore = useMemo(() => {
        let total = 0;
        const detailed: Record<string, number> = {};

        visibleSheets.forEach((sheet) => {
            sheet.sections.forEach(section => {
                const key = section.scoreKey;
                const data = selections[key];
                let sectionScore = 0;

                if (!data) {
                    if (detailed[key] === undefined) {
                        detailed[key] = 0;
                    }
                    return;
                }

                if (section.type === 'grid') {
                    sectionScore = (data as string[]).length;
                } else if (section.type === 'assessment-grid') {
                    sectionScore = (data as {row: number, isCorrect: boolean}[]).filter(item => item.isCorrect).length;
                } else if (section.type === 'list-checkbox') {
                    if (section.items && (section.items[0] as any).weight) {
                        sectionScore = (data as number[]).reduce((acc, idx) => {
                             return acc + ((section.items![idx] as any).weight || 0);
                        }, 0);
                    } else {
                        sectionScore = (data as number[]).length;
                    }
                } else if (section.type === 'mcq-image' || section.type === 'mcq-text') {
                    if (section.questions) {
                        sectionScore = 0;
                        Object.entries(data as Record<number, number>).forEach(([qIdx, oIdx]) => {
                            const question = section.questions![parseInt(qIdx)];
                            if (question && question.correctAnswerIndex === oIdx) {
                                sectionScore += (section.mcqPoints || 0);
                            }
                        });
                    }
                } else if (section.type === 'rubric-grid') {
                    const sel = data as Record<number, number>;
                    sectionScore = 0;
                    const items = section.items as ListItem[];
                    items.forEach((item, rIdx) => {
                         if (sel[rIdx] === 0) {
                             sectionScore += (item.weight || 0);
                         }
                    });
                }

                detailed[key] = sectionScore;
                if (section.type !== 'summary-table') {
                    total += sectionScore;
                }
            });
        });

        return { total, detailed };
    }, [selections, visibleSheets]);

    // --- Handlers ---
    const handleStudentInfoChange = (field: keyof StudentInfo, value: string) => {
        setStudentInfo(prev => ({ ...prev, [field]: value }));
        if (field === 'class') {
            setCurrentSheetIndex(0);
        }
    };

    const handleClassSelect = (cls: string) => {
        setSummaryViewMode('none');
        setStudentInfo(prev => ({ ...prev, class: cls }));
        setShowLanding(false);
        setCurrentSheetIndex(0);
    };

    const handleViewGeneralResults = () => {
        setRefreshTrigger(prev => prev + 1);
        setIsLoadingGlobal(true);
        setSummaryViewMode('general');
        setShowLanding(false);
        setCurrentSheetIndex(0);
    };

    const handleViewKindergartenResults = () => {
        setRefreshTrigger(prev => prev + 1);
        setIsLoadingGlobal(true);
        setSummaryViewMode('kindergarten');
        setShowLanding(false);
        setCurrentSheetIndex(0);
    };

    const handleToggleGrid = (key: string, item: string) => {
        setSelections(prev => {
            const current = (prev[key] as string[]) || [];
            if (current.includes(item)) {
                return { ...prev, [key]: current.filter(i => i !== item) };
            } else {
                return { ...prev, [key]: [...current, item] };
            }
        });
    };

    const handleToggleAssessment = (key: string, row: number, isCorrect: boolean) => {
        setSelections(prev => {
            const current = (prev[key] as { row: number, isCorrect: boolean }[]) || [];
            const filtered = current.filter(i => i.row !== row);
            const existing = current.find(i => i.row === row);
            
            if (existing && existing.isCorrect === isCorrect) {
                return { ...prev, [key]: filtered };
            } else {
                return { ...prev, [key]: [...filtered, { row, isCorrect }] };
            }
        });
    };

    const handleToggleList = (key: string, index: number) => {
        setSelections(prev => {
            const current = (prev[key] as number[]) || [];
            if (current.includes(index)) {
                return { ...prev, [key]: current.filter(i => i !== index) };
            } else {
                return { ...prev, [key]: [...current, index] };
            }
        });
    };

    const handleSelectMcq = (key: string, qIndex: number, oIndex: number) => {
        setSelections(prev => {
            const current = (prev[key] as Record<number, number>) || {};
            return { ...prev, [key]: { ...current, [qIndex]: oIndex } };
        });
    };

    const handleSelectRubric = (key: string, rowIndex: number, colIndex: number) => {
        setSelections(prev => {
            const current = (prev[key] as Record<number, number>) || {};
            return { ...prev, [key]: { ...current, [rowIndex]: colIndex } };
        });
    };

    const summaryIndex = visibleSheets.length - 1;
    const isSubmitSheet = summaryViewMode === 'none' && currentSheetIndex === summaryIndex - 1;
    const isResultSheet = summaryViewMode !== 'none' || currentSheetIndex === summaryIndex;

    const handleSubmit = async () => {
        // Always save locally first as backup
        const currentResult: SubmissionResult = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            studentInfo: { ...studentInfo },
            totalScore: calculateScore.total,
            detailedScores: { ...calculateScore.detailed },
            selections: { ...selections }
        };
        setAccumulatedResults(prev => [...prev, currentResult]);

        if (isOffline || !isCloudDatabaseConfigured()) {
            setCurrentSheetIndex(summaryIndex);
            return;
        }

        setIsSubmitting(true);
        setSubmissionStatus('idle');
        
        try {
            const payload: Omit<SubmissionResult, 'id' | 'timestamp'> = {
                studentInfo,
                totalScore: calculateScore.total,
                detailedScores: calculateScore.detailed,
                selections
            };
            
            // 1. Submit to Cloud Database (Supabase / Firebase)
            await submitWorksheetResult(payload);

            setSubmissionStatus('success');
            
            setTimeout(() => {
                 setCurrentSheetIndex(summaryIndex);
                 setRefreshTrigger(prev => prev + 1); // Force refresh after submit
            }, 1200);
        } catch (err: any) {
            console.error(err);
            setSubmissionStatus('error');
            setErrorMessage(err.message || "បញ្ហាក្នុងការបញ្ជូនទៅ Cloud Database។");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRestart = () => {
        if (window.confirm("តើអ្នកចង់ត្រឡប់ទៅទំព័រដើមវិញមែនទេ?")) {
            setCurrentSheetIndex(0);
            setSelections({});
            setSubmissionStatus('idle');
            setErrorMessage('');
            setStudentInfo(initialStudentInfo);
            setShowLanding(true);
            setSummaryViewMode('none');
            setTableFilters({});
        }
    };

    const handleManualRefresh = () => {
        // Force re-subscription by incrementing trigger
        setRefreshTrigger(prev => prev + 1);
        // Optimistically assume we might be online now
        setIsOffline(false);
        setIsLoadingGlobal(true);
    };

    const handleClearTable = async () => {
        const isGlobal = globalResults.length > 0;
        const message = isGlobal 
            ? "⚠️ ព្រមាន៖ តើអ្នកពិតជាចង់លុបទិន្នន័យ *ទាំងអស់* (Cloud Data) ចេញពីប្រព័ន្ធមែនទេ? \n\nសកម្មភាពនេះនឹងលុបទិន្នន័យរបស់សិស្សទាំងអស់ជាអចិន្ត្រៃយ៍ ហើយមិនអាចត្រឡប់វិញបានទេ។" 
            : "តើអ្នកចង់លុបទិន្នន័យដែលបានរក្សាទុកក្នុងម៉ាស៊ីននេះ (Local) ទាំងអស់មែនទេ?";

        if (window.confirm(message)) {
            // Second confirmation for Global data safety
            if (isGlobal && !window.confirm("សូមបញ្ជាក់ម្ដងទៀតថាអ្នកចង់លុបវាចោល?")) {
                return;
            }

            setIsSubmitting(true);
            try {
                if (isGlobal && isCloudDatabaseConfigured() && !isOffline) {
                    await clearAllWorksheetResults(globalResults);
                }

                // Clear Local as well
                setAccumulatedResults([]);
                localStorage.removeItem('khmer_app_accumulated_results');
                setTableFilters({});
                setRefreshTrigger(prev => prev + 1);
            } catch (e) {
                console.error("Delete All Error:", e);
                alert("មានបញ្ហាក្នុងការលុបទិន្នន័យ។ សូមព្យាយាមម្តងទៀត។");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleDeleteRow = async (item: SubmissionResult) => {
        if (window.confirm(`តើអ្នកពិតជាចង់លុបលទ្ធផលរបស់ ${item.studentInfo.name} មែនទេ?`)) {
            if (!isOffline && isCloudDatabaseConfigured() && item.id && globalResults.some(g => g.id === item.id)) {
                try {
                    await deleteWorksheetResult(item.id);
                    setRefreshTrigger(prev => prev + 1);
                } catch (e) {
                    console.error("Delete error:", e);
                    alert("មានបញ្ហាក្នុងការលុបពីប្រព័ន្ធ");
                }
            } else {
                setAccumulatedResults(prev => prev.filter(r => r.id !== item.id));
            }
        }
    };

    const handleEditRow = (item: SubmissionResult) => {
        if (window.confirm(`តើអ្នកចង់កែប្រែលទ្ធផលរបស់ ${item.studentInfo.name} មែនទេ?`)) {
            setStudentInfo(item.studentInfo);
            if (item.selections) {
                setSelections(item.selections);
            } else {
                alert("មិនមានទិន្នន័យលម្អិតចាស់ទេ។ អ្នកត្រូវបំពេញទិន្នន័យឡើងវិញ។");
                setSelections({});
            }
            setSubmissionStatus('idle');
            setErrorMessage('');
            
            // Switch to edit mode
            setSummaryViewMode('none');
            setCurrentSheetIndex(0);
            setShowLanding(false);
            window.scrollTo(0, 0);
        }
    };

    const handleDownloadExcel = () => {
        const sheetSummary = visibleSheets[visibleSheets.length - 1];
        if (!sheetSummary) return;
        const section = sheetSummary.sections.find(sec => sec.type === 'summary-table');
        if (!section) return;
        const columns = section.items as ListItem[];

        const getValue = (entry: {studentInfo: StudentInfo, detailedScores: Record<string, number>}, col: ListItem) => {
            if (!col.key) return '';
            if (col.isScore) {
                 return entry.detailedScores[col.key]?.toString() || '0';
            }
            return (entry.studentInfo[col.key as keyof StudentInfo] as string) || '';
        };

        // Decide which data source to export
        const sourceData = (globalResults.length > 0) ? globalResults : accumulatedResults;

        const dataToExport = sourceData.filter(row => {
             return columns.every(col => {
                if (!col.key || col.key === 'actions') return true;
                const filterValue = tableFilters[col.key];
                if (!filterValue || filterValue === 'all') return true;
                return getValue(row, col) === filterValue;
            });
        });

        if (dataToExport.length === 0) {
            alert("គ្មានទិន្នន័យសម្រាប់ទាញយកទេ (No data to export)");
            return;
        }

        const exportColumns = columns.filter(c => c.key !== 'actions');
        const headerRow = exportColumns.map(col => `"${col.text}"`).join(",");
        
        const dataRows = dataToExport.map(row => {
             return exportColumns.map(col => {
                 const val = getValue(row, col);
                 return `"${val.replace(/"/g, '""')}"`;
             }).join(",");
        }).join("\n");

        const csvContent = "\uFEFF" + headerRow + "\n" + dataRows;
        
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        const fileName = `results_summary_${new Date().toISOString().slice(0,10)}.csv`;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Render Landing
    if (showLanding) {
        return (
            <div className={isDarkMode ? 'dark' : ''}>
                <div className="min-h-screen flex items-center justify-center bg-[#e0f2fe] dark:bg-gray-900 transition-colors duration-300">
                    <div className="bg-white/30 dark:bg-gray-800/50 backdrop-blur-sm p-8 md:p-12 rounded-[3rem] border border-white/50 shadow-lg max-w-4xl w-full mx-4 relative">
                        {isAuthInitializing && (
                            <div className="absolute top-4 left-4 flex items-center gap-2 text-gray-500">
                                <Loader2 className="animate-spin" size={16} />
                                <span className="text-sm">កំពុងភ្ជាប់ប្រព័ន្ធ...</span>
                            </div>
                        )}
                        <h1 className="text-4xl md:text-5xl font-bold text-center text-red-600 mb-8 drop-shadow-sm font-sans">
                            កិច្ចការតេស្តសិស្ស (ប្រព័ន្ធរួម)
                        </h1>
                        
                        <div className="flex flex-col items-center gap-8">
                            {/* View Global Results - SPLIT INTO TWO BUTTONS */}
                            <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                                <button 
                                    onClick={handleViewKindergartenResults}
                                    className="flex-1 py-5 bg-pink-500 hover:bg-pink-600 text-white text-lg md:text-xl font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3 transition transform hover:scale-105 ring-4 ring-pink-200 dark:ring-pink-900"
                                >
                                    <Baby size={28} />
                                    លទ្ធផលមត្តេយ្យ (Global)
                                </button>
                                <button 
                                    onClick={handleViewGeneralResults}
                                    className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-700 text-white text-lg md:text-xl font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3 transition transform hover:scale-105 ring-4 ring-emerald-200 dark:ring-emerald-900"
                                >
                                    <Globe size={28} />
                                    លទ្ធផលសិស្ស ១-៦ (Global)
                                </button>
                            </div>

                            <div className="w-full border-t border-gray-300/50 dark:border-gray-600/50 flex items-center justify-center">
                                <span className="bg-[#e0f2fe] dark:bg-gray-900 px-3 text-gray-500 font-medium -mt-3 absolute">ឬ ជ្រើសរើសថ្នាក់ដើម្បីវាយតម្លៃ</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 justify-items-center w-full mt-2">
                                {['K', '1', '2', '3', '4', '5', '6'].map(cls => (
                                    <button 
                                        key={cls}
                                        onClick={() => handleClassSelect(cls)}
                                        className="w-full md:w-48 py-4 bg-[#5b7fff] hover:bg-[#4a6ee0] text-[#00ff00] text-2xl md:text-3xl font-bold rounded-2xl shadow-md transition transform hover:scale-105"
                                    >
                                        {cls === 'K' ? 'ថ្នាក់មត្ដេយ្យ' : `ថ្នាក់ទី${cls}`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="absolute right-4 top-4 flex items-center gap-2">
                        <button 
                            onClick={() => setIsDbModalOpen(true)}
                            className="p-2.5 rounded-full bg-white/70 dark:bg-gray-700/70 hover:bg-white dark:hover:bg-gray-600 transition-colors shadow-sm relative flex items-center gap-1.5 border border-gray-200 dark:border-gray-600"
                            title="កំណត់ការតភ្ជាប់ Supabase Database"
                        >
                            <Database size={20} className={activeBackend === 'supabase' ? 'text-emerald-500' : 'text-gray-600 dark:text-gray-300'} />
                            <span className="text-xs font-bold uppercase hidden sm:inline text-gray-700 dark:text-gray-200">
                                {activeBackend}
                            </span>
                            {activeBackend === 'supabase' && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            )}
                        </button>
                        <button 
                            onClick={toggleTheme}
                            className="p-2.5 rounded-full bg-white/70 dark:bg-gray-700/70 hover:bg-white dark:hover:bg-gray-600 transition-colors shadow-sm border border-gray-200 dark:border-gray-600"
                        >
                            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
                        </button>
                    </div>

                    <DatabaseConfigModal 
                        isOpen={isDbModalOpen} 
                        onClose={() => setIsDbModalOpen(false)} 
                        onConfigChanged={() => setRefreshTrigger(prev => prev + 1)} 
                    />
                </div>
            </div>
        );
    }

    const activeSheet = visibleSheets[currentSheetIndex];

    return (
        <div className={isDarkMode ? 'dark' : ''}>
            <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8 min-h-[80vh] flex flex-col transition-colors duration-300">
                    
                    {/* Header */}
                    <div className="relative mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-center text-primary dark:text-blue-400">
                            {summaryViewMode === 'general' ? 'តារាងលទ្ធផលសិស្ស ១-៦ (Global)' : 
                             summaryViewMode === 'kindergarten' ? 'តារាងលទ្ធផលមត្តេយ្យ (Global)' :
                             activeSheet?.mainTitle}
                        </h1>
                        
                        <div className="absolute right-0 top-0 flex gap-2">
                             <button 
                                onClick={() => setIsDbModalOpen(true)}
                                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 shadow-sm relative"
                                title="កំណត់ការតភ្ជាប់ Supabase Database"
                            >
                                <Database size={20} className={activeBackend === 'supabase' ? 'text-emerald-500' : 'text-gray-600 dark:text-gray-300'} />
                                {activeBackend === 'supabase' && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                                )}
                            </button>
                             <button 
                                onClick={() => window.location.reload()}
                                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 shadow-sm"
                                title="Reload App (Refresh)"
                            >
                                <RefreshCw size={20} className="text-gray-600 dark:text-gray-300" />
                            </button>
                             <button 
                                onClick={handleRestart}
                                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 shadow-sm"
                                title="Back to Home (Reset)"
                            >
                                <Home size={20} className="text-gray-600 dark:text-gray-300" />
                            </button>
                            <button 
                                onClick={toggleTheme}
                                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600 shadow-sm"
                            >
                                {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
                            </button>
                        </div>
                    </div>

                    {submissionStatus === 'error' && errorMessage && !isOffline && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                            <AlertTriangle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-red-800 dark:text-red-200">មានបញ្ហាកើតឡើង</h3>
                                <p className="text-red-700 dark:text-red-300 text-sm mt-1">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Student Form */}
                    {!isResultSheet && summaryViewMode === 'none' && (
                        <StudentForm 
                            info={studentInfo} 
                            onChange={handleStudentInfoChange} 
                            onViewResults={() => {
                                setCurrentSheetIndex(summaryIndex);
                                handleManualRefresh();
                            }}
                        />
                    )}

                    {/* Score Header */}
                    {!isResultSheet && summaryViewMode === 'none' && (
                        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b-2 border-indigo-100 dark:border-indigo-900 py-4 mb-6 flex flex-col md:flex-row justify-between items-center shadow-sm transition-colors">
                            <div className="text-xl font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg border border-red-100 dark:border-red-900 mb-2 md:mb-0">
                                ពិន្ទុសរុប: <span className="text-2xl">{calculateScore.total}</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-center flex-grow px-4 font-medium">
                                {activeSheet.instruction}
                            </p>
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="flex-grow space-y-10">
                        {activeSheet.sections.map((section, idx) => {
                            const sectionScore = calculateScore.detailed[section.scoreKey] || 0;
                            
                            // Filter data logic for Summary Table
                            let filteredResults = globalResults.length > 0 ? globalResults : accumulatedResults;
                            
                            if (summaryViewMode === 'kindergarten') {
                                filteredResults = filteredResults.filter(r => r.studentInfo.class === 'K');
                            } else if (summaryViewMode === 'general') {
                                filteredResults = filteredResults.filter(r => r.studentInfo.class !== 'K');
                            } else if (section.type === 'summary-table' && summaryViewMode === 'none') {
                                // When submitting a test, filter results to show relevant class data if possible,
                                // or show all but highlight current. Current implementation shows all mixed, which is fine for "Accumulated" view.
                                // However, to be cleaner, we could filter by current class if it's set.
                                if (studentInfo.class === 'K') {
                                    filteredResults = filteredResults.filter(r => r.studentInfo.class === 'K');
                                } else if (studentInfo.class) {
                                    filteredResults = filteredResults.filter(r => r.studentInfo.class !== 'K');
                                }
                            }

                            return (
                                <div key={section.scoreKey} className="animate-in fade-in duration-500">
                                    {section.subtitle && (
                                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">{section.subtitle}</p>
                                    )}
                                    <div className="flex justify-between items-center mb-2 text-secondary dark:text-emerald-400">
                                        <h2 className="text-xl font-bold">{section.title}</h2>
                                        {section.type !== 'summary-table' && (
                                            <span className="font-medium">
                                                ពិន្ទុ: <span className="font-bold text-xl">{sectionScore}</span>
                                            </span>
                                        )}
                                    </div>

                                    {section.type === 'grid' && (
                                        <GridSection 
                                            section={section} 
                                            selections={selections[section.scoreKey] || []} 
                                            onToggle={(item) => handleToggleGrid(section.scoreKey, item)} 
                                        />
                                    )}
                                    {section.type === 'assessment-grid' && (
                                        <AssessmentSection 
                                            section={section}
                                            selections={selections[section.scoreKey] || []}
                                            onToggle={(row, isCorrect) => handleToggleAssessment(section.scoreKey, row, isCorrect)}
                                        />
                                    )}
                                    {section.type === 'list-checkbox' && (
                                        <ListSection 
                                            section={section}
                                            selections={selections[section.scoreKey] || []}
                                            onToggle={(idx) => handleToggleList(section.scoreKey, idx)}
                                        />
                                    )}
                                    {section.type === 'mcq-image' && (
                                        <McqSection 
                                            section={section}
                                            selections={selections[section.scoreKey] || {}}
                                            onSelect={(q, o) => handleSelectMcq(section.scoreKey, q, o)}
                                        />
                                    )}
                                    {section.type === 'mcq-text' && (
                                        <McqTextSection
                                            section={section}
                                            selections={selections[section.scoreKey] || {}}
                                            onSelect={(q, o) => handleSelectMcq(section.scoreKey, q, o)}
                                        />
                                    )}
                                    {section.type === 'rubric-grid' && (
                                        <RubricGridSection
                                            section={section}
                                            selections={selections[section.scoreKey] || {}}
                                            onSelect={(row, col) => handleSelectRubric(section.scoreKey, row, col)}
                                        />
                                    )}
                                    {section.type === 'summary-table' && (
                                        <SummaryTableSection
                                            section={section}
                                            // Pass filtered results
                                            results={filteredResults}
                                            filters={tableFilters}
                                            onFilterChange={(key, val) => setTableFilters(prev => ({ ...prev, [key]: val }))}
                                            onDelete={handleDeleteRow}
                                            onEdit={handleEditRow}
                                            onRefresh={handleManualRefresh}
                                            isOffline={isOffline && globalResults.length === 0}
                                            isLoading={isLoadingGlobal}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Action Bar */}
                    <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-center gap-4">
                        {submissionStatus === 'success' && (
                             <div className="w-full text-center p-4 mb-4 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-lg">
                                ការបញ្ជូនលទ្ធផលបានជោគជ័យ!
                            </div>
                        )}
                       
                        {/* Navigation Buttons */}
                        {!isResultSheet && summaryViewMode === 'none' && (
                            <button 
                                onClick={() => {
                                    window.scrollTo(0, 0);
                                    if (currentSheetIndex === 0) {
                                        setShowLanding(true);
                                    } else {
                                        setCurrentSheetIndex(prev => prev - 1);
                                    }
                                }}
                                className="px-8 py-3 bg-gray-500 text-white font-bold rounded-lg shadow-lg hover:bg-gray-600 transition transform hover:scale-105"
                            >
                                {currentSheetIndex === 0 ? 'ត្រឡប់ទំព័រដើម' : 'ត្រឡប់ក្រោយ'}
                            </button>
                        )}

                        {/* Standard Next Button */}
                        {currentSheetIndex < summaryIndex - 1 && summaryViewMode === 'none' && (
                            <button 
                                onClick={() => {
                                    window.scrollTo(0, 0);
                                    setCurrentSheetIndex(prev => prev + 1);
                                }}
                                className="px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-blue-800 transition transform hover:scale-105"
                            >
                                សន្លឹកបន្ទាប់ ({currentSheetIndex + 1}/{visibleSheets.length - 1})
                            </button>
                        )}

                        {/* Submit Button */}
                        {isSubmitSheet && (
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex items-center justify-center px-8 py-3 bg-secondary text-white font-bold rounded-lg shadow-lg hover:bg-emerald-700 transition transform hover:scale-105 disabled:opacity-70 disabled:transform-none"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                                បញ្ជូនលទ្ធផល (Submit)
                            </button>
                        )}

                        {/* Result Sheet Actions */}
                        {isResultSheet && (
                            <div className="flex gap-4 flex-wrap justify-center">
                                <button
                                    onClick={handleClearTable}
                                    disabled={isSubmitting}
                                    className="flex items-center justify-center px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 transition"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin mr-2" size={20} /> : <Trash2 className="mr-2" size={20} />}
                                    សម្អាតទិន្នន័យទាំងអស់
                                </button>
                                <button 
                                    onClick={handleDownloadExcel}
                                    className="flex items-center justify-center px-6 py-3 bg-green-700 text-white font-bold rounded-lg shadow-lg hover:bg-green-800 transition"
                                >
                                    <FileSpreadsheet className="mr-2" size={20} />
                                    ទាញយកជា Excel
                                </button>
                                {summaryViewMode !== 'none' ? (
                                    <button 
                                        onClick={handleRestart}
                                        className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white font-bold rounded-lg shadow-lg hover:bg-gray-700 transition"
                                    >
                                        <Home className="mr-2" size={20} />
                                        ត្រឡប់ទៅទំព័រដើម
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleRestart}
                                        className="flex items-center justify-center px-6 py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-blue-800 transition"
                                    >
                                        <RotateCcw className="mr-2" size={20} />
                                        ចាប់ផ្តើមថ្មី
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <DatabaseConfigModal 
                isOpen={isDbModalOpen} 
                onClose={() => setIsDbModalOpen(false)} 
                onConfigChanged={() => setRefreshTrigger(prev => prev + 1)} 
            />
        </div>
    );
}

export default App;
