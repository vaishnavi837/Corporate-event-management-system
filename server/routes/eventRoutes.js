const express = require("express");
const { Event, User, Guest, Feedback  } = require("../models/model"); // Adjust path if needed
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ date: -1 })
      .populate("attendees guests createdBy");
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events" });
  }
});

// Create a new event (Any authenticated user)
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { title, description, date, venue, agenda, speakers, capacity } = req.body;

    if (!title || !date || !venue || !capacity) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const newEvent = new Event({
      title,
      description,
      date,
      venue,
      agenda,
      speakers,
      capacity,
      createdBy: req.user.id, // Authenticated user
    });

    await newEvent.save();
    res.status(201).json({ message: "Event created successfully", event: newEvent });

  } catch (error) {
    res.status(500).json({ message: "Error creating event", error });
  }
});

// Search Users
router.get("/search-users", authMiddleware, async (req, res) => {
  try {
      const { query } = req.query;
      if (!query) {
          return res.status(400).json({ message: "Query parameter is required" });
      }
      
      const users = await User.find({
          $or: [
              { name: { $regex: query, $options: "i" } },
              { email: { $regex: query, $options: "i" } },
          ],
      }).select("name email").limit(10);

      res.status(200).json(users);
  } catch (error) {
      res.status(500).json({ message: "Error searching users", error });
  }
});

// Get event by ID
router.get("/:eventId", authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate("createdBy", "name email")
      .populate("attendees", "name email")
      .populate("guests", "name email");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Error fetching event", error });
  }
});


// Edit an event (Only creator can edit)
router.put("/edit/:eventId", authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id; // Logged-in user

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "You can only edit your own events" });
    }

    const { title, description, date, venue, agenda, speakers, capacity, attendees, guests } = req.body;

    // Update fields if provided
    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.venue = venue || event.venue;
    event.agenda = agenda || event.agenda;
    event.capacity = capacity || event.capacity;
    event.speakers = speakers || event.speakers;

    await event.save();
    res.status(200).json({ message: "Event updated successfully", event });

  } catch (error) {
    res.status(500).json({ message: "Error updating event", error });
  }
});

// Add attendee to event
router.post("/:eventId/add-attendee", authMiddleware, async (req, res) => {
    try {
      const { eventId } = req.params;
      const { email } = req.body;
      const userId = req.user.id;
  
      // Find the event
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ message: "Event not found" });
  
      // Only the event creator can add attendees
      if (event.createdBy.toString() !== userId) {
        return res.status(403).json({ message: "You are not allowed to add attendees" });
      }
  
      // Find user by email
      const attendee = await User.findOne({ email });
      if (!attendee) return res.status(404).json({ message: "User not found" });
  
      // Check if attendee is already added
      if (event.attendees.includes(attendee._id)) {
        return res.status(400).json({ message: "Attendee already added" });
      }
  
      // Check if event is full
      if (event.attendees.length >= event.capacity) {
        return res.status(400).json({ message: "Event is full" });
      }
  
      // Add attendee
      event.attendees.push(attendee._id);
      await event.save();
  
      res.status(200).json({ message: "Attendee added successfully", user: attendee });
  
    } catch (error) {
      res.status(500).json({ message: "Error adding attendee", error });
    }
  });
  
  // Remove attendee from event
  router.delete("/:eventId/remove-attendee/:userId", authMiddleware, async (req, res) => {
    try {
      const { eventId, userId } = req.params;
      const loggedInUserId = req.user.id;
  
      // Find the event
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ message: "Event not found" });
  
      // Only the event creator can remove attendees
      if (event.createdBy.toString() !== loggedInUserId) {
        return res.status(403).json({ message: "You are not allowed to remove attendees" });
      }
  
      // Remove attendee
      event.attendees = event.attendees.filter(attendeeId => attendeeId.toString() !== userId);
      await event.save();
  
      res.status(200).json({ message: "Attendee removed successfully" });
  
    } catch (error) {
      res.status(500).json({ message: "Error removing attendee", error });
    }
  });

