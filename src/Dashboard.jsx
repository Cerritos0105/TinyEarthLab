import { useState } from 'react';
import './Dashboard.css';

const LABORATORIOS = [
  { id: 'lab1', name: 'Laboratorio de Biología' },
  { id: 'lab2', name: 'Laboratorio de Química' },
  { id: 'lab3', name: 'Laboratorio de Física' },
  { id: 'lab4', name: 'Centro de Cómputo' },
];

const HORAS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

// Función para obtener el Lunes de la semana de una fecha dada
const getMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

export default function Dashboard({ onLogout }) {
  const [selectedLab, setSelectedLab] = useState(LABORATORIOS[0].id);
  
  // Cambiamos 'Set' por 'Map' para poder guardar un valor (el nombre) asociado a la llave (la fecha)
  const [reservations, setReservations] = useState(new Map());
  
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));

  // Estados para el Modal
  const [pendingReservation, setPendingReservation] = useState(null);
  const [reserverName, setReserverName] = useState('');

  // Funciones de navegación
  const nextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const goToToday = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  const currentWeekDays = Array.from({ length: 5 }).map((_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Se activa al hacer clic en una celda
  const handleCellClick = (dateString, hora) => {
    const reservationKey = `${selectedLab}-${dateString}-${hora}`;
    
    // Si ya está reservado, lo cancelamos directamente
    if (reservations.has(reservationKey)) {
      const newReservations = new Map(reservations);
      newReservations.delete(reservationKey);
      setReservations(newReservations);
    } else {
      // Si está libre, abrimos el modal para pedir el nombre
      setPendingReservation({ dateString, hora, key: reservationKey });
    }
  };

  // Se activa al enviar el formulario del modal
  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!reserverName.trim() || !pendingReservation) return;

    const newReservations = new Map(reservations);
    // Guardamos la llave y el valor (nombre de la persona)
    newReservations.set(pendingReservation.key, reserverName.trim());
    
    setReservations(newReservations);
    
    // Limpiamos y cerramos el modal
    setPendingReservation(null);
    setReserverName('');
  };

  const closeModal = () => {
    setPendingReservation(null);
    setReserverName('');
  };

  const formatHeaderDate = (date) => {
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${diasSemana[date.getDay()]} ${date.getDate()} ${meses[date.getMonth()]}`;
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon-small">🌍</div>
          <h2>TinyEarthLab</h2>
        </div>
        
        <nav className="lab-list">
          <h3>Laboratorios</h3>
          {LABORATORIOS.map(lab => (
            <button 
              key={lab.id}
              className={`lab-button ${selectedLab === lab.id ? 'active' : ''}`}
              onClick={() => setSelectedLab(lab.id)}
            >
              {lab.name}
            </button>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-button" onClick={onLogout}>Cerrar Sesión</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-title-area">
            <h1>{LABORATORIOS.find(l => l.id === selectedLab)?.name}</h1>
            <p>Reserva por hora en diferentes semanas.</p>
          </div>
          
          <div className="week-navigation">
            <button className="nav-btn" onClick={prevWeek}>&larr; Semana Anterior</button>
            <button className="nav-btn nav-btn-today" onClick={goToToday}>Semana Actual</button>
            <button className="nav-btn" onClick={nextWeek}>Siguiente Semana &rarr;</button>
          </div>
        </header>

        <div className="calendar-container">
          <div className="calendar-grid">
            <div className="calendar-header-cell corner"></div>
            
            {currentWeekDays.map(date => (
              <div key={date.toISOString()} className="calendar-header-cell">
                {formatHeaderDate(date)}
              </div>
            ))}

            {HORAS.map(hora => (
              <div style={{display: 'contents'}} key={`row-${hora}`}>
                <div className="calendar-time-cell">
                  {hora}
                </div>
                
                {currentWeekDays.map(date => {
                  const dateString = formatDateString(date);
                  const key = `${selectedLab}-${dateString}-${hora}`;
                  
                  // Verificamos si existe en nuestro Map
                  const isReserved = reservations.has(key);
                  // Obtenemos el nombre del reservante
                  const reserver = reservations.get(key);

                  return (
                    <div 
                      key={key} 
                      className={`calendar-cell ${isReserved ? 'reserved' : ''}`}
                      onClick={() => handleCellClick(dateString, hora)}
                      title={isReserved ? `Reservado por: ${reserver}` : 'Click para reservar'}
                    >
                      {isReserved ? (
                        <>
                          <div className="status-text">Reservado</div>
                          <div className="reserver-name">{reserver}</div>
                        </>
                      ) : (
                        'Disponible'
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal Overlay */}
      {pendingReservation && (
        <div className="modal-overlay">
          <div className="modal-content login-glass-card">
            <h2>Confirmar Reserva</h2>
            <p>
              Estás reservando el <strong>{pendingReservation.dateString}</strong> a las <strong>{pendingReservation.hora}</strong>.
            </p>
            <form onSubmit={handleModalSubmit} className="modal-form">
              <div className="input-group">
                <input 
                  type="text" 
                  id="reserverName"
                  value={reserverName}
                  onChange={(e) => setReserverName(e.target.value)}
                  placeholder=" "
                  required 
                  autoFocus
                />
                <label htmlFor="reserverName">Tu Nombre Completo</label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="login-button">Confirmar Reserva</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
