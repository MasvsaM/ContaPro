import { useEffect, useState } from 'react'
import { getOrCreateSettings, getOrCreateCompany } from './database/db'
import Dashboard from './screens/Dashboard'
import Clientes from './screens/Clientes'
import Presupuestos from './screens/Presupuestos'
import Facturas from './screens/Facturas'
import Reportes from './screens/Reportes'
import Mas from './screens/Mas'
import './styles/index.css'

export default function App() {
  const [screen, setScreen] = useState<'inicio'|'clientes'|'presupuestos'|'facturas'|'reportes'|'mas'>('inicio')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    (async () => {
      const s = await getOrCreateSettings()
      if (s.darkMode === 'dark' || (s.darkMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark')
      } else {
        document.body.classList.remove('dark')
      }
      await getOrCreateCompany()
      setReady(true)
    })()
  }, [])

  if (!ready) return <div className="app" style={{padding:20}}>Cargando...</div>

  return (
    <div className="app">
      <header className="top">
        <div>
          <div className="brand">Conta<span>Pro</span></div>
          <small>Presupuestos • Facturas • Ventas</small>
        </div>
      </header>
      <main className="content">
        {screen==='inicio' && <Dashboard/>}
        {screen==='clientes' && <Clientes/>}
        {screen==='presupuestos' && <Presupuestos/>}
        {screen==='facturas' && <Facturas/>}
        {screen==='reportes' && <Reportes/>}
        {screen==='mas' && <Mas/>}
      </main>
      <nav className="bottom">
        <button className={`nav ${screen==='inicio'?'active':''}`} onClick={()=>setScreen('inicio')}><b>🏠</b>Inicio</button>
        <button className={`nav ${screen==='clientes'?'active':''}`} onClick={()=>setScreen('clientes')}><b>👤</b>Clientes</button>
        <button className={`nav ${screen==='presupuestos'?'active':''}`} onClick={()=>setScreen('presupuestos')}><b>📄</b>Presupuestos</button>
        <button className={`nav ${screen==='facturas'?'active':''}`} onClick={()=>setScreen('facturas')}><b>🧾</b>Facturas</button>
        <button className={`nav ${screen==='reportes'?'active':''}`} onClick={()=>setScreen('reportes')}><b>📊</b>Reportes</button>
        <button className={`nav ${screen==='mas'?'active':''}`} onClick={()=>setScreen('mas')}><b>⋯</b>Más</button>
      </nav>
    </div>
  )
}
