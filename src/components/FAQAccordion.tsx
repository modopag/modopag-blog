import { useState } from 'react';
import type { PostFaq } from '@/lib/types';

interface Props {
  faqs: PostFaq[];
}

export default function FAQAccordion({ faqs }: Props) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());

  if (!faqs.length) return null;

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Schema FAQPage para GEO (Generative Engine Optimization)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="my-12">
      {/* Schema JSON-LD para SEO/GEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="text-2xl font-bold text-secondary-500 dark:text-white mb-6">
        Perguntas Frequentes
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndices.has(index);
          return (
            <div
              key={faq.id}
              className="border border-secondary-200 dark:border-secondary-600 rounded-xl overflow-hidden"
            >
              <button
                type="button"
                className="w-full flex items-center justify-between p-5 text-left bg-white dark:bg-secondary-700 hover:bg-primary-50 dark:hover:bg-secondary-600 transition-colors group"
                onClick={() => toggleIndex(index)}
                aria-expanded={isOpen}
              >
                <span className="font-medium text-secondary-500 dark:text-white pr-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {faq.question}
                </span>
                <span
                  className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isOpen
                      ? 'bg-primary-500 border-primary-500 text-secondary-500'
                      : 'border-secondary-300 dark:border-secondary-500 text-secondary-400 group-hover:border-primary-500 group-hover:text-primary-500'
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    {isOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    )}
                  </svg>
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-5 pt-0 bg-white dark:bg-secondary-700">
                    <div className="pt-2 border-t border-secondary-100 dark:border-secondary-600">
                      <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed pt-4">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
