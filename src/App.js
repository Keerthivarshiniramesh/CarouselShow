
import { Route, Routes } from 'react-router-dom';
import './App.css';
import KeyCheck from './component/KeyCheck';
import Login from './component/Login';
import { useContext } from 'react';
import { DContext } from './component/Provider';
import Dashboard from './component/Dashboard';
import Register from './component/Register';

function App() {

  const { Auth } = useContext(DContext)
  return (

    // <KeyCheck />
    <Routes>
      <Route path='/admin' element={Auth ? <Dashboard /> : <Login />} />
      <Route path='/register' element={<Register />} />
      <Route />
    </Routes>

  );
}

export default App;
