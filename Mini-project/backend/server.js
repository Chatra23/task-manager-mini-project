import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { randomUUID } from "node:crypto";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    // Allow requests without an Origin header (e.g. curl / API tools).
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  }
}));
app.use(express.json());

let tasks = [
  { id: randomUUID(), title: "Explore the Task Manager", completed: false, createdAt: new Date().toISOString() },
  { id: randomUUID(), title: "Add your first task", completed: true, createdAt: new Date().toISOString() }
];

app.get("/", (_req, res) => {
  res.json({ message: "Task Manager API is running", endpoints: ["/api/health", "/api/tasks"] });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "task-manager-api", timestamp: new Date().toISOString() });
});

app.get("/api/tasks", (_req, res) => {
  res.json(tasks);
});

app.post("/api/tasks", (req, res) => {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  if (!title) return res.status(400).json({ message: "Task title is required." });
  if (title.length > 120) return res.status(400).json({ message: "Task title must be 120 characters or fewer." });

  const task = {
    id: randomUUID(),
    title,
    completed: false,
    createdAt: new Date().toISOString()
  };
  tasks.unshift(task);
  return res.status(201).json(task);
});

app.patch("/api/tasks/:id", (req, res) => {
  const task = tasks.find((item) => item.id === req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found." });
  if (typeof req.body?.completed !== "boolean") {
    return res.status(400).json({ message: "completed must be true or false." });
  }
  task.completed = req.body.completed;
  return res.json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  const previousLength = tasks.length;
  tasks = tasks.filter((item) => item.id !== req.params.id);
  if (tasks.length === previousLength) return res.status(404).json({ message: "Task not found." });
  return res.status(204).end();
});

app.use((err, _req, res, _next) => {
  console.error(err.message);
  if (err.message === "Origin is not allowed by CORS") {
    return res.status(403).json({ message: "This website is not allowed to access the API." });
  }
  return res.status(500).json({ message: "Unexpected server error." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Task Manager API listening on port ${PORT}`);
});
