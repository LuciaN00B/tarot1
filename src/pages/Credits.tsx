import { useState } from 'react';
import { Sparkles, Check, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/layout/Layout';
import { supabase } from '../lib/supabase';

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  popular?: boolean;
}

const PACKAGES: CreditPackage[] = [
  { id: 'credits_5', credits: 5, price: 4.99 },
  { id: 'credits_15', credits: 15, price: 9.99, popular: true },
  { id: 'credits_50', credits: 50, price: 24.99 },
];

export function Credits() {
  const { credits, session } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId);
    setError(null);

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentSession?.access_token || session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            priceId: packageId,
            successUrl: `${window.location.origin}/credits?success=true`,
            cancelUrl: `${window.location.origin}/credits?canceled=true`,
          }),
        }
      );

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error === 'Stripe not configured') {
        setError(
          language === 'IT'
            ? 'Il sistema di pagamento non e ancora configurato. Contatta l\'amministratore.'
            : 'Payment system is not yet configured. Please contact the administrator.'
        );
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError(
        language === 'IT'
          ? 'Si e verificato un errore. Riprova.'
          : 'An error occurred. Please try again.'
      );
    }

    setLoading(null);
  };

  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get('success');
  const canceled = urlParams.get('canceled');

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-stone-800 mb-4">
            {language === 'IT' ? 'Acquista Crediti' : 'Purchase Credits'}
          </h1>
          <p className="text-stone-600 max-w-xl mx-auto">
            {language === 'IT'
              ? 'I crediti ti permettono di effettuare letture dei tarocchi. Ogni lettura costa 1 credito.'
              : 'Credits allow you to perform tarot readings. Each reading costs 1 credit.'}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full">
            <Sparkles className="text-amber-600" size={20} />
            <span className="text-amber-700 font-medium">
              {language === 'IT' ? 'Saldo attuale:' : 'Current balance:'} {credits}{' '}
              {language === 'IT' ? 'crediti' : 'credits'}
            </span>
          </div>
        </div>

        {success && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <Check className="text-emerald-600 flex-shrink-0" size={24} />
            <p className="text-emerald-700">
              {language === 'IT'
                ? 'Acquisto completato! I tuoi crediti sono stati aggiunti.'
                : 'Purchase complete! Your credits have been added.'}
            </p>
          </div>
        )}

        {canceled && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0" size={24} />
            <p className="text-amber-700">
              {language === 'IT'
                ? 'Acquisto annullato. Nessun addebito e stato effettuato.'
                : 'Purchase canceled. No charges were made.'}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-rose-600 flex-shrink-0" size={24} />
            <p className="text-rose-700">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-2xl border-2 p-6 transition-all ${
                pkg.popular
                  ? 'border-amber-400 shadow-lg shadow-amber-100'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                  {language === 'IT' ? 'Piu Popolare' : 'Most Popular'}
                </div>
              )}

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="text-amber-600" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-stone-800">{pkg.credits}</h3>
                <p className="text-stone-500">
                  {language === 'IT' ? 'crediti' : 'credits'}
                </p>
              </div>

              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-stone-800">${pkg.price}</span>
                <span className="text-stone-500 text-sm ml-1">USD</span>
                <p className="text-sm text-stone-400 mt-1">
                  ${(pkg.price / pkg.credits).toFixed(2)}{' '}
                  {language === 'IT' ? 'per credito' : 'per credit'}
                </p>
              </div>

              <ul className="space-y-2 mb-6 text-sm text-stone-600">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-500" />
                  {pkg.credits} {language === 'IT' ? 'letture' : 'readings'}
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-500" />
                  {language === 'IT' ? 'Non scadono mai' : 'Never expire'}
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-500" />
                  {language === 'IT' ? 'Interpretazioni AI' : 'AI interpretations'}
                </li>
              </ul>

              <button
                onClick={() => handlePurchase(pkg.id)}
                disabled={loading !== null}
                className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                  pkg.popular
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === pkg.id && <Loader2 size={20} className="animate-spin" />}
                {language === 'IT' ? 'Acquista' : 'Purchase'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-stone-500">
          <p>
            {language === 'IT'
              ? 'Pagamenti sicuri tramite Stripe. I crediti vengono aggiunti immediatamente.'
              : 'Secure payments via Stripe. Credits are added immediately.'}
          </p>
        </div>
      </div>
    </Layout>
  );
}
