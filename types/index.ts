type CycleTips = {
    diet: string[];
    exercise: string[];
    mentalHealth: string[];
    weightLoss: string[];
    fasting: string[];
}

export interface Period {
    start: Date;
    end: Date | null;
}

export interface CyclePhase {
    name: string;
    start: Date;
    end: Date;
    description: string;
    symptoms: string[];
    color: string;
    tips: CycleTips;
}

export interface PredictedPeriod {
    name: string;
    color: string;
}