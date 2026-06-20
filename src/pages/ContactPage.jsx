import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const EMAIL = 'support@wrenchlogic.co.il';

const TEXT = {
  he: {
    title: 'צור קשר',
    bodyBefore: 'נשמח לשמוע ממך! לכל שאלה, הצעה או בעיה טכנית, ניתן לפנות אלינו במייל לכתובת ',
    bodyAfter: ' ונחזור אליך בהקדם. צוות WrenchLogic זמין בימים א׳ עד ה׳ בין השעות 9:00 ל-18:00. אנחנו כאן כדי לעזור לך לבנות את הרכב המושלם.',
    back: 'חזור לדף הראשי',
  },
  en: {
    title: 'Contact Us',
    bodyBefore: 'We\'d love to hear from you! For any question, suggestion or technical issue, email us at ',
    bodyAfter: ' and we\'ll get back to you shortly. The WrenchLogic team is available Sunday to Thursday, 9:00 to 18:00. We\'re here to help you build the perfect car.',
    back: 'Back to home',
  },
};

export default function ContactPage() {
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
          {t.bodyBefore}
          <span dir="ltr" className="text-[#FF6B00]">{EMAIL}</span>
          {t.bodyAfter}
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
