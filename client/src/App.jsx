import { useState } from 'react'
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import { useLenis } from './hooks/useLenis'
import { AuthProvider, useAuth } from './context/AuthContext'
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
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy'
import CookiePolicy from './pages/CookiePolicy/CookiePolicy'
import TermsOfService from './pages/TermsOfService/TermsOfService'
import UserAgreement from './pages/UserAgreement/UserAgreement'
import DataProcessingAgreement from './pages/DataProcessingAgreement/DataProcessingAgreement'
import QuotesPage from './pages/Quotes/Quotes'
import Blog from './pages/Blog/Blog'
import Careers from './pages/Careers/Careers'
import Contact from './pages/Contact/Contact'
import Admin from './pages/Admin/Admin'
import AdminLogin from './pages/Admin/Login/AdminLogin'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.35, ease: [0.55, 0, 1, 0.45] } },
}

function ProtectedAdmin() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />
  return <Admin />
}

function AnimatedRoutes() {
  const { user } = useAuth()
  const location = useLocation()
  const isAdmin  = location.pathname.startsWith('/admin')

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <Routes location={location}>
          <Route path="/"                            element={<Home />} />
          <Route path="/destinations"              element={<Destinations />} />
          <Route path="/packages"                  element={<Packages />} />
          <Route path="/package-details/:id"       element={<PackageDetails />} />
          <Route path="/about"                     element={<About />} />
          <Route path="/privacy-policy"            element={<PrivacyPolicy />} />
          <Route path="/cookie-policy"             element={<CookiePolicy />} />
          <Route path="/terms-of-service"          element={<TermsOfService />} />
          <Route path="/user-agreement"            element={<UserAgreement />} />
          <Route path="/data-processing-agreement" element={<DataProcessingAgreement />} />
          <Route path="/quotes"                     element={<QuotesPage />} />
          <Route path="/blog"                      element={<Blog />} />
          <Route path="/careers"                   element={<Careers />} />
          <Route path="/contact"                   element={<Contact />} />
          <Route path="/admin/login"               element={user ? <Navigate to="/admin" replace /> : <AdminLogin onSuccess={() => {}} />} />
          <Route path="/admin"                     element={<ProtectedAdmin />} />
        </Routes>

        {!isAdmin && <Footer />}
      </motion.div>
    </AnimatePresence>
  )
}

function AppShell() {
  const location = useLocation()
  const isAdmin  = location.pathname.startsWith('/admin')
  useLenis(!isAdmin)

  return (
    <div className="flex flex-col min-h-screen text-dark selection:bg-brand selection:text-white">
      <CustomCursor />
      {!isAdmin && <Navbar />}
      <AnimatedRoutes />
      {!isAdmin && <WhatsAppButton />}
    </div>
  )
}

export default function App() {
  const [loaded, setLoaded] = useState(false)

  if (!loaded) return <Loader onComplete={() => setLoaded(true)} />

  return (
    <HashRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </HashRouter>
  )
}
