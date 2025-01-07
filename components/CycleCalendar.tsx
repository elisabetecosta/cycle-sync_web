"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";

export function CycleCalendar() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
    };

    return (
        <div className="flex flex-col items-center justify-center p-6">
            {/* Calendar Section */}
            <div className="w-full max-w-2xl flex flex-col items-center bg-white rounded-lg shadow-md p-6">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="rounded-md"
                />
            </div>
        </div>
    );
}