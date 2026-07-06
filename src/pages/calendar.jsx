import Calendar from '../components/Calendar';

export default function CalendarPage() {
  return (
    <main style={{ background: '#e2e8f0', minHeight: '100vh', padding: 24 }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 20, color: '#0f172a' }}>Calendar View</h1>
        <Calendar />
      </div>
    </main>
  );
}
