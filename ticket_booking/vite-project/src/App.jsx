// App.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import "./App.css";

/* ------------------- API helper ------------------- */
const api = axios.create({ baseURL: '/' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ------------------- Auth Context ------------------- */
const AuthContext = createContext();
function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch (e) {
      return null;
    }
  });

  function saveAuth(userObj, token) {
    localStorage.setItem('user', JSON.stringify(userObj));
    localStorage.setItem('token', token);
    setUser(userObj);
  }

  function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
function useAuth() {
  return useContext(AuthContext);
}

/* ------------------- Simple UI components ------------------- */
function Header() {
  const { user, logout } = useAuth();
  return (
    <header>
      <h1>🎟️ Travel Booking Platform</h1>
      <nav>
        <Link to="/">Home</Link>
        {user?.role === 'ORGANIZER' && (
          <Link to="/organizer">Organizer</Link>
        )}
        {user?.role === 'ADMIN'2&& (
          <Link to="/admin">Admin</Link>
        )}
        {!user ? (
          <Link to="/login">Login</Link>
        ) : (
          <>
            <span style={{ marginRight: 10 }}>Hi, {user.name}</span>
            <button onClick={logout}>Logout</button>
          </>
        )}
      </nav>
    </header>
  );
}

/* ------------------- Pages ------------------- */
function HomePage() {
  const [events, setEvents] = useState([]);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await api.get('/events');
      setEvents(res.data || []);
    } catch (e) {
      console.error(e);
      setEvents(sampleEvents);
    }
  }

  const shown = events.filter(e => (
    (filter === 'ALL' || e.category === filter) &&
    (q.trim() === '' || e.name.toLowerCase().includes(q.toLowerCase()))
  ));

  return (
    <main>
      <h2>Book your next experience</h2>
      <div className="controls">
        <input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ALL">All</option>
          <option value="MOVIE">Movie</option>
          <option value="CONCERT">Concert</option>
          <option value="SPORTS">Sports</option>
        </select>
      </div>

      <div className="grid">
        {shown.map(ev => (
          <div key={ev.id} className="card">
            <h3>{ev.name}</h3>
            <p><strong>{ev.venue}</strong> • {new Date(ev.date).toLocaleString()}</p>
            <p>Price: ₹{ev.price} • Seats: {ev.totalSeats}</p>
            <Link to={`/events/${ev.id}`} className="button-link">View & Book</Link>
          </div>
        ))}
      </div>
    </main>
  );
}

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // New state for error message
  const { saveAuth } = useAuth();
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErrorMessage(''); // Clear previous errors
    try {
      const res = await api.post('/auth/login', { email, password });
      saveAuth(res.data.user, res.data.token);
      nav('/');
    } catch (err) {
      console.error(err);
      setErrorMessage('Login failed. Demo will log you in as a guest.');
      saveAuth({ name: 'Guest', role: 'USER', email }, 'demo-token');
      nav('/');
    }
  }

  return (
    <main>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input required placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button>Sign in</button>
        {errorMessage && (
          <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>
        )}
        <p>Or <Link to="/register">Register</Link></p>
      </form>
    </main>
  );
}

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // New state for error message
  const { saveAuth } = useAuth();
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErrorMessage(''); // Clear previous errors
    try {
      const res = await api.post('/auth/register', { name, email, password });
      saveAuth(res.data.user, res.data.token);
      nav('/');
    } catch (err) {
      console.error(err);
      setErrorMessage('Registration failed. Demo will create a local user.');
      saveAuth({ name, email, role: 'USER' }, 'demo-token');
      nav('/');
    }
  }

  return (
    <main>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <input required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input required placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button>Create account</button>
        {errorMessage && (
          <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>
        )}
      </form>
    </main>
  );
}

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const nav = useNavigate();

  useEffect(() => { fetchEvent(); }, [id]);

  async function fetchEvent() {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data.event);
      setSeats(res.data.seats);
    } catch (err) {
      console.error(err);
      const ev = sampleEvents.find(s => String(s.id) === String(id)) || sampleEvents[0];
      setEvent(ev);
      setSeats(makeSeats(ev.totalSeats));
    }
  }

  function toggleSeat(n) {
    setErrorMessage('');
    if (seats[n].isBooked) return;
    setSelected(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
  }

  async function proceed() {
    if (selected.length === 0) {
      setErrorMessage('Please select at least one seat to proceed.');
      return;
    }
    localStorage.setItem('bookingDraft', JSON.stringify({ eventId: id, seats: selected.map(i => seats[i].number) }));
    nav('/checkout');
  }

  if (!event) return <main><h3>Loading...</h3></main>;

  return (
    <main>
      <h2>{event.name}</h2>
      <p>{event.venue} • {new Date(event.date).toLocaleString()}</p>
      <p>Price per seat: ₹{event.price} • Available: {seats.filter(s => !s.isBooked).length}</p>

      <h4>Select Seats</h4>
      <div className="seat-grid">
        {seats.map((s, idx) => (
          <div key={s.number}
            onClick={() => toggleSeat(idx)}
            className={`seat ${s.isBooked ? "booked" : selected.includes(idx) ? "selected" : ""}`}>
            {s.number}
          </div>
        ))}
      </div>
      {errorMessage && (
        <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{errorMessage}</p>
      )}

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <button className="button" onClick={proceed}>Proceed to Checkout ({selected.length} seats)</button>
      </div>
    </main>
  );
}

