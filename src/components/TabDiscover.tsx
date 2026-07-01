import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Compass, Dice5, Plus, Check, X, Edit2, Trash2, Share2 } from 'lucide-react';

export default function TabDiscover() {
  const { data, setData, addNotification, escapeHtml, currentUser, currentGroup, sendToFriends, friends, saveData } = useApp();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', location: '', budget: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [sharing, setSharing] = useState<string | null>(null);

  const items = search
    ? data.kesfet.filter(i =>
        (i.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (i.location || '').toLowerCase().includes(search.toLowerCase())
      )
    : data.kesfet;

  const handleVote = async (type: 'approve' | 'skip', id: string) => {
    const item = data.kesfet.find(i => i.id === id);
    if (!item) return;
    const updated = {
      ...data,
      history: [...data.history, { title: item.title, date: item.date || 'Bugün', status: type === 'approve' ? 'approved' as const : 'skipped' as const }],
      kesfet: data.kesfet.filter(i => i.id !== id),
    };
    setData(updated);
    await saveData(updated);
    addNotification(type === 'approve' ? `✅ "${item.title}" onaylandı!` : `⏭️ "${item.title}" geçildi.`);
  };

  const handleAdd = async () => {
    if (!form.title.trim()) return;

    if (editId) {
      // Düzenleme modu
      const updated = {
        ...data,
        kesfet: data.kesfet.map(i =>
          i.id === editId
            ? { ...i, title: form.title, date: form.date || i.date, location: form.location || i.location, budget: form.budget || i.budget }
            : i
        ),
      };
      setData(updated);
      await saveData(updated);
      addNotification(`✏️ "${form.title}" güncellendi.`);
      setEditId(null);
    } else {
      // Yeni öneri
      const newItem = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        title: form.title,
        date: form.date || new Date().toLocaleDateString('tr-TR'),
        location: form.location || 'Belirtilmemiş',
        budget: form.budget || 'Ücretsiz',
        participants: [],
        authorId: currentUser?.id,
        authorName: currentUser?.displayName || currentUser?.username,
        groupId: currentGroup?.id,
      };
      const updated = { ...data, kesfet: [...data.kesfet, newItem] };
      setData(updated);
      await saveData(updated);
      addNotification(`📌 Yeni öneri: "${form.title}"`);

      // Arkadaşlara otomatik gönder
      if (friends.length > 0) {
        await sendToFriends('kesfet', newItem);
        addNotification(`📨 Öneri ${friends.length} arkadaşına gönderildi!`);
      }
    }

    setForm({ title: '', date: '', location: '', budget: '' });
    setShowAdd(false);
  };

  const handleShare = async (item: typeof data.kesfet[0]) => {
    if (friends.length === 0) {
      addNotification('⚠️ Paylaşmak için önce arkadaş ekle!');
      return;
    }
    setSharing(item.id);
    await sendToFriends('kesfet', item);
    addNotification(`📨 "${item.title}" ${friends.length} arkadaşına gönderildi!`);
    setTimeout(() => setSharing(null), 2000);
  };

  const randomSuggestion = async () => {
    const suggestions = [
      { title: '🎬 Film Gecesi', location: 'Ev', budget: 'Ücretsiz' },
      { title: '⚽ Halı Saha', location: 'Spor Kompleksi', budget: '500 TL/kişi' },
      { title: '🍖 Mangal Partisi', location: 'Park', budget: '300 TL/kişi' },
      { title: '🎮 Oyun Turnuvası', location: 'Ev', budget: 'Ücretsiz' },
      { title: '🎤 Karaoke Gecesi', location: 'Kafe', budget: '200 TL/kişi' },
      { title: '🏕️ Kamp', location: 'Orman', budget: '400 TL/kişi' },
      { title: '🎳 Bowling', location: 'Bowling Salonu', budget: '150 TL/kişi' },
      { title: '🍕 Pizza Partisi', location: 'Ev', budget: '100 TL/kişi' },
    ];
    const s = suggestions[Math.floor(Math.random() * suggestions.length)];
    const newItem = {
      ...s,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      date: new Date().toLocaleDateString('tr-TR'),
      participants: [],
      authorId: currentUser?.id,
      authorName: currentUser?.displayName || currentUser?.username,
      groupId: currentGroup?.id,
    };
    const updated = { ...data, kesfet: [...data.kesfet, newItem] };
    setData(updated);
    await saveData(updated);
    addNotification(`🎲 Rastgele öneri: "${s.title}"`);

    // Arkadaşlara gönder
    if (friends.length > 0) {
      await sendToFriends('kesfet', newItem);
    }
  };

  const renderParticipants = (parts?: any[]) => {
    if (!parts?.length) return null;
    return (
      <div className="mt-1 flex flex-wrap">
        {parts.map((p, i) => (
          <span key={i} className={`participant-badge ${p.status}`}>
            <span>{p.name}</span>{p.value ? ` (${p.value})` : ''}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="section-title">
        <h3>
          <span className="icon-box"><Compass size={16} /></span>
          Bugün Ne Yapsak? <span className="count-badge">{data.kesfet.length}</span>
        </h3>
        <div className="flex gap-2">
          <button className="btn-gradient" style={{ background: 'linear-gradient(135deg, var(--accent-glow), rgba(251,191,36,0.05))', color: 'var(--accent)', border: '1px solid rgba(249,115,22,0.15)' }}
            onClick={() => setShowHistory(true)}>📜 Geçmiş</button>
          <button className="btn-gradient btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent), #f59e0b)', color: '#fff' }}
            onClick={() => { setEditId(null); setForm({ title: '', date: '', location: '', budget: '' }); setShowAdd(true); }}>
            <Plus size={14} /> Ekle
          </button>
        </div>
      </div>

      <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        Hepinizin boş vaktine, konuma ve bütçeye göre öneriler.
        {friends.length > 0 && <span style={{ color: 'var(--accent)' }}> · {friends.length} arkadaşına otomatik gönderilir</span>}
      </p>

      <div className="flex gap-2 mb-3">
        <input className="glass-input flex-1" placeholder="🔍 Filtrele..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn-gradient btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent), #f59e0b)', color: '#fff', padding: '10px 14px' }}
          onClick={randomSuggestion} title="Rastgele Öneri">
          <Dice5 size={16} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <Plus size={48} className="empty-state-icon" />
          <div>Henüz öneri yok.</div>
          <div className="empty-state-hint">"+ Ekle" ile yeni bir aktivite planlayın veya 🎲 ile rastgele öneri alın.</div>
        </div>
      ) : (
        items.map(item => (
          <div key={item.id} className="vote-card" style={{ borderLeftColor: 'var(--accent)' }}>
            <div className="font-extrabold text-base tracking-tight">{escapeHtml(item.title)}</div>
            <div className="flex flex-wrap gap-3 text-xs mt-1 mb-2" style={{ color: 'var(--text-secondary)' }}>
              <span>📅 {escapeHtml(item.date || 'Bugün')}</span>
              <span>📍 {escapeHtml(item.location || 'Belirtilmemiş')}</span>
              <span>💰 {escapeHtml(item.budget || 'Ücretsiz')}</span>
              {item.authorName && <span>👤 {escapeHtml(item.authorName)}</span>}
            </div>
            {renderParticipants(item.participants)}
            <div className="flex flex-wrap gap-2 mt-3" onClick={e => e.stopPropagation()}>
              <button className="btn-gradient" style={{ background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.2)' }}
                onClick={() => handleVote('approve', item.id)}><Check size={14} /> Onayla</button>
              <button className="btn-gradient" style={{ background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}
                onClick={() => handleVote('skip', item.id)}><X size={14} /> Geç</button>
              {friends.length > 0 && (
                <button
                  className="btn-gradient"
                  style={{
                    background: sharing === item.id ? 'var(--green-dim)' : 'rgba(59,130,246,0.1)',
                    color: sharing === item.id ? 'var(--green)' : 'var(--blue)',
                    border: '1px solid rgba(59,130,246,0.2)',
                  }}
                  onClick={() => handleShare(item)}
                  title="Arkadaşlara gönder"
                >
                  <Share2 size={14} /> {sharing === item.id ? 'Gönderildi!' : 'Paylaş'}
                </button>
              )}
              <div className="ml-auto flex gap-1">
                <button className="p-1 rounded-lg hover:bg-white/5" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => {
                    setEditId(item.id);
                    setForm({ title: item.title, date: item.date, location: item.location, budget: item.budget });
                    setShowAdd(true);
                  }}>
                  <Edit2 size={14} />
                </button>
                <button className="p-1 rounded-lg hover:bg-white/5" style={{ color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={async () => {
                    if (confirm('Bu öneriyi silmek istediğinize emin misiniz?')) {
                      const updated = { ...data, kesfet: data.kesfet.filter(i => i.id !== item.id) };
                      setData(updated);
                      await saveData(updated);
                      addNotification(`🗑️ "${item.title}" silindi.`);
                    }
                  }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* ADD / EDIT MODAL */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => { setShowAdd(false); setEditId(null); }}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-extrabold mb-4 flex items-center gap-2">
              <Plus size={20} style={{ color: 'var(--accent)' }} />
              {editId ? 'Öneriyi Düzenle' : 'Yeni Öneri'}
            </h3>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>BAŞLIK</label>
            <input className="glass-input mb-3" placeholder="Örn: Futbol Maçı" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>TARİH</label>
            <input className="glass-input mb-3" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>KONUM</label>
            <input className="glass-input mb-3" placeholder="Halı saha X" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>BÜTÇE</label>
            <input className="glass-input mb-4" placeholder="500 TL/kişi" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
            {!editId && friends.length > 0 && (
              <p className="text-xs mb-3 p-2 rounded-lg" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--blue)' }}>
                📨 Bu öneri {friends.length} arkadaşına otomatik gönderilecek
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <button className="btn-gradient" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                onClick={() => { setShowAdd(false); setEditId(null); }}>İptal</button>
              <button className="btn-gradient" style={{ background: 'linear-gradient(135deg, var(--accent), #f59e0b)', color: '#fff' }}
                onClick={handleAdd}>
                {editId ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-extrabold mb-4">📜 Geçmiş</h3>
            {!data.history.length ? (
              <div className="empty-state">
                <div className="empty-state-icon">📜</div>
                <div>Henüz geçmiş öneri yok.</div>
              </div>
            ) : (
              data.history.slice().reverse().map((h, i) => (
                <div key={i} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span>{h.status === 'approved' ? '✅' : '⏭️'}</span>
                  <span className="flex-1 text-sm">{escapeHtml(h.title)}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{escapeHtml(h.date)}</span>
                </div>
              ))
            )}
            <button className="btn-gradient mt-4 w-full justify-center" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              onClick={() => setShowHistory(false)}>Kapat</button>
          </div>
        </div>
      )}
    </div>
  );
}
