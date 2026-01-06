import { Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Cross, MessageCircle, BookOpen, Sparkles, ChevronRight, User, Languages } from 'lucide-react';
import { Background3D } from '@/components/3d/Background3D';
import { useAuth } from '@/hooks/useAuth';

type Language = 'fr' | 'ar' | 'pl';

const translations = {
  fr: {
    tagline: 'Votre compagnon spirituel pour explorer la richesse de la foi catholique',
    description: "Dialoguez avec une intelligence artificielle formée sur les enseignements de l'Église, les Écritures et la Tradition pour approfondir votre compréhension de la foi.",
    startChat: 'Commencer une conversation',
    createAccount: 'Créer un compte',
    feature1Title: 'Fondée sur la Tradition',
    feature1Desc: "Réponses basées sur le Catéchisme, les Écritures et les enseignements des Pères de l'Église.",
    feature2Title: 'Dialogue Naturel',
    feature2Desc: "Posez vos questions sur la foi, la morale, la liturgie ou l'histoire de l'Église.",
    feature3Title: 'Accompagnement Personnel',
    feature3Desc: 'Adapté à votre niveau de connaissance, du débutant au théologien avancé.',
    footer: 'Intelligence artificielle au service de la foi',
    logout: 'Déconnexion',
    login: 'Connexion',
  },
  ar: {
    tagline: 'رفيقك الروحي لاستكشاف غنى الإيمان الكاثوليكي',
    description: 'تحاور مع ذكاء اصطناعي مدرب على تعاليم الكنيسة والكتاب المقدس والتقليد لتعميق فهمك للإيمان.',
    startChat: 'ابدأ محادثة',
    createAccount: 'إنشاء حساب',
    feature1Title: 'مبنية على التقليد',
    feature1Desc: 'إجابات مستندة إلى التعليم المسيحي والكتاب المقدس وتعاليم آباء الكنيسة.',
    feature2Title: 'حوار طبيعي',
    feature2Desc: 'اطرح أسئلتك حول الإيمان والأخلاق والليتورجيا أو تاريخ الكنيسة.',
    feature3Title: 'مرافقة شخصية',
    feature3Desc: 'مكيف حسب مستوى معرفتك، من المبتدئ إلى اللاهوتي المتقدم.',
    footer: 'الذكاء الاصطناعي في خدمة الإيمان',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
  },
  pl: {
    tagline: 'Twój duchowy towarzysz w odkrywaniu bogactwa wiary katolickiej',
    description: 'Rozmawiaj z sztuczną inteligencją wyszkoloną na naukach Kościoła, Piśmie Świętym i Tradycji, aby pogłębić swoje zrozumienie wiary.',
    startChat: 'Rozpocznij rozmowę',
    createAccount: 'Utwórz konto',
    feature1Title: 'Oparta na Tradycji',
    feature1Desc: 'Odpowiedzi oparte na Katechizmie, Piśmie Świętym i naukach Ojców Kościoła.',
    feature2Title: 'Naturalny Dialog',
    feature2Desc: 'Zadawaj pytania o wiarę, moralność, liturgię lub historię Kościoła.',
    feature3Title: 'Osobiste Towarzyszenie',
    feature3Desc: 'Dostosowane do Twojego poziomu wiedzy, od początkującego do zaawansowanego teologa.',
    footer: 'Sztuczna inteligencja w służbie wiary',
    logout: 'Wyloguj się',
    login: 'Zaloguj się',
  },
};

function FeatureCard({ icon: Icon, title, description }: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-6 hover:glow-sm transition-all duration-500 group">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export default function Welcome() {
  const navigate = useNavigate();
  const { isAuthenticated, user, signOut, loading } = useAuth();
  const [language, setLanguage] = useState<Language>('fr');

  const t = translations[language];

  const handleStartChat = () => {
    navigate('/chat');
  };

  const handleAuth = () => {
    navigate('/auth');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className={`min-h-screen bg-background relative overflow-hidden ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <Suspense fallback={null}>
        <Background3D />
      </Suspense>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center glow-sm">
            <Cross className="w-5 h-5 text-primary" />
          </div>
          <span className="font-serif text-xl font-semibold text-foreground">Théologia</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1 glass-card rounded-xl p-1">
            <Button
              variant={language === 'fr' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLanguage('fr')}
              className="h-8 px-3 text-xs font-medium"
            >
              FR
            </Button>
            <Button
              variant={language === 'ar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLanguage('ar')}
              className="h-8 px-3 text-xs font-medium"
            >
              عربي
            </Button>
            <Button
              variant={language === 'pl' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLanguage('pl')}
              className="h-8 px-3 text-xs font-medium"
            >
              PL
            </Button>
          </div>

          {!loading && (
            isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user?.email}
                </span>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t.logout}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={handleAuth}
                className="border-primary/30 text-foreground hover:bg-primary/10 gap-2"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{t.login}</span>
              </Button>
            )
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-12 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Floating cross icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border border-primary/20 mb-8 glow-lg float">
            <Cross className="w-12 h-12 text-primary" />
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6 leading-tight">
            <span className="text-gradient text-glow">Théologia</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 font-light max-w-2xl mx-auto">
            {t.tagline}
          </p>
          
          <p className="text-base text-muted-foreground/80 mb-12 max-w-xl mx-auto">
            {t.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Button
              size="lg"
              onClick={handleStartChat}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-xl glow-md group transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {t.startChat}
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            {!isAuthenticated && !loading && (
              <Button
                size="lg"
                variant="outline"
                onClick={handleAuth}
                className="border-primary/30 text-foreground hover:bg-primary/10 px-8 py-6 text-lg rounded-xl"
              >
                <User className="w-5 h-5 mr-2" />
                {t.createAccount}
              </Button>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <FeatureCard
              icon={BookOpen}
              title={t.feature1Title}
              description={t.feature1Desc}
            />
            <FeatureCard
              icon={MessageCircle}
              title={t.feature2Title}
              description={t.feature2Desc}
            />
            <FeatureCard
              icon={Sparkles}
              title={t.feature3Title}
              description={t.feature3Desc}
            />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-border/30">
        <p className="text-sm text-muted-foreground">
          Théologia • {t.footer}
        </p>
      </footer>
    </div>
  );
}
