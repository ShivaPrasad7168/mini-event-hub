import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Event } from "@/types/event";
import { format } from "date-fns";

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  location: z.string().min(3, "Location must be at least 3 characters").max(100),
  date: z.string().refine((date) => new Date(date) > new Date(), {
    message: "Event date must be in the future",
  }),
  max_participants: z.coerce.number().min(1, "Must have at least 1 participant").max(1000),
  category: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EditEventDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditEventDialog = ({ event, open, onOpenChange }: EditEventDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      date: "",
      max_participants: 10,
      category: "",
    },
  });

  // Update form when event changes
  useEffect(() => {
    if (event) {
      // Format date for datetime-local input
      const formattedDate = format(new Date(event.date), "yyyy-MM-dd'T'HH:mm");
      form.reset({
        title: event.title,
        description: event.description,
        location: event.location,
        date: formattedDate,
        max_participants: event.max_participants,
        category: event.category || "",
      });
    }
  }, [event, form]);

  const updateEventMutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      if (!event) throw new Error("No event selected");

      // Validate max_participants is not less than current_participants
      if (values.max_participants < event.current_participants) {
        throw new Error(
          `Maximum participants cannot be less than current participants (${event.current_participants})`
        );
      }

      const data = await apiClient.put(`/api/events/${event.id}`, {
        title: values.title,
        description: values.description,
        location: values.location,
        date: values.date,
        maxParticipants: values.max_participants,
        category: values.category,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Success!",
        description: "Event has been updated successfully.",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: EventFormValues) => {
    updateEventMutation.mutate(values);
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Event
          </DialogTitle>
          <DialogDescription>
            Update the event details. Make sure all required fields are filled.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Summer Tech Meetup" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your event..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="San Francisco, CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="max_participants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Participants</FormLabel>
                  <FormControl>
                    <Input type="number" min={event.current_participants} {...field} />
                  </FormControl>
                  <FormDescription>
                    Must be at least {event.current_participants} (current participants)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tech, Music, Sports" {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional category for your event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateEventMutation.isPending}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                {updateEventMutation.isPending ? "Updating..." : "Update Event"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
