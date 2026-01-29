import { useState } from 'react';
import type { PostFaq } from '@/lib/types';

interface Props {
  faqs: PostFaq[];
}

export default function FAQAccordion({ faqs }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs.length) return null;

  return (
    <section className="my-12">
      <h2 className="text-2xl font-bold text-secondary-500 dark:text-white mb-6">
        Perguntas Frequentes
      </h2>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={faq.id}
            className="border border-secondary-200 dark:border-secondary-600 rounded-xl overflow-hidden"
          >
            <button
              type="button"
              className="w-full flex items-center justify-between p-4 text-left bg-white dark:bg-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-600 transition-colors"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              aria-expanded={openIndex === index}
            >
              <span className="font-medium text-secondary-500 dark:text-white pr-4">
                {faq.question}
              </span>
              <svg
                className={`w-5 h-5 text-secondary-400 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div className="p-4 pt-0 bg-white dark:bg-secondary-700">
                <p className="text-secondary-500 dark:text-secondary-300">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
