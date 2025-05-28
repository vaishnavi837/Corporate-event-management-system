import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import CreateEvent from "@/pages/CreateEvent";
import Register from "@/pages/Register";
import EditEvent from "./pages/EditEvent";
import EditEventPeoples from "./pages/EditEventGuestsAttendies";
import EventsDashboard from "./pages/EventsDashboard";
import EventFeedback from "./pages/EventFeedback"; 
import EventFeedbackList from "./pages/EventFeedbackList"; // Add this import

function App() {
  return (
    <Router>
      <Routes><Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<EventsDashboard />} />
        <Route path="/event" element={<CreateEvent />} />
        <Route path="/event/:eventId" element={<EditEvent />} />
        <Route path="/event-peoples/:eventId" element={<EditEventPeoples />} />
        <Route path="/event/:eventId/feedback" element={<EventFeedback />} />
        <Route path="/event/:eventId/feedback/list" element={<EventFeedbackList />} /> {/* Add this new route */}
      </Routes>
    </Router>
  );
}

export default App;
