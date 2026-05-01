import '../../styles/simulator.css'

export default function PhoneFrame({ children }) {
  return (
    <div className="phone-frame">
      <div className="phone-notch">
        <div className="phone-camera" />
        <div className="phone-speaker" />
      </div>
      <div className="phone-screen-area">
        {children}
      </div>
      <div className="phone-home-bar" />
      <div className="phone-side-btn phone-btn-vol-up" />
      <div className="phone-side-btn phone-btn-vol-down" />
      <div className="phone-side-btn phone-btn-power" />
      <div className="phone-glass-reflection" />
    </div>
  )
}
