"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import "./ding.css";

type Category = { id: string; name: string; color: string; createdAt: number };
type Task = { id: string; text: string; categoryId: string; createdAt: number };
type DingState = { categories: Category[]; tasks: Task[]; updatedAt?: number };

const DEFAULT_CATEGORIES: Category[] = [
  { id: "work", name: "Work", color: "#007AFF", createdAt: 1 },
  { id: "shopping", name: "Shopping", color: "#34C759", createdAt: 2 },
  { id: "elly", name: "Elly", color: "#AF52DE", createdAt: 3 },
  { id: "home", name: "Home", color: "#FF9500", createdAt: 4 },
];

const PALETTE = ["#007AFF","#34C759","#AF52DE","#FF9500","#FF2D55","#5AC8FA","#FFCC00","#5856D6","#00C7BE","#FF3B30"];

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function mergeStates(server: DingState, local: DingState | null) {
  if (!local) return server;
  const categories = [...server.categories];
  for (const c of local.categories || []) {
    if (!categories.some(existing => existing.id === c.id)) categories.push(c);
  }
  const taskMap = new Map<string, Task>();
  for (const t of [...(server.tasks || []), ...(local.tasks || [])]) taskMap.set(t.id, t);
  return { categories, tasks: Array.from(taskMap.values()), updatedAt: Date.now() };
}

function base64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(char => char.charCodeAt(0)));
}

