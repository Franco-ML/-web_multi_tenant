import { createBrowserRouter, Navigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import BrandingPage from '../pages/BrandingPage'
import ThemePage from '../pages/ThemePage'
import LocalePage from '../pages/LocalePage'
import ModulesPage from '../pages/ModulesPage'
import LanguagePage from '../pages/LanguagePage'
import AdvancedPage from '../pages/AdvancedPage'
import ExportPage from '../pages/ExportPage'
import SetupPage from '../pages/SetupPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true,          element: <Navigate to="/branding" replace /> },
      { path: 'branding',     element: <BrandingPage /> },
      { path: 'theme',        element: <ThemePage /> },
      { path: 'locale',       element: <LocalePage /> },
      { path: 'modules',      element: <ModulesPage /> },
      { path: 'language',     element: <LanguagePage /> },
      { path: 'advanced',     element: <AdvancedPage /> },
      { path: 'export',       element: <ExportPage /> },
      { path: 'setup',        element: <SetupPage /> },
      // Redirecciones de rutas antiguas
      { path: 'features',     element: <Navigate to="/modules" replace /> },
      { path: 'registration', element: <Navigate to="/modules" replace /> },
      { path: 'i18n',         element: <Navigate to="/language" replace /> },
    ],
  },
])
