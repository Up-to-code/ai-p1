import Calendar from '../components/Calendar';

export default function CalendarPage() {
  return (
    <main style={{ padding: 24, minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 16, color: '#0f172a' }}>My Calendar</h1>
        <Calendar />
      </div>
    </main>
  );
}
