import { useMemo, useState } from 'react';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  const totalCells = 42;
  const startPrevMonthDay = daysInPrevMonth - firstDay + 1;

  for (let index = 0; index < totalCells; index += 1) {
    let day = index - firstDay + 1;
    let currentMonth = month;
    let currentYear = year;
    let isCurrentMonth = true;

    if (day <= 0) {
      day = startPrevMonthDay + index;
      currentMonth = month - 1;
      currentYear = month === 0 ? year - 1 : year;
      isCurrentMonth = false;
    } else if (day > daysInMonth) {
      day = day - daysInMonth;
      currentMonth = month + 1;
      currentYear = month === 11 ? year + 1 : year;
      isCurrentMonth = false;
    }

    cells.push({
      key: `${currentYear}-${currentMonth}-${day}`,
      day,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth,
    });
  }

  return cells;
}

const styles = {
  root: {
    maxWidth: 760,
    width: '100%',
    margin: '0 auto',
    borderRadius: 20,
    background: '#ffffff',
    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
    overflow: 'hidden',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  header: {
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#0f172a',
    color: '#ffffff',
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
  },
  navButton: {
    border: 'none',
    background: 'rgba(255,255,255,0.12)',
    color: '#f8fafc',
    height: 36,
    width: 36,
    borderRadius: 10,
    cursor: 'pointer',
  },
  gridHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gap: 0,
    padding: '16px 24px 8px',
    background: '#f8fafc',
  },
  weekDay: {
    color: '#475569',
    fontSize: 13,
    fontWeight: 600,
    textAlign: 'center',
  },
  gridBody: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gap: 0,
    padding: '0 24px 24px',
    background: '#ffffff',
  },
  dayCell: {
    minHeight: 94,
    padding: 10,
    borderRadius: 16,
    margin: 4,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    color: '#0f172a',
    background: '#f8fafc',
  },
  dayOutside: {
    color: '#94a3b8',
    background: '#ffffff',
  },
  dayToday: {
    border: '2px solid #2563eb',
    background: '#bfdbfe',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 8,
  },
};

export default function Calendar() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const monthCells = useMemo(() => getMonthGrid(year, month), [year, month]);

  const currentMonthLabel = `${MONTH_LABELS[month]} ${year}`;

  const handlePreviousMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((value) => value - 1);
    } else {
      setMonth((value) => value - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((value) => value + 1);
    } else {
      setMonth((value) => value + 1);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <div>
          <p style={styles.title}>Calendar</p>
          <div style={{ color: '#cbd5e1', fontSize: 14 }}>{currentMonthLabel}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={handlePreviousMonth} style={styles.navButton}>
            ◀
          </button>
          <button type="button" onClick={handleNextMonth} style={styles.navButton}>
            ▶
          </button>
        </div>
      </div>

      <div style={styles.gridHeader}>
        {WEEK_DAYS.map((day) => (
          <div key={day} style={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>

      <div style={styles.gridBody}>
        {monthCells.map((cell) => {
          const isToday =
            cell.year === now.getFullYear() &&
            cell.month === now.getMonth() &&
            cell.day === now.getDate();

          return (
            <div
              key={cell.key}
              style={{
                ...styles.dayCell,
                ...(cell.isCurrentMonth ? {} : styles.dayOutside),
                ...(isToday ? styles.dayToday : {}),
              }}
            >
              <span style={styles.dayNumber}>{cell.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
