import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Search, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Data will be fetched from API
type ChartDataPoint = {
  name: string;
  tasks: number;
};

export function GanttChart({ data = [] }: { data?: ChartDataPoint[] }) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-xl font-semibold" data-testid="text-gantt-heading">
          Gantt Timeline
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" data-testid="button-search-chart">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" data-testid="button-expand-chart">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="h-64" data-testid="chart-gantt">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            <defs>
              <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <Line
              type="monotone"
              dataKey="tasks"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              activeDot={{ r: 6 }}
              fill="url(#colorTasks)"
            />
          </LineChart>
        </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No timeline data available</p>
          </div>
        )}
        </div>
    </Card>
  );
}
