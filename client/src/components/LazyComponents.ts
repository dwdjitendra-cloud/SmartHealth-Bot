import { lazy } from 'react';

// Lazy load pages for better performance
export const Home = lazy(() => import('../pages/Home'));
export const Login = lazy(() => import('../pages/Login'));
export const Register = lazy(() => import('../pages/Register'));
export const Dashboard = lazy(() => import('../pages/Dashboard'));
export const SymptomChecker = lazy(() => import('../pages/SymptomChecker'));
export const Doctors = lazy(() => import('../pages/Doctors'));
export const Profile = lazy(() => import('../pages/Profile'));
export const AIHealthcare = lazy(() => import('../pages/AIHealthcare'));
export const HealthcareDashboard = lazy(() => import('../pages/HealthcareDashboard'));
export const AdvancedHealthDashboard = lazy(() => import('../pages/AdvancedHealthDashboard'));
export const VitalSignsDashboard = lazy(() => import('../pages/VitalSignsDashboard'));
export const SmartMedicationDashboard = lazy(() => import('../pages/SmartMedicationDashboard'));
export const TelemedicineDashboard = lazy(() => import('../pages/TelemedicineDashboard'));
export const MentalHealthDashboard = lazy(() => import('../pages/MentalHealthDashboard'));