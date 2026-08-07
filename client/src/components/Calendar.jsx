import React, { useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const Calendar = ({ reports = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

  const getDayStatus = (day) => {
    // Mock logic to return a status color based on report for that day
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const report = reports.find(r => r.tarih?.startsWith(dateStr));
    if (!report) return null;
    
    switch(report.durum) {
      case 'onaylandi': return 'var(--success-color)';
      case 'beklemede': return 'var(--warning-color)';
      case 'duzeltme': return 'var(--error-color)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><HiChevronLeft size={20} /></button>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><HiChevronRight size={20} /></button>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center', marginBottom: '0.5rem' }}>
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
          <div key={day} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{day}</div>
        ))}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
        {padding.map(i => <div key={`pad-${i}`} />)}
        {days.map(day => {
          const statusColor = getDayStatus(day);
          const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
          
          return (
            <div key={day} style={{ 
              aspectRatio: '1', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              background: isToday ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)',
              borderRadius: 'var(--radius-sm)',
              position: 'relative',
              cursor: 'pointer',
              border: isToday ? '1px solid var(--border-color)' : 'none'
            }}>
              <span style={{ fontSize: '0.9rem' }}>{day}</span>
              {statusColor && (
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor, marginTop: '2px' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
