import { useCssVariables } from './hooks/useCssVariables'

export default function App({ children }) {
  useCssVariables()
  return children
}
