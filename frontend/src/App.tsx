import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Categories from './pages/Categories'
import NotFound from './pages/NotFound'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/gastos" element={<Expenses />} />
        <Route path="/categorias" element={<Categories />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App