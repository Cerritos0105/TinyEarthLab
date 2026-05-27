const fs = require('fs');
let content = fs.readFileSync('d:/TEL/src/Dashboard.jsx', 'utf8');

// Sidebar and general UI emojis
content = content.replace('<div className="logo-icon-small">🌍</div>', '<div className="logo-icon-small"></div>');
content = content.replaceAll('👥 Mis Equipos', 'Mis Equipos');
content = content.replaceAll('📊 Ver Estadísticas', 'Ver Estadísticas');
content = content.replaceAll('📊 Exportar Excel', 'Exportar Excel');
content = content.replaceAll('🔒 Bloqueado', 'Bloqueado');
content = content.replaceAll('&& "🔒"', '');
content = content.replaceAll('✕ Quitar', 'Quitar');
content = content.replaceAll('🗑 Liberar Toda la Hora', 'Liberar Toda la Hora');
content = content.replaceAll('🗑 Eliminar', 'Eliminar');
content = content.replaceAll('📄 Exportar PDF', 'Exportar PDF');

// Modals: Remove the icon div entirely for Notifications
content = content.replace('<div style={{ fontSize: "48px", marginBottom: "12px", lineHeight: 1 }}>{cfg.icon}</div>', '');
// Modals: Remove the icon div entirely for Confirm
content = content.replace('<div style={{ fontSize: "48px", marginBottom: "12px", lineHeight: 1 }}>⚠️</div>', '');

fs.writeFileSync('d:/TEL/src/Dashboard.jsx', content);
console.log('Emojis removed');
