import { useState } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import { useLenis } from './hooks/useLenis'
import Navbar from './components/layout/Navbar/Navbar'
import Footer from './components/layout/Footer/Footer'
import Loader from './components/layout/Loader/Loader'
import CustomCursor from './components/layout/CustomCursor/CustomCursor'
import WhatsAppButton from './components/layout/WhatsAppButton/WhatsAppButton'

import Home from './pages/Home/Home'
import Destinations from './pages/Destinations/Destinations'
import Packages from './pages/Packages/Packages'
import PackageDetails from './pages/PackageDetails/PackageDetails'
import About from './pages/About/About'
import Admin from './pages/Admin/Admin'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.35, ease: [0.55, 0, 1, 0.45] } },
}

function AnimatedRoutes() {
  const location = useLocation()
  const isAdmin = location.pathname === '/admin'

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/package-details" element={<PackageDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>

        {!isAdmin && <Footer />}
      </motion.div>
    </AnimatePresence>
  )
}

function AppShell() {
  useLenis()
  const location = useLocation()
  const isAdmin = location.pathname === '/admin'

  return (
    <div className="flex flex-col min-h-screen text-dark selection:bg-brand selection:text-white">
      <CustomCursor />
      <Navbar />
      <AnimatedRoutes />
      {!isAdmin && <WhatsAppButton />}
    </div>
  )
}

export default function App() {
  const [loaded, setLoaded] = useState(false)

  if (!loaded) {
    return <Loader onComplete={() => setLoaded(true)} />
  }

  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  )
}
