import { useState, useEffect } from "react";
import "./Dashboard.css";

const HORAS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

// Obtener lunes de la semana
const getMonday = (d) => {
  const date = new Date(d);

  const day = date.getDay();

  const diff = date.getDate() - day + (day === 0 ? -6 : 1);

  return new Date(date.setDate(diff));
};

export default function Dashboard({ onLogout }) {
  // Usuario logeado
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // =========================================
  // ESTADOS
  // =========================================

  // Laboratorios de clases
  const [laboratoriosClase, setLaboratoriosClase] = useState([]);

  // Laboratorios siempre disponibles
  const [laboratoriosSiempre, setLaboratoriosSiempre] = useState([]);

  // Todos los laboratorios unidos
  const [laboratorios, setLaboratorios] = useState([]);

  // Laboratorio seleccionado
  const [selectedLab, setSelectedLab] = useState(null);

  // Reservas
  const [reservas, setReservas] = useState([]);

  // Semana actual
  const [currentWeekStart, setCurrentWeekStart] = useState(
    getMonday(new Date()),
  );

  // =========================================
  // ESTADOS DE EQUIPOS Y RESERVAS
  // =========================================
  const [alumnosDb, setAlumnosDb] = useState([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [nombreEquipo, setNombreEquipo] = useState("");
  const [clasesAlumno, setClasesAlumno] = useState([]);
  const [selectedClaseEquipo, setSelectedClaseEquipo] = useState("");

  const [showReservaModal, setShowReservaModal] = useState(false);
  const [reservaSlot, setReservaSlot] = useState(null);
  const [misEquipos, setMisEquipos] = useState([]);
  const [selectedEquipoReserva, setSelectedEquipoReserva] = useState(null);

  // =========================================
  // OBTENER LABORATORIOS DE CLASES
  // =========================================

  const obtenerLaboratoriosClase = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/laboratorios/alumno/${usuario.idUsuario}`,
      );

      const data = await response.json();

      console.log("LABORATORIOS CLASE:", data);

      if (data.ok) {
        setLaboratoriosClase(data.laboratorios);

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

  const obtenerLaboratoriosSiempre = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/laboratorios/siempre-disponibles",
      );

      const data = await response.json();

      console.log("LABORATORIOS SIEMPRE:", data);

      if (data.ok) {
        setLaboratoriosSiempre(data.laboratorios);

        return data.laboratorios;
      }

      return [];
    } catch (error) {
      console.log(error);

      return [];
    }
  };

  // =========================================
  // OBTENER ALUMNOS PARA EQUIPOS
  // =========================================

  const obtenerAlumnosDb = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/alumnos");
      const data = await response.json();
      if (Array.isArray(data)) {
        setAlumnosDb(data);
      }
    } catch (error) {
      console.log("Error obtaining students:", error);
    }
  };

  const obtenerClasesAlumno = async () => {
    try {
      if (!usuario.noControl) return;
      const response = await fetch(
        `http://localhost:3000/api/clases/alumno/${usuario.noControl}`,
      );
      const data = await response.json();
      if (data.ok) {
        setClasesAlumno(data.clases);
      }
    } catch (error) {
      console.log("Error obtaining classes for student:", error);
    }
  };

  const abrirModalEquipos = () => {
    setNombreEquipo("");
    obtenerAlumnosDb();
    obtenerClasesAlumno();
    setSelectedClaseEquipo("");
    setSelectedTeamMembers([]);
    setShowCreateTeamModal(true);
  };

  const handleToggleMember = (noControl) => {
    setSelectedTeamMembers((prev) => {
      if (prev.includes(noControl)) {
        return prev.filter((id) => id !== noControl);
      } else {
        if (prev.length >= 3) return prev; // maximo 3
        return [...prev, noControl];
      }
    });
  };

  const handleCrearEquipo = async () => {
    if (!nombreEquipo.trim()) {
      alert("Debes ingresar un nombre para el equipo.");
      return;
    }
    if (selectedTeamMembers.length === 0 || selectedTeamMembers.length > 3) {
      alert("Debes seleccionar entre 1 y 3 alumnos.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/equipos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombreEquipo,
          alumnos: selectedTeamMembers,
          idClase: selectedClaseEquipo,
        }),
      });

      const data = await response.json();
      if (data.ok) {
        alert("Equipo creado exitosamente (ID: " + data.idEquipo + ")");
        setShowCreateTeamModal(false);
        setSelectedTeamMembers([]);
        setNombreEquipo("");
        setSelectedClaseEquipo("");
      } else {
        alert(data.error + (data.detalles ? ": " + data.detalles : ""));
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al crear equipo");
    }
  };

  // =========================================
  // LÓGICA DE RESERVA
  // =========================================

  const obtenerMisEquipos = async (idClase) => {
    try {
      if (!usuario.noControl) return;
      const response = await fetch("http://localhost:3000/api/equipos/alumno", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noControl: usuario.noControl,
          idClase: idClase,
        }),
      });
      const data = await response.json();
      if (data.ok) {
        setMisEquipos(data.equipos);
      }
    } catch (error) {
      console.log("Error obtaining teams:", error);
    }
  };

  const abrirModalReserva = (fecha, hora) => {
    const classForCurrentLab = clasesAlumno.find(
      (cl) => cl.idLaboratorio == selectedLab,
    );
    const idClaseReserva = classForCurrentLab
      ? classForCurrentLab.idClase
      : null;

    obtenerMisEquipos(idClaseReserva);
    setReservaSlot({ fecha, hora });
    setSelectedEquipoReserva(null);
    setShowReservaModal(true);
  };

  const handleCrearReserva = async () => {
    if (!selectedEquipoReserva) {
      alert("Por favor selecciona un equipo para la reserva.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/reservas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idEquipo: selectedEquipoReserva,
          idLaboratorio: selectedLab,
          fecha: reservaSlot.fecha,
          hora: reservaSlot.hora,
        }),
      });

      const data = await response.json();
      if (data.ok) {
        alert("Reserva exitosa en la estación " + data.idEstacion);
        setShowReservaModal(false);
        obtenerReservas(selectedLab); // Refrescar el calendario
      } else {
        alert(data.mensaje || "Error al reservar");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al realizar la reserva");
    }
  };

  // =========================================
  // CARGAR TODOS LOS LABORATORIOS
  // =========================================

  const cargarLaboratorios = async () => {
    const labsClase = await obtenerLaboratoriosClase();

    const labsSiempre = await obtenerLaboratoriosSiempre();

    // Evitar duplicados
    const idsExistentes = labsClase.map((lab) => lab.idLaboratorio);

    const labsSiempreFiltrados = labsSiempre.filter(
      (lab) => !idsExistentes.includes(lab.idLaboratorio),
    );

    // Unir todos
    const todos = [...labsClase, ...labsSiempreFiltrados];

    setLaboratorios(todos);

    // seleccionar primero automáticamente
    if (todos.length > 0) {
      setSelectedLab(todos[0].idLaboratorio);
    }
  };

  // =========================================
  // OBTENER RESERVAS
  // =========================================

  const obtenerReservas = async (idLaboratorio) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/reservas/laboratorio/${idLaboratorio}`,
      );

      const data = await response.json();

      console.log("RESERVAS:", data);

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
    obtenerClasesAlumno();
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

  const laboratorioActual = laboratorios.find(
    (lab) => lab.idLaboratorio == selectedLab,
  );

  const laboratoriosSiempreFiltrados = laboratoriosSiempre.filter(
    (labSiempre) =>
      !laboratoriosClase.some(
        (labClase) => labClase.idLaboratorio === labSiempre.idLaboratorio,
      ),
  );

  // =========================================
  // CONTAR RESERVAS
  // =========================================

  const contarReservas = (fecha, hora) => {
    return reservas.filter((reserva) => {
      // fecha SQL
      const reservaFecha = reserva.fecha.split("T")[0];

      // hora SQL
      const reservaHora = reserva.hora.substring(0, 5);

      return reservaFecha === fecha && reservaHora === hora;
    }).length;
  };

  // =========================================
  // NAVEGACIÓN SEMANAS
  // =========================================

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

  // =========================================
  // DÍAS DE LA SEMANA
  // =========================================

  const currentWeekDays = Array.from({ length: 5 }).map((_, i) => {
    const date = new Date(currentWeekStart);

    date.setDate(date.getDate() + i);

    return date;
  });

  // =========================================
  // FORMATEAR FECHA
  // =========================================

  const formatDateString = (date) => {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================
  // FORMATEAR HEADER
  // =========================================

  const formatHeaderDate = (date) => {
    const diasSemana = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    const meses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
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
          <div className="logo-icon-small">🌍</div>

          <h2>TinyEarthLab</h2>
        </div>

        <nav className="lab-list">
          {/* ================================= */}
          {/* LABS DE CLASES */}
          {/* ================================= */}

          <h3>Laboratorios para tus Clases</h3>

          {laboratoriosClase.map((lab) => (
            <button
              key={lab.idLaboratorio}
              className={`lab-button ${
                selectedLab == lab.idLaboratorio ? "active" : ""
              }`}
              onClick={() => setSelectedLab(lab.idLaboratorio)}
            >
              <div className="lab-name">{lab.nombre}</div>

              <div className="lab-building">{lab.edificio}</div>
            </button>
          ))}

          {/* ================================= */}
          {/* OTROS LABORATORIOS */}
          {/* ================================= */}

          <h3
            style={{
              marginTop: "25px",
            }}
          >
            Otros Laboratorios
          </h3>

          {laboratoriosSiempreFiltrados.map((lab) => (
            <button
              key={lab.idLaboratorio}
              className={`lab-button ${
                selectedLab == lab.idLaboratorio ? "active" : ""
              }`}
              onClick={() => setSelectedLab(lab.idLaboratorio)}
            >
              <div className="lab-name">{lab.nombre}</div>

              <div className="lab-building">{lab.edificio}</div>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="create-team-btn" onClick={abrirModalEquipos}>
            Crear Equipo
          </button>

          <button className="logout-button" onClick={onLogout}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-title-area">
            <h1>{laboratorioActual?.nombre}</h1>

            <p>Reserva por hora en diferentes semanas.</p>
          </div>

          <div className="week-navigation">
            <button className="nav-btn" onClick={prevWeek}>
              &larr; Semana Anterior
            </button>

            <button className="nav-btn nav-btn-today" onClick={goToToday}>
              Semana Actual
            </button>

            <button className="nav-btn" onClick={nextWeek}>
              Siguiente Semana &rarr;
            </button>
          </div>
        </header>

        {/* CALENDARIO */}
        <div className="calendar-container">
          <div className="calendar-grid">
            <div className="calendar-header-cell corner"></div>

            {/* HEADERS DÍAS */}
            {currentWeekDays.map((date) => (
              <div key={date.toISOString()} className="calendar-header-cell">
                {formatHeaderDate(date)}
              </div>
            ))}

            {/* HORAS */}
            {HORAS.map((hora) => (
              <div
                style={{
                  display: "contents",
                }}
                key={`row-${hora}`}
              >
                <div className="calendar-time-cell">{hora}</div>

                {currentWeekDays.map((date) => {
                  const dateString = formatDateString(date);

                  const reservadas = contarReservas(dateString, hora);

                  const disponibles = laboratorioActual?.capacidad - reservadas;
                  // =========================================
                  // VALIDAR SI EL HORARIO YA PASÓ
                  // =========================================

                  const ahora = new Date();

                  const fechaHoraCelda = new Date(`${dateString}T${hora}:00`);

                  const horarioPasado = fechaHoraCelda < ahora;

                  return (
                    <div
                      key={`${selectedLab}-${dateString}-${hora}`}
                      className={`calendar-cell
                        ${horarioPasado ? "past-cell" : ""}
                        ${disponibles <= 0 ? "reserved" : ""}
                      `}
                      title="Horario del laboratorio"
                      onClick={() =>
                        !horarioPasado &&
                        disponibles > 0 &&
                        abrirModalReserva(dateString, hora)
                      }
                    >
                      {horarioPasado ? (
                        <div className="past-text">—</div>
                      ) : disponibles <= 0 ? (
                        <div className="full-text">Lleno</div>
                      ) : (
                        <div className="available-text">
                          {disponibles} espacio
                          {disponibles !== 1 ? "s" : ""}
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

      {/* MODAL CREAR EQUIPO */}
      {showCreateTeamModal && (
        <div className="modal-overlay">
          <div className="modal-content login-glass-card">
            <h2>Crear Equipo</h2>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#cbd5e1",
                  fontSize: "14px",
                }}
              >
                Nombre del Equipo:
              </label>
              <input
                type="text"
                value={nombreEquipo}
                onChange={(e) => setNombreEquipo(e.target.value)}
                placeholder="Ej. Los Hackers"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(0,0,0,0.3)",
                  color: "white",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#cbd5e1",
                  fontSize: "14px",
                }}
              >
                Asociar a una Clase (Opcional):
              </label>
              <select
                value={selectedClaseEquipo}
                onChange={(e) => setSelectedClaseEquipo(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(0,0,0,0.3)",
                  color: "white",
                }}
              >
                <option
                  value=""
                  style={{ background: "#1e293b", color: "white" }}
                >
                  Ninguna - Acceso Libre
                </option>
                {clasesAlumno.map((clase) => (
                  <option
                    key={clase.idClase}
                    value={clase.idClase}
                    style={{ background: "#1e293b", color: "white" }}
                  >
                    {clase.materiaNombre} (Lab:{" "}
                    {clase.laboratorioNombre || "Ninguno"}) -{" "}
                    {clase.hora.substring(0, 5)} hrs
                  </option>
                ))}
              </select>
            </div>

            <p>Selecciona hasta 3 alumnos para formar un equipo.</p>

            <div className="team-members-list">
              {alumnosDb.map((alumno) => {
                const isSelected = selectedTeamMembers.includes(
                  alumno.noControl,
                );
                const isDisabled =
                  !isSelected && selectedTeamMembers.length >= 3;

                return (
                  <div
                    key={alumno.noControl}
                    className={`team-member-option ${isDisabled ? "disabled" : ""}`}
                    onClick={() =>
                      !isDisabled && handleToggleMember(alumno.noControl)
                    }
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      disabled={isDisabled}
                    />
                    <div className="team-member-info">
                      <span className="team-member-name">
                        {alumno.nombre} {alumno.apellidos}
                      </span>
                      <span className="team-member-nocontrol">
                        {alumno.noControl}{" "}
                        {alumno.idEquipo ? `(Eq. ${alumno.idEquipo})` : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowCreateTeamModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-submit"
                onClick={handleCrearEquipo}
                disabled={selectedTeamMembers.length === 0}
                style={{ opacity: selectedTeamMembers.length === 0 ? 0.5 : 1 }}
              >
                Crear Equipo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RESERVAR */}
      {showReservaModal && (
        <div className="modal-overlay">
          <div className="modal-content login-glass-card">
            <h2>Confirmar Reserva</h2>
            <p>
              Fecha: {reservaSlot?.fecha} | Hora: {reservaSlot?.hora}
            </p>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#cbd5e1",
                  fontSize: "14px",
                }}
              >
                Selecciona tu equipo:
              </label>
              {misEquipos.length > 0 ? (
                <div className="team-members-list">
                  {misEquipos.map((equipo) => (
                    <div
                      key={equipo.idEquipo}
                      className="team-member-option"
                      onClick={() => setSelectedEquipoReserva(equipo.idEquipo)}
                      style={{
                        background:
                          selectedEquipoReserva === equipo.idEquipo
                            ? "rgba(59, 130, 246, 0.3)"
                            : "",
                      }}
                    >
                      <div className="team-member-info">
                        <span className="team-member-name">
                          {equipo.nombre}
                        </span>
                        <span className="team-member-nocontrol">
                          ID: {equipo.idEquipo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#ef4444", fontSize: "13px" }}>
                  No perteneces a ningún equipo. Crea uno primero.
                </p>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowReservaModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-submit"
                onClick={handleCrearReserva}
                disabled={!selectedEquipoReserva}
                style={{ opacity: !selectedEquipoReserva ? 0.5 : 1 }}
              >
                Confirmar Reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
