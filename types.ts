
export interface StudentInfo {
    school: string;
    teacherName?: string;
    name: string;
    gender: string;
    class: string;
    deskNumber: string;
}

export type SectionType = 'grid' | 'assessment-grid' | 'list-checkbox' | 'mcq-image' | 'mcq-text' | 'summary-table' | 'rubric-grid';

export interface McqQuestion {
    text: string;
    iconEmoji?: string; // Optional for text-only MCQ
    options: string[];
    correctAnswerIndex: number;
}

export interface ListItem {
    text: string;
    weight?: number;
    // Optional keys for summary table columns
    key?: string; 
    label?: string;
    isScore?: boolean;
}

export interface SheetSection {
    title: string;
    subtitle?: string;
    scoreKey: string;
    type: SectionType;
    gridClass?: string; // e.g. 'grid-cols-8', 'grid-cols-5'
    headers?: string[]; // For rubric-grid column headers
    items?: (string | ListItem | string[])[];
    mcqPoints?: number;
    questions?: McqQuestion[];
    textInfo?: string; // For reading passages or long instructions
    isEmojiGrid?: boolean; // New flag for large emoji display
}

export interface Sheet {
    mainTitle: string;
    instruction?: string;
    sections: SheetSection[];
}

// Selection State Types
export interface Selections {
    [scoreKey: string]: any;
}

// For Grid: string[] (list of selected texts)
// For Assessment: { row: number, isCorrect: boolean }[]
// For List: number[] (indices)
// For MCQ: { [questionIndex: number]: number }
// For Rubric Grid: { [rowIndex: number]: number } (colIndex)

export interface SubmissionResult {
    id?: string;
    timestamp: string;
    studentInfo: StudentInfo;
    totalScore: number;
    detailedScores: Record<string, number>;
    selections?: Record<string, any>; // Saved raw selections for editing
}
