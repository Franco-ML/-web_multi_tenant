import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const defaultColors = {
  primary: '#E8175D',
  primaryLight: '#FF6B96',
  primaryDark: '#B5104A',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#5856D6',
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F8F8',
  surfaceElevated: '#ECECEC',
  textPrimary: '#000000',
  textSecondary: '#6C6C70',
  textDisabled: '#AEAEB2',
  textInverse: '#FFFFFF',
  border: '#C6C6C8',
  borderLight: '#E5E5EA',
  borderFocus: '#E8175D',
}

const darkColors = {
  primary: '#E8175D',
  primaryLight: '#FF6B96',
  primaryDark: '#B5104A',
  success: '#30D158',
  warning: '#FFD60A',
  error: '#FF453A',
  info: '#6E6EF7',
  background: '#0D0D0D',
  backgroundSecondary: '#1A1A1A',
  surface: '#1C1C1E',
  surfaceSecondary: '#2C2C2E',
  surfaceElevated: '#3A3A3C',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textDisabled: '#48484A',
  textInverse: '#000000',
  border: '#38383A',
  borderLight: '#2C2C2E',
  borderFocus: '#E8175D',
}

export const DEFAULT_REGISTRATION_STEPS = [
  {
    id: 'register',
    label: 'Registro',
    subtitle: 'Cédula, foto de perfil y datos personales',
    icon: 'user-check',
    enabled: true,
    fields: [
      { key: 'identificationTypeId', label: 'Tipo de documento', type: 'select', required: true, optionsSource: 'catalog/identificationTypes' },
      { key: 'card',         label: 'Número de documento', type: 'text',   required: true, placeholder: '10000000' },
      { key: 'cedulaExpiry', label: 'Vencimiento',          type: 'date',   required: true },
      { key: 'name',         label: 'Nombre',               type: 'text',   required: true, validation: { minLength: 2, maxLength: 50 } },
      { key: 'lastName',     label: 'Apellidos',            type: 'text',   required: true, validation: { minLength: 2 } },
      { key: 'birthdate',    label: 'Fecha de nacimiento',  type: 'date',   required: true },
      { key: 'gender',       label: 'Género',               type: 'select', required: true, options: [{ value: 'M', label: 'Masculino' }, { value: 'F', label: 'Femenino' }] },
      { key: 'province',     label: 'Provincia',            type: 'text',   required: true, placeholder: 'Ej: San José' },
      { key: 'location',     label: 'Cantón / Distrito',    type: 'text',   required: true, placeholder: 'Ej: Escazú' },
    ],
    documents: [
      {
        key: 'idFront', label: 'Frente de cédula', description: 'Cara principal con tu foto y nombre',
        side: 'front', required: true,
        ocr: { documentType: 'national_id_front', autofill: true, extractFields: [
          { targetField: 'name',         ocrKey: 'name' },
          { targetField: 'lastName',     ocrKey: 'lastName' },
          { targetField: 'birthdate',    ocrKey: 'birthdate' },
          { targetField: 'card',         ocrKey: 'card' },
          { targetField: 'cedulaExpiry', ocrKey: 'expiry' },
        ]},
      },
      {
        key: 'idBack', label: 'Dorso de cédula', description: 'Si tiene datos en el reverso, mejora el análisis',
        side: 'back', required: false,
        ocr: { documentType: 'national_id_back', autofill: false, extractFields: [] },
      },
    ],
  },
  {
    id: 'license',
    label: 'Licencia de conducir',
    subtitle: 'Foto de tu licencia vigente',
    icon: 'award',
    enabled: true,
    fields: [
      { key: 'licenseType',   label: 'Categoría',   type: 'select', required: true, optionsSource: 'catalog/licenseTypes' },
      { key: 'licenseExpiry', label: 'Vencimiento', type: 'date',   required: true },
    ],
    documents: [
      {
        key: 'licensePhoto', label: 'Foto de licencia', description: 'Cara frontal de tu licencia de conducir',
        required: true,
        ocr: { documentType: 'drivers_license', autofill: true, extractFields: [
          { targetField: 'licenseType',   ocrKey: 'licenseType' },
          { targetField: 'licenseExpiry', ocrKey: 'expiry' },
        ]},
      },
    ],
  },
  {
    id: 'contact',
    label: 'Contacto y trabajo',
    subtitle: 'Teléfono, correo, disponibilidad y situación actual',
    icon: 'phone',
    enabled: true,
    fields: [
      { key: 'callPhone', label: 'Teléfono', type: 'phone', required: true, placeholder: '8888-8888' },
      { key: 'mail',      label: 'Correo',   type: 'email', required: true, placeholder: 'correo@ejemplo.com' },
    ],
    documents: [],
  },
  {
    id: 'vehicle',
    label: 'Vehículo',
    subtitle: 'Tipo de vehículo, placa y documentos',
    icon: 'truck',
    enabled: true,
    fields: [
      { key: 'vehicleType',     label: 'Tipo de vehículo', type: 'select', required: true, optionsSource: 'catalog/vehicleTypes' },
      { key: 'vehicleIdentity', label: 'Placa',            type: 'text',   required: true, placeholder: 'ABC-123' },
      { key: 'brand',           label: 'Marca',            type: 'text',   required: true, placeholder: 'Ej: Toyota' },
      { key: 'model',           label: 'Modelo',           type: 'text',   required: true, placeholder: 'Ej: Corolla' },
      { key: 'year',            label: 'Año',              type: 'number', required: true, validation: { min: 1990, max: 2025 } },
      { key: 'color',           label: 'Color',            type: 'text',   required: true },
    ],
    documents: [
      {
        key: 'vehicleTitle', label: 'Título de propiedad', description: 'Tarjeta de circulación del vehículo',
        required: true,
        ocr: { documentType: 'vehicle_title', autofill: true, extractFields: [
          { targetField: 'vehicleIdentity', ocrKey: 'vehicleIdentity' },
          { targetField: 'brand',           ocrKey: 'brand' },
          { targetField: 'model',           ocrKey: 'model' },
          { targetField: 'year',            ocrKey: 'year' },
          { targetField: 'color',           ocrKey: 'color' },
        ]},
      },
    ],
  },
  {
    id: 'emergency',
    label: 'Contacto de emergencia',
    subtitle: 'Nombre y teléfono de tu contacto de emergencia',
    icon: 'alert-circle',
    enabled: true,
    fields: [
      { key: 'emergencyName',         label: 'Nombre',   type: 'text',   required: true },
      { key: 'emergencyPhone',        label: 'Teléfono', type: 'phone',  required: true, placeholder: '8888-8888' },
      { key: 'emergencyRelationship', label: 'Relación', type: 'select', required: true, optionsSource: 'catalog/relationships' },
    ],
    documents: [],
  },
]

