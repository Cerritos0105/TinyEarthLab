const fs = require('fs');
const content = fs.readFileSync('d:/TEL/src/Dashboard.jsx', 'utf8');

const missingLogic = `
  // =========================================
  // MODALES DE NOTIFICACIÓN Y CONFIRMACIÓN
  // =========================================
  const [notif, setNotif] = useState({ show: false, message: "", type: "info" });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: "", onConfirm: null });

  const showAlert = (message, type = "info") => setNotif({ show: true, message, type });
  const hideAlert = () => setNotif({ show: false, message: "", type: "info" });
  const showConfirm = (message, onConfirm) => setConfirmModal({ show: true, message, onConfirm });
  const hideConfirm = () => setConfirmModal({ show: false, message: "", onConfirm: null });

  // =========================================
  // OBTENER LABORATORIOS
  // =========================================
  const obtenerLaboratoriosClase = async () => {
    try {
      const r = await fetch(\`http://localhost:3000/api/laboratorios/alumno/\${usuario.idUsuario}\`);
      const d = await r.json();
      if (d.ok) { setLaboratoriosClase(d.laboratorios); return d.laboratorios; }
      return [];
    } catch { return []; }
  };
  const obtenerLaboratoriosSiempre = async () => {
    try {
      const r = await fetch("http://localhost:3000/api/laboratorios/siempre-disponibles");
      const d = await r.json();
      if (d.ok) { setLaboratoriosSiempre(d.laboratorios); return d.laboratorios; }
      return [];
    } catch { return []; }
  };

  // =========================================
  // OBTENER ALUMNOS / CLASES
  // =========================================
  const obtenerAlumnosDb = async () => {
    try {
      const r = await fetch("http://localhost:3000/api/alumnos");
      const d = await r.json();
      if (Array.isArray(d)) setAlumnosDb(d);
    } catch (e) { console.log(e); }
  };
  const obtenerClasesAlumno = async () => {
    try {
      if (!usuario.noControl) return;
      const r = await fetch(\`http://localhost:3000/api/clases/alumno/\${usuario.noControl}\`);
      const d = await r.json();
      if (d.ok) setClasesAlumno(d.clases);
    } catch (e) { console.log(e); }
  };

  // =========================================
  // EQUIPOS
  // =========================================
  const abrirModalEquipos = () => {
    setNombreEquipo(""); obtenerAlumnosDb(); obtenerClasesAlumno();
    setSelectedClaseEquipo("999"); setSelectedTeamMembers([]); setShowCreateTeamModal(true);
  };
  const handleToggleMember = (noControl) => {
    setSelectedTeamMembers((prev) => {
      if (prev.includes(noControl)) return prev.filter((id) => id !== noControl);
      if (prev.length >= 3) return prev;
      return [...prev, noControl];
    });
  };
  const handleCrearEquipo = async () => {
    if (!nombreEquipo.trim()) { showAlert("Debes ingresar un nombre para el equipo.", "error"); return; }
    if (selectedTeamMembers.length === 0 || selectedTeamMembers.length > 3) { showAlert("Debes seleccionar entre 1 y 3 alumnos.", "error"); return; }
    try {
      const r = await fetch("http://localhost:3000/api/equipos", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreEquipo, alumnos: selectedTeamMembers, idClase: selectedClaseEquipo }),
      });
      const d = await r.json();
      if (d.ok) {
        showAlert("Equipo creado exitosamente", "success");
        setShowCreateTeamModal(false); setSelectedTeamMembers([]); setNombreEquipo(""); setSelectedClaseEquipo("999");
      } else { showAlert(d.error + (d.detalles ? ": " + d.detalles : ""), "error"); }
    } catch { showAlert("Error de conexión al crear equipo", "error"); }
  };

  // =========================================
  // RESERVAS
  // =========================================
  const obtenerMisEquipos = async (idClase) => {
    try {
      if (!usuario.noControl) return;
      const r = await fetch("http://localhost:3000/api/equipos/alumno", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noControl: usuario.noControl, idClase }),
      });
      const d = await r.json();
      if (d.ok) setMisEquipos(d.equipos);
    } catch (e) { console.log(e); }
  };
  const abrirModalReserva = (fecha, hora) => {
    const cl = clasesAlumno.find((c) => c.idLaboratorio == selectedLab);
    obtenerMisEquipos(cl ? cl.idClase : "TODAS");
    setReservaSlot({ fecha, hora }); setSelectedEquipoReserva(null); setShowReservaModal(true);
  };
  const handleCrearReserva = async () => {
    if (!selectedEquipoReserva) { showAlert("Por favor selecciona un equipo.", "error"); return; }
    try {
      const r = await fetch("http://localhost:3000/api/reservas", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idEquipo: selectedEquipoReserva, idLaboratorio: selectedLab, fecha: reservaSlot.fecha, hora: reservaSlot.hora }),
      });
      const d = await r.json();
      if (d.ok) { showAlert("Reserva exitosa en la estación " + d.noEstacion, "success"); setShowReservaModal(false); obtenerReservas(selectedLab); }
      else showAlert(d.mensaje || "Error al reservar", "error");
    } catch { showAlert("Error de conexión al realizar la reserva", "error"); }
  };

  // =========================================
  // GESTIÓN DE RESERVAS
  // =========================================
  const abrirModalGestion = (fecha, hora) => {
    let slots = reservas.filter((r) => r.fecha.split("T")[0] === fecha && r.hora.substring(0, 5) === hora);
    if (usuario.tipo !== "maestro" && usuario.tipo !== "administrador" && usuario.tipo !== "docente") slots = slots.filter((r) => r.esMia);
    if (slots.length > 0) { setReservaSlot({ fecha, hora }); setReservasParaGestion(slots); setShowGestionModal(true); }
  };
  const handleCancelarHora = () => {
    showConfirm("¿Estás seguro de cancelar TODAS las reservas en esta hora?", async () => {
      try {
        const r = await fetch("http://localhost:3000/api/reservas/cancelar-hora", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idLaboratorio: selectedLab, fecha: reservaSlot.fecha, hora: reservaSlot.hora, noControl: usuario.noControl, tipo: usuario.tipo }),
        });
        const d = await r.json();
        if (d.ok) { showAlert(\`Se cancelaron \${d.reservasCanceladas} reservas\`, "success"); setReservasParaGestion([]); setShowGestionModal(false); obtenerReservas(selectedLab); }
        else showAlert(d.mensaje || "Error al cancelar", "error");
      } catch { showAlert("Error de conexión al cancelar la hora", "error"); }
    });
  };
  const handleCancelarReservaIndividual = (idReserva) => {
    showConfirm("¿Cancelar esta reserva individual?", async () => {
      try {
        const r = await fetch(\`http://localhost:3000/api/reservas/cancelar/\${idReserva}\`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ noControl: usuario.noControl, tipo: usuario.tipo }),
        });
        const d = await r.json();
        if (d.ok) {
          showAlert("Reserva cancelada correctamente", "success");
          const nuevas = reservasParaGestion.filter((r) => r.idReserva !== idReserva);
          setReservasParaGestion(nuevas);
          if (nuevas.length === 0) setShowGestionModal(false);
          obtenerReservas(selectedLab);
        } else showAlert(d.mensaje || "Error al cancelar", "error");
      } catch { showAlert("Error de conexión", "error"); }
    });
  };

  // =========================================
  // CARGAR LABORATORIOS
  // =========================================
  const cargarLaboratorios = async () => {
    try {
      const r = await fetch("http://localhost:3000/api/laboratorios/todos");
      const d = await r.json();
      if (d.ok) {
        setLaboratorios(d.laboratorios); setLaboratoriosSiempre([]); setLaboratoriosClase([]);
        if (d.laboratorios.length > 0) setSelectedLab(d.laboratorios[0].idLaboratorio);
      }
    } catch (e) { console.error(e); }
  };

  // =========================================
  // MIS EQUIPOS
  // =========================================
  const obtenerTodosEquipos = async () => {
    try {
      const r = await fetch("http://localhost:3000/api/equipos/alumno", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noControl: usuario.noControl, idClase: "TODAS" }),
      });
      const d = await r.json();
      if (d.ok) setTodosEquipos(d.equipos); else setTodosEquipos([]);
    } catch (e) { console.error(e); }
  };
  const handleEliminarEquipo = (idEquipo) => {
    showConfirm("¿Estás seguro de eliminar este equipo? Esto también eliminará sus reservas.", async () => {
      try {
        const r = await fetch(\`http://localhost:3000/api/equipos/\${idEquipo}\`, { method: "DELETE" });
        const d = await r.json();
        if (d.ok) { showAlert("Equipo eliminado correctamente", "success"); obtenerTodosEquipos(); }
        else showAlert(d.error || "Error al eliminar", "error");
      } catch { showAlert("Error de conexión", "error"); }
    });
  };

  // =========================================
  // EXPORTAR
  // =========================================
  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(statsData.map((d) => ({ Hora: d.hora, "Reservas Confirmadas": d.usos })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estadísticas");
    XLSX.writeFile(wb, \`estadisticas_\${laboratorioActual?.nombre || "lab"}.xlsx\`);
  };
  const exportarPDF = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, { backgroundColor: "#0f172a" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.setFillColor(15, 23, 42); pdf.rect(0, 0, pdfWidth, pdf.internal.pageSize.getHeight(), "F");
      pdf.setTextColor(255, 255, 255); pdf.setFontSize(18);
      pdf.text(\`Estadísticas - \${laboratorioActual?.nombre || "Laboratorio"}\`, 14, 20);
      pdf.addImage(imgData, "PNG", 14, 30, pdfWidth - 28, pdfHeight - 10);
      pdf.save(\`estadisticas_\${laboratorioActual?.nombre || "lab"}.pdf\`);
    } catch { showAlert("Error al exportar PDF", "error"); }
  };

  // =========================================
  // OBTENER RESERVAS
  // =========================================
  const obtenerReservas = async (idLab) => {
    try {
      const r = await fetch(\`http://localhost:3000/api/reservas/laboratorio/\${idLab}?noControl=\${usuario.noControl || ""}\`);
      const d = await r.json();
      if (d.ok) { setReservas(d.reservas); setDiasBloqueados(d.diasBloqueados || []); }
      else { setReservas([]); setDiasBloqueados([]); }
    } catch { setReservas([]); setDiasBloqueados([]); }
  };
  const obtenerEstadisticas = async (idLab) => {
    try {
      const r = await fetch(\`http://localhost:3000/api/reservas/estadisticas/laboratorio/\${idLab}\`);
      const d = await r.json();
      if (d.ok) { setStatsData(d.estadisticas); setShowStatsModal(true); }
    } catch (e) { console.error(e); }
  };

  // =========================================
  // BLOQUEAR / DESBLOQUEAR DÍAS
  // =========================================
  const handleToggleBloquearDia = (fechaString) => {
    const isBlocked = diasBloqueados.includes(fechaString);
    const accionText = isBlocked ? "desbloquear" : "bloquear";
    const confirmMsg = isBlocked
      ? \`¿Estás seguro de que deseas desbloquear el día \${fechaString}?\`
      : \`¿Estás seguro de que deseas bloquear todo el día \${fechaString}? ¡Esto eliminará todas las reservas de ese día!\`;

    showConfirm(confirmMsg, async () => {
      try {
        const endpoint = isBlocked ? "desbloquear-dia" : "bloquear-dia";
        const r = await fetch(\`http://localhost:3000/api/reservas/\${endpoint}\`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fecha: fechaString, idLaboratorio: selectedLab }),
        });
        const d = await r.json();
        if (d.ok) { showAlert(d.mensaje, "success"); obtenerReservas(selectedLab); }
        else showAlert("Error: " + d.mensaje, "error");
      } catch { showAlert("Error de conexión al " + accionText + " día.", "error"); }
    });
  };

  // =========================================
  // EFECTOS
  // =========================================

  useEffect(() => {
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
`;

const anchorRegex = /const \[todosEquipos, setTodosEquipos\] = useState\(\[\]\);\s*const laboratoriosSiempreFiltrados = laboratoriosSiempre\.filter\(/g;

const replacement = `const [todosEquipos, setTodosEquipos] = useState([]);
${missingLogic}
  const laboratoriosSiempreFiltrados = laboratoriosSiempre.filter(`;

if (!anchorRegex.test(content)) {
    console.error("Regex anchor not found in file!");
    process.exit(1);
}

const newContent = content.replace(anchorRegex, replacement);
fs.writeFileSync('d:/TEL/src/Dashboard.jsx', newContent);
console.log('Fixed Dashboard.jsx successfully!');
