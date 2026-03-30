import { createBrowserRouter, redirect } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Patients from '../pages/Patients'
import PatientDetail from '../pages/PatientDetail'
import DoctorConsultation from '../pages/DoctorConsultation'
import NurseDocumentation from '../pages/NurseDocumentation'
import Queue from '../pages/Queue'
import QueueDisplay from '../pages/QueueDisplay'
import Welcome from '../pages/Welcome'
import ServiceGuide from '../pages/ServiceGuide'
import PublicSelfService from '../pages/PublicSelfService'
import Admin from '../pages/Admin'
import Settings from '../pages/Settings'
import ProtectedRoute from '../components/auth/ProtectedRoute'

export default createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Login /> }
    ]
  },
  {
    path: '/display',
    element: <QueueDisplay />
  },
  {
    path: '/welcome',
    element: <Welcome />
  },
  {
    path: '/info',
    element: <ServiceGuide />
  },
  {
    path: '/register',
    element: <PublicSelfService />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute roles={['ADMIN', 'DOCTOR', 'NURSE', 'STUDENT', 'CLINIC']}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'patients', element: <Patients /> },
      { path: 'patients/:id', element: <PatientDetail /> },
      { path: 'settings', element: <Settings /> }
    ]
  },
  {
    path: '/queue',
    element: (
      <ProtectedRoute roles={['ADMIN', 'DOCTOR', 'NURSE', 'CLINIC']}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Queue /> }
    ]
  },
  {
    path: '/consultation',
    element: (
      <ProtectedRoute roles={['DOCTOR', 'ADMIN']}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DoctorConsultation /> }
    ]
  },
  {
    path: '/nurse',
    element: (
      <ProtectedRoute roles={['NURSE', 'ADMIN']}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <NurseDocumentation /> }
    ]
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute roles={['ADMIN']}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Admin /> }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
})