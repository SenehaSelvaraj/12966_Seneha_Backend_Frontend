import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import UserDashboard from'./pages/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminItems from './pages/admin/AdminItems';
import AdminUserStats from './pages/admin/AdminUserStats';
import AdminUsers from './pages/admin/AdminUsers';
import ReportFound from './pages/ReportFound';
import ReportLost from './pages/ReportLost';
import MyReports from './pages/MyReports';
import SearchingItems from './pages/SearchingItems';
 
 
function App() {
  return (
    <BrowserRouter>
     
      <Navbar />
 
      <Routes>
       
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
 
        <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
        <Route path="/report-found" element={<PrivateRoute><ReportFound /></PrivateRoute>} />
        <Route path="/report-lost" element={<PrivateRoute><ReportLost /></PrivateRoute>} />
        <Route path="/my-reports" element={<PrivateRoute><MyReports /></PrivateRoute>} />
        <Route path="/searching-items" element={<PrivateRoute><SearchingItems /></PrivateRoute>} />
        <Route path="/admin" element={
          <PrivateRoute requiredRole="ADMIN">
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin/items" element={
          <PrivateRoute requiredRole="ADMIN">
            <AdminItems />
          </PrivateRoute>
        } />
         <Route path="/admin/user-stats" element={
          <PrivateRoute requiredRole="ADMIN">
            <AdminUserStats />
          </PrivateRoute>
        } />
 
           <Route path="/admin/users" element={
          <PrivateRoute requiredRole="ADMIN">
            <AdminUsers />
          </PrivateRoute>
        } />
     
      </Routes>
    </BrowserRouter>
  );
}
 
export default App;
 
 