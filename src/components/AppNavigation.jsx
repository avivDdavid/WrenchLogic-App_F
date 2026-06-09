import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';
  return (
    <button
      onClick={toggleTheme}
      title={isLight ? 'מצב כהה' : 'מצב בהיר'}
      aria-label="החלף בין מצב כהה ובהיר"
      className={`material-symbols-outlined text-[#E0E0E0] hover:text-[#FF6B00] transition-colors cursor-pointer ${className}`}
    >
      {isLight ? 'dark_mode' : 'light_mode'}
    </button>
  );
}

const navItems = [
  { to: '/',        icon: 'directions_car',         label: 'בחירת רכב'   },
  { to: '/catalog', icon: 'precision_manufacturing', label: 'קטלוג חלפים' },
  { to: '/garage',  icon: 'garage',                 label: 'הגראז\' שלי'  },
];

const bottomNavItems = [
  { to: '/',        icon: 'directions_car',          label: 'רכב'   },
  { to: '/catalog', icon: 'precision_manufacturing',  label: 'קטלוג' },
  { to: '/garage',  icon: 'garage',                  label: 'גראז\'' },
];

export default function AppNavigation() {
  const navigate     = useNavigate();
  const { session, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      {/* TopNavBar – Mobile Only */}
      <nav className="fixed top-0 w-full z-50 bg-[#121212]/60 backdrop-blur-md border-b border-[#2D2D2D] md:hidden flex flex-row-reverse justify-between items-center h-16 px-6">
        <div className="text-2xl font-black text-[#FF6B00] uppercase tracking-tighter font-h2 text-h2">
          WrenchLogic
        </div>
        <div className="flex items-center gap-4">
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
              title="יציאה"
              className="material-symbols-outlined text-[#E0E0E0] hover:text-red-400 transition-colors cursor-pointer"
            >
              logout
            </button>
          ) : (
            <Link to="/login">
              <span className="material-symbols-outlined text-[#E0E0E0] hover:text-[#FF6B00] transition-colors cursor-pointer">
                account_circle
              </span>
            </Link>
          )}
        </div>
      </nav>

      {/* SideNavBar – Desktop Only */}
      <nav className="fixed right-0 top-0 hidden md:flex flex-col z-40 h-screen w-64 border-l border-[#2D2D2D] bg-[#1E1E1E]">

        {/* Logo */}
        <div className="p-6 border-b border-[#2D2D2D] flex items-start justify-between">
          <div>
            <h1 className="text-[#FF6B00] font-bold text-lg font-h2 text-h2 uppercase tracking-tighter">
              WrenchLogic
            </h1>
            <p className="text-xs text-[#E0E0E0] font-mono-data text-mono-data uppercase mt-1">
              Engineered Performance
            </p>
          </div>
          <ThemeToggle className="text-[20px]" />
        </div>

        {/* Nav Links */}
        <div className="flex-1 py-4 font-['Space_Grotesk'] text-sm">
          {navItems.map(({ to, icon, label }) => (
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
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        {/* User Profile Snippet */}
        <div className="p-4 border-t border-[#2D2D2D] space-y-1">
          {session ? (
            <>
              <Link to="/profile" className="flex flex-row-reverse items-center gap-3 px-2 py-2 rounded hover:bg-[#2D2D2D] transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-[#2D2D2D] border border-[#474747] overflow-hidden shrink-0">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaon7rKumT_B6Lv8jSWCtDK4o6PnIUP7hd0kJBcC9MnLsb391zvVALXEDxWzfPGBxTfUC9cTripd35zGRjgddMmoWHyn5M5SvAQzI5BAsxDUAN724lrCWeRYgSbjOzAR5u-DuB0GRRlgyn1IDGN5AYO7u5wBKKq_jK9tgJnO9Y34DHzpHUDeObtLZnmBpfMWFoz_VXOixBfKJSmGf22VI3Z8phLZVvY-vwE5tUUbNfMqxvg-Z_0YvAQy39O_Fk4irQSUwfGwv-nKA"
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-right min-w-0 flex-1">
                  <p className="font-['Space_Grotesk'] text-sm font-semibold text-on-surface truncate">
                    {session.user.email.split('@')[0]}
                  </p>
                  <p className="font-mono-data text-[11px] text-secondary truncate">
                    {session.user.email}
                  </p>
                </div>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex flex-row-reverse items-center gap-2 px-3 py-2 rounded text-secondary hover:bg-[#2D2D2D] hover:text-red-400 transition-colors font-label-caps text-label-caps"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>יציאה מהחשבון</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex flex-row-reverse items-center gap-3 px-2 py-2 rounded hover:bg-[#2D2D2D] transition-colors cursor-pointer text-secondary hover:text-[#FF6B00]"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span className="font-label-caps text-label-caps">כניסה / הרשמה</span>
            </Link>
          )}
        </div>

      </nav>

      {/* BottomNavBar – Mobile Only */}
      <nav className="fixed bottom-0 left-0 w-full h-16 flex flex-row-reverse justify-around items-center px-4 md:hidden bg-[#121212] rounded-t-lg z-50 border-t border-[#2D2D2D] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)]">
        {bottomNavItems.map(({ to, icon, label }) => (
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
            <span className="font-['Space_Grotesk'] text-[10px] uppercase font-bold">{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}