const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Admin", "Manager", "Employee"], required: true },
}, { timestamps: true });

// Event Schema
const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  agenda: { type: String },
  speakers: [{ name: String, designation: String }],
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  capacity: { type: Number, required: true },
  attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
  guests: [{ type: Schema.Types.ObjectId, ref: "Guest" }],
}, { timestamps: true });

// Guest Schema
const GuestSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  event: { type: Schema.Types.ObjectId, ref: "Event" },
  invitedBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

// RSVP Schema
const RSVPSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  event: { type: Schema.Types.ObjectId, ref: "Event" },
  status: { type: String, enum: ["Going", "Not Going", "Interested"], required: true },
}, { timestamps: true });

// Notification Schema
const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  event: { type: Schema.Types.ObjectId, ref: "Event" },
  message: { type: String, required: true },
  type: { type: String, enum: ["Email", "SMS", "Push"] },
  sentAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Feedback Schema
const FeedbackSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: "Event" },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
}, { timestamps: true });

module.exports = {
  User: mongoose.model("User", UserSchema),
  Event: mongoose.model("Event", EventSchema),
  Guest: mongoose.model("Guest", GuestSchema),
  RSVP: mongoose.model("RSVP", RSVPSchema),
  Notification: mongoose.model("Notification", NotificationSchema),
  Feedback: mongoose.model("Feedback", FeedbackSchema)
};