// Register for an event (Self-registration)
router.post("/register/:eventId", authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check if user is already registered
    if (event.attendees.includes(userId)) {
      return res.status(400).json({ message: "You are already registered for this event" });
    }

    // Check if event is full
    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({ message: "Event is full" });
    }

    // Add user to attendees
    event.attendees.push(userId);
    await event.save();

    res.status(200).json({ message: "Successfully registered for event" });
  } catch (error) {
    res.status(500).json({ message: "Error registering for event", error });
  }
});

// Add Guest
router.post("/:eventId/add-guest", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const { eventId } = req.params;
    const userId = req.user.id;

    // Ensure event exists
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Create and save guest
    const guest = new Guest({ name, email, event: eventId, invitedBy: userId });
    await guest.save();

    // Add guest to event
    event.guests.push(guest._id);
    await event.save();

    res.status(201).json({ message: "Guest added", guest });
  } catch (error) {
    res.status(500).json({ message: "Error adding guest", error });
  }
});

// Remove Guest
router.delete("/:eventId/remove-guest/:guestId", authMiddleware, async (req, res) => {
  try {
    const { eventId, guestId } = req.params;

    // Ensure event and guest exist
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const guest = await Guest.findById(guestId);
    if (!guest) return res.status(404).json({ message: "Guest not found" });

    // Remove guest from event
    event.guests = event.guests.filter((id) => id.toString() !== guestId);
    await event.save();

    // Delete guest
    await Guest.findByIdAndDelete(guestId);

    res.json({ message: "Guest removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing guest", error });
  }
});

// Submit feedback for an event (only for attendees after event has ended)
router.post("/:eventId/feedback", authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Find the event
    const event = await Event.findById(eventId).populate("attendees");
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if event has ended
    const now = new Date();
    if (new Date(event.date) > now) {
      return res.status(400).json({ message: "Cannot submit feedback before event has ended" });
    }

    // Check if user was an attendee
    const wasAttendee = event.attendees.some(attendee => 
      attendee._id.toString() === userId
    );
    
    if (!wasAttendee) {
      return res.status(403).json({ message: "Only attendees can submit feedback" });
    }

    // Check if user has already submitted feedback
    const existingFeedback = await Feedback.findOne({ 
      event: eventId,
      user: userId 
    });

    if (existingFeedback) {
      // Update existing feedback
      existingFeedback.rating = rating;
      existingFeedback.comment = comment;
      await existingFeedback.save();
      return res.status(200).json({ message: "Feedback updated successfully" });
    }

    // Create new feedback
    const feedback = new Feedback({
      event: eventId,
      user: userId,
      rating,
      comment
    });

    await feedback.save();
    res.status(201).json({ message: "Feedback submitted successfully" });
    
  } catch (error) {
    res.status(500).json({ message: "Error submitting feedback", error });
  }
});

// Get feedback for an event
router.get("/:eventId/feedback", async (req, res) => {
  try {
    const { eventId } = req.params;

    // Find all feedback for this event
    const feedback = await Feedback.find({ event: eventId })
      .populate("user", "name");

    // Calculate average rating
    let totalRating = 0;
    feedback.forEach(item => {
      totalRating += item.rating;
    });
    const averageRating = feedback.length > 0 ? totalRating / feedback.length : 0;

    res.status(200).json({ 
      feedback,
      averageRating,
      totalFeedback: feedback.length
    });
    
  } catch (error) {
    res.status(500).json({ message: "Error fetching feedback", error });
  }
});


// Get user's feedback for an event
router.get("/:eventId/my-feedback", authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Find feedback for this user and event
    const feedback = await Feedback.findOne({ 
      event: eventId,
      user: userId 
    });

    if (!feedback) {
      return res.status(404).json({ message: "No feedback found" });
    }

    res.status(200).json(feedback);
    
  } catch (error) {
    res.status(500).json({ message: "Error fetching feedback", error });
  }
});


module.exports = router;
