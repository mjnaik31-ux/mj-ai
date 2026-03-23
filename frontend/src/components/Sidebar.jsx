import './Sidebar.css'

const NAV_ITEMS = [
  { mode:'chat',         label:'Chat Assistant' },
  { mode:'voice',        label:'Voice Mode' },
  { mode:'productivity', label:'Productivity' },
  { mode:'creative',     label:'Creative AI' },
]

export default function Sidebar({ mode, onModeChange }) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-orb"/>
        <span className="logo-text">MJ</span>
      </div>
      <nav className="nav">
        <div className="nav-label">Modes</div>
        {NAV_ITEMS.map(item => (
          <div key={item.mode} className={`nav-item${mode===item.mode?' active':''}`} onClick={() => onModeChange(item.mode)}>
            {item.label}
          </div>
        ))}
        <div className="nav-label" style={{marginTop:12}}>History</div>
        <div className="nav-item">Recent chats</div>
        <div className="nav-item">Saved notes</div>
      </nav>
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="avatar">Y</div>
          <div className="user-info">
            <div className="user-name">You</div>
            <div className="user-plan">Pro - All features</div>
          </div>
          <div className="status-dot"/>
        </div>
      </div>
    </aside>
  )
}
