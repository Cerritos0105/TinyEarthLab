import { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
  const [usuario, setUuario] = useState(
    JSON.parse(localStorage.getItem("usuario")),
  );
  console.log("holasdsa");
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
  const [selectedClaseEquipo, setSelectedClaseEquipo] = useState("999");

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
  const [statsDiaData, setStatsDiaData] = useState([]);
  const [tablaData, setTablaData] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const chartRef = useRef(null);
  const chartDiaRef = useRef(null);

  // Estados para Mis Equipos
  const [showMisEquiposModal, setShowMisEquiposModal] = useState(false);
  const [todosEquipos, setTodosEquipos] = useState([]);

  // Sidebar móvil
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =========================================
  // MODALES DE NOTIFICACIÓN Y CONFIRMACIÓN
  // =========================================
  const [notif, setNotif] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    message: "",
    onConfirm: null,
  });

  const showAlert = (message, type = "info") =>
    setNotif({ show: true, message, type });
  const hideAlert = () => setNotif({ show: false, message: "", type: "info" });
  const showConfirm = (message, onConfirm) =>
    setConfirmModal({ show: true, message, onConfirm });
  const hideConfirm = () =>
    setConfirmModal({ show: false, message: "", onConfirm: null });

  // =========================================
  // OBTENER LABORATORIOS
  // =========================================
  const obtenerLaboratoriosClase = async () => {
    try {
      const r = await fetch(
        `http://localhost:3000/api/laboratorios/alumno/${usuario.idUsuario}`,
      );
      const d = await r.json();
      if (d.ok) {
        setLaboratoriosClase(d.laboratorios);
        return d.laboratorios;
      }
      return [];
    } catch {
      return [];
    }
  };
  const obtenerLaboratoriosSiempre = async () => {
    try {
      const r = await fetch(
        "http://localhost:3000/api/laboratorios/siempre-disponibles",
      );
      const d = await r.json();
      if (d.ok) {
        setLaboratoriosSiempre(d.laboratorios);
        return d.laboratorios;
      }
      return [];
    } catch {
      return [];
    }
  };

  // =========================================
  // OBTENER ALUMNOS / CLASES
  // =========================================
  const obtenerAlumnosDb = async () => {
    try {
      const r = await fetch("http://localhost:3000/api/alumnos");
      const d = await r.json();
      if (Array.isArray(d)) setAlumnosDb(d);
    } catch (e) {
      console.log(e);
    }
  };
  const obtenerClasesAlumno = async () => {
    try {
      if (!usuario.noControl) return;
      const r = await fetch(
        `http://localhost:3000/api/clases/alumno/${usuario.noControl}`,
      );
      const d = await r.json();
      if (d.ok) setClasesAlumno(d.clases);
    } catch (e) {
      console.log(e);
    }
  };

  // =========================================
  // EQUIPOS
  // =========================================
  const abrirModalEquipos = () => {
    setNombreEquipo("");
    obtenerAlumnosDb();
    obtenerClasesAlumno();
    setSelectedClaseEquipo("999");
    setSelectedTeamMembers([]);
    setShowCreateTeamModal(true);
  };
  const handleToggleMember = (noControl) => {
    setSelectedTeamMembers((prev) => {
      if (prev.includes(noControl))
        return prev.filter((id) => id !== noControl);
      if (prev.length >= 3) return prev;
      return [...prev, noControl];
    });
  };
  const handleCrearEquipo = async () => {
    if (!nombreEquipo.trim()) {
      showAlert("Debes ingresar un nombre para el equipo.", "error");
      return;
    }
    if (selectedTeamMembers.length === 0 || selectedTeamMembers.length > 3) {
      showAlert("Debes seleccionar entre 1 y 3 alumnos.", "error");
      return;
    }
    try {
      const r = await fetch("http://localhost:3000/api/equipos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreEquipo,
          alumnos: selectedTeamMembers,
          idClase: selectedClaseEquipo,
        }),
      });
      const d = await r.json();
      if (d.ok) {
        showAlert("Equipo creado exitosamente", "success");
        setShowCreateTeamModal(false);
        setSelectedTeamMembers([]);
        setNombreEquipo("");
        setSelectedClaseEquipo("999");
      } else {
        showAlert(d.error + (d.detalles ? ": " + d.detalles : ""), "error");
      }
    } catch {
      showAlert("Error de conexión al crear equipo", "error");
    }
  };

  // =========================================
  // RESERVAS
  // =========================================
  const obtenerMisEquipos = async (idClase) => {
    try {
      if (!usuario.noControl) return;
      const r = await fetch("http://localhost:3000/api/equipos/alumno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noControl: usuario.noControl, idClase }),
      });
      const d = await r.json();
      if (d.ok) setMisEquipos(d.equipos);
    } catch (e) {
      console.log(e);
    }
  };
  const abrirModalReserva = (fecha, hora) => {
    const cl = clasesAlumno.find((c) => c.idLaboratorio == selectedLab);
    obtenerMisEquipos(cl ? cl.idClase : "TODAS");
    setReservaSlot({ fecha, hora });
    setSelectedEquipoReserva(null);
    setShowReservaModal(true);
  };
  const handleCrearReserva = async () => {
    if (!selectedEquipoReserva) {
      showAlert("Por favor selecciona un equipo.", "error");
      return;
    }
    try {
      const r = await fetch("http://localhost:3000/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idEquipo: selectedEquipoReserva,
          idLaboratorio: selectedLab,
          fecha: reservaSlot.fecha,
          hora: reservaSlot.hora,
        }),
      });
      const d = await r.json();
      if (d.ok) {
        showAlert("Reserva exitosa en la estación " + d.noEstacion, "success");
        setShowReservaModal(false);
        obtenerReservas(selectedLab);
      } else showAlert(d.mensaje || "Error al reservar", "error");
    } catch {
      showAlert("Error de conexión al realizar la reserva", "error");
    }
  };

  // =========================================
  // GESTIÓN DE RESERVAS
  // =========================================
  const abrirModalGestion = (fecha, hora) => {
    let slots = reservas.filter(
      (r) => r.fecha.split("T")[0] === fecha && r.hora.substring(0, 5) === hora,
    );
    if (
      usuario.tipo !== "maestro" &&
      usuario.tipo !== "administrador" &&
      usuario.tipo !== "docente"
    )
      slots = slots.filter((r) => r.esMia);
    if (slots.length > 0) {
      setReservaSlot({ fecha, hora });
      setReservasParaGestion(slots);
      setShowGestionModal(true);
    }
  };
  const handleCancelarHora = () => {
    showConfirm(
      "¿Estás seguro de cancelar TODAS las reservas en esta hora?",
      async () => {
        try {
          const r = await fetch(
            "http://localhost:3000/api/reservas/cancelar-hora",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                idLaboratorio: selectedLab,
                fecha: reservaSlot.fecha,
                hora: reservaSlot.hora,
                noControl: usuario.noControl,
                tipo: usuario.tipo,
              }),
            },
          );
          const d = await r.json();
          if (d.ok) {
            showAlert(
              `Se cancelaron ${d.reservasCanceladas} reservas`,
              "success",
            );
            setReservasParaGestion([]);
            setShowGestionModal(false);
            obtenerReservas(selectedLab);
          } else showAlert(d.mensaje || "Error al cancelar", "error");
        } catch {
          showAlert("Error de conexión al cancelar la hora", "error");
        }
      },
    );
  };
  const handleCancelarReservaIndividual = (idReserva) => {
    showConfirm("¿Cancelar esta reserva individual?", async () => {
      try {
        const r = await fetch(
          `http://localhost:3000/api/reservas/cancelar/${idReserva}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              noControl: usuario.noControl,
              tipo: usuario.tipo,
            }),
          },
        );
        const d = await r.json();
        if (d.ok) {
          showAlert("Reserva cancelada correctamente", "success");
          const nuevas = reservasParaGestion.filter(
            (r) => r.idReserva !== idReserva,
          );
          setReservasParaGestion(nuevas);
          if (nuevas.length === 0) setShowGestionModal(false);
          obtenerReservas(selectedLab);
        } else showAlert(d.mensaje || "Error al cancelar", "error");
      } catch {
        showAlert("Error de conexión", "error");
      }
    });
  };

  // =========================================
  // CARGAR LABORATORIOS
  // =========================================
  const cargarLaboratorios = async () => {
    try {
      const esMaestro = usuario.tipo === "maestro" || usuario.tipo === "docente" || usuario.tipo === "administrador";
      const url = esMaestro
        ? "http://localhost:3000/api/laboratorios/todos"
        : `http://localhost:3000/api/laboratorios/alumno/${usuario.idUsuario}`;

      const r = await fetch(url);
      const d = await r.json();
      if (d.ok) {
        setLaboratorios(d.laboratorios);
        if (d.laboratorios.length > 0)
          setSelectedLab(d.laboratorios[0].idLaboratorio);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // =========================================
  // MIS EQUIPOS
  // =========================================
  const obtenerTodosEquipos = async () => {
    try {
      const r = await fetch("http://localhost:3000/api/equipos/alumno", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noControl: usuario.noControl,
          idClase: "TODAS",
        }),
      });
      const d = await r.json();
      if (d.ok) setTodosEquipos(d.equipos);
      else setTodosEquipos([]);
    } catch (e) {
      console.error(e);
    }
  };
  const handleEliminarEquipo = (idEquipo) => {
    showConfirm(
      "¿Estás seguro de eliminar este equipo? Esto también eliminará sus reservas.",
      async () => {
        try {
          const r = await fetch(
            `http://localhost:3000/api/equipos/${idEquipo}`,
            { method: "DELETE" },
          );
          const d = await r.json();
          if (d.ok) {
            showAlert("Equipo eliminado correctamente", "success");
            obtenerTodosEquipos();
          } else showAlert(d.error || "Error al eliminar", "error");
        } catch {
          showAlert("Error de conexión", "error");
        }
      },
    );
  };

  // =========================================
  // EXPORTAR
  // =========================================
  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      statsData.map((d) => ({ Hora: d.hora, "Reservas Confirmadas": d.usos })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estadísticas");
    XLSX.writeFile(
      wb,
      `estadisticas_${laboratorioActual?.nombre || "lab"}.xlsx`,
    );
  };
  const exportarPDF = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#0f172a",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pdfWidth, pdf.internal.pageSize.getHeight(), "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.text(
        `Estadísticas - ${laboratorioActual?.nombre || "Laboratorio"}`,
        14,
        20,
      );
      pdf.addImage(imgData, "PNG", 14, 30, pdfWidth - 28, pdfHeight - 10);
      pdf.save(`estadisticas_${laboratorioActual?.nombre || "lab"}.pdf`);
    } catch {
      showAlert("Error al exportar PDF", "error");
    }
  };

  // =========================================
  // OBTENER RESERVAS
  // =========================================
  const obtenerReservas = async (idLab) => {
    try {
      const r = await fetch(
        `http://localhost:3000/api/reservas/laboratorio/${idLab}?noControl=${usuario.noControl || ""}`,
      );
      const d = await r.json();
      if (d.ok) {
        setReservas(d.reservas);
        setDiasBloqueados(d.diasBloqueados || []);
      } else {
        setReservas([]);
        setDiasBloqueados([]);
      }
    } catch {
      setReservas([]);
      setDiasBloqueados([]);
    }
  };
  const obtenerEstadisticas = async (idLab) => {
    try {
      let url = `http://localhost:3000/api/reservas/estadisticas/laboratorio/${idLab}`;
      if (fechaInicio && fechaFin) {
         url += `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      }
      const r = await fetch(url);
      const d = await r.json();
      if (d.ok) {
        setStatsData(d.estadisticas);
        setStatsDiaData(d.estadisticasPorDia || []);
        setTablaData(d.tabla || []);
        setShowStatsModal(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // =========================================
  // BLOQUEAR / DESBLOQUEAR DÍAS
  // =========================================
  const handleToggleBloquearDia = (fechaString) => {
    const isBlocked = diasBloqueados.includes(fechaString);
    const accionText = isBlocked ? "desbloquear" : "bloquear";
    const confirmMsg = isBlocked
      ? `¿Estás seguro de que deseas desbloquear el día ${fechaString}?`
      : `¿Estás seguro de que deseas bloquear todo el día ${fechaString}? ¡Esto eliminará todas las reservas de ese día!`;

    showConfirm(confirmMsg, async () => {
      try {
        const endpoint = isBlocked ? "desbloquear-dia" : "bloquear-dia";
        const r = await fetch(
          `http://localhost:3000/api/reservas/${endpoint}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fecha: fechaString,
              idLaboratorio: selectedLab,
            }),
          },
        );
        const d = await r.json();
        if (d.ok) {
          showAlert(d.mensaje, "success");
          obtenerReservas(selectedLab);
        } else showAlert("Error: " + d.mensaje, "error");
      } catch {
        showAlert("Error de conexión al " + accionText + " día.", "error");
      }
    });
  };

  // =========================================
  // EFECTOS
  // =========================================

  useEffect(() => {
    console.log(usuario);
    cargarLaboratorios();
    obtenerClasesAlumno();
  }, []);

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

      {/* BOTÓN HAMBURGUESA (solo móvil) */}
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)}>☰</button>

      {/* OVERLAY detrás del sidebar en móvil */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
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
              onClick={() => { setSelectedLab(lab.idLaboratorio); setSidebarOpen(false); }}
            >
              <div className="lab-name">{lab.nombre}</div>
              <div className="lab-building">{lab.edificio}</div>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {usuario.tipo !== "maestro" &&
            usuario.tipo !== "docente" &&
            usuario.tipo !== "administrador" && (
              <>
                <button className="create-team-btn" onClick={abrirModalEquipos}>
                  Crear Equipo
                </button>

                <button
                  className="create-team-btn"
                  style={{
                    background: "rgba(59, 130, 246, 0.15)",
                    borderColor: "rgba(59, 130, 246, 0.3)",
                  }}
                  onClick={() => {
                    obtenerTodosEquipos();
                    setShowMisEquiposModal(true);
                  }}
                >
                  Mis Equipos
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

            <p style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              Reserva por hora en diferentes semanas.
              {(usuario.tipo === "maestro" ||
                usuario.tipo === "docente" ||
                usuario.tipo === "administrador") && (
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
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.background = "rgba(59, 130, 246, 0.4)")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.background = "rgba(59, 130, 246, 0.2)")
                  }
                >
                  Ver Estadísticas
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
              const canBlock =
                usuario.tipo === "maestro" ||
                usuario.tipo === "administrador" ||
                usuario.tipo === "docente";

              return (
                <div
                  key={date.toISOString()}
                  className={`calendar-header-cell ${canBlock ? "clickable-header" : ""} ${isBlocked ? "blocked-header" : ""}`}
                  onClick={() => canBlock && handleToggleBloquearDia(dateStr)}
                  title={
                    canBlock
                      ? isBlocked
                        ? "Clic para desbloquear"
                        : "Clic para bloquear el día"
                      : ""
                  }
                  style={{
                    cursor: canBlock ? "pointer" : "default",
                    transition: "all 0.2s",
                  }}
                >
                  {formatHeaderDate(date)} {isBlocked}
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

                  const esMiReserva = reservas.some((r) => {
                    const rFecha = r.fecha.split("T")[0];
                    const rHora = r.hora.substring(0, 5);
                    return rFecha === dateString && rHora === hora && r.esMia;
                  });

                  const disponibles = laboratorioActual?.capacidad - reservadas;
                  // =========================================
                  // VALIDAR SI EL HORARIO YA PASÓ
                  // =========================================

                  const ahora = new Date();

                  const fechaHoraCelda = new Date(`${dateString}T${hora}:00`);

                  const horarioPasado = fechaHoraCelda < ahora;

                  const esMaestro =
                    usuario.tipo === "maestro" ||
                    usuario.tipo === "administrador" ||
                    usuario.tipo === "docente";

                  return (
                    <div
                      key={`${selectedLab}-${dateString}-${hora}`}
                      className={`calendar-cell
                        ${horarioPasado && !isBlocked ? "past-cell" : ""}
                        ${disponibles <= 0 && !isBlocked ? "reserved" : ""}
                        ${isBlocked ? "blocked-cell" : ""}
                        ${esMiReserva ? "mi-reserva-cell" : ""}
                      `}
                      style={{
                        backgroundColor: isBlocked
                          ? "rgba(239, 68, 68, 0.15)"
                          : !isBlocked && !horarioPasado
                            ? esMiReserva
                              ? "rgba(34, 197, 94, 0.2)"
                              : reservadas > 0
                                ? "rgba(59, 130, 246, 0.15)"
                                : ""
                            : "",
                        borderColor: isBlocked
                          ? "rgba(239, 68, 68, 0.3)"
                          : !isBlocked && !horarioPasado
                            ? esMiReserva
                              ? "rgba(34, 197, 94, 0.5)"
                              : reservadas > 0
                                ? "rgba(59, 130, 246, 0.3)"
                                : ""
                            : "",
                        cursor: isBlocked ? "not-allowed" : "",
                      }}
                      title={
                        isBlocked ? "Día bloqueado" : "Horario del laboratorio"
                      }
                      onClick={() => {
                        if (isBlocked) return;
                        if (horarioPasado && !esMaestro) return;

                        if (esMaestro) {
                          abrirModalGestion(dateString, hora);
                        } else if (esMiReserva) {
                          abrirModalGestion(dateString, hora);
                        } else if (disponibles > 0) {
                          abrirModalReserva(dateString, hora);
                        }
                      }}
                    >
                      {isBlocked ? (
                        <div
                          className="blocked-text"
                          style={{
                            color: "#f87171",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          Bloqueado
                        </div>
                      ) : horarioPasado ? (
                        <div className="past-text">—</div>
                      ) : disponibles <= 0 ? (
                        <div className="full-text">Lleno</div>
                      ) : (
                        <div className="available-text">
                          {disponibles} espacio
                          {disponibles !== 0 ? "s" : ""}
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
                placeholder="Ej. legu loveers"
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
                  value="999"
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
          <div
            className="modal-content login-glass-card"
            style={{ maxWidth: "550px" }}
          >
            <h2>
              {usuario.tipo === "maestro" ||
              usuario.tipo === "administrador" ||
              usuario.tipo === "docente"
                ? "Gestionar Reservas"
                : "Mis Reservas"}
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              {reservaSlot?.fecha} - {reservaSlot?.hora}
            </p>

            {reservasParaGestion.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>
                No hay reservas en este horario.
              </p>
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
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "bold", color: "white" }}>
                        Equipo: {r.equipoNombre || "Desconocido"}
                      </div>
                      <div
                        style={{ fontSize: "12px", color: "var(--text-muted)" }}
                      >
                        ID Reserva: {r.idReserva}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleCancelarReservaIndividual(r.idReserva)
                      }
                      style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        color: "#fca5a5",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.background = "rgba(239, 68, 68, 0.35)")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.background = "rgba(239, 68, 68, 0.15)")
                      }
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "24px",
                justifyContent: "flex-end",
                flexWrap: "wrap",
              }}
            >
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
              {reservasParaGestion.length > 0 &&
                (usuario.tipo === "maestro" ||
                  usuario.tipo === "administrador" ||
                  usuario.tipo === "docente") && (
                  <button
                    style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      color: "#fca5a5",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.background = "rgba(239, 68, 68, 0.4)")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.background = "rgba(239, 68, 68, 0.2)")
                    }
                    onClick={handleCancelarHora}
                  >
                    Liberar Toda la Hora
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
      {/* MODAL ESTADÍSTICAS */}
      {showStatsModal && (
        <div className="modal-overlay">
          <div
            className="modal-content login-glass-card"
            style={{ maxWidth: "800px", width: "95%" }}
          >
            <h2>Estadísticas de Uso</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              {laboratorioActual?.nombre} — Reservas confirmadas históricas
            </p>

            <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#cbd5e1",
                    fontSize: "14px",
                    marginBottom: "5px",
                  }}
                >
                  Fecha Inicio:
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  style={{
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(0,0,0,0.3)",
                    color: "white",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#cbd5e1",
                    fontSize: "14px",
                    marginBottom: "5px",
                  }}
                >
                  Fecha Fin:
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  style={{
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(0,0,0,0.3)",
                    color: "white",
                  }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  onClick={() => obtenerEstadisticas(selectedLab)}
                  style={{
                    background: "#3b82f6",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Filtrar
                </button>
              </div>
            </div>

            {/* Tabla de reporte en lugar de Gráfica por hora */}
            <p
              style={{
                color: "#94a3b8",
                fontSize: "13px",
                marginBottom: "8px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Reporte de Reservas
            </p>
            <div
              ref={chartRef}
              style={{
                width: "100%",
                maxHeight: "240px",
                overflowY: "auto",
                background: "rgba(15,23,42,0.7)",
                borderRadius: "10px",
                padding: "10px",
                marginBottom: "24px",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {tablaData.length === 0 ? (
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "14px",
                    textAlign: "center",
                    marginTop: "20px",
                  }}
                >
                  No hay reservas confirmadas para este filtro.
                </div>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    color: "white",
                    fontSize: "14px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      <th style={{ padding: "8px", textAlign: "left" }}>
                        Fecha
                      </th>
                      <th style={{ padding: "8px", textAlign: "left" }}>
                        Hora
                      </th>
                      <th style={{ padding: "8px", textAlign: "left" }}>
                        Equipo
                      </th>
                      <th style={{ padding: "8px", textAlign: "left" }}>
                        Estación
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tablaData.map((row, index) => (
                      <tr
                        key={index}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <td style={{ padding: "8px" }}>
                          {new Date(row.fecha).toLocaleDateString("es-ES")}
                        </td>
                        <td style={{ padding: "8px" }}>
                          {row.hora.substring(0, 5)}
                        </td>
                        <td style={{ padding: "8px" }}>{row.equipo}</td>
                        <td style={{ padding: "8px" }}>{row.noEstacion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Gráfica por día */}
            <p
              style={{
                color: "#94a3b8",
                fontSize: "13px",
                marginBottom: "8px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Por Día de la Semana
            </p>
            <div
              ref={chartDiaRef}
              style={{
                width: "100%",
                height: 240,
                background: "rgba(15,23,42,0.7)",
                borderRadius: "10px",
                padding: "10px",
                marginBottom: "8px",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {statsDiaData.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  Sin datos suficientes
                </div>
              ) : (
                <ResponsiveContainer>
                  <BarChart
                    data={statsDiaData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="dia"
                      stroke="#cbd5e1"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#cbd5e1"
                      allowDecimals={false}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#a78bfa" }}
                      formatter={(val, name) => [val, "Reservas"]}
                    />
                    <Bar
                      dataKey="usos"
                      radius={[4, 4, 0, 0]}
                      name="Reservas"
                      fill="#8b5cf6"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "24px",
                gap: "10px",
              }}
            >
              <button
                style={{
                  background: "rgba(34, 197, 94, 0.15)",
                  color: "#86efac",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "all 0.2s",
                }}
                onClick={exportarExcel}
                onMouseOver={(e) =>
                  (e.target.style.background = "rgba(34, 197, 94, 0.3)")
                }
                onMouseOut={(e) =>
                  (e.target.style.background = "rgba(34, 197, 94, 0.15)")
                }
              >
                Exportar Excel
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
                  transition: "all 0.2s",
                }}
                onClick={exportarPDF}
                onMouseOver={(e) =>
                  (e.target.style.background = "rgba(239, 68, 68, 0.3)")
                }
                onMouseOut={(e) =>
                  (e.target.style.background = "rgba(239, 68, 68, 0.15)")
                }
              >
                Exportar PDF
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
          <div
            className="modal-content login-glass-card"
            style={{ maxWidth: "550px" }}
          >
            <h2>Mis Equipos</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              Equipos en los que participas
            </p>

            {todosEquipos.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>
                No perteneces a ningún equipo aún.
              </p>
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
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: "bold",
                          color: "white",
                          fontSize: "15px",
                        }}
                      >
                        {eq.nombre}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text-muted)",
                          marginTop: "4px",
                        }}
                      >
                        Miembros: {eq.alumnos ? eq.alumnos.join(", ") : "—"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
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
                          transition: "all 0.2s",
                        }}
                        onMouseOver={(e) =>
                          (e.target.style.background = "rgba(239, 68, 68, 0.3)")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.background =
                            "rgba(239, 68, 68, 0.15)")
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "24px",
              }}
            >
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

      {/* MODAL NOTIFICACIÓN (reemplaza alert nativo) */}
      {notif.show &&
        (() => {
          const cfg = {
            success: {
              title: "Éxito",
              accent: "34, 197, 94",
              titleColor: "#86efac",
            },
            error: {
              title: "Error",
              accent: "239, 68, 68",
              titleColor: "#fca5a5",
            },
            info: {
              title: "Información",
              accent: "59, 130, 246",
              titleColor: "#93c5fd",
            },
          }[notif.type] || {
            title: "Información",
            accent: "59, 130, 246",
            titleColor: "#93c5fd",
          };
          return (
            <div className="modal-overlay" style={{ zIndex: 9999 }}>
              <div
                className="modal-content login-glass-card"
                style={{
                  maxWidth: "420px",
                  textAlign: "center",
                  border: `1px solid rgba(${cfg.accent}, 0.35)`,
                  boxShadow: `0 0 30px rgba(${cfg.accent}, 0.15)`,
                }}
              >
                <h2
                  style={{
                    color: cfg.titleColor,
                    marginBottom: "12px",
                    fontSize: "20px",
                  }}
                >
                  {cfg.title}
                </h2>
                <p
                  style={{
                    color: "#cbd5e1",
                    marginBottom: "28px",
                    fontSize: "15px",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {notif.message.replace(/^[✅❌ℹ️]\s*/, "")}
                </p>
                <button
                  style={{
                    background: `rgba(${cfg.accent}, 0.2)`,
                    color: cfg.titleColor,
                    border: `1px solid rgba(${cfg.accent}, 0.4)`,
                    padding: "10px 32px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                    transition: "all 0.2s",
                  }}
                  onClick={hideAlert}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = `rgba(${cfg.accent}, 0.4)`)
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = `rgba(${cfg.accent}, 0.2)`)
                  }
                >
                  Aceptar
                </button>
              </div>
            </div>
          );
        })()}

      {/* MODAL CONFIRMACIÓN (reemplaza window.confirm nativo) */}
      {confirmModal.show && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div
            className="modal-content login-glass-card"
            style={{
              maxWidth: "420px",
              textAlign: "center",
              border: "1px solid rgba(234, 179, 8, 0.35)",
              boxShadow: "0 0 30px rgba(234, 179, 8, 0.12)",
            }}
          >
            <h2
              style={{
                color: "#fde68a",
                marginBottom: "12px",
                fontSize: "20px",
              }}
            >
              Confirmar acción
            </h2>
            <p
              style={{
                color: "#cbd5e1",
                marginBottom: "28px",
                fontSize: "15px",
                lineHeight: 1.6,
              }}
            >
              {confirmModal.message}
            </p>
            <div
              style={{ display: "flex", gap: "12px", justifyContent: "center" }}
            >
              <button
                style={{
                  background: "transparent",
                  color: "#94a3b8",
                  border: "1px solid rgba(255,255,255,0.2)",
                  padding: "10px 28px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "14px",
                  transition: "all 0.2s",
                }}
                onClick={hideConfirm}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                Cancelar
              </button>
              <button
                style={{
                  background: "rgba(239, 68, 68, 0.2)",
                  color: "#fca5a5",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  padding: "10px 28px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "14px",
                  transition: "all 0.2s",
                }}
                onClick={() => {
                  confirmModal.onConfirm && confirmModal.onConfirm();
                  hideConfirm();
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "rgba(239, 68, 68, 0.4)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)")
                }
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
