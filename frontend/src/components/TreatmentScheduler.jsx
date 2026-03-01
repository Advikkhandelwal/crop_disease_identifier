import React, { useEffect, useMemo, useState } from 'react';
import './FeaturePanels.css';

const STORAGE_KEY = 'cropscope_treatment_reminders_v1';

const readReminders = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const TreatmentScheduler = ({ treatment }) => {
  const [reminders, setReminders] = useState([]);
  const [title, setTitle] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [notificationState, setNotificationState] = useState(
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
  );

  useEffect(() => {
    setReminders(readReminders());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    if (!title && treatment) setTitle(`Apply treatment: ${treatment}`);
  }, [title, treatment]);

  useEffect(() => {
    if (notificationState !== 'granted') return;

    const timer = setInterval(() => {
      const now = Date.now();
      setReminders((prev) =>
        prev.map((item) => {
          if (item.done || item.notifiedAt) return item;
          if (new Date(item.dueAt).getTime() > now) return item;

          try {
            new Notification('CropScope Reminder', {
              body: `${item.title} is due now.`,
            });
          } catch {
            return item;
          }

          return { ...item, notifiedAt: new Date().toISOString() };
        })
      );
    }, 30000);

    return () => clearInterval(timer);
  }, [notificationState]);

  const sortedReminders = useMemo(
    () =>
      [...reminders].sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()),
    [reminders]
  );

  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const permission = await Notification.requestPermission();
    setNotificationState(permission);
  };

  const addReminder = () => {
    if (!title.trim() || !dueAt) return;
    const item = {
      id: crypto.randomUUID(),
      title: title.trim(),
      dueAt: new Date(dueAt).toISOString(),
      done: false,
      createdAt: new Date().toISOString(),
      notifiedAt: null,
    };
    setReminders((prev) => [item, ...prev]);
    setDueAt('');
  };

  const toggleDone = (id) => {
    setReminders((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  const removeReminder = (id) => {
    setReminders((prev) => prev.filter((item) => item.id !== id));
  };

  const getStateLabel = (item) => {
    if (item.done) return 'done';
    if (new Date(item.dueAt).getTime() < Date.now()) return 'overdue';
    return 'pending';
  };

  return (
    <div className="feature-card glass-panel">
      <div className="feature-header">
        <h3>Offline Treatment Scheduler</h3>
        <button
          className="mini-btn"
          onClick={requestNotificationPermission}
          disabled={notificationState === 'granted' || notificationState === 'unsupported'}
        >
          {notificationState === 'granted' ? 'Alerts On' : 'Enable Alerts'}
        </button>
      </div>

      <div className="scheduler-form">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Reminder title"
          className="field-input"
        />
        <input
          type="datetime-local"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          className="field-input"
        />
        <button className="action-btn" onClick={addReminder}>
          Add Reminder
        </button>
      </div>

      {sortedReminders.length === 0 ? (
        <p className="feature-empty">No reminders yet. Add the next spray/check date.</p>
      ) : (
        <div className="reminder-list">
          {sortedReminders.slice(0, 8).map((item) => (
            <div className="reminder-item" key={item.id}>
              <div>
                <h4>{item.title}</h4>
                <p>{new Date(item.dueAt).toLocaleString()}</p>
                <span className={`status-pill status-${getStateLabel(item)}`}>{getStateLabel(item)}</span>
              </div>
              <div className="reminder-actions">
                <button className="mini-btn" onClick={() => toggleDone(item.id)}>
                  {item.done ? 'Undo' : 'Done'}
                </button>
                <button className="mini-btn danger" onClick={() => removeReminder(item.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TreatmentScheduler;
