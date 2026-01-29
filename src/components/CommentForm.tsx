import { useState, useCallback } from 'react';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  isReply?: boolean;
}

// Supabase client for browser
const SUPABASE_URL = 'https://acxelejbtjjkttfwrdbi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjeGVsZWpidGpqa3R0ZndyZGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzgxMjQsImV4cCI6MjA4NTIxNDEyNH0.tq_iDpuDjdnmmfLFmyxqXQW2AEy-62ox6gUFPCXfVT4';

// Simple HTML sanitization
function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Email validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function CommentForm({
  postId,
  parentId,
  onSuccess,
  onCancel,
  isReply = false
}: CommentFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Spam prevention
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<{ name?: string; email?: string; content?: string }>({});

  const validate = useCallback(() => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (name.trim().length > 100) {
      newErrors.name = 'Nome deve ter no máximo 100 caracteres';
    }

    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!isValidEmail(email.trim())) {
      newErrors.email = 'E-mail inválido';
    }

    if (!content.trim()) {
      newErrors.content = 'Comentário é obrigatório';
    } else if (content.trim().length > 2000) {
      newErrors.content = 'Comentário deve ter no máximo 2000 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, email, content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check - if filled, silently "succeed" but don't submit
    if (honeypot) {
      setMessage({ type: 'success', text: 'Seu comentário foi enviado e está aguardando moderação.' });
      setName('');
      setEmail('');
      setContent('');
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          post_id: postId,
          parent_id: parentId || null,
          author_name: sanitizeHtml(name.trim().slice(0, 100)),
          author_email: email.trim().toLowerCase(),
          content: sanitizeHtml(content.trim().slice(0, 2000)),
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          status: 'pending',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }

      setMessage({ type: 'success', text: 'Seu comentário foi enviado e está aguardando moderação.' });
      setName('');
      setEmail('');
      setContent('');

      // Rate limiting - disable for 30 seconds
      setIsDisabled(true);
      setTimeout(() => setIsDisabled(false), 30000);

      onSuccess?.();
    } catch (error) {
      console.error('Error submitting comment:', error);
      setMessage({ type: 'error', text: 'Erro ao enviar comentário. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot field - hidden from users, visible to bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="comment-name" className="block text-sm font-medium text-secondary-600 dark:text-secondary-300 mb-1">
            Nome *
          </label>
          <input
            type="text"
            id="comment-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting || isDisabled}
            maxLength={100}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.name
                ? 'border-red-500 focus:ring-red-500'
                : 'border-secondary-200 dark:border-secondary-600 focus:ring-primary-500'
            } bg-white dark:bg-secondary-700 text-secondary-500 dark:text-white focus:outline-none focus:ring-2 transition-colors`}
            placeholder="Seu nome"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="comment-email" className="block text-sm font-medium text-secondary-600 dark:text-secondary-300 mb-1">
            E-mail * <span className="text-secondary-400 text-xs">(não será publicado)</span>
          </label>
          <input
            type="email"
            id="comment-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting || isDisabled}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.email
                ? 'border-red-500 focus:ring-red-500'
                : 'border-secondary-200 dark:border-secondary-600 focus:ring-primary-500'
            } bg-white dark:bg-secondary-700 text-secondary-500 dark:text-white focus:outline-none focus:ring-2 transition-colors`}
            placeholder="seu@email.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="comment-content" className="block text-sm font-medium text-secondary-600 dark:text-secondary-300 mb-1">
          Comentário *
        </label>
        <textarea
          id="comment-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting || isDisabled}
          rows={isReply ? 3 : 4}
          maxLength={2000}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.content
              ? 'border-red-500 focus:ring-red-500'
              : 'border-secondary-200 dark:border-secondary-600 focus:ring-primary-500'
          } bg-white dark:bg-secondary-700 text-secondary-500 dark:text-white focus:outline-none focus:ring-2 transition-colors resize-none`}
          placeholder={isReply ? 'Escreva sua resposta...' : 'Escreva seu comentário...'}
        />
        <div className="flex justify-between mt-1">
          {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
          <p className="text-xs text-secondary-400 ml-auto">{content.length}/2000</p>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting || isDisabled}
          className="px-6 py-2 bg-primary-500 hover:bg-primary-400 disabled:bg-secondary-300 disabled:cursor-not-allowed text-secondary-500 font-semibold rounded-lg transition-colors flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Enviando...
            </>
          ) : isDisabled ? (
            'Aguarde...'
          ) : (
            isReply ? 'Responder' : 'Enviar comentário'
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-secondary-500 dark:text-secondary-300 hover:text-secondary-700 dark:hover:text-white transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
