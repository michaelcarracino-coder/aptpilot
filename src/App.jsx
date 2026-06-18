import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Nav from './components/Nav'
import Landing    from './pages/Landing'
import Login      from './pages/Login'
import Signup     from './pages/Signup'
import Intake     from './pages/Intake'
import Checkout   from './pages/Checkout'
import Dashboard  from './pages/Dashboard'
import Blog       from './pages/Blog'
import BlogPost   from './pages/BlogPost'
import AdminBlog  from './pages/AdminBlog'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}><div className="spinner" style={{ borderColor:'rgba(10,147,150,0.3)', borderTopColor:'var(--teal)', width:32, height:32 }} /></div>
  return user ? children : <Navigate to="/login" replace />
}

function PaidRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!profile?.paid) return <Navigate to="/checkout" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/"          element={<Landing />} />
        <Route path="/blog"      element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/admin/blog" element={<AdminBlog />} />
        <Route path="/login"     element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup"    element={user ? <Navigate to="/intake" /> : <Signup />} />
        <Route path="/intake"    element={<PrivateRoute><Intake /></PrivateRoute>} />
        <Route path="/checkout"  element={<PrivateRoute><Checkout /></PrivateRoute>} />
        <Route path="/dashboard" element={<PaidRoute><Dashboard /></PaidRoute>} />
        <Route path="*"          element={<Navigate to="/" />} />
      </Routes>
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
