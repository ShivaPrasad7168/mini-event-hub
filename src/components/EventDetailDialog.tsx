import { useState } from "react";
import { Calendar, MapPin, Users, Clock, Pencil, Trash2, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/types/event";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EditEventDialog } from "./EditEventDialog";

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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const joinEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiClient.put(`/api/events/${eventId}/join`);
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

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiClient.delete(`/api/events/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted.",
      });
      setShowDeleteDialog(false);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!event) return null;

  const spotsLeft = Math.max(0, event.max_participants - event.current_participants);
  const isFull = spotsLeft === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto custom-scrollbar">
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
            {event.category && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Tag className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Category</p>
                  <Badge variant="outline" className="mt-1">
                    {event.category}
                  </Badge>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-3 pt-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(true)}
                className="flex-1"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="flex-1 text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
            <div className="flex gap-3">
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
        </div>
      </DialogContent>

      {/* Edit Dialog */}
      <EditEventDialog
        event={event}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              "{event.title}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEventMutation.mutate(event.id)}
              disabled={deleteEventMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEventMutation.isPending ? "Deleting..." : "Delete Event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