function Checkout() {
  const draft = JSON.parse(localStorage.getItem('bookingDraft') || '{}');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) { setName(user.name); setEmail(user.email || ''); }
  }, []);

  async function pay() {
    try {
      const payload = { eventId: draft.eventId, seats: draft.seats, customerName: name, customerEmail: email };
      const res = await api.post('/bookings', payload);
      const bookingId = res.data.bookingId || ('bk_' + Date.now());
      localStorage.setItem('lastTicket', JSON.stringify({ bookingId, eventId: draft.eventId, seats: draft.seats, name, email }));
      nav('/ticket');
    } catch (err) {
      console.error(err);
      setErrorMessage('Payment failed. Creating local ticket for demo purposes.');
      const bookingId = 'demo_' + Date.now();
      localStorage.setItem('lastTicket', JSON.stringify({ bookingId, eventId: draft.eventId, seats: draft.seats, name, email }));
      setTimeout(() => nav('/ticket'), 2000);
    }
  }

  return (
    <main>
      <h2>Checkout</h2>
      <p>Seats: {(draft.seats || []).join(', ')}</p>
      <form onSubmit={(e) => { e.preventDefault(); pay(); }}>
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
        <input required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <button>Pay (Mock)</button>
        {errorMessage && (
          <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>
        )}
      </form>
    </main>
  );
}

function TicketPage() {
  const ticket = JSON.parse(localStorage.getItem('lastTicket') || 'null');
  const event = sampleEvents.find(s => String(s.id) === String(ticket?.eventId));

  if (!ticket) return <main><h3>No ticket found</h3></main>;

  return (
    <main>
      <div className="ticket-box">
        <h2>Booking Confirmed 🎉</h2>
        <p>Booking ID: {ticket.bookingId}</p>
        <p>Event: {event?.name}</p>
        <p>Seats: {ticket.seats.join(', ')}</p>
        <p>Customer: {ticket.name} • {ticket.email}</p>

        <div style={{ marginTop: 16 }}>
          <QRCodeCanvas value={`Ticket ID: ${ticket.bookingId}`} size={128} />
        </div>

        <div style={{ marginTop: 12 }}>
          <button onClick={() => window.print()} className="button">Print Ticket</button>
        </div>
      </div>
    </main>
  );
}

/* Organizer Dashboard */
function OrganizerPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ name: '', date: '', venue: '', price: 100, totalSeats: 100, category: 'CONCERT' });

  useEffect(() => { fetchMyEvents(); }, []);
  async function fetchMyEvents() {
    try {
      const res = await api.get('/organizer/events');
      setEvents(res.data.events || []);
    } catch (err) { setEvents(sampleEvents.filter((_, i) => i % 2 === 0)); }
  }

  async function create(e) {
    e.preventDefault();
    try {
      await api.post('/organizer/events', form);
      alert('Created');
      fetchMyEvents();
    } catch (err) {
      console.error(err);
      alert('Demo: added locally');
      setEvents(prev => [{ ...form, id: 'ev_' + Date.now() }, ...prev]);
    }
  }

  return (
    <main>
      <h2>Organizer Dashboard</h2>
      <form onSubmit={create}>
        <input placeholder="Event name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Date (YYYY-MM-DDTHH:mm)" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <input placeholder="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
        <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
        <input type="number" placeholder="Total seats" value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: +e.target.value })} />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option value="CONCERT">Concert</option>
          <option value="MOVIE">Movie</option>
          <option value="SPORTS">Sports</option>
        </select>
        <button>Create Event</button>
      </form>

      <h3>Your Events</h3>
      <div className="grid">
        {events.map(ev => (
          <div key={ev.id} className="card">
            <h4>{ev.name}</h4>
            <p>{ev.venue} • {ev.date}</p>
            <p>Seats: {ev.totalSeats} • Price: ₹{ev.price}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

/* Admin Page */
function AdminPage() {
  const [users, setUsers] = useState([]);
  useEffect(() => { fetchUsers(); }, []);
  async function fetchUsers() {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (err) { setUsers([{ id: 1, name: 'Demo', email: 'demo@example.com', role: 'USER' }]); }
  }

  return (
    <main>
      <h2>Admin Panel</h2>
      <h3>Users</h3>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td></tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

/* ------------------- App Root ------------------- */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/ticket" element={<TicketPage />} />
          <Route path="/organizer" element={<OrganizerPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

/* ------------------- Utilities & sample data ------------------- */
function makeSeats(n) {
  const seats = [];
  for (let i = 1; i <= n; i++) seats.push({ number: 'S' + i, isBooked: Math.random() < 0.15 });
  return seats;
}

const sampleEvents = [
  { id: '1', name: 'AR Rahman Live', category: 'CONCERT', date: '2025-12-05T19:00', venue: 'Indoor Stadium', totalSeats: 120, price: 1500 },
  { id: '2', name: 'Avengers: Final Show', category: 'MOVIE', date: '2025-10-05T18:30', venue: 'PVR Cinemas, City Mall', totalSeats: 200, price: 300 },
  { id: '3', name: 'City Derby: FC Blue vs Red', category: 'SPORTS', date: '2025-11-01T17:00', venue: 'National Stadium', totalSeats: 500, price: 400 },
];

export default App;
