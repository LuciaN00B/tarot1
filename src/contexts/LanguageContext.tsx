import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

type Language = 'EN' | 'IT';

interface Translations {
  [key: string]: {
    EN: string;
    IT: string;
  };
}

const translations: Translations = {
  'app.name': { EN: 'Hidden Wisdom', IT: 'La Saggezza Nascosta' },
  'app.tagline': { EN: 'A mirror for self-reflection', IT: 'Uno specchio per l\'autoriflessione' },
  'nav.home': { EN: 'Home', IT: 'Home' },
  'nav.newReading': { EN: 'New Reading', IT: 'Nuova Lettura' },
  'nav.history': { EN: 'History', IT: 'Cronologia' },
  'nav.profile': { EN: 'Profile', IT: 'Profilo' },
  'nav.signOut': { EN: 'Sign Out', IT: 'Esci' },
  'nav.signIn': { EN: 'Sign In', IT: 'Accedi' },
  'nav.signUp': { EN: 'Sign Up', IT: 'Registrati' },
  'auth.email': { EN: 'Email', IT: 'Email' },
  'auth.password': { EN: 'Password', IT: 'Password' },
  'auth.confirmPassword': { EN: 'Confirm Password', IT: 'Conferma Password' },
  'auth.forgotPassword': { EN: 'Forgot password?', IT: 'Password dimenticata?' },
  'auth.noAccount': { EN: "Don't have an account?", IT: 'Non hai un account?' },
  'auth.hasAccount': { EN: 'Already have an account?', IT: 'Hai già un account?' },
  'auth.resetPassword': { EN: 'Reset Password', IT: 'Reimposta Password' },
  'auth.resetInstructions': { EN: 'Enter your email to receive reset instructions', IT: 'Inserisci la tua email per ricevere le istruzioni' },
  'auth.resetSent': { EN: 'Check your email for the reset link', IT: 'Controlla la tua email per il link di reset' },
  'auth.backToLogin': { EN: 'Back to login', IT: 'Torna al login' },
  'credits.remaining': { EN: 'Credits', IT: 'Crediti' },
  'reading.step1': { EN: 'Centering', IT: 'Centratura' },
  'reading.step2': { EN: 'Question', IT: 'Domanda' },
  'reading.step3': { EN: 'Spread', IT: 'Schema' },
  'reading.step4': { EN: 'Cards', IT: 'Carte' },
  'reading.step5': { EN: 'Interpretation', IT: 'Interpretazione' },
  'reading.step6': { EN: 'Journal', IT: 'Diario' },
  'spread.single': { EN: 'Single Card', IT: 'Carta Singola' },
  'spread.threeCard': { EN: 'Three Card Spread', IT: 'Schema a Tre Carte' },
  'spread.celticCross': { EN: 'Celtic Cross', IT: 'Croce Celtica' },
  'spread.singleDesc': { EN: 'Quick insight for a simple question', IT: 'Intuizione rapida per una domanda semplice' },
  'spread.threeCardDesc': { EN: 'Past, Present, Future - understand your journey', IT: 'Passato, Presente, Futuro - comprendi il tuo percorso' },
  'spread.celticCrossDesc': { EN: 'Deep exploration of a complex situation', IT: 'Esplorazione profonda di una situazione complessa' },
  'common.next': { EN: 'Next', IT: 'Avanti' },
  'common.back': { EN: 'Back', IT: 'Indietro' },
  'common.save': { EN: 'Save', IT: 'Salva' },
  'common.cancel': { EN: 'Cancel', IT: 'Annulla' },
  'common.loading': { EN: 'Loading...', IT: 'Caricamento...' },
  'common.error': { EN: 'An error occurred', IT: 'Si è verificato un errore' },
  'disclaimer.main': { EN: 'This tool is for personal reflection and entertainment only. It does not predict the future or provide professional advice.', IT: 'Questo strumento è solo per riflessione personale e intrattenimento. Non predice il futuro né fornisce consulenza professionale.' },
  'profile.language': { EN: 'Language', IT: 'Lingua' },
  'profile.tone': { EN: 'Reading Tone', IT: 'Tono della Lettura' },
  'profile.focusAreas': { EN: 'Focus Areas', IT: 'Aree di Focus' },
  'profile.experience': { EN: 'Experience Level', IT: 'Livello di Esperienza' },
  'tone.soft': { EN: 'Soft & Gentle', IT: 'Dolce e Gentile' },
  'tone.pragmatic': { EN: 'Pragmatic', IT: 'Pragmatico' },
  'tone.spiritual': { EN: 'Spiritual', IT: 'Spirituale' },
  'tone.direct': { EN: 'Direct', IT: 'Diretto' },
  'experience.beginner': { EN: 'Beginner', IT: 'Principiante' },
  'experience.intermediate': { EN: 'Intermediate', IT: 'Intermedio' },
  'focus.relationships': { EN: 'Relationships', IT: 'Relazioni' },
  'focus.career': { EN: 'Career', IT: 'Carriera' },
  'focus.personal': { EN: 'Personal Growth', IT: 'Crescita Personale' },
  'focus.health': { EN: 'Health & Wellness', IT: 'Salute e Benessere' },
  'focus.creativity': { EN: 'Creativity', IT: 'Creatività' },
  'focus.spirituality': { EN: 'Spirituality', IT: 'Spiritualità' },
  'landing.hero': { EN: 'Discover the wisdom within', IT: 'Scopri la saggezza interiore' },
  'landing.heroSub': { EN: 'A modern approach to tarot as a tool for self-reflection and personal insight', IT: 'Un approccio moderno ai tarocchi come strumento di autoriflessione e intuizione personale' },
  'landing.getStarted': { EN: 'Start Your Journey', IT: 'Inizia il Tuo Percorso' },
  'landing.feature1Title': { EN: 'Guided Reflection', IT: 'Riflessione Guidata' },
  'landing.feature1Desc': { EN: 'A structured process to help you explore your thoughts and feelings', IT: 'Un processo strutturato per aiutarti a esplorare i tuoi pensieri e sentimenti' },
  'landing.feature2Title': { EN: 'Personal Journal', IT: 'Diario Personale' },
  'landing.feature2Desc': { EN: 'Record your insights and track your growth over time', IT: 'Registra le tue intuizioni e segui la tua crescita nel tempo' },
  'landing.feature3Title': { EN: 'Deep Symbolism', IT: 'Simbolismo Profondo' },
  'landing.feature3Desc': { EN: 'Access rich interpretations drawn from Jungian and symbolic traditions', IT: 'Accedi a interpretazioni ricche tratte dalle tradizioni junghiane e simboliche' },
  'history.title': { EN: 'Your Reading History', IT: 'La Tua Cronologia' },
  'history.noReadings': { EN: 'No readings yet. Start your first reading to begin your journey.', IT: 'Nessuna lettura ancora. Inizia la tua prima lettura per cominciare il tuo percorso.' },
  'history.viewDetails': { EN: 'View Details', IT: 'Vedi Dettagli' },
  'card.upright': { EN: 'Upright', IT: 'Dritta' },
  'card.reversed': { EN: 'Reversed', IT: 'Rovesciata' },
  'centering.title': { EN: 'Take a moment to center yourself', IT: 'Prenditi un momento per centrarti' },
  'centering.instruction': { EN: 'Close your eyes, take three deep breaths, and focus on what you want to explore. When you feel ready, continue.', IT: 'Chiudi gli occhi, fai tre respiri profondi e concentrati su ciò che vuoi esplorare. Quando ti senti pronto, continua.' },
  'question.title': { EN: 'What would you like to explore?', IT: 'Cosa vorresti esplorare?' },
  'question.placeholder': { EN: 'Write your question or intention here...', IT: 'Scrivi qui la tua domanda o intenzione...' },
  'question.tip': { EN: 'Tip: Open-ended questions work best. Instead of "Will I get the job?", try "What should I consider about this career opportunity?"', IT: 'Suggerimento: Le domande aperte funzionano meglio. Invece di "Otterrò il lavoro?", prova "Cosa dovrei considerare riguardo a questa opportunità di carriera?"' },
  'cards.shuffle': { EN: 'Shuffle the Deck', IT: 'Mescola il Mazzo' },
  'cards.draw': { EN: 'Draw Card', IT: 'Estrai Carta' },
  'cards.reveal': { EN: 'Reveal Your Cards', IT: 'Rivela le Tue Carte' },
  'interpretation.generating': { EN: 'Generating your personalized interpretation...', IT: 'Generando la tua interpretazione personalizzata...' },
  'journal.title': { EN: 'Your Reflections', IT: 'Le Tue Riflessioni' },
  'journal.prompt': { EN: 'What thoughts or feelings arise from this reading?', IT: 'Quali pensieri o sentimenti emergono da questa lettura?' },
  'journal.mood': { EN: 'How are you feeling?', IT: 'Come ti senti?' },
  'journal.save': { EN: 'Save Reading', IT: 'Salva Lettura' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { preferences } = useAuth();
  const [language, setLanguage] = useState<Language>('EN');

  useEffect(() => {
    if (preferences?.language) {
      setLanguage(preferences.language);
    }
  }, [preferences?.language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
