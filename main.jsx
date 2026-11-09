import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Brain, LayoutDashboard, BookOpen, CalendarDays, Plus, Search,
  Check, Bell, Trash2, Pencil, X, ChevronRight, Clock3, Flame,
  GraduationCap, Settings2, CircleCheck, AlertCircle, Sparkles
} from "lucide-react";
import "./style.css";

const CYCLE = [1, 3, 7, 21];
const STORAGE_KEY = "revision-mate-topics-v1";
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const addDays = (date, days) => {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days - 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const fmt = (date) => new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {day:"numeric", month:"short", year:"numeric"});
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

function loadTopics() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function App() {
  const [topics, setTopics] = useState(loadTopics);
  const [page, setPage] = useState("Overview");
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All subjects");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({title:"", subject:"Banking & Financial GK", date:todayISO(), notes:""});
  const today = todayISO();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
  }, [topics]);

  const allSessions = useMemo(() => topics.flatMap(topic =>
    CYCLE.map(day => ({
      topic, day, date:addDays(topic.startDate, day),
      done: topic.completed?.includes(day) || false
    }))
  ), [topics]);

  const due = allSessions.filter(s => !s.done && s.date <= today)
    .sort((a,b) => a.date.localeCompare(b.date));
  const upcoming = allSessions.filter(s => !s.done && s.date > today)
    .sort((a,b) => a.date.localeCompare(b.date));
  const completedCount = allSessions.filter(s => s.done).length;
  const totalCount = allSessions.length;
  const progress = totalCount ? Math.round(completedCount / totalCount * 100) : 0;
  const subjects = ["All subjects", ...new Set(topics.map(t => t.subject))];
  const filteredTopics = topics.filter(t =>
    (subjectFilter === "All subjects" || t.subject === subjectFilter) &&
    `${t.title} ${t.subject}`.toLowerCase().includes(query.toLowerCase())
  );

  function openAdd() {
    setEditing(null);
    setForm({title:"", subject:"Banking & Financial GK", date:todayISO(), notes:""});
    setShowForm(true);
  }
  function openEdit(topic) {
    setEditing(topic.id);
    setForm({title:topic.title, subject:topic.subject, date:topic.startDate, notes:topic.notes || ""});
    setShowForm(true);
  }
  function saveTopic(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editing) {
      setTopics(old => old.map(t => t.id === editing
        ? {...t, title:form.title.trim(), subject:form.subject, startDate:form.date, notes:form.notes}
        : t));
    } else {
      setTopics(old => [{id:uid(), title:form.title.trim(), subject:form.subject,
        startDate:form.date, notes:form.notes, completed:[], createdAt:new Date().toISOString()}, ...old]);
    }
    setShowForm(false);
  }
  function toggleSession(topicId, day) {
    setTopics(old => old.map(t => {
      if (t.id !== topicId) return t;
      const set = new Set(t.completed || []);
      set.has(day) ? set.delete(day) : set.add(day);
      return {...t, completed:[...set]};
    }));
  }
  function deleteTopic(id) {
    if (confirm("Delete this topic and its revision history?")) setTopics(old => old.filter(t => t.id !== id));
  }
  async function enableNotifications() {
    if (!("Notification" in window)) {
      setNotice("This browser does not support notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotice(permission === "granted" ? "Notifications enabled for this browser." : "Notification permission was not granted.");
  }
  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const sentKey = `revision-mate-notified-${today}`;
    if (localStorage.getItem(sentKey)) return;
    const dueNow = allSessions.filter(s => !s.done && s.date <= today);
    if (dueNow.length) {
      new Notification("Revision Mate — revisions due", {
        body: `${dueNow.length} revision${dueNow.length === 1 ? "" : "s"} need your attention today.`,
        icon: "./icon.svg"
      });
      localStorage.setItem(sentKey, "yes");
    }
  }, [allSessions, today]);

  const nav = [
    {name:"Overview", icon:LayoutDashboard},
    {name:"My topics", icon:BookOpen},
    {name:"Schedule", icon:CalendarDays}
  ];

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><Brain size={22}/></div><div><b>Revision Mate</b><span>STUDY SMARTER</span></div></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{nav.map(item => <button key={item.name} className={`nav-item ${page===item.name?"active":""}`} onClick={()=>setPage(item.name)}><item.icon size={18}/>{item.name}{page===item.name && <ChevronRight className="nav-arrow" size={16}/>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="mini-tip"><Sparkles size={17}/><b>Little by little</b><p>Short, timely revisions help move knowledge into long-term memory.</p></div>
        <div className="profile"><div className="avatar">S</div><div><b>My study space</b><span>Personal workspace</span></div><Settings2 size={17}/></div>
      </div>
    </aside>

    <main className="main">
      <header className="topbar">
        <div className="mobile-brand"><Brain size={20}/> Revision Mate</div>
        <div className="breadcrumb">Workspace <span>/</span> {page}</div>
        <div className="top-actions"><button className="icon-button" title="Enable notifications" onClick={enableNotifications}><Bell size={18}/></button><div className="today-pill"><span className="live-dot"></span>{fmt(today)}</div></div>
      </header>

      <div className="content">
        {notice && <div className="notice" onClick={()=>setNotice("")}>{notice}<X size={15}/></div>}
        {page === "Overview" && <>
          <section className="welcome-row"><div><div className="eyebrow">YOUR LEARNING, ORGANIZED</div><h1>Good day. Ready to remember more?</h1><p className="muted">Stay consistent with small revision sessions.</p></div><button className="primary-button" onClick={openAdd}><Plus size={18}/> Add a topic</button></section>
          <section className="hero">
            <div className="hero-copy"><div className="hero-kicker"><Sparkles size={15}/> SPACED REPETITION</div><h2>Learn it today.<br/><em>Remember it longer.</em></h2><p>We plan your next revision dates, so you can focus on learning — not tracking.</p><button className="hero-button" onClick={openAdd}>Plan a new topic <ChevronRight size={17}/></button></div>
            <div className="cycle-visual"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="brain-circle"><Brain size={42}/></div><div className="cycle-node n1"><b>1</b><span>DAY</span></div><div className="cycle-node n2"><b>3</b><span>DAYS</span></div><div className="cycle-node n3"><b>7</b><span>DAYS</span></div><div className="cycle-node n4"><b>21</b><span>DAYS</span></div></div>
          </section>
          <section className="stats-grid">
            <Stat icon={Clock3} label="Due today / overdue" value={due.length} sub="Revisions waiting" tone="orange"/>
            <Stat icon={BookOpen} label="Topics in progress" value={topics.length} sub="Across all subjects" tone="blue"/>
            <Stat icon={CircleCheck} label="Revisions completed" value={completedCount} sub={`${progress}% overall progress`} tone="green"/>
            <Stat icon={Flame} label="Coming up next" value={upcoming.length} sub="Future revision sessions" tone="purple"/>
          </section>
          <section className="dashboard-grid">
            <div className="panel"><div className="panel-heading"><div><h3>Needs your attention</h3><p>Topics ready for revision</p></div><span className="count-badge">{due.length} DUE</span></div>
              {due.length ? <div className="session-list">{due.slice(0,5).map(s=><SessionRow key={`${s.topic.id}-${s.day}`} session={s} onDone={()=>toggleSession(s.topic.id,s.day)}/>)}</div> : <Empty icon={CircleCheck} title="You're all caught up!" text="No revisions are due right now. Add a topic or enjoy your free time."/>}
            </div>
            <div className="panel progress-panel"><div className="panel-heading"><div><h3>Your progress</h3><p>A little progress adds up</p></div><GraduationCap size={20} className="muted-icon"/></div><div className="progress-ring" style={{"--progress":`${progress*3.6}deg`}}><div><b>{progress}%</b><span>COMPLETED</span></div></div><div className="progress-legend"><span><i className="legend-dot green"></i> {completedCount} completed</span><span><i className="legend-dot gray"></i> {totalCount-completedCount} remaining</span></div><div className="progress-foot">{topics.length ? `${topics.length} topic${topics.length===1?"":"s"} in your study plan` : "Your study journey starts here"}</div></div>
          </section>
          <section className="panel upcoming-panel"><div className="panel-heading"><div><h3>Coming up</h3><p>Your next scheduled revisions</p></div><button className="text-button" onClick={()=>setPage("Schedule")}>View schedule <ChevronRight size={15}/></button></div>{upcoming.length ? upcoming.slice(0,4).map(s=><SessionRow key={`${s.topic.id}-${s.day}`} session={s} compact/>) : <p className="muted small-pad">No upcoming revisions yet.</p>}</section>
        </>}

        {page === "My topics" && <>
          <section className="welcome-row"><div><div className="eyebrow">YOUR PERSONAL LIBRARY</div><h1>My topics</h1><p className="muted">Everything you're learning, in one place.</p></div><button className="primary-button" onClick={openAdd}><Plus size={18}/> Add a topic</button></section>
          <div className="toolbar"><div className="searchbox"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search topics or subjects..."/></div><select value={subjectFilter} onChange={e=>setSubjectFilter(e.target.value)}>{subjects.map(s=><option key={s}>{s}</option>)}</select></div>
          <div className="topic-grid">{filteredTopics.map(t=><TopicCard key={t.id} topic={t} onEdit={()=>openEdit(t)} onDelete={()=>deleteTopic(t.id)}/>)}{!filteredTopics.length&&<div className="panel full-width"><Empty icon={BookOpen} title="No topics found" text="Add your first topic to create a revision plan."/></div>}</div>
        </>}

        {page === "Schedule" && <>
          <section className="welcome-row"><div><div className="eyebrow">YOUR REVISION TIMELINE</div><h1>Schedule</h1><p className="muted">A clear view of what to revise and when.</p></div><button className="primary-button" onClick={openAdd}><Plus size={18}/> Add a topic</button></section>
          <div className="schedule-summary"><div><span className="summary-number">{due.length}</span><span>Due / overdue</span></div><div><span className="summary-number">{upcoming.length}</span><span>Upcoming</span></div><div><span className="summary-number">{completedCount}</span><span>Completed</span></div></div>
          <div className="panel schedule-panel"><div className="panel-heading"><div><h3>All revision sessions</h3><p>Sorted by date, earliest first</p></div><CalendarDays className="muted-icon"/></div>
            {allSessions.sort((a,b)=>a.date.localeCompare(b.date)).map(s=><SessionRow key={`${s.topic.id}-${s.day}`} session={s} onDone={()=>toggleSession(s.topic.id,s.day)} showDate/>)}
            {!allSessions.length&&<Empty icon={CalendarDays} title="Your calendar is empty" text="Add a topic and your revision dates will appear here."/>}
          </div>
        </>}
      </div>
      <footer>Made for focused learning <span>·</span> Your topics are saved in this browser</footer>
    </main>

    {showForm && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowForm(false)}}><form className="modal" onSubmit={saveTopic}>
      <div className="modal-head"><div><div className="eyebrow">{editing?"UPDATE YOUR PLAN":"START A REVISION PLAN"}</div><h2>{editing?"Edit topic":"Add a new topic"}</h2><p>We'll calculate your revision dates automatically.</p></div><button type="button" className="icon-button" onClick={()=>setShowForm(false)}><X size={19}/></button></div>
      <label>Topic name <span>*</span><input autoFocus required maxLength="100" placeholder="e.g. Monetary Policy" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
      <label>Subject<select value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}>{["Banking & Financial GK","Economics","Mathematics","English","Engineering","General Knowledge","Bangla"].map(s=><option key={s}>{s}</option>)}</select></label>
      <label>Study date<input type="date" required value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/><small>Day 1 is your study date. The next revisions are scheduled for Day 3, Day 7 and Day 21.</small></label>
      <label>Notes <small className="optional">(optional)</small><textarea rows="3" placeholder="Add a short note or reference..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
      <div className="schedule-preview"><b><CalendarDays size={16}/> Your revision plan</b><div>{CYCLE.map(day=><div key={day}><strong>Day {day}</strong><span>{fmt(addDays(form.date || today,day))}</span></div>)}</div></div>
      <div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setShowForm(false)}>Cancel</button><button className="primary-button" type="submit">{editing?"Save changes":"Create revision plan"}</button></div>
    </form></div>}
  </div>;
}

