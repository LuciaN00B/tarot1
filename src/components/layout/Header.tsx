import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X, LogOut, User, History, Plus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, credits, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-indigo-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-900/50">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="font-semibold text-indigo-100 hidden sm:block">{t('app.name')}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link
                  to="/reading/new"
                  className="flex items-center gap-1.5 text-indigo-300 hover:text-indigo-100 transition-colors"
                >
                  <Plus size={18} />
                  {t('nav.newReading')}
                </Link>
                <Link
                  to="/history"
                  className="flex items-center gap-1.5 text-indigo-300 hover:text-indigo-100 transition-colors"
                >
                  <History size={18} />
                  {t('nav.history')}
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 text-indigo-300 hover:text-indigo-100 transition-colors"
                >
                  <User size={18} />
                  {t('nav.profile')}
                </Link>
                <Link
                  to="/credits"
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-900/50 hover:bg-indigo-900/70 rounded-full transition-colors border border-indigo-500/30"
                >
                  <Sparkles size={16} className="text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-200">{credits}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-indigo-300 hover:text-rose-400 transition-colors"
                >
                  <LogOut size={18} />
                  {t('nav.signOut')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-indigo-300 hover:text-indigo-100 transition-colors font-medium"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-indigo-900/50"
                >
                  {t('nav.signUp')}
                </Link>
              </>
            )}
            <button
              onClick={() => setLanguage(language === 'EN' ? 'IT' : 'EN')}
              className="px-2 py-1 text-sm font-medium text-indigo-400 hover:text-indigo-200 border border-indigo-500/30 rounded"
            >
              {language}
            </button>
          </nav>

          <button
            className="md:hidden p-2 text-indigo-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-indigo-500/20">
          <div className="px-4 py-4 space-y-3">
            {user ? (
              <>
                <Link
                  to="/credits"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between pb-3 border-b border-indigo-500/20"
                >
                  <span className="text-indigo-300">{t('credits.remaining')}</span>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-900/50 rounded-full border border-indigo-500/30">
                    <Sparkles size={16} className="text-indigo-400" />
                    <span className="text-sm font-medium text-indigo-200">{credits}</span>
                  </div>
                </Link>
                <Link
                  to="/reading/new"
                  className="flex items-center gap-2 py-2 text-indigo-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Plus size={20} />
                  {t('nav.newReading')}
                </Link>
                <Link
                  to="/history"
                  className="flex items-center gap-2 py-2 text-indigo-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <History size={20} />
                  {t('nav.history')}
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 py-2 text-indigo-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={20} />
                  {t('nav.profile')}
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 py-2 text-rose-400 w-full"
                >
                  <LogOut size={20} />
                  {t('nav.signOut')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 text-indigo-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  to="/signup"
                  className="block py-2 text-indigo-400 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.signUp')}
                </Link>
              </>
            )}
            <div className="pt-3 border-t border-indigo-500/20">
              <button
                onClick={() => setLanguage(language === 'EN' ? 'IT' : 'EN')}
                className="text-sm text-indigo-400"
              >
                {language === 'EN' ? 'Switch to Italian' : 'Passa all\'Inglese'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
