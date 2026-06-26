import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Nav from './components/Nav'
import ChatWidget from './components/ChatWidget'

const Landing          = lazy(() => import('./pages/Landing'))
const Login            = lazy(() => import('./pages/Login'))
const Signup           = lazy(() => import('./pages/Signup'))
const Intake           = lazy(() => import('./pages/Intake'))
const Checkout         = lazy(() => import('./pages/Checkout'))
const Dashboard        = lazy(() => import('./pages/Dashboard'))
const Blog             = lazy(() => import('./pages/Blog'))
const BlogPost         = lazy(() => import('./pages/BlogPost'))
const AdminBlog        = lazy(() => import('./pages/AdminBlog'))
const AdminListings    = lazy(() => import('./pages/AdminListings'))
const AdminTestimonials = lazy(() => import('./pages/AdminTestimonials'))
const ForgotPassword   = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword    = lazy(() => import('./pages/ResetPassword'))
const Pricing          = lazy(() => import('./pages/Pricing'))
const Privacy          = lazy(() => import('./pages/Privacy'))
const Terms            = lazy(() => import('./pages/Terms'))
const Documents        = lazy(() => import('./pages/Documents'))
const JoinGroup        = lazy(() => import('./pages/JoinGroup'))
const Qualify          = lazy(() => import('./pages/Qualify'))
const Neighborhoods    = lazy(() => import('./pages/Neighborhoods'))

const PageFallback = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
    <div className="spinner" style={{ borderColor:'rgba(10,147,150,0.3)', borderTopColor:'var(--teal)', width:32, height:32 }} />
  </div>
)

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}><div className="spinner" style={{ borderColor:'rgba(10,147,150,0.3)', borderTopColor:'var(--teal)', width:32, height:32 }} /></div>
  return user ? children : <Navigate to="/login" replace />
}

function PaidRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}><div className="spinner" style={{ borderColor:'rgba(10,147,150,0.3)', borderTopColor:'var(--teal)', width:32, height:32 }} /></div>
  if (!user) return <Navigate to="/login" replace />
  if (!profile?.paid) return <Navigate to="/checkout" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <>
      <Nav />
      <ChatWidget />
      <div style={{ paddingTop: 68 }}>
      <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/"          element={<Landing />} />
        <Route path="/blog"      element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/admin/blog" element={<AdminBlog />} />
        <Route path="/admin/listings" element={<AdminListings />} />
        <Route path="/admin/testimonials" element={<AdminTestimonials />} />
        <Route path="/pricing"         element={<Pricing />} />
        <Route path="/privacy"         element={<Privacy />} />
        <Route path="/qualify"         element={<Qualify />} />
        <Route path="/neighborhoods"   element={<Neighborhoods />} />
        <Route path="/terms"           element={<Terms />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/join"      element={<JoinGroup />} />
        <Route path="/login"     element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup"    element={user ? <Navigate to="/intake" /> : <Signup />} />
        <Route path="/intake"    element={<PrivateRoute><Intake /></PrivateRoute>} />
        <Route path="/checkout"  element={<PrivateRoute><Checkout /></PrivateRoute>} />
        <Route path="/dashboard" element={<PaidRoute><Dashboard /></PaidRoute>} />
        <Route path="/documents" element={<PaidRoute><Documents /></PaidRoute>} />
        <Route path="*"          element={<Navigate to="/" />} />
      </Routes>
      </Suspense>
      </div>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
