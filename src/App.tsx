import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Branches from "./pages/Branches";
import Users from "./pages/Users";
import Subjects from "./pages/Subjects";
import Attendance from "./pages/Attendance";
import Students from "./pages/Students";
import Resources from "./pages/Resources";
import Assignments from "./pages/Assignments";
import Assistant from "./pages/Assistant";
import Analytics from "./pages/Analytics";
import MyAttendance from "./pages/MyAttendance";
import Settings from "./pages/Settings";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              }
            />
            <Route
              path="/branches"
              element={
                <AuthGuard requiredRoles={['super_admin']}>
                  <Branches />
                </AuthGuard>
              }
            />
            <Route
              path="/users"
              element={
                <AuthGuard requiredRoles={['super_admin']}>
                  <Users />
                </AuthGuard>
              }
            />
            <Route
              path="/subjects"
              element={
                <AuthGuard requiredRoles={['super_admin', 'teacher']}>
                  <Subjects />
                </AuthGuard>
              }
            />
            <Route
              path="/attendance"
              element={
                <AuthGuard requiredRoles={['super_admin', 'teacher']}>
                  <Attendance />
                </AuthGuard>
              }
            />
            <Route
              path="/students"
              element={
                <AuthGuard requiredRoles={['super_admin', 'teacher']}>
                  <Students />
                </AuthGuard>
              }
            />
            <Route
              path="/resources"
              element={
                <AuthGuard>
                  <Resources />
                </AuthGuard>
              }
            />
            <Route
              path="/assignments"
              element={
                <AuthGuard>
                  <Assignments />
                </AuthGuard>
              }
            />
            <Route
              path="/assistant"
              element={
                <AuthGuard>
                  <Assistant />
                </AuthGuard>
              }
            />
            <Route
              path="/analytics"
              element={
                <AuthGuard requiredRoles={['super_admin', 'teacher']}>
                  <Analytics />
                </AuthGuard>
              }
            />
            <Route
              path="/my-attendance"
              element={
                <AuthGuard requiredRoles={['student']}>
                  <MyAttendance />
                </AuthGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthGuard>
                  <Settings />
                </AuthGuard>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
