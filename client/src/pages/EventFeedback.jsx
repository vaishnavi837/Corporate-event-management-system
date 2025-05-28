import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/pages/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/Textarea"; // You'll need to create this component
import { Star, StarHalf, StarOff } from "lucide-react";
import { format } from "date-fns";
import { axiosInstanceLoggedIn } from "@/services/api";

export default function EventFeedback() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [event, setEvent] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [existingFeedback, setExistingFeedback] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    } else {
      fetchEvent();
      fetchExistingFeedback();
    }
  }, [user, loading]);

  const fetchEvent = async () => {
    try {
      const response = await axiosInstanceLoggedIn.get(`/api/events/${eventId}`);
      setEvent(response.data);
      
      // Check if event has ended
      if (new Date(response.data.date) > new Date()) {
        setError("Cannot leave feedback before the event has ended");
      }
      
      // Check if user was an attendee
      const isAttendee = response.data.attendees.some(
        attendee => attendee._id === user?._id
      );
      
      if (!isAttendee) {
        setError("You must have attended this event to leave feedback");
      }
      
    } catch (error) {
      setError("Failed to load event details");
    }
  };

  const fetchExistingFeedback = async () => {
    try {
      // We'll need to create this endpoint to get user's specific feedback
      const response = await axiosInstanceLoggedIn.get(`/api/events/${eventId}/my-feedback`);
      if (response.data) {
        setExistingFeedback(response.data);
        setRating(response.data.rating);
        setComment(response.data.comment);
      }
    } catch (error) {
      // No feedback exists yet, that's fine
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await axiosInstanceLoggedIn.post(`/api/events/${eventId}/feedback`, {
        rating,
        comment
      });
      
      setSuccess("Thank you for your feedback!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
      
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center" 
    style={{ backgroundImage: 'url(../public/image.png)' }}>
      <Header />
      <div className="p-4 space-y-6 flex-grow flex items-center justify-center">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold">Event Feedback</CardTitle>
            {event && (
              <CardDescription className="text-center">
                {event.title} - {event.date && format(new Date(event.date), "PPP")}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <p className="mb-2 font-medium">Your Rating:</p>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="focus:outline-none"
                    >
                      {rating >= value ? (
                        <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <Star className="w-8 h-8 text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="mb-2 font-medium">Comments:</p>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  rows={4}
                  className="w-full p-3 border rounded-md"
                />
              </div>
              
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!rating || isSubmitting || !!error}
                >
                  {isSubmitting ? "Submitting..." : existingFeedback ? "Update Feedback" : "Submit Feedback"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}