export default function DingPage() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState("");
  const [categoryId, setCategoryId] = useState("work");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState<"newest"|"oldest"|"category">("newest");
  const [showCategories, setShowCategories] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [undoTask, setUndoTask] = useState<Task | null>(null);
  const [ready, setReady] = useState(false);
  const [syncState, setSyncState] = useState<"loading"|"saved"|"offline">("loading");
  const [pushState, setPushState] = useState<"checking"|"enabled"|"disabled"|"unsupported">("checking");
  const [pushBusy, setPushBusy] = useState(false);
  const syncTimer = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let local: DingState | null = null;
      try {
        const localTasks = JSON.parse(localStorage.getItem("ding:tasks") || "null");
        const localCategories = JSON.parse(localStorage.getItem("ding:categories") || "null");
        if (Array.isArray(localTasks) || Array.isArray(localCategories)) {
          local = {
            tasks: Array.isArray(localTasks) ? localTasks : [],
            categories: Array.isArray(localCategories) && localCategories.length ? localCategories : DEFAULT_CATEGORIES,
          };
        }
      } catch {}

      try {
        const response = await fetch("/ding/api/state", { cache: "no-store" });
        if (!response.ok) throw new Error("state");
        const data = await response.json();
        const merged = mergeStates(data.state, local);
        if (cancelled) return;
        setCategories(merged.categories.length ? merged.categories : DEFAULT_CATEGORIES);
        setTasks(merged.tasks);
        setCategoryId((merged.categories[0] || DEFAULT_CATEGORIES[0]).id);
        setSyncState("saved");
        setReady(true);

        if (local && (!data.exists || local.tasks?.length)) {
          fetch("/ding/api/state", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(merged),
          }).catch(() => {});
        }
      } catch {
        if (cancelled) return;
        if (local) {
          setCategories(local.categories);
          setTasks(local.tasks);
          setCategoryId((local.categories[0] || DEFAULT_CATEGORIES[0]).id);
        }
        setSyncState("offline");
        setReady(true);
      }

      if ("serviceWorker" in navigator && "PushManager" in window) {
        try {
          const registration = await navigator.serviceWorker.register("/ding-sw.js", { scope: "/ding" });
          const subscription = await registration.pushManager.getSubscription();
          if (!cancelled) setPushState(subscription ? "enabled" : "disabled");
        } catch {
          if (!cancelled) setPushState("disabled");
        }
      } else if (!cancelled) {
        setPushState("unsupported");
      }
    })();

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("ding:tasks", JSON.stringify(tasks));
    localStorage.setItem("ding:categories", JSON.stringify(categories));

    if (syncTimer.current) window.clearTimeout(syncTimer.current);
    setSyncState("loading");
    syncTimer.current = window.setTimeout(async () => {
      try {
        const response = await fetch("/ding/api/state", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categories, tasks }),
        });
        if (!response.ok) throw new Error("sync");
        setSyncState("saved");
      } catch {
        setSyncState("offline");
      }
    }, 300);

    return () => {
      if (syncTimer.current) window.clearTimeout(syncTimer.current);
    };
  }, [categories, tasks, ready]);

  useEffect(() => {
    if (!categories.some(c => c.id === categoryId) && categories[0]) setCategoryId(categories[0].id);
    if (filter !== "all" && !categories.some(c => c.id === filter)) setFilter("all");
  }, [categories, categoryId, filter]);

  useEffect(() => {
    if (!undoTask) return;
    const t = window.setTimeout(() => setUndoTask(null), 5000);
    return () => window.clearTimeout(t);
  }, [undoTask]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const task of tasks) m.set(task.categoryId, (m.get(task.categoryId) || 0) + 1);
    return m;
  }, [tasks]);

  const visibleCategories = categories.filter(c => (counts.get(c.id) || 0) > 0);

  const visibleTasks = useMemo(() => {
    let list = filter === "all" ? [...tasks] : tasks.filter(t => t.categoryId === filter);
    if (sort === "newest") list.sort((a,b) => b.createdAt - a.createdAt);
    if (sort === "oldest") list.sort((a,b) => a.createdAt - b.createdAt);
    if (sort === "category") {
      list.sort((a,b) => {
        const ai = categories.findIndex(c => c.id === a.categoryId);
        const bi = categories.findIndex(c => c.id === b.categoryId);
        return ai - bi || b.createdAt - a.createdAt;
      });
    }
    return list;
  }, [tasks, filter, sort, categories]);

  function addTask(e: FormEvent) {
    e.preventDefault();
    const clean = text.trim();
    if (!clean || !categoryId) return;
    setTasks(prev => [{ id: uid(), text: clean, categoryId, createdAt: Date.now() }, ...prev]);
    setText("");
  }

  function completeTask(task: Task) {
    setTasks(prev => prev.filter(t => t.id !== task.id));
    setUndoTask(task);
  }

  function undo() {
    if (!undoTask) return;
    setTasks(prev => [undoTask, ...prev]);
    setUndoTask(null);
  }

  function addCategory(e: FormEvent) {
    e.preventDefault();
    const name = newCategory.trim();
    if (!name) return;
    const color = PALETTE[categories.length % PALETTE.length];
    const cat = { id: uid(), name, color, createdAt: Date.now() };
    setCategories(prev => [...prev, cat]);
    setCategoryId(cat.id);
    setNewCategory("");
  }

  function renameCategory(id: string) {
    const current = categories.find(c => c.id === id);
    if (!current) return;
    const name = window.prompt("Rename category", current.name)?.trim();
    if (name) setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  }

  function deleteCategory(id: string) {
    if (categories.length <= 1) return;
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    const hasTasks = tasks.some(t => t.categoryId === id);
    if (hasTasks && !window.confirm(`Delete ${cat.name} and its open tasks?`)) return;
    setTasks(prev => prev.filter(t => t.categoryId !== id));
    setCategories(prev => prev.filter(c => c.id !== id));
  }

  function categoryFor(id: string) {
    return categories.find(c => c.id === id) || categories[0];
  }

  async function enableNotifications() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushState("unsupported");
      return;
    }
    setPushBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushState("disabled");
        return;
      }
      const registration = await navigator.serviceWorker.register("/ding-sw.js", { scope: "/ding" });
      await navigator.serviceWorker.ready;
      const keyResponse = await fetch("/ding/api/push/key", { cache: "no-store" });
      const { publicKey } = await keyResponse.json();
      if (!publicKey) throw new Error("No push key");

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64ToUint8Array(publicKey) as BufferSource,
        });
      }

      const response = await fetch("/ding/api/push/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
      if (!response.ok) throw new Error("Subscription failed");
      setPushState("enabled");
      await fetch("/ding/api/push/test", { method: "POST" });
    } catch (error) {
      console.error(error);
      setPushState("disabled");
    } finally {
      setPushBusy(false);
    }
  }

  return (
    <main className="ding-shell">
      <section className="ding-app">
        <header className="ding-header">
          <div>
            <div className="ding-mark" aria-hidden>◉</div>
            <h1>Ding</h1>
            <p>{tasks.length ? `${tasks.length} open` : "You're all clear."} <span className="sync-dot">· {syncState === "saved" ? "saved" : syncState === "offline" ? "offline" : "saving"}</span></p>
          </div>
          <button className="icon-button" onClick={() => setShowCategories(true)} aria-label="Manage categories">•••</button>
        </header>

        <form className="add-card" onSubmit={addTask}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="What do you need to do?"
            aria-label="New task"
          />
          <div className="add-row">
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} aria-label="Category">
              {categories.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
            </select>
            <button className="add-button" type="submit" disabled={!text.trim()}>Add</button>
          </div>
        </form>

        <div className="toolbar">
          <div className="filters" aria-label="Task filters">
            <button className={filter === "all" ? "filter active" : "filter"} onClick={() => setFilter("all")}>
              All <span>{tasks.length}</span>
            </button>
            {visibleCategories.map(c => (
              <button key={c.id} className={filter === c.id ? "filter active" : "filter"} onClick={() => setFilter(c.id)}>
                <i style={{ background: c.color }} />{c.name}<span>{counts.get(c.id)}</span>
              </button>
            ))}
          </div>
          <select className="sort" value={sort} onChange={e => setSort(e.target.value as typeof sort)} aria-label="Sort tasks">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="category">Category</option>
          </select>
        </div>

        <section className="task-list" aria-live="polite">
          {visibleTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-ring">✓</div>
              <h2>Nothing here</h2>
              <p>{filter === "all" ? "Add something when it comes to mind." : "No open tasks in this category."}</p>
            </div>
          ) : visibleTasks.map(task => {
            const cat = categoryFor(task.categoryId);
            return (
              <article className="task" key={task.id}>
                <button className="check" onClick={() => completeTask(task)} aria-label={`Complete ${task.text}`}><span /></button>
                <div className="task-copy">
                  <div className="task-text">{task.text}</div>
                  <div className="category-label"><i style={{ background: cat.color }} />{cat.name}</div>
                </div>
                <button className="edit-task" aria-label="Edit task" onClick={() => {
                  const next = window.prompt("Edit task", task.text)?.trim();
                  if (next) setTasks(prev => prev.map(t => t.id === task.id ? { ...t, text: next } : t));
                }}>•••</button>
              </article>
            );
          })}
        </section>

        <section className="notification-card">
          <div>
            <span className="eyebrow">Daily Dings</span>
            <strong>7:00 AM · 2:30 PM</strong>
            <p>Every open task, delivered as a Ding notification.</p>
          </div>
          {pushState === "enabled" ? (
            <span className="notification-on">On</span>
          ) : pushState === "unsupported" ? (
            <span className="notification-help">Add Ding to your Home Screen to enable notifications.</span>
          ) : (
            <button onClick={enableNotifications} disabled={pushBusy || pushState === "checking"}>
              {pushBusy ? "Enabling…" : pushState === "checking" ? "Checking…" : "Enable"}
            </button>
          )}
        </section>
      </section>

      {showCategories && (
        <div className="sheet-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowCategories(false); }}>
          <section className="sheet" role="dialog" aria-modal="true" aria-label="Manage categories">
            <div className="sheet-handle" />
            <div className="sheet-title"><h2>Categories</h2><button onClick={() => setShowCategories(false)}>Done</button></div>
            <div className="category-list">
              {categories.map(c => (
                <div className="category-row" key={c.id}>
                  <i style={{ background: c.color }} /><span>{c.name}</span>
                  <button onClick={() => renameCategory(c.id)}>Rename</button>
                  <button className="danger" onClick={() => deleteCategory(c.id)}>Delete</button>
                </div>
              ))}
            </div>
            <form className="category-add" onSubmit={addCategory}>
              <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="New category" />
              <button disabled={!newCategory.trim()}>Add</button>
            </form>
            <p className="category-note">Colors are assigned automatically.</p>
          </section>
        </div>
      )}

      {undoTask && <div className="undo-toast"><span>Done</span><button onClick={undo}>Undo</button></div>}
    </main>
  );
}
