import { useState, useRef } from 'react';
import type { Equipment } from '../types';

interface WeekRow {
  day: string;
  physicalDamage: string;
  fluidLeaks: string;
  controls: string;
  safetyDevices: string;
  operatorShift: string;
  repairsNeeded: string;
  taggedOutOfService: string;
  supvInitials: string;
}

interface WeekData {
  monYr: string;
  pitId: string;
  rows: WeekRow[];
}

const DAYS = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'];

const emptyWeek = (monYr: string, pitId: string): WeekData => ({
  monYr,
  pitId,
  rows: DAYS.map(day => ({
    day,
    physicalDamage: '',
    fluidLeaks: '',
    controls: '',
    safetyDevices: '',
    operatorShift: '',
    repairsNeeded: '',
    taggedOutOfService: '',
    supvInitials: '',
  })),
});

const getInitialWeek = (year: number, month: number): WeekData[] => {
  const firstDay = new Date(year, month, 1);
  let currentSunday = new Date(firstDay);
  currentSunday.setDate(currentSunday.getDate() - currentSunday.getDay());
  
  const monYr = `${currentSunday.getMonth() + 1}/${currentSunday.getFullYear()}`;
  return [emptyWeek(monYr, '')];
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface InspectionsPageProps {
  equipments: Equipment[];
}

export function InspectionsPage({ equipments }: InspectionsPageProps) {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [weeks, setWeeks] = useState<WeekData[]>(() => getInitialWeek(now.getFullYear(), now.getMonth()));
  const printRef = useRef<HTMLDivElement>(null);

  const pitEquipments = equipments.filter(e => 
    e.type === 'Forklift' || e.type === 'Reach Truck' || e.type === 'Pallet Jack'
  );

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setWeeks(getInitialWeek(year, month));
  };

  const handleAddWeek = () => {
    setWeeks(prev => {
      const copy = [...prev];
      const monYr = `${selectedMonth + 1}/${selectedYear}`;
      copy.push(emptyWeek(monYr, ''));
      return copy;
    });
  };

  const updateCell = (weekIdx: number, dayIdx: number, field: keyof WeekRow, value: string) => {
    setWeeks(prev => {
      const copy = [...prev];
      copy[weekIdx] = {
        ...copy[weekIdx],
        rows: copy[weekIdx].rows.map((row, i) => 
          i === dayIdx ? { ...row, [field]: value } : row
        ),
      };
      return copy;
    });
  };

  const updateWeekMeta = (weekIdx: number, field: 'monYr' | 'pitId', value: string) => {
    setWeeks(prev => {
      const copy = [...prev];
      copy[weekIdx] = { ...copy[weekIdx], [field]: value };
      return copy;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const thStyle: React.CSSProperties = {
    border: '1px solid #222',
    padding: '3px 5px',
    fontSize: 10,
    fontWeight: 700,
    textAlign: 'center',
    background: '#f8f4ef',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    border: '1px solid #555',
    padding: '2px 4px',
    fontSize: 11,
    height: 24,
    verticalAlign: 'middle',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: 'none',
    background: 'transparent',
    fontSize: 11,
    outline: 'none',
    padding: 0,
    textAlign: 'center',
    height: '100%',
  };

  const weekHeaderStyle: React.CSSProperties = {
    border: '1px solid #222',
    padding: '3px 5px',
    fontSize: 10,
    fontWeight: 700,
    background: '#e8e0d4',
  };

  const renderWeek = (week: WeekData, weekIdx: number, isFirst: boolean) => (
    <tbody key={weekIdx}>
      {/* Week header */}
      <tr>
        <td style={weekHeaderStyle}>Week:</td>
        <td colSpan={2} style={weekHeaderStyle}>
          <span style={{ marginRight: 4 }}>Mon/Yr:</span>
          <input style={{ ...inputStyle, textAlign: 'left', fontWeight: 700, width: 80 }} 
            value={week.monYr} onChange={e => updateWeekMeta(weekIdx, 'monYr', e.target.value)} />
        </td>
        <td style={weekHeaderStyle}>/</td>
        <td colSpan={2} style={{ ...weekHeaderStyle, background: isFirst ? '#e8e0d4' : '#d4d0cc' }}>
          {isFirst && <span style={{ marginRight: 4 }}>PIT ID #:</span>}
          {isFirst && (
            <input style={{ ...inputStyle, textAlign: 'left', fontWeight: 700, width: 80 }}
              value={selectedEquipment} readOnly />
          )}
        </td>
        <td colSpan={2} style={{ ...weekHeaderStyle, background: isFirst ? '#e8e0d4' : '#d4d0cc' }}></td>
        <td style={{ ...weekHeaderStyle, fontSize: 9, lineHeight: '1.1' }}>Tagged<br/>Out of<br/>Service<br/>(Y/N)</td>
        <td style={{ ...weekHeaderStyle, fontSize: 9, lineHeight: '1.1' }}>Supv.<br/>Notified<br/>Initials</td>
      </tr>
      {/* Column header row */}
      <tr>
        <th style={{ ...thStyle, width: 55 }}>Day of<br/>Week</th>
        <th style={{ ...thStyle, width: 70 }}>Physical<br/>Damage/Wear</th>
        <th style={{ ...thStyle, width: 50 }}>Fluid<br/>Leaks</th>
        <th style={{ ...thStyle, width: 55 }}>Controls</th>
        <th style={{ ...thStyle, width: 55 }}>Safety<br/>Devices</th>
        <th style={{ ...thStyle, width: 140 }}>Operator(s) Names/Shift</th>
        <th style={{ ...thStyle, width: 140 }}>Repairs Needed</th>
        <th style={{ ...thStyle, width: 0 }} colSpan={3}></th>
      </tr>
      {/* Day rows */}
      {week.rows.map((row, dayIdx) => (
        <tr key={dayIdx}>
          <td style={{ ...tdStyle, fontWeight: 600, fontSize: 10, textAlign: 'center' }}>{row.day}</td>
          <td style={tdStyle}>
            <input style={inputStyle} value={row.physicalDamage} onChange={e => updateCell(weekIdx, dayIdx, 'physicalDamage', e.target.value)} />
          </td>
          <td style={tdStyle}>
            <input style={inputStyle} value={row.fluidLeaks} onChange={e => updateCell(weekIdx, dayIdx, 'fluidLeaks', e.target.value)} />
          </td>
          <td style={tdStyle}>
            <input style={inputStyle} value={row.controls} onChange={e => updateCell(weekIdx, dayIdx, 'controls', e.target.value)} />
          </td>
          <td style={tdStyle}>
            <input style={inputStyle} value={row.safetyDevices} onChange={e => updateCell(weekIdx, dayIdx, 'safetyDevices', e.target.value)} />
          </td>
          <td style={tdStyle}>
            <input style={{ ...inputStyle, textAlign: 'left' }} value={row.operatorShift} onChange={e => updateCell(weekIdx, dayIdx, 'operatorShift', e.target.value)} />
          </td>
          <td style={tdStyle}>
            <input style={{ ...inputStyle, textAlign: 'left' }} value={row.repairsNeeded} onChange={e => updateCell(weekIdx, dayIdx, 'repairsNeeded', e.target.value)} />
          </td>
          <td style={{ ...tdStyle, width: 0 }} colSpan={1}></td>
          <td style={{ ...tdStyle, width: 45 }}>
            <input style={inputStyle} value={row.taggedOutOfService} onChange={e => updateCell(weekIdx, dayIdx, 'taggedOutOfService', e.target.value)} />
          </td>
          <td style={{ ...tdStyle, width: 45 }}>
            <input style={inputStyle} value={row.supvInitials} onChange={e => updateCell(weekIdx, dayIdx, 'supvInitials', e.target.value)} />
          </td>
        </tr>
      ))}
    </tbody>
  );

  return (
    <div className="p-6 md:p-8">
      {/* Screen-only controls */}
      <div className="no-print mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Assets</p>
            <h1 className="text-2xl md:text-3xl font-serif text-stone-900 tracking-tight">PIT Pre-Shift Inspections</h1>
          </div>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
            Print Checklist
          </button>
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          <select
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white"
            value={selectedEquipment}
            onChange={e => setSelectedEquipment(e.target.value)}
          >
            <option value="">Select PIT equipment...</option>
            {pitEquipments.map(eq => (
              <option key={eq.id} value={eq.serialNumber}>{eq.name} ({eq.serialNumber})</option>
            ))}
          </select>

          <select
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white"
            value={selectedMonth}
            onChange={e => handleMonthChange(parseInt(e.target.value), selectedYear)}
          >
            {MONTHS.map((m, idx) => (
              <option key={idx} value={idx}>{m}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white"
            value={selectedYear}
            onChange={e => handleMonthChange(selectedMonth, parseInt(e.target.value))}
          >
            {[2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Printable checklist */}
      <div ref={printRef} className="pit-checklist-print" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        {/* Form header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, borderBottom: '2px solid #222', paddingBottom: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 700 }}>
            FORM5142 - PIT Pre-Shift Inspection Checklist Rev06
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#FF4713', fontFamily: 'Arial Black, Arial, sans-serif' }}>
            GXO
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          {weeks.map((week, idx) => renderWeek(week, idx, idx === 0))}
        </table>
      </div>

      {/* Add Week Button (No Print) */}
      <div className="no-print mt-6 flex justify-center">
        <button
          onClick={handleAddWeek}
          className="px-5 py-2.5 bg-white border border-stone-300 text-stone-700 rounded-full text-sm font-medium hover:bg-stone-50 transition flex items-center gap-2 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Week
        </button>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print, header, aside, [class*="sidebar"], nav { 
            display: none !important; 
          }
          body, html { 
            margin: 0 !important; 
            padding: 0 !important; 
            background: white !important;
          }
          .min-h-screen { min-height: auto !important; }
          .flex.min-h-screen { display: block !important; }
          main { overflow: visible !important; }
          .pit-checklist-print { 
            padding: 12px !important; 
            margin: 0 !important;
          }
          @page { 
            size: landscape; 
            margin: 0.4in; 
          }
        }
      `}</style>
    </div>
  );
}
