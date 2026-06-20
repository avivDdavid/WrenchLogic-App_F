import { useState, useEffect } from 'react';
import { useGarage } from '../context/GarageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { fetchProfile, upsertProfile } from '../lib/profile';
import { fileToResizedDataUrl } from '../lib/imageResize';

const T = {
  he: {
    editProfile: 'ערוך פרופיל',
    proTuner: 'Pro Tuner',
    active: 'פעיל',
    featUnlimited: 'גראז\' מלא ללא הגבלה',
    featBackup: 'גיבוי אוטומטי לענן',
    featLiveTracking: 'מעקב ביצועים חי',
    accountInfo: 'פרטי חשבון',
    fullName: 'שם מלא',
    email: 'אימייל',
    phone: 'טלפון',
    memberSince: 'חבר מאז',
    location: 'מיקום',
    notSet: '—',
    garageStats: 'סטטיסטיקות גראז\'',
    installedParts: 'חלקים מותקנים',
    plannedMods: 'שיפורים מתוכננים',
    hpAdded: 'כ"ס נוספו',
    nmAdded: 'Nm נוספו',
    dangerZone: 'אזור מסוכן',
    deleteAccount: 'מחק חשבון',
    deleteDesc: 'פעולה זו בלתי הפיכה ותמחק את כל הנתונים שלך.',
    uploadPhoto: 'העלה תמונה',
    changePhoto: 'שנה תמונה',
    imageFail: 'טעינת התמונה נכשלה — נסה תמונה אחרת',
    locale: 'he-IL',
  },
  en: {
    editProfile: 'Edit Profile',
    proTuner: 'Pro Tuner',
    active: 'Active',
    featUnlimited: 'Unlimited Garage',
    featBackup: 'Automatic cloud backup',
    featLiveTracking: 'Live Performance Tracking',
    accountInfo: 'Account Info',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    memberSince: 'Member Since',
    location: 'Location',
    notSet: '—',
    garageStats: 'Garage Stats',
    installedParts: 'Installed parts',
    plannedMods: 'Planned mods',
    hpAdded: 'HP added',
    nmAdded: 'Nm added',
    dangerZone: 'Danger Zone',
    deleteAccount: 'Delete Account',
    deleteDesc: 'This action is irreversible and will delete all your data.',
    uploadPhoto: 'Upload photo',
    changePhoto: 'Change photo',
    imageFail: 'Image failed to load — try another one',
    locale: 'en-US',
  },
};

