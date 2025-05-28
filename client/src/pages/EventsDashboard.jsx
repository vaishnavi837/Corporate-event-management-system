import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { format, isFuture, isPast } from "date-fns";
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";
import Header from "@/pages/Header";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { axiosInstanceLoggedIn } from "@/services/api";

export default function EventsDashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filter, setFilter] = useState("attending");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showGuests, setShowGuests] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axiosInstanceLoggedIn.get("/api/events");
        setEvents(res.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    if (!loading && !user) {
      navigate("/login");
    } else {
      fetchEvents();
    }
  }, []);

  useEffect(() => {
    const now = new Date();
    if (filter === "attending") {
      setFilteredEvents(
        events.filter((event) =>
          event.attendees.some((attendee) => attendee?._id === user?._id)
        )
      );
    } else if (filter === "upcoming") {
      setFilteredEvents(events.filter((event) => isFuture(new Date(event.date))));
    } else if (filter === "past") {
      setFilteredEvents(events.filter((event) => isPast(new Date(event.date))));
    }
  }, [events, filter]);

  const handleRegister = async (eventId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setIsRegistering(true);
      await axiosInstanceLoggedIn.post(`/api/events/register/${eventId}`);

      setEvents(
        events.map((event) => {
          if (event._id === eventId) {
            return {
              ...event,
              attendees: [...event.attendees, user],
            };
          }
          return event;
        })
      );

      alert("Successfully registered for event!");
    } catch (error) {
      console.error("Error registering for event:", error);
      alert(error.response?.data?.message || "Error registering for event");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSeeGuests = (eventId) => {
    setShowGuests((prevState) => ({
      ...prevState,
      [eventId]: !prevState[eventId],
    }));
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url(../public/image.png)" }}
    >
      <Header />
      <div className="p-4 space-y-6 flex-grow bg-white/80 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900">Events Dashboard</h1>

        {/* Filter Buttons */}
        <div className="flex space-x-4">
          <Button
            variant={filter === "attending" ? "default" : "outline"}
            className={filter === "attending" ? "" : "text-black"}
            onClick={() => setFilter("attending")}
          >
            Attending
          </Button>
          <Button
            variant={filter === "upcoming" ? "default" : "outline"}
            className={filter === "upcoming" ? "" : "text-black"}
            onClick={() => setFilter("upcoming")}
          >
            Upcoming
          </Button>
          <Button
            variant={filter === "past" ? "default" : "outline"}
            className={filter === "past" ? "" : "text-black"}
            onClick={() => setFilter("past")}
          >
            Past
          </Button>
        </div>

        {/* Event Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Card key={event._id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                      <span className="text-sm">
                        {format(new Date(event.date), "PPP")} at{" "}
                        {format(new Date(event.date), "p")}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="mr-2 h-4 w-4 opacity-70" />
                      <span className="text-sm">{event.venue}</span>
                    </div>
                    <div className="flex items-center">
                      <UsersIcon className="mr-2 h-4 w-4 opacity-70" />
                      <span className="text-sm">Capacity: {event.capacity}</span>
                    </div>
                  </div>
                  <Separator className="my-4" />

                  {/* Speakers */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Speakers:</h4>
                    <div className="flex flex-wrap gap-2">
                      {event.speakers.map((speaker, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{speaker.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <p className="font-medium">{speaker.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {speaker.designation}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="mt-4">
                       <div className="mt-4">
                        <h4 className="text-sm font-semibold mb-2">Guests:</h4>
                        <div className="flex flex-wrap gap-2">
                          {event.guests.map((guest, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>{guest.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="text-sm">
                                <p className="font-medium">{guest.name}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Badge variant="outline">{event.agenda}</Badge>
                  <div className="space-x-2">
                    {event?.createdBy?._id === user?._id && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/event/${event._id}`)}
                        >
                          Edit
                        </Button>
                        {isPast(new Date(event.date)) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(`/event/${event._id}/feedback/list`)
                            }
                          >
                            View Feedback
                          </Button>
                        )}
                      </>
                    )}
                    {isPast(new Date(event.date)) &&
                    event.attendees.some((attendee) => attendee._id === user?._id) ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/event/${event._id}/feedback`)}
                      >
                        Leave Feedback
                      </Button>
                    ) : event.attendees.some(
                        (attendee) => attendee._id === user?._id
                      ) ? (
                      <Button size="sm" variant="secondary" disabled>
                        Registered
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleRegister(event._id)}
                        disabled={isRegistering}
                      >
                        {isRegistering ? "Registering..." : "Register"}
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500 w-full">No events found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
