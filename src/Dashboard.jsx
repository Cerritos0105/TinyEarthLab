import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
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
  const [diasBloqueados, setDiasBloqueados] = useState([]);

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

  // Estados para gestión de reservas (maestros/admin)
  const [showGestionModal, setShowGestionModal] = useState(false);
  const [reservasParaGestion, setReservasParaGestion] = useState([]);

  // Estados para estadísticas
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsData, setStatsData] = useState([]);
  const chartRef = useRef(null);

  // Estados para Mis Equipos
  const [showMisEquiposModal, setShowMisEquiposModal] = useState(false);
  const [todosEquipos, setTodosEquipos] = useState([]);
  const [showEditEquipoModal, setShowEditEquipoModal] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState(null);
  const [editNombreEquipo, setEditNombreEquipo] = useState("");
  const [editMiembros, setEditMiembros] = useState([]);

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
      : 'TODAS';

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
  // GESTIÓN DE RESERVAS (MAESTROS/ADMIN)
  // =========================================

  const abrirModalGestion = (fecha, hora) => {
    // Filtrar reservas para este slot
    const reservasEnSlot = reservas.filter((reserva) => {
      const reservaFecha = reserva.fecha.split("T")[0];
      const reservaHora = reserva.hora.substring(0, 5);
      return reservaFecha === fecha && reservaHora === hora;
    });

    if (reservasEnSlot.length > 0) {
      setReservaSlot({ fecha, hora });
      setReservasParaGestion(reservasEnSlot);
      setShowGestionModal(true);
    }
  };

  const handleCancelarHora = async () => {
    if (!window.confirm("¿Estás seguro de cancelar TODAS las reservas en esta hora?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/reservas/cancelar-hora`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idLaboratorio: selectedLab,
          fecha: reservaSlot.fecha,
          hora: reservaSlot.hora,
          noControl: usuario.noControl,
          tipo: usuario.tipo,
        }),
      });

      const data = await response.json();
      
      if (data.ok) {
        alert(`Se han cancelado ${data.reservasCanceladas} reservas exitosamente`);
        setReservasParaGestion([]);
        setShowGestionModal(false);
        obtenerReservas(selectedLab); // Refrescar el calendario principal
      } else {
        alert(data.mensaje || "Error al cancelar la hora completa");
      }
    } catch (error) {
      console.error("Error cancelando hora:", error);
      alert("Error de conexión al cancelar la hora");
    }
  };

  // =========================================
  // CARGAR TODOS LOS LABORATORIOS
  // =========================================

  const cargarLaboratorios = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/laboratorios/todos");
      const data = await response.json();
      if (data.ok) {
        setLaboratorios(data.laboratorios);
        setLaboratoriosSiempre([]);
        setLaboratoriosClase([]);
        if (data.laboratorios.length > 0) {
          setSelectedLab(data.laboratorios[0].idLaboratorio);
        }
      }
    } catch (error) {
      console.error("Error fetching all labs:", error);
    }
  };

  // =========================================
  // FUNCIONES MIS EQUIPOS
  // =========================================

  const obtenerTodosEquipos = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/equipos/alumno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noControl: usuario.noControl, idClase: 'TODAS' }),
      });
      const data = await response.json();

      if (data.ok) {
        setTodosEquipos(data.equipos);
      } else {
        setTodosEquipos([]);
      }
    } catch (error) {
      console.error("Error obteniendo equipos:", error);
    }
  };

  const handleEliminarEquipo = async (idEquipo) => {
    if (!window.confirm("¿Estás seguro de eliminar este equipo? Esto también eliminará sus reservas.")) return;
    try {
      const response = await fetch(`http://localhost:3000/api/equipos/${idEquipo}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.ok) {
        alert("Equipo eliminado");
        obtenerTodosEquipos();
      } else {
        alert(data.error || "Error al eliminar");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  const abrirEditarEquipo = (equipo) => {
    setEditingEquipo(equipo);
    setEditNombreEquipo(equipo.nombre);
    setEditMiembros(equipo.alumnos || []);
    obtenerAlumnosDb();
    setShowEditEquipoModal(true);
  };

  const handleEditarEquipo = async () => {
    if (!editNombreEquipo || editMiembros.length === 0) {
      alert("Nombre y al menos 1 miembro son requeridos");
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/api/equipos/${editingEquipo.idEquipo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreEquipo: editNombreEquipo,
          alumnos: editMiembros,
          idClase: null,
        }),
      });
      const data = await response.json();
      if (data.ok) {
        alert("Equipo actualizado");
        setShowEditEquipoModal(false);
        obtenerTodosEquipos();
      } else {
        alert(data.error || "Error al editar");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  // =========================================
  // FUNCIONES EXPORTAR GRÁFICA
  // =========================================

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(statsData.map(d => ({ Hora: d.hora, "Reservas Confirmadas": d.usos })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estadísticas");
    XLSX.writeFile(wb, `estadisticas_${laboratorioActual?.nombre || "lab"}.xlsx`);
  };

  const exportarPDF = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, { backgroundColor: "#0f172a" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pdfWidth, pdf.internal.pageSize.getHeight(), "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.text(`Estadísticas - ${laboratorioActual?.nombre || "Laboratorio"}`, 14, 20);
      pdf.addImage(imgData, "PNG", 14, 30, pdfWidth - 28, pdfHeight - 10);
      pdf.save(`estadisticas_${laboratorioActual?.nombre || "lab"}.pdf`);
    } catch (error) {
      console.error("Error exportando PDF:", error);
      alert("Error al exportar PDF");
    }
  };

  const handleCancelarReservaIndividual = async (idReserva) => {
    if (!window.confirm("¿Cancelar esta reserva individual?")) return;
    try {
      const response = await fetch(`http://localhost:3000/api/reservas/cancelar/${idReserva}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noControl: usuario.noControl, tipo: usuario.tipo }),
      });
      const data = await response.json();
      if (data.ok) {
        alert("Reserva cancelada");
        const nuevas = reservasParaGestion.filter(r => r.idReserva !== idReserva);
        setReservasParaGestion(nuevas);
        if (nuevas.length === 0) setShowGestionModal(false);
        obtenerReservas(selectedLab);
      } else {
        alert(data.mensaje || "Error al cancelar");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  // =========================================
  // OBTENER RESERVAS
  // =========================================

  const obtenerReservas = async (idLab) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/reservas/laboratorio/${idLab}`,
      );

      const data = await response.json();

      if (data.ok) {
        setReservas(data.reservas);
        setDiasBloqueados(data.diasBloqueados || []);
      } else {
        setReservas([]);
        setDiasBloqueados([]);
      }
    } catch (error) {
      console.log(error);
      setReservas([]);
      setDiasBloqueados([]);
    }
  };

  const obtenerEstadisticas = async (idLab) => {
    try {
      const response = await fetch(`http://localhost:3000/api/reservas/estadisticas/laboratorio/${idLab}`);
      const data = await response.json();
      if (data.ok) {
        setStatsData(data.estadisticas);
        setShowStatsModal(true);
      }
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
    }
  };

  // =========================================
  // BLOQUEAR / DESBLOQUEAR DÍAS
  // =========================================

  const handleToggleBloquearDia = async (fechaString) => {
    const isBlocked = diasBloqueados.includes(fechaString);
    const accionText = isBlocked ? "desbloquear" : "bloquear";
    const confirmMsg = isBlocked
      ? `¿Estás seguro de que deseas desbloquear el día ${fechaString}?`
      : `¿Estás seguro de que deseas bloquear todo el día ${fechaString}? ¡Esto eliminará todas las reservas de ese día!`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const endpoint = isBlocked ? "desbloquear-dia" : "bloquear-dia";
      const response = await fetch(`http://localhost:3000/api/reservas/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha: fechaString, idLaboratorio: selectedLab }),
      });

      const data = await response.json();
      if (data.ok) {
        alert(data.mensaje);
        obtenerReservas(selectedLab);
      } else {
        alert("Error: " + data.mensaje);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al " + accionText + " día.");
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
          <h3>Todos los Laboratorios</h3>

          {laboratorios.map((lab) => (
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
          {usuario.tipo !== "maestro" && usuario.tipo !== "docente" && usuario.tipo !== "administrador" && (
            <>
              <button className="create-team-btn" onClick={abrirModalEquipos}>
                Crear Equipo
              </button>

              <button 
                className="create-team-btn" 
                style={{ background: "rgba(59, 130, 246, 0.15)", borderColor: "rgba(59, 130, 246, 0.3)" }}
                onClick={() => { obtenerTodosEquipos(); setShowMisEquiposModal(true); }}
              >
                👥 Mis Equipos
              </button>
            </>
          )}

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

            <p style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              Reserva por hora en diferentes semanas.
              {(usuario.tipo === "maestro" || usuario.tipo === "docente" || usuario.tipo === "administrador") && (
                <button 
                  onClick={() => obtenerEstadisticas(selectedLab)}
                  style={{
                    background: "rgba(59, 130, 246, 0.2)",
                    color: "#60a5fa",
                    border: "1px solid rgba(59, 130, 246, 0.4)",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "bold",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => e.target.style.background = "rgba(59, 130, 246, 0.4)"}
                  onMouseOut={(e) => e.target.style.background = "rgba(59, 130, 246, 0.2)"}
                >
                  📊 Ver Estadísticas
                </button>
              )}
            </p>
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
            {currentWeekDays.map((date) => {
              const dateStr = formatDateString(date);
              const isBlocked = diasBloqueados.includes(dateStr);
              const canBlock = usuario.tipo === "maestro" || usuario.tipo === "administrador" || usuario.tipo === "docente";

              return (
                <div 
                  key={date.toISOString()} 
                  className={`calendar-header-cell ${canBlock ? "clickable-header" : ""} ${isBlocked ? "blocked-header" : ""}`}
                  onClick={() => canBlock && handleToggleBloquearDia(dateStr)}
                  title={canBlock ? (isBlocked ? "Clic para desbloquear" : "Clic para bloquear el día") : ""}
                  style={{ cursor: canBlock ? "pointer" : "default", transition: "all 0.2s" }}
                >
                  {formatHeaderDate(date)} {isBlocked && "🔒"}
                </div>
              );
            })}

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
                  const isBlocked = diasBloqueados.includes(dateString);

                  const reservadas = contarReservas(dateString, hora);

                  const disponibles = laboratorioActual?.capacidad - reservadas;
                  // =========================================
                  // VALIDAR SI EL HORARIO YA PASÓ
                  // =========================================

                  const ahora = new Date();

                  const fechaHoraCelda = new Date(`${dateString}T${hora}:00`);

                  const horarioPasado = fechaHoraCelda < ahora;

                  const esMaestro = usuario.tipo === "maestro" || usuario.tipo === "administrador" || usuario.tipo === "docente";

                  return (
                    <div
                      key={`${selectedLab}-${dateString}-${hora}`}
                      className={`calendar-cell
                        ${horarioPasado && !isBlocked ? "past-cell" : ""}
                        ${(disponibles <= 0 && !isBlocked) ? "reserved" : ""}
                        ${isBlocked ? "blocked-cell" : ""}
                      `}
                      style={{
                        backgroundColor: isBlocked ? "rgba(239, 68, 68, 0.15)" : "",
                        borderColor: isBlocked ? "rgba(239, 68, 68, 0.3)" : "",
                        cursor: isBlocked ? "not-allowed" : ""
                      }}
                      title={isBlocked ? "Día bloqueado" : "Horario del laboratorio"}
                      onClick={() => {
                        if (isBlocked) return;
                        if (horarioPasado && !esMaestro) return;

                        if (esMaestro) {
                          abrirModalGestion(dateString, hora);
                        } else if (disponibles > 0) {
                          abrirModalReserva(dateString, hora);
                        }
                      }}
                    >
                      {isBlocked ? (
                        <div className="blocked-text" style={{ color: "#f87171", fontSize: "12px", fontWeight: "bold" }}>🔒 Bloqueado</div>
                      ) : horarioPasado ? (
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
      {/* MODAL RESERVAR (Omitido por brevedad en multi-replace, asumo que ya existe) */}

      {/* MODAL GESTIÓN DE RESERVAS (MAESTROS/ADMIN) */}
      {showGestionModal && (
        <div className="modal-overlay">
          <div className="modal-content login-glass-card" style={{ maxWidth: "550px" }}>
            <h2>Gestionar Reservas</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              {reservaSlot?.fecha} - {reservaSlot?.hora}
            </p>

            {reservasParaGestion.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No hay reservas en este horario.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {reservasParaGestion.map((r) => (
                  <li 
                    key={r.idReserva}
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      background: "rgba(0,0,0,0.2)",
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      border: "1px solid rgba(255,255,255,0.05)"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "bold", color: "white" }}>Equipo: {r.equipoNombre || "Desconocido"}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>ID Reserva: {r.idReserva}</div>
                    </div>
                    <button 
                      onClick={() => handleCancelarReservaIndividual(r.idReserva)}
                      style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        color: "#fca5a5",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        transition: "all 0.2s"
                      }}
                      onMouseOver={(e) => e.target.style.background = "rgba(239, 68, 68, 0.35)"}
                      onMouseOut={(e) => e.target.style.background = "rgba(239, 68, 68, 0.15)"}
                    >
                      ✕ Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                style={{
                  background: "transparent",
                  color: "#cbd5e1",
                  border: "1px solid rgba(255,255,255,0.2)",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onClick={() => setShowGestionModal(false)}
              >
                Cerrar
              </button>
              {reservasParaGestion.length > 0 && (
                <button
                  style={{
                    background: "rgba(239, 68, 68, 0.2)",
                    color: "#fca5a5",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => e.target.style.background = "rgba(239, 68, 68, 0.4)"}
                  onMouseOut={(e) => e.target.style.background = "rgba(239, 68, 68, 0.2)"}
                  onClick={handleCancelarHora}
                >
                  🗑 Liberar Toda la Hora
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL ESTADÍSTICAS */}
      {showStatsModal && (
        <div className="modal-overlay">
          <div className="modal-content login-glass-card" style={{ maxWidth: "700px", width: "90%" }}>
            <h2>Estadísticas de Uso</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              {laboratorioActual?.nombre} - Histórico de Reservas por Hora
            </p>

            <div ref={chartRef} style={{ width: '100%', height: 300, background: '#0f172a', borderRadius: '8px', padding: '10px' }}>
              <ResponsiveContainer>
                <BarChart data={statsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="hora" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#60a5fa' }}
                  />
                  <Bar dataKey="usos" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Reservas Confirmadas" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px", gap: "10px" }}>
              <button
                style={{
                  background: "rgba(34, 197, 94, 0.15)",
                  color: "#86efac",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "all 0.2s"
                }}
                onClick={exportarExcel}
                onMouseOver={(e) => e.target.style.background = "rgba(34, 197, 94, 0.3)"}
                onMouseOut={(e) => e.target.style.background = "rgba(34, 197, 94, 0.15)"}
              >
                📊 Exportar Excel
              </button>
              <button
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  color: "#fca5a5",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "all 0.2s"
                }}
                onClick={exportarPDF}
                onMouseOver={(e) => e.target.style.background = "rgba(239, 68, 68, 0.3)"}
                onMouseOut={(e) => e.target.style.background = "rgba(239, 68, 68, 0.15)"}
              >
                📄 Exportar PDF
              </button>
              <button
                style={{
                  background: "transparent",
                  color: "#cbd5e1",
                  border: "1px solid rgba(255,255,255,0.2)",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onClick={() => setShowStatsModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MIS EQUIPOS */}
      {showMisEquiposModal && (
        <div className="modal-overlay">
          <div className="modal-content login-glass-card" style={{ maxWidth: "550px" }}>
            <h2>👥 Mis Equipos</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              Equipos en los que participas
            </p>

            {todosEquipos.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No perteneces a ningún equipo aún.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {todosEquipos.map((eq) => (
                  <li 
                    key={eq.idEquipo}
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      background: "rgba(0,0,0,0.2)",
                      padding: "14px",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      border: "1px solid rgba(255,255,255,0.05)"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "bold", color: "white", fontSize: "15px" }}>{eq.nombre}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                        Miembros: {eq.alumnos ? eq.alumnos.join(", ") : "—"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button 
                        onClick={() => abrirEditarEquipo(eq)}
                        style={{
                          background: "rgba(59, 130, 246, 0.15)",
                          color: "#60a5fa",
                          border: "1px solid rgba(59, 130, 246, 0.3)",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => e.target.style.background = "rgba(59, 130, 246, 0.3)"}
                        onMouseOut={(e) => e.target.style.background = "rgba(59, 130, 246, 0.15)"}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        onClick={() => handleEliminarEquipo(eq.idEquipo)}
                        style={{
                          background: "rgba(239, 68, 68, 0.15)",
                          color: "#fca5a5",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => e.target.style.background = "rgba(239, 68, 68, 0.3)"}
                        onMouseOut={(e) => e.target.style.background = "rgba(239, 68, 68, 0.15)"}
                      >
                        🗑 Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button
                style={{
                  background: "transparent",
                  color: "#cbd5e1",
                  border: "1px solid rgba(255,255,255,0.2)",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onClick={() => setShowMisEquiposModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR EQUIPO */}
      {showEditEquipoModal && (
        <div className="modal-overlay">
          <div className="modal-content login-glass-card" style={{ maxWidth: "500px" }}>
            <h2>✏️ Editar Equipo</h2>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", color: "#cbd5e1", fontSize: "14px" }}>
                Nombre del Equipo:
              </label>
              <input
                type="text"
                value={editNombreEquipo}
                onChange={(e) => setEditNombreEquipo(e.target.value)}
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
              <label style={{ display: "block", marginBottom: "8px", color: "#cbd5e1", fontSize: "14px" }}>
                Miembros (selecciona hasta 3):
              </label>
              <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "8px" }}>
                {alumnosDb.map((alumno) => (
                  <label
                    key={alumno.noControl}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px",
                      color: "white",
                      cursor: "pointer",
                      borderRadius: "4px",
                      background: editMiembros.includes(alumno.noControl) ? "rgba(59,130,246,0.15)" : "transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={editMiembros.includes(alumno.noControl)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (editMiembros.length < 3) {
                            setEditMiembros([...editMiembros, alumno.noControl]);
                          }
                        } else {
                          setEditMiembros(editMiembros.filter(m => m !== alumno.noControl));
                        }
                      }}
                    />
                    {alumno.nombre} ({alumno.noControl})
                  </label>
                ))}
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                Seleccionados: {editMiembros.join(", ") || "Ninguno"}
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                style={{
                  background: "transparent",
                  color: "#cbd5e1",
                  border: "1px solid rgba(255,255,255,0.2)",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onClick={() => setShowEditEquipoModal(false)}
              >
                Cancelar
              </button>
              <button
                style={{
                  background: "rgba(59, 130, 246, 0.2)",
                  color: "#60a5fa",
                  border: "1px solid rgba(59, 130, 246, 0.4)",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "all 0.2s"
                }}
                onClick={handleEditarEquipo}
                onMouseOver={(e) => e.target.style.background = "rgba(59, 130, 246, 0.4)"}
                onMouseOut={(e) => e.target.style.background = "rgba(59, 130, 246, 0.2)"}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
