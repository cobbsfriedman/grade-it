import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import GameScreen from './screens/GameScreen'

export default function App() {
  return (
    <BrowserRouter basename="/projects/grade-it">
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<GameScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
