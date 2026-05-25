import { useState, useEffect } from 'react';
import './Dashboard.css';

const HORAS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00'
];

// Obtener lunes de la semana
const getMonday = (d) => {

  const date = new Date(d);

  const day = date.getDay();

  const diff =
    date.getDate() - day + (day === 0 ? -6 : 1);

  return new Date(date.setDate(diff));
};

export default function Dashboard({ onLogout }) {

  // Usuario logeado
  const usuario = JSON.parse(
    localStorage.getItem('usuario')
  );

  // =========================================
  // ESTADOS
  // =========================================

  // Laboratorios de clases
  const [laboratoriosClase, setLaboratoriosClase] =
    useState([]);

  // Laboratorios siempre disponibles
  const [
    laboratoriosSiempre,
    setLaboratoriosSiempre
  ] = useState([]);

  // Todos los laboratorios unidos
  const [laboratorios, setLaboratorios] =
    useState([]);

  // Laboratorio seleccionado
  const [selectedLab, setSelectedLab] =
    useState(null);

  // Reservas
  const [reservas, setReservas] =
    useState([]);

  // Semana actual
  const [currentWeekStart, setCurrentWeekStart] =
    useState(getMonday(new Date()));

  // =========================================
  // OBTENER LABORATORIOS DE CLASES
  // =========================================

  const obtenerLaboratoriosClase =
    async () => {

      try {

        const response = await fetch(
          `http://localhost:3000/api/laboratorios/alumno/${usuario.idUsuario}`
        );

        const data =
          await response.json();

        console.log(
          'LABORATORIOS CLASE:',
          data
        );

        if (data.ok) {

          setLaboratoriosClase(
            data.laboratorios
          );

          return data.laboratorios;
        }

        return [];

      } catch (error) {

        console.log(error);

        return [];
      }
    };

  // =========================================
  // OBTENER LABORATORIOS SIEMPRE
  // =========================================

  const obtenerLaboratoriosSiempre =
    async () => {

      try {

        const response = await fetch(
          'http://localhost:3000/api/laboratorios/siempre-disponibles'
        );

        const data =
          await response.json();

        console.log(
          'LABORATORIOS SIEMPRE:',
          data
        );

        if (data.ok) {

          setLaboratoriosSiempre(
            data.laboratorios
          );

          return data.laboratorios;
        }

        return [];

      } catch (error) {

        console.log(error);

        return [];
      }
    };

  // =========================================
  // CARGAR TODOS LOS LABORATORIOS
  // =========================================

  const cargarLaboratorios =
    async () => {

      const labsClase =
        await obtenerLaboratoriosClase();

      const labsSiempre =
        await obtenerLaboratoriosSiempre();

      // Evitar duplicados
      const idsExistentes =
        labsClase.map(
          lab => lab.idLaboratorio
        );

      const labsSiempreFiltrados =
        labsSiempre.filter(
          lab =>
            !idsExistentes.includes(
              lab.idLaboratorio
            )
        );

      // Unir todos
      const todos =
        [
          ...labsClase,
          ...labsSiempreFiltrados
        ];

      setLaboratorios(todos);

      // seleccionar primero automáticamente
      if (todos.length > 0) {

        setSelectedLab(
          todos[0].idLaboratorio
        );
      }
    };

  // =========================================
  // OBTENER RESERVAS
  // =========================================

  const obtenerReservas =
    async (idLaboratorio) => {

      try {

        const response = await fetch(
          `http://localhost:3000/api/reservas/laboratorio/${idLaboratorio}`
        );

        const data =
          await response.json();

        console.log(
          'RESERVAS:',
          data
        );

        if (data.ok) {

          setReservas(data.reservas);
        }

      } catch (error) {

        console.log(error);
      }
    };

  // =========================================
  // CARGAR LABORATORIOS AL INICIO
  // =========================================

  useEffect(() => {

    cargarLaboratorios();

  }, []);

  // =========================================
  // CARGAR RESERVAS CUANDO CAMBIA LAB
  // =========================================

  useEffect(() => {

    if (selectedLab) {

      obtenerReservas(selectedLab);
    }

  }, [selectedLab]);

  // =========================================
  // LABORATORIO ACTUAL
  // =========================================

  const laboratorioActual =
    laboratorios.find(
      lab =>
        lab.idLaboratorio ==
        selectedLab
    );

  const laboratoriosSiempreFiltrados =
  laboratoriosSiempre.filter(
    labSiempre =>
      !laboratoriosClase.some(
        labClase =>
          labClase.idLaboratorio ===
          labSiempre.idLaboratorio
      )
  );

  // =========================================
  // CONTAR RESERVAS
  // =========================================

  const contarReservas =
    (fecha, hora) => {

      return reservas.filter(
        reserva => {

          // fecha SQL
          const reservaFecha =
            reserva.fecha.split('T')[0];

          // hora SQL
          const reservaHora =
            reserva.hora.substring(0, 5);

          return (
            reservaFecha === fecha &&
            reservaHora === hora
          );

        }
      ).length;
    };

  // =========================================
  // NAVEGACIÓN SEMANAS
  // =========================================

  const nextWeek = () => {

    const next =
      new Date(currentWeekStart);

    next.setDate(
      next.getDate() + 7
    );

    setCurrentWeekStart(next);
  };

  const prevWeek = () => {

    const prev =
      new Date(currentWeekStart);

    prev.setDate(
      prev.getDate() - 7
    );

    setCurrentWeekStart(prev);
  };

  const goToToday = () => {

    setCurrentWeekStart(
      getMonday(new Date())
    );
  };

  // =========================================
  // DÍAS DE LA SEMANA
  // =========================================

  const currentWeekDays =
    Array.from(
      { length: 5 }
    ).map((_, i) => {

      const date =
        new Date(currentWeekStart);

      date.setDate(
        date.getDate() + i
      );

      return date;
    });

  // =========================================
  // FORMATEAR FECHA
  // =========================================

  const formatDateString =
    (date) => {

      const year =
        date.getFullYear();

      const month = String(
        date.getMonth() + 1
      ).padStart(2, '0');

      const day = String(
        date.getDate()
      ).padStart(2, '0');

      return `${year}-${month}-${day}`;
    };

  // =========================================
  // FORMATEAR HEADER
  // =========================================

  const formatHeaderDate =
    (date) => {

      const diasSemana = [
        'Domingo',
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado'
      ];

      const meses = [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic'
      ];

      return `${diasSemana[date.getDay()]} ${date.getDate()} ${meses[date.getMonth()]}`;
    };

  // =========================================
  // RENDER
  // =========================================

  return (

    <div className="dashboard-container">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="sidebar-header">
          <div className="logo-icon-small">
            🌍
          </div>

          <h2>TinyEarthLab</h2>
        </div>

        <nav className="lab-list">

          {/* ================================= */}
          {/* LABS DE CLASES */}
          {/* ================================= */}

          <h3>
            Laboratorios para tus Clases
          </h3>

          {laboratoriosClase.map(lab => (

            <button
              key={lab.idLaboratorio}
              className={`lab-button ${
                selectedLab ==
                lab.idLaboratorio
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setSelectedLab(
                  lab.idLaboratorio
                )
              }
            >

              <div className="lab-name">
                {lab.nombre}
              </div>

              <div className="lab-building">
                {lab.edificio}
              </div>

            </button>
          ))}

          {/* ================================= */}
          {/* OTROS LABORATORIOS */}
          {/* ================================= */}

          <h3
            style={{
              marginTop: '25px'
            }}
          >
            Otros Laboratorios
          </h3>

          {laboratoriosSiempreFiltrados.map(lab => (

            <button
              key={lab.idLaboratorio}
              className={`lab-button ${
                selectedLab ==
                lab.idLaboratorio
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setSelectedLab(
                  lab.idLaboratorio
                )
              }
            >

              <div className="lab-name">
                {lab.nombre}
              </div>

              <div className="lab-building">
                {lab.edificio}
              </div>

            </button>
          ))}

        </nav>

        <div className="sidebar-footer">

          <button
            className="logout-button"
            onClick={onLogout}
          >
            Cerrar Sesión
          </button>

        </div>

      </aside>

      {/* MAIN */}
      <main className="main-content">

        <header className="main-header">

          <div className="header-title-area">

            <h1>
              {
                laboratorioActual?.nombre
              }
            </h1>

            <p>
              Reserva por hora en
              diferentes semanas.
            </p>

          </div>

          <div className="week-navigation">

            <button
              className="nav-btn"
              onClick={prevWeek}
            >
              &larr; Semana Anterior
            </button>

            <button
              className="nav-btn nav-btn-today"
              onClick={goToToday}
            >
              Semana Actual
            </button>

            <button
              className="nav-btn"
              onClick={nextWeek}
            >
              Siguiente Semana
              &rarr;
            </button>

          </div>

        </header>

        {/* CALENDARIO */}
        <div className="calendar-container">

          <div className="calendar-grid">

            <div className="calendar-header-cell corner"></div>

            {/* HEADERS DÍAS */}
            {currentWeekDays.map(date => (

              <div
                key={date.toISOString()}
                className="calendar-header-cell"
              >
                {formatHeaderDate(date)}
              </div>

            ))}

            {/* HORAS */}
            {HORAS.map(hora => (

              <div
                style={{
                  display: 'contents'
                }}
                key={`row-${hora}`}
              >

                <div className="calendar-time-cell">
                  {hora}
                </div>

                {currentWeekDays.map(date => {

                  const dateString =
                    formatDateString(date);

                  const reservadas =
                    contarReservas(
                      dateString,
                      hora
                    );

                  const disponibles =
                    laboratorioActual?.capacidad -
                    reservadas;
                  // =========================================
                  // VALIDAR SI EL HORARIO YA PASÓ
                  // =========================================

                  const ahora = new Date();

                  const fechaHoraCelda =
                    new Date(`${dateString}T${hora}:00`);

                  const horarioPasado =
                    fechaHoraCelda < ahora;

                  return (

                    <div
                      key={`${selectedLab}-${dateString}-${hora}`}
                      className={`calendar-cell
                        ${horarioPasado ? 'past-cell' : ''}
                        ${disponibles <= 0 ? 'reserved' : ''}
                      `}
                      title="Horario del laboratorio"
                    >

                      {horarioPasado ? (

                        <div className="past-text">
                          —
                        </div>

                      ) : disponibles <= 0 ? (

                        <div className="full-text">
                          Lleno
                        </div>

                      ) : (

                        <div className="available-text">

                          {disponibles} espacio

                          {disponibles !== 1
                            ? 's'
                            : ''}

                        </div>
                    )}

                    </div>
                  );
                })}
              </div>
            ))}

          </div>
        </div>

      </main>
    </div>
  );
}