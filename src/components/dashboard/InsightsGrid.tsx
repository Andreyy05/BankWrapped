import React from 'react';
import {
  Calendar,
  ShoppingBag,
  CreditCard,
  Coffee,
  Repeat,
  Sun,
  TrendingDown,
  Activity,
  Sparkles,
} from 'lucide-react';
import { InsightMetric } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { cs } from '@/i18n/cs';

interface InsightsGridProps {
  cards: InsightMetric[];
}

function getInsightIcon(iconName: string) {
  switch (iconName) {
    case 'Calendar':
      return Calendar;
    case 'ShoppingBag':
      return ShoppingBag;
    case 'CreditCard':
      return CreditCard;
    case 'Coffee':
      return Coffee;
    case 'Repeat':
      return Repeat;
    case 'Sun':
      return Sun;
    case 'TrendingDown':
      return TrendingDown;
    case 'Activity':
      return Activity;
    default:
      return Sparkles;
  }
}

export const InsightsGrid: React.FC<InsightsGridProps> = ({ cards }) => {
  if (cards.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
        {cs.insights.title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => {
          const IconComponent = getInsightIcon(card.icon);

          return (
            <Card key={card.id}>
              <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-text-secondary leading-tight truncate">
                    {card.titleKey}
                  </span>
                  <IconComponent className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                </div>

                <div className="space-y-0.5">
                  <div className="text-lg font-semibold tabular-nums text-text-primary truncate">
                    {card.value}
                  </div>
                  <p className="text-xs text-text-secondary leading-snug">
                    {card.detail}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
