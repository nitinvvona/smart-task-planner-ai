import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const priorityOptions = [
  "Speed/Time", "Cost Efficiency", "Quality/Excellence", "Convenience",
  "Safety/Security", "Sustainability", "Local/Nearby", "Flexibility",
  "Privacy", "Social/Collaborative"
];

const resourceConstraints = [
  "Limited team/help available", "Work around existing commitments",
  "Physical location restrictions", "Technology/equipment limitations",
  "Skill/knowledge gaps", "Legal/regulatory requirements",
  "Third-party dependencies", "Weather/seasonal factors",
  "Health/accessibility needs", "Cultural/religious considerations"
];

interface GoalInputModalProps {
  onGenerate: (goal: string, constraints?: string) => void;
  onUseTemplate: () => void;
  isGenerating?: boolean;
}

export function GoalInputModal({ onGenerate, onUseTemplate, isGenerating = false }: GoalInputModalProps) {
  const [goal, setGoal] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedConstraints, setSelectedConstraints] = useState<string[]>([]);

  const togglePriority = (priority: string) => {
    if (selectedPriorities.includes(priority)) {
      setSelectedPriorities(selectedPriorities.filter(p => p !== priority));
    } else if (selectedPriorities.length < 3) {
      setSelectedPriorities([...selectedPriorities, priority]);
    }
  };

  const toggleConstraint = (constraint: string) => {
    if (selectedConstraints.includes(constraint)) {
      setSelectedConstraints(selectedConstraints.filter(c => c !== constraint));
    } else {
      setSelectedConstraints([...selectedConstraints, constraint]);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      <Card className="w-full max-w-2xl backdrop-blur-xl bg-card/80 p-8 shadow-2xl">
        <h2 className="mb-6 font-heading text-3xl font-bold" data-testid="text-goal-heading">
          What's your goal?
        </h2>
        
        <div className="space-y-6">
          <div>
            <Textarea
              placeholder="Enter your goal (e.g., 'Plan a weekend camping trip', 'Find the best gym near me', 'Organize a team building event')"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="min-h-32 resize-none text-base"
              maxLength={500}
              data-testid="input-goal"
            />
            <div className="mt-2 text-right text-sm text-muted-foreground" data-testid="text-character-count">
              {goal.length}/500
            </div>
          </div>

          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="flex w-full items-center justify-between rounded-lg p-3 text-left hover-elevate active-elevate-2"
            data-testid="button-advanced-options"
          >
            <span className="flex items-center gap-2">
              Advanced Options <span className="rounded-full bg-muted px-2 py-0.5 text-xs">(Optional)</span>
            </span>
            {isAdvancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {isAdvancedOpen && (
            <div className="space-y-6 rounded-lg border p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Select>
                    <SelectTrigger id="timeframe" data-testid="select-timeframe">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This week</SelectItem>
                      <SelectItem value="2weeks">2 weeks</SelectItem>
                      <SelectItem value="month">1 month</SelectItem>
                      <SelectItem value="3months">3 months</SelectItem>
                      <SelectItem value="6months">6 months</SelectItem>
                      <SelectItem value="year">1 year</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="budget">Budget Constraint</Label>
                  <div className="flex gap-2">
                    <Input
                      id="budget"
                      type="number"
                      placeholder="Amount"
                      data-testid="input-budget"
                    />
                    <Select defaultValue="usd">
                      <SelectTrigger className="w-24" data-testid="select-currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD</SelectItem>
                        <SelectItem value="inr">INR</SelectItem>
                        <SelectItem value="eur">EUR</SelectItem>
                        <SelectItem value="gbp">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <Label>Priority Focus (max 3)</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {priorityOptions.map((priority) => (
                    <button
                      key={priority}
                      onClick={() => togglePriority(priority)}
                      className={`rounded-full px-3 py-1.5 text-sm transition-all ${
                        selectedPriorities.includes(priority)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover-elevate"
                      }`}
                      disabled={!selectedPriorities.includes(priority) && selectedPriorities.length >= 3}
                      data-testid={`chip-priority-${priority.toLowerCase().replace(/\//g, '-')}`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Resource Constraints</Label>
                <div className="mt-2 space-y-2">
                  {resourceConstraints.map((constraint) => (
                    <label key={constraint} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedConstraints.includes(constraint)}
                        onCheckedChange={() => toggleConstraint(constraint)}
                        data-testid={`checkbox-constraint-${constraint.toLowerCase().replace(/\//g, '-')}`}
                      />
                      <span className="text-sm">{constraint}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="additional">Additional Constraints</Label>
                <Textarea
                  id="additional"
                  placeholder="Any other specific requirements, preferences, or constraints?"
                  className="mt-2 resize-none"
                  rows={2}
                  data-testid="input-additional-constraints"
                />
              </div>

              <button
                onClick={() => {
                  setSelectedPriorities([]);
                  setSelectedConstraints([]);
                }}
                className="text-sm text-primary hover:underline"
                data-testid="button-reset-defaults"
              >
                Reset to Defaults
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500"
              size="lg"
              onClick={() => {
                // Prepare constraints string from selected priorities and constraints
                const constraintsStr = [
                  selectedPriorities.length > 0 ? `Priorities: ${selectedPriorities.join(', ')}` : '',
                  selectedConstraints.length > 0 ? `Constraints: ${selectedConstraints.join(', ')}` : ''
                ].filter(Boolean).join('. ');
                
                onGenerate(goal, constraintsStr || undefined);
              }}
              disabled={!goal.trim() || isGenerating}
              data-testid="button-generate-plan"
            >
              {isGenerating ? (
                <>
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Plan
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              size="lg"
              onClick={onUseTemplate}
              disabled={isGenerating}
              data-testid="button-use-template"
            >
              Use Template
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
