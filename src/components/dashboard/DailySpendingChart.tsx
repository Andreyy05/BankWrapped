import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { ExpensiveDayInfo, Transaction } from '@/types';
import { formatCurrencyCzk } from '@/i18n/cs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface DailySpendingChartProps {
  transactions: Transaction[];
  expensiveDay: ExpensiveDayInfo | null;
}

interface DailySpendItem {
  date: string;
  dayLabel: string;
  amountMinor: number;
  topItemName?: string;
  topItemMinor?: number;
}

export const DailySpendingChart: React.FC<DailySpendingChartProps> = ({
  transactions,
  expensiveDay,
}) => {
  const data = useMemo<DailySpendItem[]>(() => {
    const map: Record<string, { totalMinor: number; topTx: Transaction | null }> = {};

    for (const tx of transactions) {
      if (tx.category === 'transfer' || tx.category === 'income') continue;

      const current = map[tx.date] || { totalMinor: 0, topTx: null };
      if (tx.amountMinor < 0) {
        const exp = Math.abs(tx.amountMinor);
        current.totalMinor += exp;
        if (!current.topTx || exp > Math.abs(current.topTx.amountMinor)) {
          current.topTx = tx;
        }
      } else {
        // Refund reduces daily spend
        current.totalMinor = Math.max(0, current.totalMinor - tx.amountMinor);
      }
      map[tx.date] = current;
    }

    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, d]) => {
        const dayPart = date.split('-')[2] || '1';
        return {
          date,
          dayLabel: `${parseInt(dayPart, 10)}.`,
          amountMinor: d.totalMinor,
          topItemName: d.topTx?.cleanedMerchant,
          topItemMinor: d.topTx ? Math.abs(d.topTx.amountMinor) : 0,
        };
      });
  }, [transactions]);

  if (data.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle>Denní výdaje</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-8 text-center text-xs text-text-secondary">
          V tomto období nejsou zaznamenány žádné denní výdaje.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle>Denní výdaje</CardTitle>
        {expensiveDay && (
          <Badge variant="warning" className="text-xs">
            Nejdražší: {expensiveDay.date.split('-')[2]}. {expensiveDay.date.split('-')[1]}.
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex-1 pt-2">
        <div className="w-full h-60 min-h-[240px]">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="dayLabel"
                stroke="var(--text-tertiary)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--text-tertiary)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: number) => `${Math.round(val / 100000)}k`}
              />
              <Tooltip
                cursor={{ fill: 'var(--bg-hover)', opacity: 0.5 }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0]?.payload as DailySpendItem;
                  if (!item) return null;
                  const isTop = expensiveDay?.date === item.date;

                  return (
                    <div className="rounded-card border border-border-subtle bg-bg-card p-3 shadow-popover text-xs text-text-primary">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">{item.date}</span>
                        {isTop && (
                          <span className="px-1.5 py-0.5 rounded-btn text-[11px] font-medium bg-warning-subtle text-warning border border-warning/20">
                            Nejdražší den
                          </span>
                        )}
                      </div>
                      <div className="mt-1 font-semibold tabular-nums text-sm">
                        {formatCurrencyCzk(item.amountMinor)}
                      </div>
                      {item.topItemName && (
                        <p className="text-xs text-text-secondary mt-1 truncate max-w-xs">
                          Hlavní nákup: {item.topItemName} ({formatCurrencyCzk(item.topItemMinor || 0)})
                        </p>
                      )}
                    </div>
                  );
                }}
              />
              <Bar dataKey="amountMinor" radius={[3, 3, 0, 0]}>
                {data.map((entry) => {
                  const isExpensive = expensiveDay?.date === entry.date;
                  return (
                    <Cell
                      key={entry.date}
                      fill={isExpensive ? 'var(--accent)' : 'var(--border-strong)'}
                      className="transition-colors hover:opacity-80"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
