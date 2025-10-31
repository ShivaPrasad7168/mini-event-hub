import { Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/types/event";
import { format } from "date-fns";

interface EventCardProps {
  event: Event;
  onClick: () => void;
  distance?: number;
}

export const EventCard = ({ event, onClick, distance }: EventCardProps) => {
  const spotsLeft = event.max_participants - event.current_participants;
  const isFull = spotsLeft === 0;

  return (
    <Card 
      className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
      onClick={onClick}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {event.title}
          </CardTitle>
          {isFull ? (
            <Badge variant="destructive">Full</Badge>
          ) : (
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
              {spotsLeft} spots left
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2">{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(event.date), "PPP 'at' p")}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{event.location}</span>
          {distance !== undefined && (
            <span className="text-primary font-medium ml-auto">
              {distance.toFixed(1)} km away
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {event.current_participants} / {event.max_participants} participants
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
