# 📋 Explicación Detallada de Cambios - Proyecto TinyEarthLab

> Este documento contiene una explicación **línea por línea** de cada cambio realizado en el proyecto.
> Cada sección describe qué se hizo, por qué se hizo, y cómo funciona cada línea de código.

---

## Índice de Cambios

1. [Cambio #1: Creación del proyecto React con Vite](#cambio-1-creación-del-proyecto-react-con-vite)
2. [Cambio #2: Creación del Login de TinyEarthLab](#cambio-2-creación-del-login-de-tinyearthlab)
3. [Cambio #3: Corrección de dimensiones y simplificación del fondo](#cambio-3-corrección-de-dimensiones-y-simplificación-del-fondo)
4. [Cambio #4: Bypass del Login y creación del Dashboard de Reservas](#cambio-4-bypass-del-login-y-creación-del-dashboard-de-reservas)
5. [Cambio #5: Navegación por semanas en el calendario](#cambio-5-navegación-por-semanas-en-el-calendario)
6. [Cambio #6: Modal de confirmación con nombre de usuario](#cambio-6-modal-de-confirmación-con-nombre-de-usuario)

---

## Cambio #1: Creación del proyecto React con Vite

**Fecha:** 2026-05-22  
**Descripción:** Se creó el proyecto base de React usando Vite como herramienta de construcción (build tool).  
**Comando ejecutado:** `npx -y create-vite@latest ./ --template react --overwrite --no-interactive`

### ¿Qué es Vite?

Vite es una herramienta moderna para desarrollar aplicaciones web. Su función principal es:
- **Servidor de desarrollo rápido:** Cuando estás programando, Vite te muestra los cambios en el navegador al instante, sin esperar.
- **Empaquetador (bundler):** Cuando tu app está lista, Vite la empaqueta en archivos optimizados para producción.

### ¿Qué es React?

React es una librería de JavaScript creada por Facebook (Meta) para construir interfaces de usuario. Funciona con **componentes**: piezas reutilizables de código que representan partes de la pantalla (un botón, un menú, una página entera, etc.).

---

### Archivos creados y su explicación

#### 📄 `index.html` (Punto de entrada principal)

Este es el archivo HTML que el navegador carga primero. Es la "puerta de entrada" de toda la aplicación.

```html
<!doctype html>
```
- **Qué hace:** Le dice al navegador que este archivo es HTML5 (la versión más reciente de HTML).
- **Por qué:** Sin esto, el navegador podría interpretar el archivo de forma incorrecta.

```html
<html lang="en">
```
- **Qué hace:** Abre la etiqueta `<html>` y define el idioma como inglés (`en`).
- **Por qué:** Ayuda a los lectores de pantalla y motores de búsqueda a saber en qué idioma está la página.

```html
<head>
```
- **Qué hace:** Abre la sección `<head>`, que contiene información SOBRE la página (no contenido visible).

```html
<meta charset="UTF-8" />
```
- **Qué hace:** Define la codificación de caracteres como UTF-8.
- **Por qué:** UTF-8 soporta todos los caracteres del mundo (acentos como á, é, í, emojis, etc.).

```html
<link rel="icon" type="image/svg+xml" href="/vite.svg" />
```
- **Qué hace:** Define el ícono que aparece en la pestaña del navegador (favicon).
- **`rel="icon"`**: Relación = ícono.
- **`type="image/svg+xml"`**: El tipo de imagen es SVG.
- **`href="/vite.svg"`**: La ruta al archivo de imagen, ubicado en la carpeta `public/`.

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```
- **Qué hace:** Hace que la página se adapte al tamaño de la pantalla del dispositivo.
- **`width=device-width`**: El ancho de la página = ancho del dispositivo.
- **`initial-scale=1.0`**: No hay zoom inicial, se muestra al 100%.
- **Por qué:** Sin esto, en celulares la página se vería diminuta.

```html
<title>Vite + React</title>
```
- **Qué hace:** Define el texto que aparece en la pestaña del navegador.

```html
</head>
```
- **Qué hace:** Cierra la sección `<head>`.

```html
<body>
```
- **Qué hace:** Abre la sección `<body>`, que contiene todo lo VISIBLE en la página.

```html
<div id="root"></div>
```
- **Qué hace:** Crea un contenedor vacío con el identificador "root".
- **Por qué:** Este es el punto donde React "inyecta" toda la aplicación. React toma este `<div>` vacío y lo llena con todos los componentes que programemos.
- **Es fundamental:** Sin este div, React no tendría dónde renderizar la app.

```html
<script type="module" src="/src/main.jsx"></script>
```
- **Qué hace:** Carga el archivo JavaScript principal de la aplicación.
- **`type="module"`**: Indica que es un módulo ES6 (permite usar `import`/`export`).
- **`src="/src/main.jsx"`**: La ruta al archivo principal de React.
- **Por qué:** Este script es el que arranca React y conecta todo con el `<div id="root">`.

```html
</body>
</html>
```
- **Qué hace:** Cierra las etiquetas `<body>` y `<html>`.

---

#### 📄 `src/main.jsx` (Arranque de React)

Este archivo es el "motor de arranque" de React. Es lo primero que se ejecuta.

```jsx
import { StrictMode } from 'react'
```
- **Qué hace:** Importa `StrictMode` desde la librería React.
- **`StrictMode`**: Es una herramienta de desarrollo que detecta problemas potenciales en tu código. Muestra advertencias adicionales en la consola del navegador. NO afecta la app en producción.
- **`import { }` **: Las llaves `{}` significan que estamos importando algo específico (una "exportación nombrada") de la librería.

```jsx
import { createRoot } from 'react-dom/client'
```
- **Qué hace:** Importa la función `createRoot` desde `react-dom/client`.
- **`createRoot`**: Es la función que crea la "raíz" de React. Es el puente entre React y el HTML real del navegador (el DOM).
- **`react-dom`**: Es la parte de React que se encarga de manipular el HTML del navegador.

```jsx
import './index.css'
```
- **Qué hace:** Importa el archivo de estilos CSS global.
- **Por qué:** Vite permite importar CSS directamente en JavaScript. Los estilos se aplicarán a toda la app.

```jsx
import App from './App.jsx'
```
- **Qué hace:** Importa el componente principal `App` desde el archivo `App.jsx`.
- **Sin llaves `{}`**: Esto significa que `App` es la exportación por defecto (`export default`) de ese archivo.
- **`App`**: Es el componente raíz que contiene toda la interfaz de la aplicación.

```jsx
createRoot(document.getElementById('root')).render(
```
- **`document.getElementById('root')`**: Busca en el HTML el elemento con `id="root"` (el `<div>` que creamos en `index.html`).
- **`createRoot(...)`**: Crea una raíz de React en ese elemento.
- **`.render(...)`**: Le dice a React "dibuja esto dentro de ese elemento".

```jsx
  <StrictMode>
    <App />
  </StrictMode>,
```
- **`<StrictMode>`**: Envuelve la app en modo estricto para detectar problemas durante el desarrollo.
- **`<App />`**: Renderiza el componente `App`. Los componentes en React se usan como etiquetas HTML personalizadas.
- **Por qué `<App />` y no `<App></App>`**: Cuando un componente no tiene contenido dentro, se puede "auto-cerrar" con `/>`.

```jsx
)
```
- **Qué hace:** Cierra la llamada a `.render()`.

---

#### 📄 `package.json` (Configuración del proyecto)

Este archivo es la "ficha técnica" del proyecto. Define qué librerías usa, qué comandos están disponibles, y metadatos del proyecto.

- **`"name": "tel"`**: Nombre del proyecto (tomado del nombre de la carpeta TEL).
- **`"private": true`**: Indica que este proyecto NO se publicará en npm (el registro público de paquetes).
- **`"version": "0.0.0"`**: Versión del proyecto.
- **`"type": "module"`**: Indica que los archivos `.js` usan módulos ES6 (`import`/`export`) en lugar del viejo `require()`.

**Scripts (comandos):**
- **`"dev": "vite"`**: `npm run dev` → Arranca el servidor de desarrollo local.
- **`"build": "vite build"`**: `npm run build` → Genera la versión optimizada para producción.
- **`"preview": "vite preview"`**: `npm run preview` → Previsualiza la versión de producción localmente.
- **`"lint": "eslint ."`**: `npm run lint` → Analiza el código en busca de errores de estilo y buenas prácticas.

**Dependencies (dependencias de producción):**
- **`"react"`**: La librería principal de React.
- **`"react-dom"`**: La parte de React que conecta con el navegador (DOM).

**DevDependencies (dependencias solo para desarrollo):**
- **`"@vitejs/plugin-react"`**: Plugin que conecta Vite con React.
- **`"vite"`**: La herramienta de construcción.
- **`"eslint"` y plugins**: Herramientas para analizar la calidad del código.

---

#### 📄 `vite.config.js` (Configuración de Vite)

```js
import { defineConfig } from 'vite'
```
- **Qué hace:** Importa la función `defineConfig` de Vite para tener autocompletado y validación de la configuración.

```js
import react from '@vitejs/plugin-react'
```
- **Qué hace:** Importa el plugin de React para Vite.
- **Por qué:** Este plugin permite que Vite entienda archivos `.jsx`, active el "Fast Refresh" (actualización instantánea al guardar), y procese JSX correctamente.

```js
export default defineConfig({
  plugins: [react()],
})
```
- **`export default`**: Exporta esta configuración como la principal.
- **`plugins: [react()]`**: Registra el plugin de React. El `react()` con paréntesis lo ejecuta para activarlo.

---

## Cambio #2: Creación del Login de TinyEarthLab

**Fecha:** 2026-05-22  
**Descripción:** Se creó una pantalla de inicio de sesión (Login) con diseño premium, usando Glassmorphism, animaciones CSS y diseño responsivo.

### Archivos modificados y creados

#### 📄 `src/App.jsx` (Modificado)

Se modificó para que ahora sea simplemente un contenedor que muestra el nuevo componente `Login`.

```jsx
import Login from './Login';
```
- **Qué hace:** Importa el componente `Login` que acabamos de crear en el archivo `Login.jsx`.

```jsx
function App() {
  return (
    <Login />
  );
}
```
- **Qué hace:** La función `App` ahora solo devuelve (renderiza) el componente `<Login />`. 
- **Por qué:** Antes tenía todo el código de ejemplo de Vite (el contador, logos, etc). Lo limpiamos para mostrar nuestra pantalla.

```jsx
export default App;
```
- **Qué hace:** Exporta el componente para que pueda ser usado en `main.jsx`.

---

#### 📄 `src/Login.jsx` (Nuevo)

Este archivo contiene la estructura HTML (escrita en JSX) y la lógica del formulario de inicio de sesión.

```jsx
import { useState } from 'react';
```
- **Qué hace:** Importa el "Hook" `useState` de React.
- **Por qué:** `useState` permite crear variables que, cuando cambian, le dicen a React que vuelva a dibujar (renderizar) el componente. Es fundamental para leer lo que el usuario escribe en los inputs.

```jsx
import './Login.css';
```
- **Qué hace:** Importa los estilos CSS específicos para este componente.

```jsx
export default function Login() {
```
- **Qué hace:** Declara y exporta la función principal del componente.

```jsx
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
```
- **Qué hace:** Crea dos estados: `email` y `password`, ambos inicializados como un texto vacío `''`.
- **`setEmail` y `setPassword`**: Son funciones que usamos para actualizar esos valores cuando el usuario escribe.

```jsx
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login intent:', { email, password });
  };
```
- **Qué hace:** Crea la función que se ejecuta al enviar el formulario (cuando dan clic en "Sign In").
- **`e.preventDefault()`**: Evita que el navegador recargue la página (que es el comportamiento por defecto de HTML al enviar un formulario).
- **`console.log(...)`**: Imprime en la consola del navegador los datos para confirmar que los capturamos correctamente.

```jsx
  return (
    <div className="login-container">
```
- **Qué hace:** Inicia la parte visual. Este `div` es el contenedor principal que ocupará toda la pantalla. Nota: En JSX usamos `className` en lugar de `class` como en HTML normal.

```jsx
      <div className="login-glass-card">
```
- **Qué hace:** Crea la tarjeta (card) semi-transparente estilo "vidrio esmerilado" donde va el formulario.

```jsx
        <div className="login-header">
          <div className="logo-icon">🌍</div>
          <h1>TinyEarthLab</h1>
          <p>Welcome back, explorer.</p>
        </div>
```
- **Qué hace:** La cabecera del login, incluye un emoji de planeta (como logo), el nombre de la app y un saludo.

```jsx
        <form className="login-form" onSubmit={handleSubmit} noValidate>
```
- **Qué hace:** Declara el formulario. 
- **`onSubmit={handleSubmit}`**: Conecta el evento de envío con la función `handleSubmit` que definimos arriba.
- **`noValidate`**: Es una instrucción clave que añadimos para deshabilitar la validación por defecto del navegador HTML5. Como los campos de abajo tienen la propiedad `required`, el navegador normalmente te obligaría a llenarlos antes de dejarte enviar. Al poner `noValidate`, le decimos al navegador: "Ignora esa regla, déjame enviar el formulario vacío si quiero", lo cual es necesario para que funcione nuestro bypass de sesión rápida.

```jsx
          <div className="input-group">
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              required 
            />
            <label htmlFor="email">Email Address</label>
          </div>
```
- **Qué hace:** Crea el campo para el correo.
- **`value={email}`**: Conecta el input con nuestra variable de estado `email`.
- **`onChange={(e) => setEmail(e.target.value)}`**: Cada vez que el usuario teclea una letra, extrae ese valor (`e.target.value`) y actualiza el estado con `setEmail`.
- **`placeholder=" "`**: Es un espacio en blanco. Es un truco necesario para que nuestra animación CSS (que detecta si hay texto o no) funcione correctamente.
- **`required`**: Hace que el navegador exija llenar el campo antes de enviar.
- **`<label htmlFor="email">`**: Es la etiqueta del campo. En JSX usamos `htmlFor` en lugar de `for`.

```jsx
          <div className="input-group">
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              required 
            />
            <label htmlFor="password">Password</label>
          </div>
```
- **Qué hace:** Igual que el bloque anterior, pero para la contraseña.

```jsx
          <div className="form-actions">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
```
- **Qué hace:** Crea la fila con el checkbox de "Recordarme" y el enlace de "Olvidé mi contraseña".

```jsx
          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
```
- **Qué hace:** El botón para enviar el formulario y cierra la etiqueta `<form>`.

```jsx
        <div className="login-footer">
          Don't have an account? <a href="#">Create one</a>
        </div>
      </div>
```
- **Qué hace:** El enlace en la parte inferior para registrarse, y cierra la tarjeta de cristal.

```jsx
    </div>
  );
}
```
- **Qué hace:** Cierra el contenedor principal y finaliza el componente. Las formas geométricas flotantes (`bg-shape`) fueron eliminadas en una revisión posterior.

---

## Cambio #3: Corrección de dimensiones y simplificación del fondo

**Fecha:** 2026-05-22  
**Descripción:** Se corrigió un problema visual donde el Login quedaba desplazado hacia la derecha creando barras de scroll. Además, se simplificó el fondo para hacerlo más sutil y menos extravagante.

### Archivos modificados y su explicación

#### 📄 `src/index.css` (Modificado)

Se sobrescribió por completo para eliminar los estilos por defecto que traía Vite y que causaban el mal dimensionamiento.

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```
- **Qué hace:** Aplica un "reset" global a todos los elementos (`*`).
- **`margin: 0; padding: 0;`**: Quita márgenes y espaciados por defecto de los navegadores. Esto evita el espacio negro a la izquierda.
- **`box-sizing: border-box;`**: Asegura que el ancho (`width`) incluya los bordes y el padding, evitando que los elementos se desborden.

```css
html, body, #root {
  width: 100%;
  height: 100%;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: #0f172a;
}
```
- **Qué hace:** Configura los contenedores principales (todo el documento HTML, el cuerpo, y el div "root" de React).
- **`width: 100%; height: 100%;`**: Obliga a que la aplicación tome exactamente el tamaño de la pantalla, sin pasarse (lo que evita el scroll horizontal y vertical).
- **`background-color: #0f172a;`**: Define el color de fondo base oscuro.

---

#### 📄 `src/Login.jsx` (Modificado)

Se eliminaron las esferas flotantes animadas.

```jsx
      {/* Background animated elements */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      <div className="bg-shape shape-3"></div>
```
- **Qué se hizo:** Estas 4 líneas fueron borradas completamente del archivo para quitar lo "extravagante".

---

#### 📄 `src/Login.css` (Modificado)

Se ajustó el contenedor del Login y se cambió el fondo.

```css
.login-container {
  height: 100%;
  width: 100%;
  /* ... resto de propiedades ... */
```
- **Qué se hizo:** Se cambió `100vw` (100% del Viewport Width) y `100vh` por `100%`. Esto es porque `vw/vh` a veces no tienen en cuenta las barras de desplazamiento del navegador y causan scroll horizontal extra.

```css
  /* Fondo más sutil y elegante, sin formas flotantes */
  background: radial-gradient(circle at center, #1e293b 0%, var(--bg-color) 100%);
```
- **Qué se hizo:** Se aplicó un "gradiente radial" sutil en lugar de las esferas animadas. 
- **`radial-gradient`**: Dibuja un degradado en forma de círculo. En el centro es un gris-azulado un poco más claro (`#1e293b`), y se oscurece hacia los bordes hasta llegar al azul marino oscuro (`var(--bg-color)`). Da un efecto de "iluminación suave" en el centro de la pantalla.

Finalmente, se borraron todas las clases CSS relacionadas con `.bg-shape` y las animaciones `@keyframes drift` para limpiar el código.

---

## Cambio #4: Bypass del Login y creación del Dashboard de Reservas

**Fecha:** 2026-05-22  
**Descripción:** Se modificó la aplicación para permitir entrar al sistema sin validar credenciales (bypass). Se creó una nueva vista `Dashboard` con un panel lateral (sidebar) para seleccionar laboratorios y un calendario tipo cuadrícula interactivo para realizar reservas.

### Archivos modificados y creados

#### 📄 `src/App.jsx` (Modificado)

Se introdujo el manejo del estado para "navegar" (cambiar la vista) entre el Login y el Dashboard.

```jsx
import { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
```
- **Qué hace:** Importa `useState` de React, y los dos componentes principales: `Login` y el nuevo `Dashboard`.

```jsx
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
```
- **Qué hace:** Crea un estado `isLoggedIn` (por defecto `false`). Si es false, muestra el Login; si es true, muestra el Dashboard.

```jsx
  if (isLoggedIn) {
    return <Dashboard onLogout={() => setIsLoggedIn(false)} />;
  }
```
- **Qué hace:** Si el usuario ya entró (`isLoggedIn === true`), la aplicación dibuja el componente `Dashboard`. Le pasa una función `onLogout` (como un prop) que, al ejecutarse, vuelve a poner `isLoggedIn` en `false`, cerrando la sesión.

```jsx
  return (
    <Login onLogin={() => setIsLoggedIn(true)} />
  );
}
```
- **Qué hace:** Si no está logueado, dibuja el componente `Login`. Le pasa la función `onLogin` que cambia el estado a `true`, dejándolo entrar.

---

#### 📄 `src/Login.jsx` (Modificado)

Se ajustó para ejecutar el "Bypass" (salto de autenticación).

```jsx
export default function Login({ onLogin }) {
```
- **Qué hace:** Ahora el componente recibe el prop `onLogin` que le envió `App.jsx`.

```jsx
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login intent (bypass):', { email, password });
    // Por ahora omitimos la validación real y simplemente dejamos pasar al usuario
    if (onLogin) onLogin();
  };
```
- **Qué hace:** Al dar clic en "Sign In", en lugar de verificar con una base de datos si el usuario existe, simplemente ejecuta `onLogin()`, lo cual instantáneamente cambia el estado en `App.jsx` y abre el Dashboard.

---

#### 📄 `src/Dashboard.jsx` (Nuevo)

Este componente genera la pantalla principal. Está dividido en dos secciones: el *Sidebar* (panel izquierdo) y el *Main Content* (calendario derecho).

```jsx
const LABORATORIOS = [
  { id: 'lab1', name: 'Laboratorio de Biología' },
  /* ...otros laboratorios... */
];
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const HORAS = ['08:00', '09:00', /* ...hasta 18:00... */ ];
```
- **Qué hace:** Define listas constantes con los datos falsos o fijos que usaremos para construir la interfaz.

```jsx
export default function Dashboard({ onLogout }) {
  const [selectedLab, setSelectedLab] = useState(LABORATORIOS[0].id);
  const [reservations, setReservations] = useState(new Set());
```
- **Qué hace:** 
  - `selectedLab`: Recuerda qué laboratorio está seleccionado actualmente (por defecto el primero).
  - `reservations`: Es un "conjunto" (Set) especial de JavaScript donde guardaremos un identificador único por cada celda reservada (ej. `"lab1-Lunes-08:00"`).

```jsx
  const handleToggleReservation = (dia, hora) => {
    const reservationKey = `${selectedLab}-${dia}-${hora}`;
    const newReservations = new Set(reservations);
    
    if (newReservations.has(reservationKey)) {
      newReservations.delete(reservationKey); // Cancelar reserva
    } else {
      newReservations.add(reservationKey); // Hacer reserva
    }
    
    setReservations(newReservations);
  };
```
- **Qué hace:** Esta función se dispara cuando el usuario da clic en una celda vacía del calendario.
- Crea un texto clave único uniendo el laboratorio, el día y la hora (`reservationKey`).
- Si esa clave ya existe en el "Set" (ya estaba reservado), la borra (deshace la reserva). Si no, la añade (crea la reserva).

```jsx
  const isReserved = (dia, hora) => {
    return reservations.has(`${selectedLab}-${dia}-${hora}`);
  };
```
- **Qué hace:** Devuelve verdadero (true) si un bloque de hora específico de un laboratorio específico ya está guardado en el estado `reservations`.

El resto del archivo JSX construye el HTML usando `map()`:
- **En el Sidebar (`<aside>`)**: Usa `LABORATORIOS.map()` para crear un botón por cada laboratorio. Al darle clic a un botón, actualiza el estado `selectedLab`.
- **En el Calendario (`<main>`)**: Construye una cuadrícula CSS. Primero renderiza la fila superior con los días de la semana (`DIAS.map`). Luego itera sobre las `HORAS` y dentro de cada hora vuelve a iterar sobre los `DIAS` para dibujar todas las "celdas" de la tabla.
- A cada celda del calendario se le aplica la clase de CSS `reserved` de forma condicional, usando la función `isReserved()`.

---

#### 📄 `src/Dashboard.css` (Nuevo)

Este archivo contiene todo el diseño visual del Dashboard, conservando el tema oscuro (Premium/Glassmorphism).

**La Cuadrícula (Grid) del Calendario:**
```css
.calendar-grid {
  display: grid;
  /* 1 columna para horas (80px), 5 columnas para los días (1fr) */
  grid-template-columns: 80px repeat(5, 1fr);
  gap: 8px;
  min-width: 800px;
}
```
- **Qué hace:** Utiliza **CSS Grid Layout**, la herramienta más poderosa para crear tablas y cuadrículas.
- Define que la primera columna siempre medirá `80px` de ancho (donde van los textos de las horas).
- Las siguientes 5 columnas usarán `1fr` (una "fracción"), lo que significa que se repartirán el espacio restante equitativamente, sin importar qué tan grande sea la pantalla.

**Las Celdas del Calendario:**
```css
.calendar-cell {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  /* ... */
  cursor: pointer;
  transition: all 0.2s ease;
}
```
- **Qué hace:** Les da el color oscuro translúcido base y esquinas redondeadas.
- **`transition`**: Hace que cuando pases el mouse por encima (`:hover`), el cambio de color sea suave, tardando 0.2 segundos.

**Estado de Reserva:**
```css
.calendar-cell.reserved {
  background: rgba(59, 130, 246, 0.15); /* Azul tenue */
  border-color: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}
```
- **Qué hace:** Es el estilo que aplica el "color tenue" que pediste cuando se selecciona un bloque.
- Se activa solo si la celda tiene la clase HTML `reserved`, la cual React agrega automáticamente gracias a la lógica que hicimos en `Dashboard.jsx`.

---

## Cambio #5: Navegación por semanas en el calendario

**Fecha:** 2026-05-22  
**Descripción:** Se mejoró el calendario para que soporte fechas reales y permita navegar entre distintas semanas ("Semana Anterior", "Semana Actual", "Siguiente Semana"), guardando las reservas de manera independiente para cada semana.

### Archivos modificados y su explicación

#### 📄 `src/Dashboard.jsx` (Modificado)

Se reemplazó la lista estática de días por una lógica de fechas en tiempo real.

```jsx
const getMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};
```
- **Qué hace:** Es una función matemática de apoyo. Toma cualquier fecha y calcula qué día fue el Lunes de esa misma semana.

```jsx
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
```
- **Qué hace:** Crea un nuevo estado para recordar en qué semana estamos parados actualmente. Por defecto inicia en el Lunes de la semana actual.

```jsx
  const nextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };
```
- **Qué hace:** Suma 7 días a la fecha actual para mover el calendario a la próxima semana. De manera similar se crearon `prevWeek` (resta 7 días) y `goToToday` (vuelve a la semana actual).

```jsx
  const currentWeekDays = Array.from({ length: 5 }).map((_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    return date;
  });
```
- **Qué hace:** A partir del Lunes actual (`currentWeekStart`), genera una lista de 5 días seguidos (Lunes a Viernes) sumando 1 día en cada paso.

```jsx
  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
```
- **Qué hace:** Convierte la fecha del calendario a un formato de texto (ej. "2026-05-25").
- **Por qué:** Ahora usamos esta fecha de texto como llave para guardar las reservas. Ya no guardamos "Lunes", guardamos "2026-05-25". Así, la reserva de este Lunes no se mezcla con la del próximo Lunes.

```jsx
          <div className="week-navigation">
            <button className="nav-btn" onClick={prevWeek}>&larr; Semana Anterior</button>
            <button className="nav-btn nav-btn-today" onClick={goToToday}>Semana Actual</button>
            <button className="nav-btn" onClick={nextWeek}>Siguiente Semana &rarr;</button>
          </div>
```
- **Qué hace:** Renderiza los botones de navegación en la parte superior del calendario y los conecta con las funciones de sumar y restar días.

---

#### 📄 `src/Dashboard.css` (Modificado)

Se agregaron los estilos para acomodar los nuevos botones en la cabecera.

```css
.main-header {
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
```
- **Qué hace:** Usa `flex` para poner el título a la izquierda y los botones de navegación a la derecha (`justify-content: space-between`).

```css
.week-navigation {
  display: flex;
  gap: 8px;
  background: rgba(15, 23, 42, 0.6);
  padding: 6px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```
- **Qué hace:** Crea un "cajón" semi-transparente que agrupa todos los botones de navegación.

```css
.nav-btn {
  /* ... */
  transition: all 0.2s;
}
.nav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
```
- **Qué hace:** Le da a los botones un aspecto transparente que cambia de color al pasar el mouse por encima. El botón de "Semana Actual" tiene un tono verde claro para resaltar.

---

## Cambio #6: Modal de confirmación con nombre de usuario

**Fecha:** 2026-05-22  
**Descripción:** Se agregó un formulario en ventana emergente (Modal) que se abre al hacer clic en una hora disponible, solicitando el nombre de la persona que reserva antes de pintar la casilla.

### Archivos modificados y su explicación

#### 📄 `src/Dashboard.jsx` (Modificado)

Se cambió la forma en la que se guardan los datos, pasando de guardar solo "está ocupado" a guardar "quién lo ocupó".

```jsx
  // Cambiamos 'Set' por 'Map' para poder guardar un valor asociado
  const [reservations, setReservations] = useState(new Map());
```
- **Qué hace:** Un `Map` en JavaScript es como un diccionario. Ahora la llave sigue siendo `"lab1-2026-05-25-08:00"` pero el valor asignado será el nombre (ej. `"Carlos P."`). Antes usábamos un `Set` que solo era una lista de llaves.

```jsx
  // Estados para el Modal
  const [pendingReservation, setPendingReservation] = useState(null);
  const [reserverName, setReserverName] = useState('');
```
- **Qué hace:** `pendingReservation` guarda la información de la celda a la que dimos clic temporalmente. Si tiene datos, el Modal se muestra en pantalla. `reserverName` guarda lo que el usuario va tecleando en el campo del nombre.

```jsx
  const handleCellClick = (dateString, hora) => {
    const reservationKey = `${selectedLab}-${dateString}-${hora}`;
    if (reservations.has(reservationKey)) {
      const newReservations = new Map(reservations);
      newReservations.delete(reservationKey); // Si ya estaba, lo borra (cancela)
      setReservations(newReservations);
    } else {
      // Si está libre, abre el modal
      setPendingReservation({ dateString, hora, key: reservationKey });
    }
  };
```
- **Qué hace:** Esta función reemplaza a la antigua. En lugar de hacer la reserva inmediatamente, "pausa" la acción y activa el modal.

```jsx
  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!reserverName.trim() || !pendingReservation) return;

    const newReservations = new Map(reservations);
    newReservations.set(pendingReservation.key, reserverName.trim());
    
    setReservations(newReservations);
    
    setPendingReservation(null);
    setReserverName('');
  };
```
- **Qué hace:** Se ejecuta al darle clic a "Confirmar Reserva" en el Modal. Toma el nombre escrito, lo añade al `Map` asociándolo con la celda, actualiza la pantalla, y cierra el Modal ocultándolo (`setPendingReservation(null)`).

```jsx
      {/* Modal Overlay */}
      {pendingReservation && (
        <div className="modal-overlay">
          {/* Contenido del modal y formulario... */}
        </div>
      )}
```
- **Qué hace:** En la parte inferior del JSX, esta condición evalúa si hay una reserva pendiente. Si la hay, pinta todo el código HTML de la ventana oscura y el formulario encima del calendario.

#### 📄 `src/Dashboard.css` (Modificado)

```css
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
}
```
- **Qué hace:** Crea un fondo oscuro translúcido que cubre toda la pantalla (`position: fixed`). `backdrop-filter` hace que el calendario de atrás se vea desenfocado (efecto premium), y `z-index: 1000` asegura que aparezca por encima de todo.

```css
.calendar-cell.reserved {
  display: flex;
  flex-direction: column;
}
.reserver-name {
  font-size: 11px;
  color: #93c5fd;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```
- **Qué hace:** Ajusta las celdas reservadas para que usen `flexbox`, permitiendo apilar verticalmente el texto "Reservado" arriba y el nombre de la persona abajo. `text-overflow: ellipsis` hace que si un nombre es muy largo, lo corte poniéndole "..." al final para no deformar la celda.

---
