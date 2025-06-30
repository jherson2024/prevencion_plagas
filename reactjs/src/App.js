import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/Login/Register';
import Aplicacion from './components/Aplicacion/Aplicacion';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext'; 
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/aplicacion"
            element={
              <PrivateRoute>
                <Aplicacion />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
