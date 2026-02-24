import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import GameScreen from './screens/GameScreen'

export default function App() {
  return (
    <BrowserRouter basename="/projects/grade-it">
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/game" element={<GameScreen />} />
          {/* Catch-all: redirect unknown paths to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
