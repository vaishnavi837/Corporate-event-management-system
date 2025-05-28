import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/pages/Header";
import { format } from "date-fns";
import { Star } from "lucide-react";
import { axiosInstanceLoggedIn } from "@/services/api";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function EventFeedbackList() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [event, setEvent] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalFeedback, setTotalFeedback] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }
    
    fetchEventDetails();
    fetchFeedback();
  }, [eventId, user, loading]);

  const fetchEventDetails = async () => {
    try {
      const response = await axiosInstanceLoggedIn.get(`/api/events/${eventId}`);
      setEvent(response.data);
      
      // Check if the current user is the creator of the event
      if (response.data.createdBy._id !== user?._id) {
        setError("You do not have permission to view this feedback");
        return;
      }
    } catch (error) {
      setError("Failed to load event details");
      console.error("Error fetching event:", error);
    }
  };

  const fetchFeedback = async () => {
    try {
      const response = await axiosInstanceLoggedIn.get(`/api/events/${eventId}/feedback`);
      setFeedback(response.data.feedback);
      setAverageRating(response.data.averageRating);
      setTotalFeedback(response.data.totalFeedback);
    } catch (error) {
      setError("Failed to load feedback");
      console.error("Error fetching feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render stars based on rating
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-5 h-5 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
          />
        ))}
      </div>
    );
  };

  if (loading || isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <div className="flex-grow flex items-center justify-center p-4">
          <Alert variant="destructive" className="w-full max-w-lg">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button className="mt-4" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center" 
    style={{ backgroundImage: 'url(../public/image.png)' }}>
      <Header />
      <div className="p-4 space-y-6 flex-grow">
        {event && (
          <div className="container mx-auto max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                <p className="text-gray-600">{format(new Date(event.date), "PPP")}</p>
              </div>
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Feedback Summary</CardTitle>
                <CardDescription>
                  {totalFeedback} {totalFeedback === 1 ? 'attendee has' : 'attendees have'} provided feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                  <div className="flex items-center">
                    {renderStars(Math.round(averageRating))}
                    <span className="ml-2 text-sm text-gray-600">({totalFeedback} ratings)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-xl font-semibold mb-4">All Feedback</h2>
            
            {feedback.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No feedback has been submitted for this event yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {feedback.map((item, index) => (
                  <Card key={item._id || index}>
                    <CardHeader>
                      <div className="flex justify-between">
                        <CardTitle className="text-lg">{item.user?.name || "Anonymous"}</CardTitle>
                        <div className="flex">{renderStars(item.rating)}</div>
                      </div>
                      <CardDescription>
                        {item.createdAt && format(new Date(item.createdAt), "PPP 'at' p")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {item.comment ? (
                        <p>{item.comment}</p>
                      ) : (
                        <p className="text-gray-500 italic">No comment provided</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}