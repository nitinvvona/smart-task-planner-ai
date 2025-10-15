import { LayoutList, LayoutGrid, Calendar } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type View = "list" | "kanban" | "calendar";

interface ViewToggleProps {
  view: View;
  onViewChange: (view: View) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <Tabs value={view} onValueChange={(v) => onViewChange(v as View)}>
      <TabsList data-testid="tabs-view-toggle">
        <TabsTrigger value="list" className="gap-2" data-testid="tab-list">
          <LayoutList className="h-4 w-4" />
          List
        </TabsTrigger>
        <TabsTrigger value="kanban" className="gap-2" data-testid="tab-kanban">
          <LayoutGrid className="h-4 w-4" />
          Kanban
        </TabsTrigger>
        <TabsTrigger value="calendar" className="gap-2" data-testid="tab-calendar">
          <Calendar className="h-4 w-4" />
          Calendar
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
