import { useState } from "react";
import { FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { toast } from "sonner";

interface PDFExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName?: string;
  onExport?: (options: any) => void;
  plan?: any;
}

export function PDFExportModal({ open, onOpenChange, planName = "My Plan", onExport, plan }: PDFExportModalProps) {
  const [format, setFormat] = useState("detailed");
  const [fileName, setFileName] = useState(planName);
  const [includeOptions, setIncludeOptions] = useState({
    summary: true,
    taskList: true,
    timeline: true,
    dependencies: false,
    budget: false,
    notes: false,
  });
  const [isExporting, setIsExporting] = useState(false);

  const toggleInclude = (key: keyof typeof includeOptions) => {
    setIncludeOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Create PDF document with jsPDF
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      // Add title
      doc.setFontSize(20);
      doc.text(fileName, 14, 22);
      
      // Add content based on selected options
      let yPos = 30;
      
      if (includeOptions.summary) {
        doc.setFontSize(16);
        doc.text("Executive Summary", 14, yPos);
        yPos += 10;
        // Add summary content here
      }
      
      if (includeOptions.taskList) {
        doc.setFontSize(16);
        doc.text("Task List", 14, yPos);
        yPos += 10;
        // Add task list content here
      }
      
      // Save the PDF
      doc.save(`${fileName.replace(/\s+/g, '_')}.pdf`);
      
      toast?.success("PDF exported successfully");
      onExport?.({ format, fileName, includeOptions });
      onOpenChange(false);
    } catch (error) {
      console.error("PDF export error:", error);
      toast?.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="modal-pdf-export">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-2xl">
            <FileText className="h-6 w-6" />
            Export Plan as PDF
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="mb-3 block font-semibold">Format</Label>
            <RadioGroup value={format} onValueChange={setFormat}>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer rounded-lg border p-3 hover-elevate">
                  <RadioGroupItem value="detailed" data-testid="radio-format-detailed" />
                  <div>
                    <div className="font-medium">Detailed Report</div>
                    <div className="text-sm text-muted-foreground">All task info + descriptions</div>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer rounded-lg border p-3 hover-elevate">
                  <RadioGroupItem value="summary" data-testid="radio-format-summary" />
                  <div>
                    <div className="font-medium">Summary Checklist</div>
                    <div className="text-sm text-muted-foreground">Task names + checkboxes only</div>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer rounded-lg border p-3 hover-elevate">
                  <RadioGroupItem value="timeline" data-testid="radio-format-timeline" />
                  <div>
                    <div className="font-medium">Timeline View</div>
                    <div className="text-sm text-muted-foreground">Gantt chart visualization</div>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer rounded-lg border p-3 hover-elevate">
                  <RadioGroupItem value="budget" data-testid="radio-format-budget" />
                  <div>
                    <div className="font-medium">Budget Report</div>
                    <div className="text-sm text-muted-foreground">Costs breakdown</div>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="mb-3 block font-semibold">Include in PDF</Label>
            <div className="space-y-2">
              {Object.entries({
                summary: "Executive Summary",
                taskList: "Task List by Phase",
                timeline: "Timeline Chart",
                dependencies: "Dependency Graph",
                budget: "Budget/Cost Tracking",
                notes: "Notes",
              }).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={includeOptions[key as keyof typeof includeOptions]}
                    onCheckedChange={() => toggleInclude(key as keyof typeof includeOptions)}
                    data-testid={`checkbox-include-${key}`}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="filename" className="mb-2 block font-semibold">File Name</Label>
            <Input
              id="filename"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
              data-testid="input-filename"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-export"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500"
              onClick={handleExport}
              disabled={isExporting}
              data-testid="button-download-pdf"
            >
              {isExporting ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
