# 📋 Explicación Detallada de Cambios - Proyecto TinyEarthLab

> Este documento contiene una explicación **línea por línea** de cada cambio realizado en el proyecto.
> Cada sección describe qué se hizo, por qué se hizo, y cómo funciona cada línea de código.

---

## Índice de Cambios

1. [Cambio #1: Creación del proyecto React con Vite](#cambio-1-creación-del-proyecto-react-con-vite)
2. [Cambio #2: Creación del Login de TinyEarthLab](#cambio-2-creación-del-login-de-tinyearthlab)
3. [Cambio #3: Corrección de dimensiones y simplificación del fondo](#cambio-3-corrección-de-dimensiones-y-simplificación-del-fondo)

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
        <form className="login-form" onSubmit={handleSubmit}>
```
- **Qué hace:** Declara el formulario. 
- **`onSubmit={handleSubmit}`**: Conecta el evento de envío con la función `handleSubmit` que definimos arriba.

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
