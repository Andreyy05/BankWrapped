import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { CategoryId, Transaction } from '@/types';
import { CATEGORIES, getCategoryDefinition } from '@/data/categories';
import { formatCurrencyCzk } from '@/i18n/cs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface CategoryDonutChartProps {
  transactions: Transaction[];
  selectedCategory: CategoryId | 'all';
  onCategorySelect: (category: CategoryId | 'all') => void;
}

interface CategorySliceData {
  categoryId: CategoryId;
  name: string;
  amountMinor: number;
  count: number;
  percentage: number;
  color: string;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  transactions,
  selectedCategory,
  onCategorySelect,
}) => {
  const chartData = useMemo<CategorySliceData[]>(() => {
    const map: Record<string, { amountMinor: number; count: number }> = {};
    let totalExpenseMinor = 0;

    for (const tx of transactions) {
      if (tx.category === 'transfer' || tx.category === 'income') continue;

      const current = map[tx.category] || { amountMinor: 0, count: 0 };
      if (tx.amountMinor < 0) {
        current.amountMinor += Math.abs(tx.amountMinor);
        current.count += 1;
        totalExpenseMinor += Math.abs(tx.amountMinor);
      } else {
        // Refund reduces category expense
        current.amountMinor = Math.max(0, current.amountMinor - tx.amountMinor);
        totalExpenseMinor = Math.max(0, totalExpenseMinor - tx.amountMinor);
      }
      map[tx.category] = current;
    }

    if (totalExpenseMinor === 0) return [];

    return Object.entries(map)
      .filter(([, d]) => d.amountMinor > 0)
      .map(([catId, d]) => {
        const id = catId as CategoryId;
        const def = getCategoryDefinition(id);
        const percentage = Math.round((d.amountMinor / totalExpenseMinor) * 1000) / 10;
        return {
          categoryId: id,
          name: def.label,
          amountMinor: d.amountMinor,
          count: d.count,
          percentage,
          color: def.color,
        };
      })
      .sort((a, b) => b.amountMinor - a.amountMinor);
  }, [transactions]);

  const totalExpenseMinor = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.amountMinor, 0);
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle>Rozložení výdajů podle kategorií</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-8 text-center text-xs text-text-secondary">
          V tomto období nejsou zaznamenány žádné výdaje.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle>Kategorie výdajů</CardTitle>
        {selectedCategory !== 'all' && (
          <button
            onClick={() => onCategorySelect('all')}
            className="text-xs text-accent hover:underline font-medium"
          >
            Zrušit filtr
          </button>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-1 space-y-4">
        {/* Donut Chart with Center Text */}
        <div className="relative w-full h-52 flex items-center justify-center min-h-[208px]">
          <ResponsiveContainer width="100%" height={208}>
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0]?.payload as CategorySliceData;
                  if (!data) return null;
                  return (
                    <div className="rounded-card border border-border-subtle bg-bg-card p-3 shadow-popover text-xs text-text-primary">
                      <div className="flex items-center gap-2 font-medium">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: data.color }}
                        />
                        <span>{data.name}</span>
                      </div>
                      <div className="mt-1 font-semibold tabular-nums text-sm">
                        {formatCurrencyCzk(data.amountMinor)}
                      </div>
                      <div className="text-xs text-text-secondary flex items-center gap-2 mt-0.5 tabular-nums">
                        <span>{data.percentage} % výdajů</span>
                        <span>•</span>
                        <span>{data.count} plateb</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Pie
                data={chartData}
                dataKey="amountMinor"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={82}
                paddingAngle={2}
                onClick={(_, index) => {
                  const entry = chartData[index];
                  if (entry) {
                    onCategorySelect(
                      selectedCategory === entry.categoryId ? 'all' : entry.categoryId
                    );
                  }
                }}
                className="cursor-pointer focus:outline-none"
              >
                {chartData.map((entry) => {
                  const isSelected =
                    selectedCategory === 'all' || selectedCategory === entry.categoryId;
                  return (
                    <Cell
                      key={entry.categoryId}
                      fill={entry.color}
                      opacity={isSelected ? 1 : 0.25}
                      stroke="var(--bg-card)"
                      strokeWidth={2}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Donut Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-xs text-text-secondary">Celkem</span>
            <span className="text-base font-semibold tabular-nums text-text-primary">
              {formatCurrencyCzk(totalExpenseMinor)}
            </span>
          </div>
        </div>

        {/* Interactive Clickable Category Legend */}
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {chartData.slice(0, 6).map((item) => {
            const isSelected = selectedCategory === item.categoryId;
            const def = CATEGORIES[item.categoryId];
            return (
              <button
                key={item.categoryId}
                onClick={() =>
                  onCategorySelect(isSelected ? 'all' : item.categoryId)
                }
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-btn text-left transition-colors border ${
                  isSelected
                    ? 'border-accent bg-accent-subtle text-accent font-medium'
                    : 'border-border-subtle bg-bg-card hover:bg-bg-subtle text-text-primary'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-xs">
                    {def?.label || item.name}
                  </span>
                </div>
                <span className="tabular-nums text-xs text-text-secondary shrink-0 pl-1">
                  {item.percentage}%
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
