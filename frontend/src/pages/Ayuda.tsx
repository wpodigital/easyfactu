import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Mail,
  ExternalLink,
  Search,
  Info,
  CheckCircle2,
} from 'lucide-react';

const COLOR = '#7a5a5a';

interface FaqItem {
  q: string;
  a: string;
}

interface GuideItem {
  title: string;
  steps: string[];
}

export default function Ayuda() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqs: FaqItem[] = [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({
    q: t(`ayuda.faq.q${n}`),
    a: t(`ayuda.faq.a${n}`),
  }));

  const guides: GuideItem[] = [1, 2, 3].map(n => ({
    title: t(`ayuda.guides.g${n}Title`),
    steps: (t(`ayuda.guides.g${n}Steps`, { returnObjects: true }) as string[]) || [],
  }));

  const filteredFaqs = faqs.filter(
    f =>
      !searchTerm ||
      f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.a.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const guideIcons = ['🚀', '📄', '🔐'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: COLOR }}>
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('ayuda.title')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('ayuda.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* FAQ Section */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <HelpCircle className="h-5 w-5" style={{ color: COLOR }} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('ayuda.faqTitle')}
            </h2>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('ayuda.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7a5a5a] dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <HelpCircle className="mx-auto h-10 w-10 mb-2 opacity-30" />
              <p>{t('ayuda.noResults')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFaqs.map((faq, idx) => {
                const globalIdx = faqs.indexOf(faq);
                const isOpen = openFaq === globalIdx;
                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : globalIdx)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <span className="font-medium text-gray-900 dark:text-white pr-4">
                        {faq.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick Guides */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <BookOpen className="h-5 w-5" style={{ color: COLOR }} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('ayuda.guidesTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {guides.map((guide, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5"
              >
                <div className="text-2xl mb-3">{guideIcons[idx]}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  {guide.title}
                </h3>
                <ol className="space-y-2">
                  {guide.steps.map((step, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: COLOR }} />
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* Contact & Links */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Mail className="h-5 w-5" style={{ color: COLOR }} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('ayuda.contactTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={t('ayuda.contact.docsUrl')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow group"
            >
              <div className="p-3 rounded-lg flex-shrink-0" style={{ backgroundColor: `${COLOR}20` }}>
                <ExternalLink className="h-6 w-6" style={{ color: COLOR }} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white group-hover:underline">
                  {t('ayuda.contact.docsLabel')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('ayuda.contact.docsDesc')}
                </p>
              </div>
            </a>
            <a
              href="https://github.com/wpodigital/easyfactu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow group"
            >
              <div className="p-3 rounded-lg flex-shrink-0" style={{ backgroundColor: `${COLOR}20` }}>
                <BookOpen className="h-6 w-6" style={{ color: COLOR }} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white group-hover:underline">
                  {t('ayuda.contact.repoLabel')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('ayuda.contact.repoDesc')}
                </p>
              </div>
            </a>
          </div>
        </section>

        {/* Version Info */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <Info className="h-5 w-5" style={{ color: COLOR }} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('ayuda.versionTitle')}
            </h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400 font-medium">
                  {t('ayuda.version.appVersion')}
                </dt>
                <dd className="mt-1 font-semibold text-gray-900 dark:text-white">
                  v0.2.0
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400 font-medium">
                  {t('ayuda.version.buildDate')}
                </dt>
                <dd className="mt-1 font-semibold text-gray-900 dark:text-white">
                  2026-03-09
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400 font-medium">
                  {t('ayuda.version.techStack')}
                </dt>
                <dd className="mt-1 font-semibold text-gray-900 dark:text-white">
                  React 18 · TypeScript · Node.js · PostgreSQL
                </dd>
              </div>
            </dl>
          </div>
        </section>

      </div>
    </div>
  );
}

