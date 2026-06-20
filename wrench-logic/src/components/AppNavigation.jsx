import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const T = {
  he: {
    vehicle: 'בחירת רכב', catalog: 'קטלוג חלפים', garage: 'הגראז\' שלי',
    vehicleShort: 'רכב', catalogShort: 'קטלוג', garageShort: 'גראז\'',
    profile: 'הפרופיל שלי', loginRegister: 'התחבר / הירשם', logout: 'יציאה מהחשבון',
    logoutShort: 'יציאה', darkMode: 'מצב כהה', lightMode: 'מצב בהיר', toggleTheme: 'החלף בין מצב כהה ובהיר',
  },
  en: {
    vehicle: 'Vehicle', catalog: 'Parts Catalog', garage: 'My Garage',
    vehicleShort: 'Car', catalogShort: 'Catalog', garageShort: 'Garage',
    profile: 'My Profile', loginRegister: 'Sign In / Register', logout: 'Sign Out',
    logoutShort: 'Sign out', darkMode: 'Dark mode', lightMode: 'Light mode', toggleTheme: 'Toggle dark / light mode',
  },
};

function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme, lang } = useTheme();
  const t = T[lang] || T.he;
  const isLight = theme === 'light';
  return (
    <button
      onClick={toggleTheme}
      title={isLight ? t.darkMode : t.lightMode}
      aria-label={t.toggleTheme}
      style={{ filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.8)) drop-shadow(0 0 1px rgba(255,255,255,0.5))' }}
      className={`material-symbols-outlined text-[#E0E0E0] hover:text-[#FF6B00] transition-colors cursor-pointer ${className}`}
    >
      {isLight ? 'dark_mode' : 'light_mode'}
    </button>
  );
}

// HE / EN language toggle — same style as the LandingPage navbar toggle.
function LangToggle({ className = '' }) {
  const { lang, setLang } = useTheme();
  return (
    <div className={`flex items-center gap-1 border border-[#2D2D2D] rounded-[8px] p-0.5 ${className}`}>
      {['he', 'en'].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={
            'px-2 py-0.5 rounded-[6px] text-[11px] font-bold uppercase transition-colors cursor-pointer ' +
            (lang === l ? 'bg-[#FF6B00] text-black' : 'text-[#E0E0E0] hover:text-[#FF6B00]')
          }
        >
          {l}
        </button>
      ))}
    </div>
  );
}

const navItems = [
  { to: '/vehicle-selection', icon: 'directions_car',           key: 'vehicle' },
  { to: '/catalog',           icon: 'precision_manufacturing',  key: 'catalog' },
  { to: '/garage',            icon: 'garage',                   key: 'garage'  },
];

const bottomNavItems = [
  { to: '/vehicle-selection', icon: 'directions_car',           key: 'vehicleShort' },
  { to: '/catalog',           icon: 'precision_manufacturing',  key: 'catalogShort' },
  { to: '/garage',            icon: 'garage',                   key: 'garageShort'  },
];

export default function AppNavigation() {
  const navigate     = useNavigate();
  const { session, user, signOut } = useAuth();
  const { lang } = useTheme();
  const t = T[lang] || T.he;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      {/* TopNavBar – Mobile Only */}
      <nav className="fixed top-0 w-full z-50 bg-[#121212]/60 backdrop-blur-md border-b border-[#2D2D2D] md:hidden flex flex-row-reverse justify-between items-center h-16 px-6">
        <button
          onClick={() => navigate('/')}
          className="text-2xl font-black text-[#FF6B00] uppercase tracking-tighter font-h2 text-h2 cursor-pointer focus:outline-none"
          aria-label="WrenchLogic"
        >
          WrenchLogic
        </button>
        <div className="flex items-center gap-3">
          <LangToggle />
          <ThemeToggle />
          <NavLink
            to="/garage"
            className={({ isActive }) =>
              `material-symbols-outlined transition-colors cursor-pointer ` +
              (isActive ? 'text-[#FF6B00]' : 'text-[#E0E0E0] hover:text-[#FF6B00]')
            }
          >
            garage
          </NavLink>
          {session ? (
            <button
              onClick={handleSignOut}
              title={t.logoutShort}
              className="material-symbols-outlined text-[#E0E0E0] hover:text-red-400 transition-colors cursor-pointer"
            >
              logout
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="material-symbols-outlined text-[#E0E0E0] hover:text-[#FF6B00] transition-colors cursor-pointer"
            >
              account_circle
            </button>
          )}
        </div>
      </nav>

      {/* SideNavBar – Desktop Only */}
      <nav className="fixed right-0 top-0 hidden md:flex flex-col z-40 h-screen w-64 border-l border-[#2D2D2D] bg-[#1E1E1E]">

        {/* Logo */}
        <div className="p-6 border-b border-[#2D2D2D] flex items-start justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-right focus:outline-none cursor-pointer"
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <h1 className="text-[#FF6B00] font-bold text-lg font-h2 text-h2 uppercase tracking-tighter">
              WrenchLogic
            </h1>
            <p className="text-xs text-[#E0E0E0] font-mono-data text-mono-data uppercase mt-1">
              Engineered Performance
            </p>
          </button>
          <div className="flex flex-col items-end gap-2">
            <ThemeToggle className="text-[20px]" />
            <LangToggle />
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 py-4 font-['Space_Grotesk'] text-sm">
          {navItems.map(({ to, icon, key }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-row-reverse items-center gap-3 px-4 py-3 transition-all duration-200 ` +
                (isActive
                  ? 'bg-[#2D2D2D] text-[#FF6B00] border-r-4 border-[#FF6B00] font-bold'
                  : 'text-[#E0E0E0] hover:bg-[#2D2D2D] hover:text-[#FF6B00]')
              }
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span>{t[key]}</span>
            </NavLink>
          ))}
        </div>

        {/* User Profile Snippet */}
        <div className="p-4 border-t border-[#2D2D2D] space-y-2">
          {session && (
            <p className="font-mono-data text-[11px] text-secondary truncate text-right px-1">
              {session.user.email}
            </p>
          )}
          <button
            onClick={() => navigate(user ? '/profile' : '/login')}
            className="w-full bg-[#FF6B00] text-black font-bold py-2.5 rounded-[10px] hover:bg-[#ff8124] transition-colors font-label-caps text-label-caps"
          >
            {user ? t.profile : t.loginRegister}
          </button>
          {session && (
            <button
              onClick={handleSignOut}
              className="w-full flex flex-row-reverse items-center gap-2 px-3 py-2 rounded text-secondary hover:bg-[#2D2D2D] hover:text-red-400 transition-colors font-label-caps text-label-caps"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>{t.logout}</span>
            </button>
          )}
        </div>

      </nav>

      {/* BottomNavBar – Mobile Only */}
      <nav className="fixed bottom-0 left-0 w-full h-16 flex flex-row-reverse justify-around items-center px-4 md:hidden bg-[#121212] rounded-t-lg z-50 border-t border-[#2D2D2D] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)]">
        {bottomNavItems.map(({ to, icon, key }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-1 active:scale-90 duration-150 ` +
              (isActive ? 'text-[#FF6B00] bg-[#1E1E1E] rounded-md px-3' : 'text-[#E0E0E0] hover:text-[#FF6B00]')
            }
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span className="font-['Space_Grotesk'] text-[10px] uppercase font-bold">{t[key]}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
