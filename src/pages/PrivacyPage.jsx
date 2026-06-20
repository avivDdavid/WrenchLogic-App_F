import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const TEXT = {
  he: {
    title: 'מדיניות פרטיות',
    body: 'אנו ב-WrenchLogic מכבדים את פרטיותך ושומרים על המידע שלך באחריות מלאה. אנו אוספים רק את הנתונים הדרושים לתפעול השירות, כגון כתובת אימייל ופרטי הרכב שבחרת, ולעולם לא נמכור או נשתף אותם עם צד שלישי ללא הסכמתך. המידע נשמר בצורה מאובטחת ומשמש אך ורק כדי לשפר את חוויית השימוש שלך באתר. באפשרותך לפנות אלינו בכל עת בבקשה לעיין במידע שלך או למחוק אותו.',
    back: 'חזור לדף הראשי',
  },
  en: {
    title: 'Privacy Policy',
    body: 'At WrenchLogic we respect your privacy and handle your information responsibly. We collect only the data needed to operate the service, such as your email address and the vehicle you selected, and we will never sell or share it with a third party without your consent. The information is stored securely and is used solely to improve your experience on the site. You may contact us at any time to review or delete your information.',
    back: 'Back to home',
  },
};

export default function PrivacyPage() {
  const navigate = useNavigate();
  const { lang } = useTheme();
  const t = TEXT[lang] ?? TEXT.he;
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const align = lang === 'he' ? 'text-right' : 'text-left';

  return (
    <main dir={dir} className="min-h-screen bg-[#121212] text-white flex items-center justify-center px-6 py-16 font-['Inter']">
      <div className={`max-w-2xl w-full ${align} space-y-6`}>
        <h1 className="text-3xl md:text-5xl font-black text-white font-['Space_Grotesk']">
          {t.title}
        </h1>
        <p className="text-[#A0A0A0] leading-relaxed text-lg">
          {t.body}
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-[#FF6B00] text-black font-bold px-6 py-3 rounded-[10px] hover:bg-[#ff8124] transition-colors"
        >
          {t.back}
        </button>
      </div>
    </main>
  );
}