export default function UserProfilePage() {
  const { userParts } = useGarage();
  const { lang } = useTheme();
  const { user } = useAuth();
  const t = T[lang] || T.he;
  const isHe = lang === 'he';

  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetchProfile(user.id).then(p => { if (active) setProfile(p); });
    return () => { active = false; };
  }, [user]);

  // Real garage stats, derived straight from the garage context.
  const installed    = userParts.filter(p => p.status === 'installed');
  const plannedCount = userParts.filter(p => p.status === 'planned').length;
  const hpAdded      = installed.reduce((sum, p) => sum + (p.hpGain     || 0), 0);
  const nmAdded      = installed.reduce((sum, p) => sum + (p.torqueGain || 0), 0);

  // Real account info (with graceful fallbacks).
  const displayName = profile?.first_name || profile?.display_name || user?.email?.split('@')[0] || '';
  const emailVal    = user?.email || t.notSet;
  const phoneVal    = profile?.phone || t.notSet;
  const locationVal = profile?.location || t.notSet;
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(t.locale, { year: 'numeric', month: 'long' })
    : t.notSet;
  const avatarUrl   = profile?.avatar_url || '';

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setError('');
    setUploading(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      const { error: upErr } = await upsertProfile(user.id, { avatar_url: dataUrl });
      if (upErr) throw upErr;
      setProfile(prev => ({ ...(prev || {}), avatar_url: dataUrl }));
    } catch {
      setError(t.imageFail);
    }
    setUploading(false);
  };

  return (
    <main className="pt-20 md:pt-8 md:pr-72 px-container-margin pb-24 md:pb-xl min-h-screen">
      <div className="max-w-3xl mx-auto space-y-xl">

        {/* Header */}
        <section className="flex flex-col md:flex-row-reverse items-start md:items-center justify-between gap-md border-b border-[#2D2D2D] pb-lg">
          <div className="flex flex-row-reverse items-center gap-md">
            <div className="relative w-20 h-20 rounded-full bg-surface-container-high border-2 border-[#FF6B00] overflow-hidden shrink-0 flex items-center justify-center">
              {avatarUrl
                ? <img
                    alt={displayName}
                    className="w-full h-full object-cover"
                    src={avatarUrl}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                  />
                : <span className="material-symbols-outlined text-[#474747] text-[44px]">person</span>
              }
              {/* Upload overlay button */}
              <label
                title={avatarUrl ? t.changePhoto : t.uploadPhoto}
                className="absolute bottom-0 inset-x-0 h-7 bg-black/60 flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors"
              >
                {uploading
                  ? <span className="material-symbols-outlined text-white text-[16px] animate-spin">progress_activity</span>
                  : <span className="material-symbols-outlined text-white text-[16px]">photo_camera</span>
                }
                <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" disabled={uploading} />
              </label>
            </div>
            <div className={isHe ? 'text-right' : 'text-left'}>
              <h1 className="font-h1 text-h1 text-on-surface uppercase">{displayName}</h1>
              <p className="font-mono-data text-mono-data text-secondary" dir="ltr">{emailVal}</p>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-center gap-2 bg-red-900/20 border border-red-800 rounded p-3 text-red-400 font-body-md text-body-md" dir={isHe ? 'rtl' : 'ltr'}>
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            {error}
          </div>
        )}

        {/* Subscription */}
        <section className="bg-[#1E1E1E] border border-[#FF6B00]/40 rounded-lg p-lg space-y-md">
          <div className="flex flex-row-reverse items-center justify-between">
            <div className="flex flex-row-reverse items-center gap-sm">
              <span className="material-symbols-outlined text-primary-container">workspace_premium</span>
              <div className={isHe ? 'text-right' : 'text-left'}>
                <h2 className="font-h2 text-h2 text-primary-container uppercase">{t.proTuner}</h2>
                {isHe && <span className="font-label-caps text-label-caps text-[#474746] tracking-widest">SUBSCRIPTION TIER</span>}
              </div>
            </div>
            <span className="bg-primary-container text-[#121212] font-label-caps text-label-caps px-sm py-base rounded uppercase">
              {t.active}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-sm text-center border-t border-[#2D2D2D] pt-md">
            {[
              { label: t.featUnlimited,    icon: 'garage' },
              { label: t.featBackup,       icon: 'cloud_upload' },
              { label: t.featLiveTracking, icon: 'monitoring' },
            ].map(({ label, icon }) => (
              <div key={icon} className="flex flex-col items-center gap-xs text-secondary">
                <span className="material-symbols-outlined text-primary-container text-[22px]">{icon}</span>
                <span className="font-mono-data text-[10px] text-secondary leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Account Details */}
        <section className="space-y-md">
          <div className="flex items-baseline gap-sm border-b border-[#2D2D2D] pb-base">
            <h3 className="font-h2 text-h2 text-primary-container uppercase">{t.accountInfo}</h3>
            {isHe && <span className="font-label-caps text-label-caps text-[#474746] tracking-widest">ACCOUNT DETAILS</span>}
          </div>
          <div className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg divide-y divide-[#2D2D2D]">
            {[
              { label: t.fullName,    value: displayName,  icon: 'person'    },
              { label: t.email,       value: emailVal,     icon: 'mail'      },
              { label: t.phone,       value: phoneVal,     icon: 'phone'     },
              { label: t.memberSince, value: memberSince,  icon: 'calendar_month' },
              { label: t.location,    value: locationVal,  icon: 'location_on'    },
            ].map(({ label, value, icon }) => (
              <div key={icon} className="flex flex-row-reverse items-center justify-between px-md py-sm">
                <div className="flex flex-row-reverse items-center gap-sm">
                  <span className="material-symbols-outlined text-[18px] text-[#474746]">{icon}</span>
                  <span className="font-label-caps text-label-caps text-secondary">{label}</span>
                </div>
                <span className="font-body-md text-body-md text-on-surface" dir={/[a-z@0-9]/i.test(String(value)) ? 'ltr' : 'rtl'}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Garage Stats */}
        <section className="space-y-md">
          <div className="flex items-baseline gap-sm border-b border-[#2D2D2D] pb-base">
            <h3 className="font-h2 text-h2 text-primary-container uppercase">{t.garageStats}</h3>
            {isHe && <span className="font-label-caps text-label-caps text-[#474746] tracking-widest">GARAGE STATS</span>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
            {[
              { value: String(installed.length), label: t.installedParts, icon: 'build_circle' },
              { value: String(plannedCount),     label: t.plannedMods,    icon: 'schedule'     },
              { value: `+${hpAdded}`,            label: t.hpAdded,        icon: 'bolt'         },
              { value: `+${nmAdded}`,            label: t.nmAdded,        icon: 'compress'     },
            ].map(({ value, label, icon }) => (
              <div key={icon} className="bg-[#1E1E1E] border border-[#2D2D2D] rounded-lg p-md text-center space-y-xs">
                <span className="material-symbols-outlined text-primary-container text-[28px]">{icon}</span>
                <p className="font-h2 text-h2 text-on-surface">{value}</p>
                <p className="font-mono-data text-[10px] text-secondary uppercase leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-md">
          <div className="flex items-baseline gap-sm border-b border-[#2D2D2D] pb-base">
            <h3 className="font-h2 text-h2 text-red-500 uppercase">{t.dangerZone}</h3>
            {isHe && <span className="font-label-caps text-label-caps text-[#474746] tracking-widest">DANGER ZONE</span>}
          </div>
          <div className="bg-[#1E1E1E] border border-red-900/40 rounded-lg p-md flex flex-col sm:flex-row-reverse sm:items-center gap-4">
            <div className={isHe ? 'text-right' : 'text-left'}>
              <p className="font-body-md text-body-md font-semibold text-on-surface">{t.deleteAccount}</p>
              <p className="font-mono-data text-[11px] text-secondary">{t.deleteDesc}</p>
            </div>
            <button className="shrink-0 border border-red-600 text-red-500 font-label-caps text-label-caps py-sm px-md rounded hover:bg-red-600 hover:text-white transition-colors">
              {t.deleteAccount}
            </button>
          </div>
        </section>

      </div>
    </main>
  );
}
