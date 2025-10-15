import { useState, useEffect } from "react";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlanCard } from "@/components/PlanCard";
import { FilterPanel } from "@/components/FilterPanel";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [plans, setPlans] = useState([]);

  const fetchPlans = () => {
    fetch('/api/plans')
      .then(res => res.json())
      .then(setPlans)
      .catch(console.error);
  };

  useEffect(() => {
    fetchPlans();
    
    // Refresh plans every 5 seconds to get updated task counts
    const interval = setInterval(fetchPlans, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleDeletePlan = (id) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      fetch(`/api/plans/${id}`, {
        method: 'DELETE',
      })
        .then(res => {
          if (res.ok) {
            fetchPlans(); // Refresh plans after deletion
          } else {
            console.error('Failed to delete plan');
          }
        })
        .catch(console.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold" data-testid="text-dashboard-heading">
          Task Planner
        </h1>
        <Button
          className="bg-gradient-to-r from-purple-600 to-purple-500"
          onClick={() => setLocation("/")}
          data-testid="button-create-plan"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create Plan
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search plans..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
          data-testid="input-search-plans"
        />
        <Select defaultValue="all">
          <SelectTrigger className="w-40" data-testid="select-category-filter">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="travel">Travel</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="sports">Sports</SelectItem>
            <SelectItem value="events">Events</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="recent">
          <SelectTrigger className="w-40" data-testid="select-sort">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Date Created</SelectItem>
            <SelectItem value="deadline">Deadline</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
        <FilterPanel trigger={
          <Button variant="outline" data-testid="button-filters">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        } />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.length === 0 ? (
          <p>No plans available. Create one to get started!</p>
        ) : (
          plans.map((plan) => (
            <PlanCard
              key={plan.id}
              id={plan.id}
              title={plan.title}
              completedTasks={plan.completedTasks || 0}
              totalTasks={plan.totalTasks || 0}
              progress={plan.progress || 0}
              color={plan.color || "purple"}
              isCompleted={plan.isCompleted}
              onClick={() => setLocation(`/plan/${plan.id}`)}
              onDelete={handleDeletePlan}
            />
          ))
        )}
      </div>
    </div>
  );
}