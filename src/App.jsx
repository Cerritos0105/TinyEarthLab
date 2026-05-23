import { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Si está logueado mostramos el Dashboard, si no, el Login
  if (isLoggedIn) {
    return <Dashboard onLogout={() => setIsLoggedIn(false)} />;
  }

  return (
    <Login onLogin={() => setIsLoggedIn(true)} />
  );
}

export default App;
