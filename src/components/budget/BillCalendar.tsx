import { motion } from "framer-motion";
import type { Bill } from "@/types/budget";
import { CATEGORY_LABELS, FREQUENCY_LABELS } from "@/types/budget";

interface BillCalendarProps {
  bills: Bill[];
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function BillCalendar({ bills }: BillCalendarProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  const billsByDay: Record<number, Bill[]> = {};
  bills.forEach((bill) => {
    const day = Math.min(bill.dueDate, daysInMonth);
    if (!billsByDay[day]) billsByDay[day] = [];
    billsByDay[day].push(bill);
  });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthName = new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="glass-card p-5">
      <h2 className="text-lg font-semibold mb-4">Bill Calendar — {monthName}</h2>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          const dayBills = day ? billsByDay[day] || [] : [];
          const isToday = day === today;
          const isPast = day !== null && day < today;
          const hasUnpaid = dayBills.some((b) => !b.isPaid);

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.008 }}
              className={`min-h-[80px] rounded-lg p-1.5 text-xs transition-colors ${
                day === null
                  ? ""
                  : isToday
                  ? "bg-primary/15 border border-primary/30"
                  : "bg-secondary/30 hover:bg-secondary/60"
              }`}
            >
              {day !== null && (
                <>
                  <div className={`font-medium mb-1 ${isToday ? "text-primary" : isPast ? "text-muted-foreground" : ""}`}>
                    {day}
                  </div>
                  {dayBills.map((bill) => (
                    <div
                      key={bill.id}
                      className={`px-1 py-0.5 rounded text-[10px] leading-tight mb-0.5 truncate ${
                        bill.isPaid
                          ? "bg-primary/20 text-primary line-through"
                          : isPast
                          ? "bg-destructive/20 text-destructive"
                          : "bg-chart-bills/20 text-chart-bills"
                      }`}
                      title={`${bill.name} - ${fmt(bill.amount)} (${FREQUENCY_LABELS[bill.frequency]})`}
                    >
                      {bill.name} {fmt(bill.amount)}
                    </div>
                  ))}
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Upcoming bills summary */}
      <div className="mt-4 space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Upcoming This Month</h3>
        {bills
          .filter((b) => !b.isPaid && Math.min(b.dueDate, daysInMonth) >= today)
          .sort((a, b) => a.dueDate - b.dueDate)
          .map((bill) => (
            <div key={bill.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/50 text-sm">
              <div>
                <span className="font-medium">{bill.name}</span>
                <span className="text-muted-foreground ml-2">
                  Due {bill.dueDate}th · {CATEGORY_LABELS[bill.category]}
                </span>
              </div>
              <span className="font-mono">{fmt(bill.amount)}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
