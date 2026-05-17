import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { STYLES } from "./constants/theme";

import Splash from "./screens/Splash";
import Phone from "./screens/auth/Phone";
import OTP from "./screens/auth/OTP";
import Registration from "./screens/auth/Registration";
import AuthSuccess from "./screens/auth/Success";
import Tutorial from "./screens/Tutorial";
import Feed from "./screens/Feed";
import PostDetail from "./screens/PostDetail";
import CreateForm from "./screens/CreateForm";
import PostSuccess from "./screens/PostSuccess";
import MyVoice from "./screens/MyVoice";
import Notifications from "./screens/Notifications";
import Profile from "./screens/Profile";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function ProfileRequiredRoute({ children }) {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile?.name) return <Navigate to="/register" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <style>{STYLES}</style>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Phone />} />
          <Route path="/otp" element={<OTP />} />
          <Route path="/register" element={
            <ProtectedRoute><Registration /></ProtectedRoute>
          } />
          <Route path="/success" element={
            <ProtectedRoute><AuthSuccess /></ProtectedRoute>
          } />
          <Route path="/tutorial" element={
            <ProtectedRoute><Tutorial /></ProtectedRoute>
          } />
          <Route path="/feed" element={
            <ProfileRequiredRoute><Feed /></ProfileRequiredRoute>
          } />
          <Route path="/post/:id" element={
            <ProfileRequiredRoute><PostDetail /></ProfileRequiredRoute>
          } />
          <Route path="/create" element={
            <ProfileRequiredRoute><CreateForm /></ProfileRequiredRoute>
          } />
          <Route path="/post-success" element={
            <ProfileRequiredRoute><PostSuccess /></ProfileRequiredRoute>
          } />
          <Route path="/voice" element={
            <ProfileRequiredRoute><MyVoice /></ProfileRequiredRoute>
          } />
          <Route path="/notifications" element={
            <ProfileRequiredRoute><Notifications /></ProfileRequiredRoute>
          } />
          <Route path="/profile" element={
            <ProfileRequiredRoute><Profile /></ProfileRequiredRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
