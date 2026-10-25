import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const request = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `Request failed (${response.status})`);
    }
    if (response.status === 204) return null;
    return response.json();
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setTasks(await request("/api/tasks"));
    } catch (err) {
      setError(`${err.message}. Check the backend URL and ensure the API is running.`);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const counts = useMemo(() => ({
    total: tasks.length,
    active: tasks.filter((task) => !task.completed).length,
    completed: tasks.filter((task) => task.completed).length
  }), [tasks]);

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  }), [tasks, filter]);

  async function addTask(event) {
    event.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const task = await request("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ title })
      });
      setTasks((current) => [task, ...current]);
      setTitle("");
      setNotice("Task added successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleTask(task) {
    setError("");
    try {
      const updated = await request(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !task.completed })
      });
      setTasks((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (err) { setError(err.message); }
  }

  async function deleteTask(id) {
    setError("");
    try {
      await request(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks((current) => current.filter((task) => task.id !== id));
      setNotice("Task deleted.");
    } catch (err) { setError(err.message); }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="TaskFlow home">
          <span className="brand-mark">✓</span><span>taskflow</span>
        </a>
        <span className="status"><span className="status-dot" /> Simple productivity</span>
      </header>

      <section className="hero">
        <p className="eyebrow">YOUR DAY, IN FOCUS</p>
        <h1>Make room for<br /><span>what matters.</span></h1>
        <p className="hero-copy">A little progress every day adds up. Capture your tasks, keep your focus, and celebrate getting things done.</p>
      </section>

      <section className="dashboard" aria-label="Task manager">
        <div className="stats">
          <div className="stat-card"><span className="stat-label">All tasks</span><strong>{counts.total}</strong><span className="stat-caption">On your list</span></div>
          <div className="stat-card"><span className="stat-label">To do</span><strong>{counts.active}</strong><span className="stat-caption">Still in progress</span></div>
          <div className="stat-card"><span className="stat-label">Completed</span><strong>{counts.completed}</strong><span className="stat-caption">Small wins</span></div>
        </div>

        <div className="task-panel">
          <div className="panel-heading">
            <div><p className="eyebrow">TASK BOARD</p><h2>Your tasks</h2></div>
            <span className="task-count">{counts.active} remaining</span>
          </div>

          <form className="add-form" onSubmit={addTask}>
            <label className="sr-only" htmlFor="task-title">New task</label>
            <input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs your attention?" maxLength={120} />
            <button type="submit" disabled={busy || !title.trim()}><span>+</span> Add task</button>
          </form>

          <div className="filters" role="group" aria-label="Filter tasks">
            {["all", "active", "completed"].map((item) => (
              <button key={item} className={`filter ${filter === item ? "selected" : ""}`} onClick={() => setFilter(item)} type="button">
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
            <button className="refresh-button" type="button" onClick={loadTasks} title="Refresh tasks" aria-label="Refresh tasks">↻</button>
          </div>

          {error && <div className="message error" role="alert">{error}</div>}
          {notice && !error && <div className="message success" role="status">{notice}</div>}

          {loading ? <div className="empty-state"><span className="loader" />Loading your tasks…</div> :
            visibleTasks.length === 0 ? (
              <div className="empty-state"><span className="empty-icon">✦</span><strong>{filter === "all" ? "A fresh start" : `No ${filter} tasks`}</strong><span>{filter === "all" ? "Add a task above and make today count." : "Try another filter or add a new task."}</span></div>
            ) : (
              <ul className="task-list">
                {visibleTasks.map((task) => (
                  <li className={`task-row ${task.completed ? "is-complete" : ""}`} key={task.id}>
                    <button className="check-button" type="button" onClick={() => toggleTask(task)} aria-label={task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}>
                      {task.completed ? "✓" : ""}
                    </button>
                    <div className="task-text"><span>{task.title}</span><small>{task.completed ? "Completed" : "In progress"}</small></div>
                    <button className="delete-button" type="button" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`} title="Delete task">×</button>
                  </li>
                ))}
              </ul>
            )}
          <footer className="panel-footer"><span>Built for focus, one task at a time.</span><span>TaskFlow <b>•</b> Mini Project</span></footer>
        </div>
      </section>
      <footer className="page-footer">Designed to keep your day moving <span>✳</span></footer>
    </main>
  );
}
