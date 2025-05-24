import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import WelcomeScreen from './components/WelcomeScreen';
import useKeepBackendAwake from './components/UseKeepBackendAwake';
import './App.css';

function App() {
  useKeepBackendAwake();

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AdminPanel />} />
          <Route path="/welcome" element={<WelcomeScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;