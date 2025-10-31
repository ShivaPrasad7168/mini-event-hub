import { Calendar, MapPin, Users, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/types/event";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface EventDetailDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  distance?: number;
}

export const EventDetailDialog = ({
  event,
  open,
  onOpenChange,
  distance,
}: EventDetailDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const joinEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { data: currentEvent, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (fetchError) throw fetchError;

      if (currentEvent.current_participants >= currentEvent.max_participants) {
        throw new Error("Event is full");
      }

      const { error: updateError } = await supabase
        .from("events")
        .update({
          current_participants: currentEvent.current_participants + 1,
        })
        .eq("id", eventId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Successfully joined!",
        description: "You're now registered for this event.",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join event. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!event) return null;

  const spotsLeft = event.max_participants - event.current_participants;
  const isFull = spotsLeft === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-2xl pr-8">{event.title}</DialogTitle>
            {isFull ? (
              <Badge variant="destructive">Full</Badge>
            ) : (
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                {spotsLeft} spots left
              </Badge>
            )}
          </div>
          <DialogDescription className="text-base pt-2">
            {event.description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Date & Time</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.date), "PPPP")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.date), "p")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{event.location}</p>
                {distance !== undefined && (
                  <p className="text-sm text-primary font-medium mt-1">
                    {distance.toFixed(1)} km from your location
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Participants</p>
                <p className="text-sm text-muted-foreground">
                  {event.current_participants} out of {event.max_participants} registered
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.created_at), "PPP")}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={() => joinEventMutation.mutate(event.id)}
              disabled={isFull || joinEventMutation.isPending}
              className="flex-1 bg-gradient-to-r from-primary to-secondary"
            >
              {joinEventMutation.isPending
                ? "Joining..."
                : isFull
                ? "Event Full"
                : "Join Event"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
