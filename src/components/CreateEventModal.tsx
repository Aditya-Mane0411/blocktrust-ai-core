import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, Plus, X, Clock } from "lucide-react";
import { format } from "date-fns";
import { useVoting } from "@/hooks/useVoting";
import { usePetition } from "@/hooks/usePetition";

interface Template {
  id: string;
  name: string;
  type: string;
  description: string;
  config: any;
}

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventType: 'voting' | 'petition';
  onSuccess: () => void;
}

export const CreateEventModal = ({ open, onOpenChange, eventType, onSuccess }: CreateEventModalProps) => {
  const { createEvent: createVotingEvent } = useVoting();
  const { createPetition } = usePetition();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [targetSignatures, setTargetSignatures] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [dateTimeError, setDateTimeError] = useState("");

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open, eventType]);

  // Validate date/time whenever they change
  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      if (end <= start) {
        setDateTimeError("End time must be after start time");
      } else {
        setDateTimeError("");
      }
    } else {
      setDateTimeError("");
    }
  }, [startTime, endTime]);

  const fetchTemplates = async () => {
    try {
      // Query database directly for active templates
      const { data, error } = await supabase
        .from('event_templates')
        .select('*')
        .eq('is_active', true)
        .eq('type', eventType);

      if (error) throw error;

      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template?.config) {
      // Pre-fill some fields based on template config
      if (eventType === 'voting' && template.config.candidates) {
        setOptions(template.config.candidates);
      }
      if (eventType === 'petition' && template.config.default_target) {
        setTargetSignatures(template.config.default_target);
      }
    }
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate dates before submission
    if (dateTimeError) {
      toast.error(dateTimeError);
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (end <= start) {
      toast.error("End time must be after start time");
      return;
    }

    setLoading(true);

    try {
      if (eventType === 'voting') {
        await createVotingEvent({
          title,
          description,
          options: options.filter(o => o.trim() !== ""),
          start_time: startTime,
          end_time: endTime,
        });
      } else {
        await createPetition({
          title,
          description,
          start_time: startTime,
          end_time: endTime,
          target_signatures: targetSignatures,
        });
      }

      onOpenChange(false);
      onSuccess();
      
      // Reset form
      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
      setOptions(["", ""]);
      setTargetSignatures(1000);
      setSelectedTemplate("");
    } catch (error: any) {
      console.error(`Error creating ${eventType}:`, error);
      // Toast already shown by hooks
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-deep-navy border-neon-cyan/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-neon-cyan">
            Create {eventType === 'voting' ? 'Voting Event' : 'Petition'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Select a template and configure your {eventType === 'voting' ? 'voting event' : 'petition campaign'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template" className="text-neon-cyan">Select Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger className="bg-deep-navy/50 border-neon-cyan/20">
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent className="bg-deep-navy border-neon-cyan/20">
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate && (
              <p className="text-sm text-gray-400">
                {templates.find(t => t.id === selectedTemplate)?.description}
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-neon-cyan">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-deep-navy/50 border-neon-cyan/20 text-black placeholder:text-gray-500"
              required
              placeholder={`Enter ${eventType} title...`}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-neon-cyan">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-deep-navy/50 border-neon-cyan/20 min-h-[100px] text-black placeholder:text-gray-500"
              required
              placeholder="Describe the purpose and details..."
            />
          </div>

          {/* Voting Options (only for voting events) */}
          {eventType === 'voting' && (
            <div className="space-y-2">
              <Label className="text-neon-cyan">Voting Options *</Label>
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="bg-deep-navy/50 border-neon-cyan/20 text-black placeholder:text-gray-500"
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeOption(index)}
                      className="border-red-500/50 text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="border-neon-cyan/50 text-neon-cyan"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          )}

          {/* Target Signatures (only for petitions) */}
          {eventType === 'petition' && (
            <div className="space-y-2">
              <Label htmlFor="target" className="text-neon-cyan">Target Signatures *</Label>
              <Input
                id="target"
                type="number"
                value={targetSignatures}
                onChange={(e) => setTargetSignatures(parseInt(e.target.value))}
                className="bg-deep-navy/50 border-neon-cyan/20 text-black"
                min={1}
                required
              />
            </div>
          )}

          {/* Time Range */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start" className="text-neon-cyan flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Start Time *
                </Label>
                <Input
                  id="start"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-deep-navy/50 border-neon-cyan/20 text-black [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  required
                  min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end" className="text-neon-cyan flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  End Time *
                </Label>
                <Input
                  id="end"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-deep-navy/50 border-neon-cyan/20 text-black [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  required
                  min={startTime || format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                />
              </div>
            </div>

            {/* Date/Time Validation Error */}
            {dateTimeError && (
              <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded p-3 flex items-center gap-2">
                <X className="h-4 w-4 flex-shrink-0" />
                <span>{dateTimeError}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedTemplate || !!dateTimeError}
              className="bg-gradient-to-r from-neon-cyan to-electric-purple hover:opacity-90"
            >
              {loading ? 'Creating...' : `Create ${eventType === 'voting' ? 'Event' : 'Petition'}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};