function Stat({icon:Icon,label,value,sub,tone}) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-sub">{sub}</div></div>;
}
function Empty({icon:Icon,title,text}) {
  return <div className="empty-state"><div><Icon size={24}/></div><b>{title}</b><p>{text}</p></div>;
}
function SessionRow({session:s,onDone,compact=false,showDate=false}) {
  const overdue = s.date < todayISO();
  const isToday = s.date === todayISO();
  return <div className={`session-row ${compact?"compact":""}`}>
    <div className={`session-date ${s.done?"done":overdue?"late":isToday?"today":""}`}><b>{new Date(`${s.date}T12:00:00`).getDate()}</b><span>{new Date(`${s.date}T12:00:00`).toLocaleDateString(undefined,{month:"short"})}</span></div>
    <div className="session-info"><b>{s.topic.title}</b><span>{s.topic.subject} · Day {s.day}{showDate?` · ${fmt(s.date)}`:""}</span></div>
    <div className="session-status">{s.done?<span className="status done-text"><Check size={14}/> Done</span>:overdue?<span className="status overdue"><AlertCircle size={14}/> Overdue</span>:isToday?<span className="status today-text">Today</span>:<span className="status upcoming-text">Upcoming</span>}</div>
    {onDone&&!s.done&&<button className="complete-button" title="Mark as revised" onClick={onDone}><Check size={16}/></button>}
    {onDone&&s.done&&<button className="undo-button" title="Undo completion" onClick={onDone}>Undo</button>}
  </div>;
}
function TopicCard({topic:t,onEdit,onDelete}) {
  const done=t.completed?.length||0;
  return <div className="topic-card"><div className="topic-card-top"><div className="topic-symbol"><BookOpen size={19}/></div><div className="topic-actions"><button className="icon-button small" onClick={onEdit} title="Edit"><Pencil size={15}/></button><button className="icon-button small danger" onClick={onDelete} title="Delete"><Trash2 size={15}/></button></div></div><span className="subject-tag">{t.subject}</span><h3>{t.title}</h3>{t.notes&&<p className="topic-notes">{t.notes}</p>}<div className="topic-progress"><div><span>Revision progress</span><b>{done}/4</b></div><div className="thin-track"><i style={{width:`${done/4*100}%`}}/></div></div><div className="topic-days">{CYCLE.map(day=><span className={t.completed?.includes(day)?"finished":""} key={day}>{t.completed?.includes(day)?"✓":`D${day}`}</span>)}</div><div className="topic-start">Started {fmt(t.startDate)}</div></div>;
}

createRoot(document.getElementById("root")).render(<App/>);
