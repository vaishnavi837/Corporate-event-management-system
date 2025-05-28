import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/pages/Header";  // Import the Header component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { axiosInstanceLoggedIn } from "@/services/api";
import { isPast } from "date-fns";

export default function EditEvent() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { eventId } = useParams(); // Get event ID from URL params

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    agenda: "",
    capacity: "",
    speakers: [{ name: "", designation: "" }],
    attendees: [],
    guests: [],
  });

  const [error, setError] = useState("");
  const [eventCreator, setEventCreator] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axiosInstanceLoggedIn.get(`/api/events/${eventId}`, {
        });

        setFormData(res.data);
        setEventCreator(res.data.createdBy);
      } catch (error) {
        setError("Event not found");
      }
    };

    if (!loading && !user) {
      navigate("/login");
    } else {
      fetchEvent();
    }
  }, [user, loading, navigate, eventId]);

  const handleChange = (e, index = null, field = null) => {
    if (index !== null && field) {
      const updatedSpeakers = [...formData.speakers];
      updatedSpeakers[index][field] = e.target.value;
      setFormData({ ...formData, speakers: updatedSpeakers });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const addSpeaker = () => {
    setFormData({
      ...formData,
      speakers: [...formData.speakers, { name: "", designation: "" }],
    });
  };

  const removeSpeaker = (index) => {
    const updatedSpeakers = formData.speakers.filter((_, i) => i !== index);
    setFormData({ ...formData, speakers: updatedSpeakers });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user._id !== eventCreator._id) {
      setError("You can only edit your own events");
      return;
    }
    try {
      await axiosInstanceLoggedIn.put(
        `/api/events/edit/${eventId}`,
        formData
      );
      navigate("/dashboard");
    } catch (err) {
      setError("Error updating event");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center" 
    style={{ backgroundImage: 'url(../public/image.png)' }}>
      <Header />  {/* Add the Header component */}
      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold">Edit Event</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input name="title" value={formData.title} placeholder="Event Title" onChange={handleChange} required />
              <Input name="description" value={formData.description} placeholder="Description" onChange={handleChange} />

              <DateTimePicker
                mongooseDateTime={formData.date ? formData.date : new Date()}
                onChange={(date) => setFormData({ ...formData, date: date.toISOString() })}
              />

              <Input name="venue" value={formData.venue} placeholder="Venue" onChange={handleChange} required />
              <Input name="agenda" value={formData.agenda} placeholder="Agenda" onChange={handleChange} />
              <Input name="capacity" type="number" value={formData.capacity} placeholder="Capacity" onChange={handleChange} required />

              {/* Dynamic Speaker Fields */}
              <div className="space-y-2">
                <p className="text-lg font-semibold">Speakers</p>
                {formData.speakers.map((speaker, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input placeholder="Name" value={speaker.name} onChange={(e) => handleChange(e, index, "name")} required />
                    <Input placeholder="Designation" value={speaker.designation} onChange={(e) => handleChange(e, index, "designation")} required />
                    {index > 0 && <Button type="button" className="bg-red-500" onClick={() => removeSpeaker(index)}>✖</Button>}
                  </div>
                ))}
                <Button type="button" className="mt-2 w-full" onClick={addSpeaker}>➕ Add Speaker</Button>
              </div>

              <Button type="button" className="mt-2 w-full" onClick={() => navigate(`/event-peoples/${eventId}`)}>Manage Guests and Attendees</Button>
              
              {formData.date && isPast(new Date(formData.date)) && (
                <Button 
                  type="button" 
                  className="mt-2 w-full" 
                  variant="outline"
                  onClick={() => navigate(`/event/${eventId}/feedback/list`)}
                >
                  View Feedback
                </Button>
              )}
              
              <Button type="submit" className="w-full">Update Event</Button>
              
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