// ─── Traducciones por defecto ──────────────────────────────────────────────────

export const DEFAULT_TRANSLATIONS = {
  es: {
    loginWelcome:  'Bienvenido',
    loginSubtitle: 'Ingresa para continuar',
    loginButton:   'Continuar',
    tabHome:       'Inicio',
    tabRoutes:     'Ruta',
    tabProfile:    'Perfil',
    swipeToStart:  'Desliza para Iniciar Escaneo',
  },
  en: {
    loginWelcome:  'Welcome',
    loginSubtitle: 'Sign in to continue',
    loginButton:   'Continue',
    tabHome:       'Home',
    tabRoutes:     'Routes',
    tabProfile:    'Profile',
    swipeToStart:  'Swipe to Start Scanning',
  },
  'zh-CN': {
    loginWelcome:  '欢迎',
    loginSubtitle: '登录以继续',
    loginButton:   '继续',
    tabHome:       '主页',
    tabRoutes:     '路线',
    tabProfile:    '个人',
    swipeToStart:  '滑动开始扫描',
  },
}

// ─── Países disponibles (catálogo) ────────────────────────────────────────────

export const COUNTRY_CATALOG = [
  { countryCode: 'CR', name: 'Costa Rica',         flag: '🇨🇷', currency: 'CRC', currencySymbol: '₡',  language: 'es-CR', phonePrefix: '+506', timezone: 'America/Costa_Rica' },
  { countryCode: 'HN', name: 'Honduras',           flag: '🇭🇳', currency: 'HNL', currencySymbol: 'L',  language: 'es-HN', phonePrefix: '+504', timezone: 'America/Tegucigalpa' },
  { countryCode: 'GT', name: 'Guatemala',          flag: '🇬🇹', currency: 'GTQ', currencySymbol: 'Q',  language: 'es-GT', phonePrefix: '+502', timezone: 'America/Guatemala' },
  { countryCode: 'SV', name: 'El Salvador',        flag: '🇸🇻', currency: 'USD', currencySymbol: '$',  language: 'es-SV', phonePrefix: '+503', timezone: 'America/El_Salvador' },
  { countryCode: 'NI', name: 'Nicaragua',          flag: '🇳🇮', currency: 'NIO', currencySymbol: 'C$', language: 'es-NI', phonePrefix: '+505', timezone: 'America/Managua' },
  { countryCode: 'PA', name: 'Panamá',             flag: '🇵🇦', currency: 'PAB', currencySymbol: 'B/', language: 'es-PA', phonePrefix: '+507', timezone: 'America/Panama' },
  { countryCode: 'CO', name: 'Colombia',           flag: '🇨🇴', currency: 'COP', currencySymbol: '$',  language: 'es-CO', phonePrefix: '+57',  timezone: 'America/Bogota' },
  { countryCode: 'VE', name: 'Venezuela',          flag: '🇻🇪', currency: 'VES', currencySymbol: 'Bs', language: 'es-VE', phonePrefix: '+58',  timezone: 'America/Caracas' },
  { countryCode: 'EC', name: 'Ecuador',            flag: '🇪🇨', currency: 'USD', currencySymbol: '$',  language: 'es-EC', phonePrefix: '+593', timezone: 'America/Guayaquil' },
  { countryCode: 'PE', name: 'Perú',               flag: '🇵🇪', currency: 'PEN', currencySymbol: 'S/', language: 'es-PE', phonePrefix: '+51',  timezone: 'America/Lima' },
  { countryCode: 'BO', name: 'Bolivia',            flag: '🇧🇴', currency: 'BOB', currencySymbol: 'Bs', language: 'es-BO', phonePrefix: '+591', timezone: 'America/La_Paz' },
  { countryCode: 'CL', name: 'Chile',              flag: '🇨🇱', currency: 'CLP', currencySymbol: '$',  language: 'es-CL', phonePrefix: '+56',  timezone: 'America/Santiago' },
  { countryCode: 'AR', name: 'Argentina',          flag: '🇦🇷', currency: 'ARS', currencySymbol: '$',  language: 'es-AR', phonePrefix: '+54',  timezone: 'America/Buenos_Aires' },
  { countryCode: 'UY', name: 'Uruguay',            flag: '🇺🇾', currency: 'UYU', currencySymbol: '$U', language: 'es-UY', phonePrefix: '+598', timezone: 'America/Montevideo' },
  { countryCode: 'PY', name: 'Paraguay',           flag: '🇵🇾', currency: 'PYG', currencySymbol: '₲',  language: 'es-PY', phonePrefix: '+595', timezone: 'America/Asuncion' },
  { countryCode: 'BR', name: 'Brasil',             flag: '🇧🇷', currency: 'BRL', currencySymbol: 'R$', language: 'pt-BR', phonePrefix: '+55',  timezone: 'America/Sao_Paulo' },
  { countryCode: 'DO', name: 'Rep. Dominicana',    flag: '🇩🇴', currency: 'DOP', currencySymbol: 'RD$',language: 'es-DO', phonePrefix: '+1',   timezone: 'America/Santo_Domingo' },
  { countryCode: 'MX', name: 'México',             flag: '🇲🇽', currency: 'MXN', currencySymbol: '$',  language: 'es-MX', phonePrefix: '+52',  timezone: 'America/Mexico_City' },
  { countryCode: 'US', name: 'Estados Unidos',     flag: '🇺🇸', currency: 'USD', currencySymbol: '$',  language: 'en-US', phonePrefix: '+1',   timezone: 'America/New_York' },
  { countryCode: 'ES', name: 'España',             flag: '🇪🇸', currency: 'EUR', currencySymbol: '€',  language: 'es-ES', phonePrefix: '+34',  timezone: 'Europe/Madrid' },
]

