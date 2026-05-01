import { AnimatePresence, motion } from 'framer-motion'
import { useSimulatorStore } from '../../store/useSimulatorStore'
import SimLoginScreen from './screens/SimLoginScreen'
import SimHomeScreen from './screens/SimHomeScreen'
import SimRoutesScreen from './screens/SimRoutesScreen'
import SimProfileScreen from './screens/SimProfileScreen'
import SimOnboardingScreen from './screens/SimOnboardingScreen'
import SimulatorNav from './SimulatorNav'

const screens = {
  login: SimLoginScreen,
  home: SimHomeScreen,
  routes: SimRoutesScreen,
  profile: SimProfileScreen,
  onboarding: SimOnboardingScreen,
}

const variants = {
  enter: (dir) => ({ x: dir > 0 ? 260 : -260, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir < 0 ? 260 : -260, opacity: 0 }),
}

export default function PhoneScreen() {
  const activeScreen = useSimulatorStore((s) => s.activeScreen)
  const direction = useSimulatorStore((s) => s.direction)
  const ActiveScreen = screens[activeScreen]
  const showNav = activeScreen !== 'login'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      background: 'var(--sim-background)',
      transition: 'background 0.3s ease',
    }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeScreen}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.8 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <ActiveScreen />
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showNav && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          >
            <SimulatorNav />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
