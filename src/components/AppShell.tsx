import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Bell, UserCircle, Plus, Compass, Trophy, Wallet, Wrench, Zap, Users, Inbox, Loader2 } from 'lucide-react';
import TabDiscover from './TabDiscover';
import TabArena from './TabArena';
import TabWallet from './TabWallet';
import TabWorkshop from './TabWorkshop';
import TabLive from './TabLive';
import FriendsModal from './FriendsModal';
import NotifModal from './NotifModal';
import ProfileModal from './ProfileModal';
import FabModal from './FabModal';
import SharedFeedModal from './SharedFeedModal';
import type { TabId } from '@/types';

const tabs: { id: TabId; label: string; icon: typeof Compass }[] = [
  { id: 'kesfet', label: 'Keşfet', icon: Compass },
  { id: 'arena', label: 'Arena', icon: Trophy },
  { id: 'kasa', label: 'Kasa', icon: Wallet },
  { id: 'atolye', label: 'Atölye', icon: Wrench },
  { id: 'canli', label: 'Canlı', icon: Zap },
];

export default function AppShell() {
  const { currentUser, data, activeTab, setActiveTab, sharedFeed, isLoading } = useApp();
  const [fabOpen, setFabOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sharedFeedOpen, setSharedFeedOpen] = useState(false);

  const unreadNotifs = data.notifications.filter(n => !n.read).length;
  const unreadFeed = sharedFeed.filter(i => !i.read).length;

  if (isLoading) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto mb-3" style={{ color: 'var(--accent)' }} />
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="app-header">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center overflow-hidden" style={{
            width: 40, height: 40, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--accent), #f59e0b)',
            boxShadow: '0 4px 20px rgba(249,115,22,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}>
            <img
              src="/icon-192x192.png"
              alt="DostOS"
              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 14 }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4l3 12h14l3-12-6 5-4-7-4 7-6-5z"/></svg>';
              }}
            />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Dost<span style={{ color: 'var(--accent)' }}>OS</span>
            </span>
            {currentUser && (
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                @{currentUser.username}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Arkadaş paylaşımları butonu */}
          <button
            className="action-btn"
            onClick={() => setSharedFeedOpen(true)}
            title="Arkadaş Paylaşımları"
            style={{ position: 'relative' }}
          >
            <Inbox size={18} />
            {unreadFeed > 0 && (
              <span className="badge" style={{ background: 'var(--blue)' }}>{unreadFeed}</span>
            )}
          </button>
          <button className="action-btn" onClick={() => setFriendsOpen(true)} title="Arkadaşlar">
            <Users size={18} />
          </button>
          <button className="action-btn" onClick={() => setNotifOpen(true)} title="Bildirimler">
            <Bell size={18} />
            {unreadNotifs > 0 && <span className="badge">{unreadNotifs}</span>}
          </button>
          <button className="action-btn" onClick={() => setProfileOpen(true)} title="Profil">
            <UserCircle size={18} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="scroll-area">
        <div className={`tab-page ${activeTab === 'kesfet' ? 'active' : ''}`}>
          <TabDiscover />
        </div>
        <div className={`tab-page ${activeTab === 'arena' ? 'active' : ''}`}>
          <TabArena />
        </div>
        <div className={`tab-page ${activeTab === 'kasa' ? 'active' : ''}`}>
          <TabWallet />
        </div>
        <div className={`tab-page ${activeTab === 'atolye' ? 'active' : ''}`}>
          <TabWorkshop />
        </div>
        <div className={`tab-page ${activeTab === 'canli' ? 'active' : ''}`}>
          <TabLive />
        </div>
      </div>

      {/* FAB */}
      <button
        className={`fab ${fabOpen ? 'active' : ''}`}
        onClick={() => setFabOpen(!fabOpen)}
        title="Hızlı İşlemler"
      >
        <Plus size={28} />
      </button>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.id); setFabOpen(false); }}
            >
              <Icon className="nav-icon" />
              <span className="nav-label">{tab.label}</span>
              {tab.id === 'arena' && (data.arenaLigler.length + data.challenges.length > 0) && (
                <span className="nav-badge">{data.arenaLigler.length + data.challenges.length}</span>
              )}
              {tab.id === 'atolye' && (data.bbqs.length + data.projects.length + data.inventory.length > 0) && (
                <span className="nav-badge">{data.bbqs.length + data.projects.length + data.inventory.length}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* MODALS */}
      {fabOpen && <FabModal onClose={() => setFabOpen(false)} />}
      {notifOpen && <NotifModal onClose={() => setNotifOpen(false)} />}
      {friendsOpen && <FriendsModal onClose={() => setFriendsOpen(false)} />}
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
      {sharedFeedOpen && <SharedFeedModal onClose={() => setSharedFeedOpen(false)} />}
    </div>
  );
}