// ─── Config por defecto ────────────────────────────────────────────────────────

// Config base de un tenant nuevo — sin datos hardcoded de ninguna empresa.
// Todo lo que diga 'Moover', 'CR', etc. debe venir del usuario o del catálogo.
const defaultConfig = {
  branding: {
    name: '',
    description: '',
    primaryColor: '#E8175D',     // color de UI por defecto, no de marca
    logoUrl: '',
    logoPreviewUrl: null,
    logoFile: null,
  },
  countryConfigs: [],            // vacío — el usuario elige desde el wizard/picker
  countryVersions: [],           // archivo de snapshots cuando se cambia herencia
  theme: {
    colorMode: 'light',
    light: { ...defaultColors },
    dark:  { ...darkColors },
  },
  login: {
    phoneEnabled: true,
    emailEnabled: true,
  },
  features: {
    routesEnabled: true,
    profileEnabled: true,
    googleMapsEnabled: true,
    scanningEnabled: true,
    darkModeToggleEnabled: true,
    analyticsEnabled: false,
    crashReportingEnabled: false,
  },
  registration: {
    steps: DEFAULT_REGISTRATION_STEPS.map(s => ({ ...s })),
  },
  i18n: {
    defaultLang: 'es',
    userCanChange: true,
    translations: { ...DEFAULT_TRANSLATIONS },
  },
  advanced: {
    apiUrl: '',
    tenantCode: '',
    sentryDsn: '',
    googleMapsApiKey: '',
    appEnv: 'prod',
    supportWebUrl: '',
    supportPhone: '',
    _setupComplete: false,
  },
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useTenantStore = create(
  persist(
    (set, get) => ({
  ...defaultConfig,

  // País actualmente seleccionado para configurar (null = config base/general)
  // Estado transitorio de UI, NO se persiste
  activeCountry: null,
  setActiveCountry: (countryCode) => set({ activeCountry: countryCode }),

  setBrandingField: (field, value) =>
    set((state) => ({ branding: { ...state.branding, [field]: value } })),

  setLogoFile: (file) => {
    if (!file) {
      set((state) => ({
        branding: { ...state.branding, logoFile: null, logoPreviewUrl: null, logoUrl: '' },
      }))
      return
    }
    const url = URL.createObjectURL(file)
    set((state) => ({
      branding: { ...state.branding, logoFile: file, logoPreviewUrl: url },
    }))
  },

  addCountry: (country) =>
    set((state) => ({
      countryConfigs: state.countryConfigs.some(c => c.countryCode === country.countryCode)
        ? state.countryConfigs
        : [...state.countryConfigs, {
            ...country,
            isPrimary: false,
            idTypes:   country.idTypes   !== undefined ? country.idTypes   : null,
            documents: country.documents !== undefined ? country.documents : null,
          }],
    })),

  removeCountry: (countryCode) =>
    set((state) => ({
      countryConfigs: state.countryConfigs.length > 1
        ? state.countryConfigs.filter(c => c.countryCode !== countryCode)
        : state.countryConfigs,
    })),

  updateCountry: (countryCode, patch) =>
    set((state) => ({
      countryConfigs: state.countryConfigs.map(c => c.countryCode === countryCode ? { ...c, ...patch } : c),
    })),

  setPrimaryCountry: (countryCode) =>
    set((state) => ({
      countryConfigs: state.countryConfigs.map(c => ({
        ...c,
        isPrimary: c.countryCode === countryCode,
      })),
    })),

  setCountryConfigs: (configs) => set({ countryConfigs: configs }),

  setCountryIdTypes: (countryCode, typesOrNull) =>
    set((state) => ({
      countryConfigs: state.countryConfigs.map(c =>
        c.countryCode === countryCode ? { ...c, idTypes: typesOrNull } : c
      ),
    })),

  setCountryDocuments: (countryCode, docsOrNull) =>
    set((state) => ({
      countryConfigs: state.countryConfigs.map(c =>
        c.countryCode === countryCode ? { ...c, documents: docsOrNull } : c
      ),
    })),

  // ─── Acciones del nuevo modelo de país (v6) ────────────────────────────────

  // Crear un país. mode = 'inherit-base' | 'inherit-from' | 'own'
  // sourceId solo para mode='inherit-from'
  // perModule solo para mode='inherit-from' personalizada (mapa Module → 'inherit'|'override-base'|'custom')
  createCountry: (catEntry, { mode, sourceId, perModule, customModules } = {}) => {
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `cc-${catEntry.countryCode}-${Date.now()}`
    const now = new Date().toISOString()
    const allInherit = {
      branding: 'inherit', theme: 'inherit', features: 'inherit',
      registration: 'inherit', i18n: 'inherit', login: 'inherit', advanced: 'inherit',
    }
    const newCountry = {
      ...catEntry,
      id,
      isPrimary: false,
      idTypes: null,
      documents: null,
      moduleModes:   perModule ?? allInherit,
      customModules: customModules ?? {},
      createdAt: now,
      updatedAt: now,
      totalSteps: 7,
      draftStep: 0,
    }
    if (mode === 'inherit-base') {
      newCountry.inheritsFrom = 'base'
      newCountry.status = 'active'
    } else if (mode === 'inherit-from') {
      newCountry.inheritsFrom = sourceId
      newCountry.status = 'active'
    } else {
      // own
      newCountry.inheritsFrom = null
      newCountry.status = 'draft'
    }
    set((state) => ({
      countryConfigs: state.countryConfigs.some(c => c.countryCode === catEntry.countryCode)
        ? state.countryConfigs
        : [...state.countryConfigs, newCountry],
    }))
    return id
  },

  // Avanza el draftStep del wizard (modo 'own')
  setCountryDraftStep: (countryId, step, customModulesPatch) =>
    set((state) => ({
      countryConfigs: state.countryConfigs.map(c =>
        c.id === countryId
          ? {
              ...c,
              draftStep: step,
              customModules: customModulesPatch
                ? { ...c.customModules, ...customModulesPatch }
                : c.customModules,
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
    })),

  // Marca un draft como completo → status active
  finalizeCountry: (countryId) =>
    set((state) => ({
      countryConfigs: state.countryConfigs.map(c =>
        c.id === countryId
          ? { ...c, status: 'active', updatedAt: new Date().toISOString() }
          : c
      ),
    })),

  // Cambia la herencia. cascadeChildren: si true, hijos pasan a apuntar al mismo nuevo padre.
  // Archiva snapshot del país antes de modificar.
  setCountryInheritance: (countryId, newSource, { cascadeChildren = false, perModule, customModules } = {}) =>
    set((state) => {
      const target = state.countryConfigs.find(c => c.id === countryId)
      if (!target) return state
      const snapshot = { ...target }
      const versions = [
        ...state.countryVersions,
        {
          id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `v-${Date.now()}`,
          countryId,
          snapshot,
          reason: 'inheritance-change',
          archivedAt: new Date().toISOString(),
        },
      ]
      const updated = state.countryConfigs.map(c => {
        if (c.id === countryId) {
          return {
            ...c,
            inheritsFrom: newSource,
            moduleModes: perModule ?? c.moduleModes,
            customModules: customModules ?? c.customModules,
            updatedAt: new Date().toISOString(),
          }
        }
        if (cascadeChildren && c.inheritsFrom === countryId) {
          return { ...c, inheritsFrom: newSource, updatedAt: new Date().toISOString() }
        }
        return c
      })
      return { countryConfigs: updated, countryVersions: versions }
    }),

  // Cambia el modo de herencia de un módulo específico de un país
  setCountryModuleMode: (countryId, moduleKey, mode) =>
    set((state) => ({
      countryConfigs: state.countryConfigs.map(c =>
        c.id === countryId
          ? {
              ...c,
              moduleModes: { ...c.moduleModes, [moduleKey]: mode },
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
    })),

  setCountryCustomModule: (countryId, moduleKey, value) =>
    set((state) => ({
      countryConfigs: state.countryConfigs.map(c =>
        c.id === countryId
          ? {
              ...c,
              customModules: { ...c.customModules, [moduleKey]: value },
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
    })),

  deactivateCountry: (countryId) =>
    set((state) => ({
      countryConfigs: state.countryConfigs.map(c =>
        c.id === countryId
          ? { ...c, status: 'inactive', isPrimary: false, updatedAt: new Date().toISOString() }
          : c
      ),
    })),

  reactivateCountry: (countryId) =>
    set((state) => ({
      countryConfigs: state.countryConfigs.map(c =>
        c.id === countryId
          ? { ...c, status: 'active', updatedAt: new Date().toISOString() }
          : c
      ),
    })),

  // Setea isPrimary=true SOLO en el país activo del id, todos los demás false
  setPrimaryCountryById: (countryId) =>
    set((state) => ({
      countryConfigs: state.countryConfigs.map(c => ({
        ...c,
        isPrimary: c.id === countryId && c.status === 'active',
      })),
    })),

  // palette: 'light' | 'dark'
  setColor: (palette, colorKey, hexValue) =>
    set((state) => ({
      theme: {
        ...state.theme,
        [palette]: { ...state.theme[palette], [colorKey]: hexValue },
      },
    })),

  // Solo cambia el modo predeterminado — NO resetea ninguna paleta
  setColorMode: (mode) =>
    set((state) => ({ theme: { ...state.theme, colorMode: mode } })),

  setFeature: (featureKey, enabled) =>
    set((state) => ({
      features: { ...state.features, [featureKey]: enabled },
    })),

  setLoginField: (field, value) =>
    set((state) => ({ login: { ...state.login, [field]: value } })),

  setAdvancedField: (field, value) =>
    set((state) => ({ advanced: { ...state.advanced, [field]: value } })),

  // Meta del i18n: defaultLang, userCanChange
  setI18nMeta: (field, value) =>
    set((state) => ({ i18n: { ...state.i18n, [field]: value } })),

  // Edita una traducción: lang='es', key='loginWelcome', value='Bienvenido'
  setTranslation: (lang, key, value) =>
    set((state) => ({
      i18n: {
        ...state.i18n,
        translations: {
          ...state.i18n.translations,
          [lang]: { ...state.i18n.translations[lang], [key]: value },
        },
      },
    })),

  // Agrega un idioma nuevo (con traducciones base opcionales)
  addLanguage: (code, translations) =>
    set((state) => ({
      i18n: {
        ...state.i18n,
        translations: {
          ...state.i18n.translations,
          [code]: translations ?? { ...DEFAULT_TRANSLATIONS.es },
        },
      },
    })),

  // Elimina un idioma (no se puede eliminar el defaultLang)
  removeLanguage: (code) =>
    set((state) => {
      if (code === state.i18n.defaultLang) return state
      const { [code]: _, ...rest } = state.i18n.translations
      return { i18n: { ...state.i18n, translations: rest } }
    }),

  updateRegistrationStep: (stepIndex, patch) =>
    set((state) => {
      const steps = state.registration.steps.map((s, i) =>
        i === stepIndex ? { ...s, ...patch } : s
      )
      return { registration: { steps } }
    }),

  updateStepField: (stepIndex, fieldIndex, patch) =>
    set((state) => {
      const steps = state.registration.steps.map((step, si) => {
        if (si !== stepIndex) return step
        const fields = step.fields.map((f, fi) =>
          fi === fieldIndex ? { ...f, ...patch } : f
        )
        return { ...step, fields }
      })
      return { registration: { steps } }
    }),

  addStepField: (stepIndex, field) =>
    set((state) => {
      const steps = state.registration.steps.map((step, si) => {
        if (si !== stepIndex) return step
        return { ...step, fields: [...step.fields, field] }
      })
      return { registration: { steps } }
    }),

  removeStepField: (stepIndex, fieldIndex) =>
    set((state) => {
      const steps = state.registration.steps.map((step, si) => {
        if (si !== stepIndex) return step
        return { ...step, fields: step.fields.filter((_, fi) => fi !== fieldIndex) }
      })
      return { registration: { steps } }
    }),

  resetToDefaults: () => set({ ...defaultConfig }),

  loadFromJson: (json) => {
    try {
      const parsed = typeof json === 'string' ? JSON.parse(json) : json

      // Migra: theme.colors → theme.light
      let parsedTheme = parsed.theme ?? null
      if (parsedTheme && parsedTheme.colors && !parsedTheme.light) {
        parsedTheme = { ...parsedTheme, light: parsedTheme.colors, dark: { ...darkColors } }
        delete parsedTheme.colors
      }

      // Migra: language section → i18n
      let parsedI18n = parsed.i18n ?? null
      if (!parsedI18n && parsed.language) {
        parsedI18n = {
          defaultLang: parsed.language.default ?? 'es',
          userCanChange: parsed.language.userCanChange ?? true,
          translations: { ...DEFAULT_TRANSLATIONS },
        }
      }

      // Migra: locale / countries → countryConfigs
      let parsedCountries = parsed.countryConfigs ?? null
      if (!parsedCountries && parsed.countries) {
        parsedCountries = parsed.countries.map((c, i) => ({
          ...c,
          isPrimary: i === 0,
          idTypes: c.idTypes ?? null,
          documents: c.documents ?? null,
        }))
      }
      if (!parsedCountries && parsed.locale) {
        parsedCountries = [{ ...parsed.locale, isPrimary: true, idTypes: null, documents: null }]
      }

      // Migra: tenantId → tenantCode
      let parsedAdvanced = parsed.advanced ?? null
      if (parsedAdvanced && parsedAdvanced.tenantId && !parsedAdvanced.tenantCode) {
        parsedAdvanced = { ...parsedAdvanced, tenantCode: parsedAdvanced.tenantId }
        delete parsedAdvanced.tenantId
      }

      set((state) => ({
        branding:        { ...state.branding, ...parsed.branding, logoFile: null, logoPreviewUrl: parsed.branding?.logoUrl || null },
        countryConfigs:  parsedCountries    ?? state.countryConfigs,
        theme:           parsedTheme        ?? state.theme,
        login:        parsed.login      ?? state.login,
        features:     parsed.features   ?? state.features,
        registration: parsed.registration ?? state.registration,
        i18n:         parsedI18n        ?? state.i18n,
        advanced:     parsedAdvanced    ?? state.advanced,
      }))
      return true
    } catch {
      return false
    }
  },

  exportToJson: () => {
    const { branding, countryConfigs, theme, login, features, registration, i18n, advanced } = get()
    const tenantCode = advanced.tenantCode || 'moover'
    return JSON.stringify(
      {
        tenantCode,
        branding: {
          name: branding.name,
          logoUrl: branding.logoUrl || branding.logoPreviewUrl || '',
          primaryColor: theme.light.primary,
        },
        theme: {
          colorMode: theme.colorMode,
          light: theme.light,
          dark:  theme.dark,
        },
        login,
        features,
        countryConfigs,
        registration: {
          steps: registration.steps
            .filter(s => s.enabled !== false)
            .map(({ enabled, ...step }) => step),
        },
        i18n,
        advanced: {
          apiUrl: advanced.apiUrl,
          appEnv: advanced.appEnv,
          sentryDsn: advanced.sentryDsn,
          googleMapsApiKey: advanced.googleMapsApiKey,
        },
      },
      null,
      2
    )
  },
    }),
    {
      name: 'moover-tenant-config',
      version: 6,
      migrate: (saved, version) => {
        if (version < 2) {
          if (saved.theme?.colors) {
            saved.theme = { colorMode: saved.theme.colorMode ?? 'light', light: saved.theme.colors, dark: { ...darkColors } }
          }
          if (saved.language && !saved.i18n) {
            saved.i18n = { defaultLang: saved.language.default ?? 'es', userCanChange: saved.language.userCanChange ?? true, translations: { ...DEFAULT_TRANSLATIONS } }
            delete saved.language
          }
        }
        if (version < 3) {
          if (saved.locale && !saved.countries) {
            saved.countries = [{ ...saved.locale }]
            delete saved.locale
          }
          if (saved.advanced?.tenantId && !saved.advanced?.tenantCode) {
            saved.advanced = { ...saved.advanced, tenantCode: saved.advanced.tenantId }
            delete saved.advanced.tenantId
          }
        }
        if (version < 4) {
          // countries → countryConfigs con isPrimary, idTypes, documents
          if (saved.countries && !saved.countryConfigs) {
            saved.countryConfigs = saved.countries.map((c, i) => ({
              ...c,
              isPrimary: i === 0,
              idTypes: null,
              documents: null,
            }))
            delete saved.countries
          }
        }
        if (version < 5) {
          if (!saved.advanced) saved.advanced = {}
          if (saved.advanced.supportWebUrl === undefined) saved.advanced.supportWebUrl = ''
          if (saved.advanced.supportPhone   === undefined) saved.advanced.supportPhone   = ''
          // tenants existentes ya están configurados — no mostrar wizard
          if (saved.advanced._setupComplete === undefined) saved.advanced._setupComplete = true
        }
        if (version < 6) {
          // Nuevo modelo de país: status / inheritance / moduleModes / customModules / draftStep
          // Países existentes pasan a status='active' heredando 'base' (comportamiento previo).
          if (Array.isArray(saved.countryConfigs)) {
            saved.countryConfigs = saved.countryConfigs.map(c => ({
              ...c,
              id:            c.id ?? (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cc-${c.countryCode}-${Date.now()}`),
              status:        c.status ?? 'active',
              inheritsFrom:  c.inheritsFrom ?? 'base',
              moduleModes:   c.moduleModes ?? {
                branding: 'inherit', theme: 'inherit', features: 'inherit',
                registration: 'inherit', i18n: 'inherit', login: 'inherit', advanced: 'inherit',
              },
              customModules: c.customModules ?? {},
              draftStep:     c.draftStep ?? 0,
              totalSteps:    c.totalSteps ?? 7,
              createdAt:     c.createdAt ?? new Date().toISOString(),
              updatedAt:     c.updatedAt ?? new Date().toISOString(),
            }))
          }
          // Snapshot archive store (vacío al migrar)
          if (!saved.countryVersions) saved.countryVersions = []
        }
        return saved
      },
      partialize: (state) => ({
        branding:        { ...state.branding, logoFile: null },
        countryConfigs:  state.countryConfigs,
        countryVersions: state.countryVersions,
        theme:           state.theme,
        login:           state.login,
        features:        state.features,
        registration:    state.registration,
        i18n:            state.i18n,
        advanced:        state.advanced,
      }),
    }
  )
)
