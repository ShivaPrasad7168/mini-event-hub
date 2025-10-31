import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Search, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import { EventCard } from "@/components/EventCard";
import { EventDetailDialog } from "@/components/EventDetailDialog";
import { Event } from "@/types/event";
import { apiClient } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  // Fetch events
  const { data: events, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const data = await apiClient.get('/api/events');
      return data as Event[];
    },
  });

  // Get user location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast({
          title: "Location enabled",
          description: "Now showing distances from your location.",
        });
      },
      (error) => {
        toast({
          title: "Location access denied",
          description: "Please enable location access to see distances.",
          variant: "destructive",
        });
      }
    );
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2?: number, lon2?: number): number | undefined => {
    if (!lat2 || !lon2) return undefined;

    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter and search events
  const filteredEvents = useMemo(() => {
    if (!events) return [];

    return events.filter((event) => {
      const matchesSearch =
        searchQuery === "" ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLocation =
        locationFilter === "" ||
        event.location.toLowerCase().includes(locationFilter.toLowerCase());

      return matchesSearch && matchesLocation;
    });
  }, [events, searchQuery, locationFilter]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error loading events</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary py-20 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center text-white mb-8">
            <div className="flex justify-center mb-4">
              <Calendar className="h-16 w-16" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in">
              Discover Amazing Events
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              Find and join events near you or create your own
            </p>
            <CreateEventDialog />
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="container mx-auto max-w-6xl px-4 py-8">
        <div className="bg-card rounded-xl shadow-lg p-6 -mt-16 relative z-20" style={{ boxShadow: "var(--shadow-elegant)" }}>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={getUserLocation}
              className="w-full"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Enable Location
            </Button>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="container mx-auto max-w-6xl px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || locationFilter
                ? "Try adjusting your search filters"
                : "Be the first to create an event!"}
            </p>
            <CreateEventDialog />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">
                Upcoming Events ({filteredEvents.length})
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => setSelectedEvent(event)}
                  distance={
                    userLocation && event.latitude && event.longitude
                      ? calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          event.latitude,
                          event.longitude
                        )
                      : undefined
                  }
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Event Detail Dialog */}
      <EventDetailDialog
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
        distance={
          selectedEvent && userLocation && selectedEvent.latitude && selectedEvent.longitude
            ? calculateDistance(
                userLocation.lat,
                userLocation.lng,
                selectedEvent.latitude,
                selectedEvent.longitude
              )
            : undefined
        }
      />
    </div>
  );
};

export default Index;
