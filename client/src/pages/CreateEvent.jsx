import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // Import auth context
import Header from "@/pages/Header";  // Import the Header component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { createEvent } from "@/services/api";
import { DateTimePicker } from "@/components/ui/date-time-picker";

export default function CreateEvent() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    agenda: "",
    capacity: "",
    speakers: [{ name: "", designation: "" }],
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login"); // Redirect to login if not authenticated
    }
  }, [user, loading, navigate]);

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
    try {
      await createEvent(formData);
      navigate("/dashboard");
    } catch (err) {
      setError("Error creating event");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />  {/* Add the Header component */}
      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold">Create Event</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Input name="title" placeholder="Event Title" onChange={handleChange} required />
              <Input name="description" placeholder="Description" onChange={handleChange} />
              <DateTimePicker
                onChange={(date) => setFormData({ ...formData, date: date.toISOString() })
              }
              />
              <Input name="venue" placeholder="Venue" onChange={handleChange} required />
              <Input name="agenda" placeholder="Agenda" onChange={handleChange} />
              <Input name="capacity" type="number" placeholder="Capacity" onChange={handleChange} required />

              {/* Dynamic Speaker Fields */}
              <div className="space-y-2">
                <p className="text-lg font-semibold">Speakers</p>
                {formData.speakers.map((speaker, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      placeholder="Name"
                      value={speaker.name}
                      onChange={(e) => handleChange(e, index, "name")}
                      required
                    />
                    <Input
                      placeholder="Designation"
                      value={speaker.designation}
                      onChange={(e) => handleChange(e, index, "designation")}
                      required
                    />
                    {index > 0 && (
                      <Button type="button" className="bg-red-500" onClick={() => removeSpeaker(index)}>
                        ✖
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" className="mt-2 w-full" onClick={addSpeaker}>
                  ➕ Add Speaker
                </Button>
              </div>

              <Button type="submit" className="w-full">Create Event</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
