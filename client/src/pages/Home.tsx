import { useState } from "react";
import { GoalInputModal } from "@/components/GoalInputModal";
import { TemplateGallery } from "@/components/TemplateGallery";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (goal: string, constraints?: string) => {
    if (!goal.trim()) return;
    
    setIsGenerating(true);
    try {
      // Send the goal to the API to generate and save a plan
      const response = await fetch('/api/generate-and-save-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: goal,
          goal,
          constraints
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }
      
      toast({
        title: "Plan generated successfully!",
        description: "Redirecting to dashboard...",
      });
      
      // Navigate to dashboard after successful plan generation
      setLocation("/dashboard");
    } catch (error) {
      console.error('Error generating plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <GoalInputModal
        onGenerate={handleGenerate}
        onUseTemplate={() => setTemplateModalOpen(true)}
        isGenerating={isGenerating}
      />
      <TemplateGallery
        open={templateModalOpen}
        onOpenChange={setTemplateModalOpen}
        onSelectTemplate={(template) => {
          console.log("Selected template:", template);
          setTemplateModalOpen(false);
        }}
      />
    </>
  );
}
