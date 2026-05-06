import { createBrowserRouter, Navigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import LoginPage from '../pages/LoginPage'
import BrandPage from '../pages/BrandPage'
import BrandingPage from '../pages/BrandingPage'
import ThemePage from '../pages/ThemePage'
import LocalePage from '../pages/LocalePage'
import ModulesPage from '../pages/ModulesPage'
import LanguagePage from '../pages/LanguagePage'
import AdvancedPage from '../pages/AdvancedPage'
import ExportPage from '../pages/ExportPage'
import ApkPage from '../pages/ApkPage'
import SetupPage from '../pages/SetupPage'
import CountriesPage from '../pages/CountriesPage'
import CountryDetailPage from '../pages/CountryDetailPage'
import CountryWizardPage from '../pages/CountryWizardPage'
import SystemCountriesPage from '../pages/SystemCountriesPage'
import SystemTenantsPage from '../pages/SystemTenantsPage'
import DocumentsPage from '../pages/DocumentsPage'
import InheritancePage from '../pages/InheritancePage'
import UsersPage from '../pages/UsersPage'

// import.meta.env.BASE_URL refleja el `base` del vite.config.js
// (en dev: '/', en producción GitHub Pages: '/-web_multi_tenant/')
// React Router necesita basename SIN trailing slash final.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export const router = createBrowserRouter([
  { path: 'login', element: <LoginPage /> },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true,          element: <Navigate to="/brand" replace /> },
      { path: 'brand',        element: <BrandPage /> },
      { path: 'locale',       element: <LocalePage /> },
      { path: 'modules',      element: <ModulesPage /> },
      { path: 'advanced',     element: <AdvancedPage /> },
      { path: 'export',       element: <ExportPage /> },
      { path: 'apk',          element: <ApkPage /> },
      { path: 'setup',        element: <SetupPage /> },
      { path: 'countries',         element: <CountriesPage /> },
      { path: 'countries/:id',           element: <CountryDetailPage /> },
      { path: 'countries/wizard/:id',    element: <CountryWizardPage /> },
      { path: 'system/countries',  element: <SystemCountriesPage /> },
      { path: 'system/tenants',   element: <SystemTenantsPage /> },
      { path: 'documents',    element: <DocumentsPage /> },
      { path: 'inheritance',  element: <InheritancePage /> },
      { path: 'users',        element: <UsersPage /> },
      // Rutas legacy mantenidas por compatibilidad / uso interno
      { path: 'branding',     element: <BrandingPage /> },
      { path: 'theme',        element: <ThemePage /> },
      { path: 'language',     element: <LanguagePage /> },
      // Redirecciones de rutas antiguas
      { path: 'features',     element: <Navigate to="/modules" replace /> },
      { path: 'registration', element: <Navigate to="/modules" replace /> },
      { path: 'i18n',         element: <Navigate to="/language" replace /> },
    ],
  },
], { basename })
