import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import { useLenis, getLenis } from './hooks/useLenis'
import { useGoogleAnalytics } from './hooks/useGoogleAnalytics'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CustomerAuthProvider, useCustomerAuth } from './context/CustomerAuthContext'
import CustomerLogin from './pages/CustomerLogin/CustomerLogin'
import CustomerProfile from './pages/CustomerProfile/CustomerProfile'
import ProfileSettings from './pages/CustomerProfile/ProfileSettings'
import TripHistory from './pages/CustomerProfile/TripHistory'
import Navbar from './components/layout/Navbar/Navbar'
import Footer from './components/layout/Footer/Footer'
import Loader from './components/layout/Loader/Loader'
import CustomCursor from './components/layout/CustomCursor/CustomCursor'
import TravelQuizModal from './components/home/TravelQuizModal/TravelQuizModal'
import CookieConsent from './components/layout/CookieConsent/CookieConsent'
import styles from './App.module.css'

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
import CancellationPolicy from './pages/CancellationPolicy/CancellationPolicy'
import QuotesPage from './pages/Quotes/Quotes'
import Blog from './pages/Blog/Blog'
import BlogPost from './pages/BlogPost/BlogPost'
import Careers from './pages/Careers/Careers'
import Contact from './pages/Contact/Contact'
import Admin from './pages/Admin/Admin'
import AdminLogin from './pages/Admin/Login/AdminLogin'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
  }, [pathname])
  return null
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.35, ease: [0.55, 0, 1, 0.45] } },
}

function ProtectedCustomer() {
  const { customer, loading } = useCustomerAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
      </div>
    )
  }

  if (!customer) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  return <CustomerProfile />
}


function ProtectedAdmin() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
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
          <Route path="/cancellation-policy"       element={<CancellationPolicy />} />
          <Route path="/quotes"                     element={<QuotesPage />} />
          <Route path="/blog"                      element={<Blog />} />
          <Route path="/blog/:id"                  element={<BlogPost />} />
          <Route path="/careers"                   element={<Careers />} />
          <Route path="/contact"                   element={<Contact />} />
          <Route path="/login"                     element={<CustomerLogin />} />
          <Route path="/customer/profile"          element={<ProtectedCustomer />}>
            <Route index                           element={<ProfileSettings />} />
            <Route path="trips"                    element={<TripHistory />} />
          </Route>
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
  useGoogleAnalytics()

  return (
    <div className={styles.shell}>
      <ScrollToTop />
      <CustomCursor />
      {!isAdmin && <Navbar />}
      <AnimatedRoutes />
      {!isAdmin && <TravelQuizModal />}
      {!isAdmin && <CookieConsent />}
    </div>
  )
}

export default function App() {
  const [loaded, setLoaded] = useState(false)

  if (!loaded) return <Loader onComplete={() => setLoaded(true)} />

  return (
    <BrowserRouter>
      <AuthProvider>
        <CustomerAuthProvider>
          <AppShell />
        </CustomerAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
