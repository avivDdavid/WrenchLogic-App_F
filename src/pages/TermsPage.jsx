import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const TEXT = {
  he: {
    title: 'תנאי שימוש',
    body: 'השימוש באתר WrenchLogic מהווה הסכמה מלאה לתנאים המפורטים כאן. המידע הטכני, נתוני הביצועים והמחירים המוצגים באתר הם להמחשה ולמטרות התרשמות בלבד, ואינם מהווים ייעוץ מקצועי או התחייבות כלשהי. WrenchLogic אינה אחראית לכל נזק, התקנה לקויה או שימוש בלתי חוקי בחלפים, והאחריות המלאה חלה על המשתמש. מומלץ תמיד להתייעץ עם טכנאי מוסמך לפני ביצוע כל שדרוג ברכב.',
    back: 'חזור לדף הראשי',
  },
  en: {
    title: 'Terms of Use',
    body: 'Using the WrenchLogic site constitutes full acceptance of the terms set out here. The technical information, performance figures and prices shown on the site are for illustration and reference only, and do not constitute professional advice or any commitment. WrenchLogic is not responsible for any damage, faulty installation or illegal use of parts, and full responsibility lies with the user. Always consult a certified technician before making any modification to your vehicle.',
    back: 'Back to home',
  },
};

export default function TermsPage() {
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
