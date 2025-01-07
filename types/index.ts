export interface Period {
    start: Date;
    end: Date | null;
}

export interface CyclePhase {
    name: string;
    start: Date;
    end: Date;
}  