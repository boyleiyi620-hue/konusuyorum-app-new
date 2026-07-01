import { useApp } from '@/context/AppContext';
import { X, Inbox, Check } from 'lucide-react';
import type { SharedFeedItem } from '@/types';

function getTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    kesfet: '🧭',
    feed: '💬',
    game: '🎮',
    music: '🎵',
    expense: '💰',
    bbq: '🍖',
    challenge: '🏆',
  };
  return emojis[type] || '📨';
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    kesfet: 'Öneri',
    feed: 'Gönderi',
    game: 'Oyun Daveti',
    music: 'Müzik',
    expense: 'Harcama',
    bbq: 'Mangal Daveti',
    challenge: 'Meydan Okuma',
  };
  return labels[type] || 'Paylaşım';
}

function FeedCard({ item, onRead }: { item: SharedFeedItem; onRead: () => void }) {
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'az önce';
    if (mins < 60) return `${mins} dk önce`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} sa önce`;
    return `${Math.floor(hours / 24)} gün önce`;
  };

  const content = item.content;

  return (
    <div
      className="p-3 rounded-xl mb-2"
      style={{
        background: item.read ? 'var(--bg-card)' : 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(251,191,36,0.04))',
        border: `1px solid ${item.read ? 'var(--border)' : 'rgba(249,115,22,0.2)'}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{getTypeEmoji(item.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm">{item.fromDisplayName || item.fromUsername}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
              {getTypeLabel(item.type)}
            </span>
            {!item.read && (
              <span className="w-2 h-2 rounded-full ml-auto" style={{ background: 'var(--accent)', flexShrink: 0 }} />
            )}
          </div>

          {/* Content preview */}
          {content.title && (
            <div className="font-semibold text-sm mb-1">{content.title}</div>
          )}
          {content.text && (
            <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{content.text}</div>
          )}
          {content.location && (
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>📍 {content.location}</div>
          )}
          {content.budget && (
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>💰 {content.budget}</div>
          )}
          {content.amount && (
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>💸 {content.amount} TL</div>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {timeAgo(item.createdAt)}
            </span>
            {!item.read && (
              <button
                onClick={onRead}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg"
                style={{ background: 'var(--green-dim)', color: 'var(--green)', border: 'none', cursor: 'pointer' }}
              >
                <Check size={10} /> Okundu
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SharedFeedModal({ onClose }: { onClose: () => void }) {
  const { sharedFeed, markFeedRead, refreshSharedFeed } = useApp();

  const unreadCount = sharedFeed.filter(i => !i.read).length;

  const handleMarkAllRead = async () => {
    const unread = sharedFeed.filter(i => !i.read);
    for (const item of unread) {
      await markFeedRead(item.id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-extrabold flex items-center gap-2">
            <Inbox size={20} style={{ color: 'var(--accent)' }} />
            Arkadaş Paylaşımları
            {unreadCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: 'var(--accent)', color: '#fff' }}>
                {unreadCount}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshSharedFeed}
              style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}
            >
              🔄
            </button>
            <button onClick={onClose} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="w-full mb-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.2)', cursor: 'pointer' }}
          >
            <Check size={12} className="inline mr-1" /> Tümünü okundu işaretle
          </button>
        )}

        <div className="overflow-y-auto" style={{ maxHeight: '65vh' }}>
          {sharedFeed.length === 0 ? (
            <div className="empty-state">
              <Inbox size={48} className="empty-state-icon" />
              <div>Henüz paylaşım yok.</div>
              <div className="empty-state-hint">Arkadaşların bir şey paylaştığında burada görünecek.</div>
            </div>
          ) : (
            sharedFeed.map(item => (
              <FeedCard
                key={item.id}
                item={item}
                onRead={() => markFeedRead(item.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
