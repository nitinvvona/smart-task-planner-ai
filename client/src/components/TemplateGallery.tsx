import { X, Plane, Heart, Dumbbell, Wrench, Calendar, BookOpen, ShoppingCart, Briefcase, DollarSign, Home } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Template {
  id: string;
  name: string;
  icon: React.ReactNode;
  example: string;
  color: string;
}

const templates: Template[] = [
  { id: "travel", name: "Travel Planning", icon: <Plane className="h-8 w-8" />, example: "Plan a weekend trip to mountains", color: "from-blue-500 to-blue-600" },
  { id: "health", name: "Health & Medical", icon: <Heart className="h-8 w-8" />, example: "Find best dentist near me", color: "from-red-500 to-red-600" },
  { id: "sports", name: "Sports & Recreation", icon: <Dumbbell className="h-8 w-8" />, example: "Find gym with best membership", color: "from-green-500 to-green-600" },
  { id: "home", name: "Home Services", icon: <Wrench className="h-8 w-8" />, example: "Schedule home repairs", color: "from-yellow-500 to-yellow-600" },
  { id: "events", name: "Event Planning", icon: <Calendar className="h-8 w-8" />, example: "Organize team building event", color: "from-purple-500 to-purple-600" },
  { id: "learning", name: "Learning & Development", icon: <BookOpen className="h-8 w-8" />, example: "Learn web development", color: "from-cyan-500 to-cyan-600" },
  { id: "shopping", name: "Shopping & Errands", icon: <ShoppingCart className="h-8 w-8" />, example: "Plan grocery shopping", color: "from-pink-500 to-pink-600" },
  { id: "career", name: "Career & Professional", icon: <Briefcase className="h-8 w-8" />, example: "Prepare for job interview", color: "from-indigo-500 to-indigo-600" },
  { id: "finance", name: "Finance & Investment", icon: <DollarSign className="h-8 w-8" />, example: "Create investment plan", color: "from-emerald-500 to-emerald-600" },
  { id: "improvement", name: "Home Improvement", icon: <Home className="h-8 w-8" />, example: "Renovate kitchen", color: "from-orange-500 to-orange-600" },
];

interface TemplateGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: Template) => void;
}

export function TemplateGallery({ open, onOpenChange, onSelectTemplate }: TemplateGalleryProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="modal-template-gallery">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Choose a Template</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer overflow-hidden p-6 transition-all hover:-translate-y-1 hover:shadow-xl"
              onClick={() => {
                onSelectTemplate(template);
                onOpenChange(false);
              }}
              data-testid={`card-template-${template.id}`}
            >
              <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${template.color} p-3 text-white`}>
                {template.icon}
              </div>
              <h3 className="mb-2 font-semibold">{template.name}</h3>
              <p className="text-sm text-muted-foreground">{template.example}</p>
              <Button
                size="sm"
                className="mt-4 w-full"
                variant="outline"
                data-testid={`button-use-${template.id}`}
              >
                Use Template
              </Button>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
