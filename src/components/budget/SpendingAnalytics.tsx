import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { TrendingDown, TrendingUp, Lightbulb, RefreshCw, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { Bill, Transaction } from "@/types/budget";
import { getMonthlyAmount } from "@/types/budget";

interface SpendingAnalyticsProps {
  bills: Bill[];
  transactions: Transaction[];
  monthlyIncome: number;
}

interface Comparison {
  category: string;
  userAmount: number;
  userPercent: number;
  usAvgPercent: number;
  status: "under" | "over" | "on-track";
  difference: number;
}

interface Tip {
  title: string;
  description: string;
  potentialSavings: number;
}

interface Analysis {
  comparisons: Comparison[];
  tips: Tip[];
  overallScore: number;
  summary: string;
}

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function SpendingAnalytics({ bills, transactions, monthlyIncome }: SpendingAnalyticsProps) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate spending by category from current month's bills and transactions
  const spendingByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    const now = new Date();
    const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Only include bills assigned to the current month
    bills
      .filter((b) => {
        const billMonth = b.month || curMonth;
        return billMonth === curMonth;
      })
      .forEach((b) => {
        const monthly = getMonthlyAmount(b.amount, b.frequency);
        const cat = b.category || "Other";
        cats[cat] = (cats[cat] || 0) + monthly;
      });

    // Add current month's expense transactions
    transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(curMonth))
      .forEach((t) => {
        const cat = t.category || "Other";
        cats[cat] = (cats[cat] || 0) + t.amount;
      });

    return cats;
  }, [bills, transactions]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("spending-tips", {
        body: { spendingByCategory, monthlyIncome },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setAnalysis(data.analysis);
    } catch (e: any) {
      setError(e.message || "Failed to analyze spending");
    } finally {
      setLoading(false);
    }
  };

  const chartData = analysis?.comparisons.map((c) => ({
    category: c.category,
    You: c.userPercent,
    "US Average": c.usAvgPercent,
  })) ?? [];

  const getStatusIcon = (status: string) => {
    if (status === "under") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === "on-track") return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === "under") return <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">Under Avg</Badge>;
    if (status === "on-track") return <Badge variant="default" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">On Track</Badge>;
    return <Badge variant="default" className="bg-red-500/10 text-red-600 border-red-500/20">Over Avg</Badge>;
  };

  const scoreColor = (score: number) => {
    if (score >= 75) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-primary" />
                Spending Analytics
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Compare your spending habits to the US national average and get personalized tips to save money.
              </p>
            </div>
            <Button onClick={fetchAnalysis} disabled={loading || monthlyIncome === 0}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {analysis ? "Refresh Analysis" : "Analyze My Spending"}
            </Button>
          </div>
        </CardHeader>
        {monthlyIncome === 0 && (
          <CardContent>
            <p className="text-sm text-muted-foreground">Please set your monthly income first to enable analysis.</p>
          </CardContent>
        )}
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <>
          {/* Score + Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Financial Health Score</p>
                <p className={`text-5xl font-bold ${scoreColor(analysis.overallScore)}`}>{analysis.overallScore}</p>
                <p className="text-xs text-muted-foreground mt-1">out of 100</p>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <p className="text-sm font-medium mb-1">Summary</p>
                <p className="text-sm text-muted-foreground">{analysis.summary}</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Spending vs. US Average (% of Income)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="category" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" unit="%" />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                        formatter={(v: number) => `${v.toFixed(1)}%`}
                      />
                      <Legend />
                      <Bar dataKey="You" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="US Average" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.5} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.comparisons.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(c.status)}
                      <div>
                        <p className="text-sm font-medium">{c.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {fmt.format(c.userAmount)}/mo · {c.userPercent.toFixed(1)}% of income
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">US Avg: {c.usAvgPercent}%</p>
                        <p className={`text-xs font-medium ${c.status === "over" ? "text-red-500" : "text-green-500"}`}>
                          {c.status === "over" ? "+" : ""}{c.difference.toFixed(1)}%
                        </p>
                      </div>
                      {getStatusBadge(c.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Money-Saving Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.tips.map((tip, i) => (
                  <div key={i} className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-sm">{tip.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{tip.description}</p>
                      </div>
                      {tip.potentialSavings > 0 && (
                        <Badge variant="outline" className="whitespace-nowrap text-green-600 border-green-500/30">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Save {fmt.format(tip.potentialSavings)}/mo
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
