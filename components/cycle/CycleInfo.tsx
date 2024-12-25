import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InfoIcon } from 'lucide-react';
import { CyclePhase } from '@/types/cycle';

interface CycleInfoProps {
  selectedDate: Date | undefined;
  currentPhase: CyclePhase | null;
  canMarkStart: (date: Date) => boolean;
  canMarkEnd: (date: Date) => boolean;
  isStartDate: (date: Date) => boolean;
  isEndDate: (date: Date) => boolean;
  markPeriodStart: (date: Date) => void;
  markPeriodEnd: (date: Date) => void;
  deletePeriodMark: (date: Date) => void;
}

export const CycleInfo = ({
  selectedDate,
  currentPhase,
  canMarkStart,
  canMarkEnd,
  isStartDate,
  isEndDate,
  markPeriodStart,
  markPeriodEnd,
  deletePeriodMark,
}: CycleInfoProps) => {
  const today = new Date();
  const dateToUse = selectedDate || today;

  const getButtonConfig = () => {
    if (isStartDate(dateToUse) || isEndDate(dateToUse)) {
      return {
        text: 'Remove Period Mark',
        action: () => deletePeriodMark(dateToUse),
        variant: 'destructive' as const
      };
    }

    if (canMarkEnd(dateToUse)) {
      return {
        text: 'Mark Period End',
        action: () => markPeriodEnd(dateToUse),
        variant: 'default' as const
      };
    }

    return {
      text: 'Mark Period Start',
      action: () => markPeriodStart(dateToUse),
      variant: 'default' as const
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle className="flex items-center gap-2">
          <InfoIcon className="w-5 h-5" />
          Cycle Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            variant={buttonConfig.variant}
            onClick={buttonConfig.action}
            className={buttonConfig.variant === 'default' ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            {buttonConfig.text}

          </Button>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Current Phase</h3>
          {currentPhase ? (
            <Badge className={`${currentPhase.color} text-white`}>
              {currentPhase.name}
            </Badge>
          ) : (
            <span className="text-gray-500">No active phase</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CycleInfo;