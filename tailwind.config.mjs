/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ─── Paleta original (mantida pra compatibility com componentes existentes) ───
        primary: {
          50: '#FFFEF0',
          100: '#FFFACC',
          200: '#FFF599',
          300: '#FFED66',
          400: '#FFE433',
          500: '#FFD700',
          600: '#CCB000',
          700: '#998400',
          800: '#665800',
          900: '#332C00',
        },
        secondary: {
          50: '#E8E8EC',
          100: '#D1D1D9',
          200: '#A3A3B3',
          300: '#75758D',
          400: '#474767',
          500: '#1a1a2e',
          600: '#151525',
          700: '#10101C',
          800: '#0B0B13',
          900: '#05050A',
        },

        // ─── Paleta editorial premium (inspirada no modogestor) ───
        // Cream: bg base quente (substitui branco puro)
        cream: {
          DEFAULT: '#faf6ec',
          50: '#fdfbf5',
          100: '#faf6ec',
          200: '#f2ecd9',
          paper: '#ffffff', // pra cards que precisam de contraste
        },
        // Gold: alinhado aos tokens oficiais do site (ciclo 3)
        // DEFAULT = amber brand #FFD700 · deep/dark = #8B6200 (texto gold
        // em fundo claro, AA strict) · soft = amber-accent #FFEA70
        gold: {
          DEFAULT: '#FFD700',
          soft: '#FFEA70',
          deep: '#8B6200',
          dark: '#8B6200',
        },
        // Tokens oficiais do site modopag.com.br (globals.css @theme)
        modopag: {
          bg: '#FAFAFA',
          'bg-2': '#F1ECDD',
          surface: '#FFFFFF',
          'surface-2': '#ECECEC',
          amber: '#FFD700',
          'amber-accent': '#FFEA70',
          'amber-deep': '#8B6200',
          text: '#111111',
          muted: '#3F3F3F',
          soft: '#595959',
        },
        // Onyx: pretos profundos (alternativa ao secondary escuro)
        onyx: {
          DEFAULT: '#0a0a0a',
          soft: '#141414',
          2: '#1c1c1c',
          3: '#2a2a2a',
        },
        // Ink: hierarquia de texto
        ink: {
          DEFAULT: '#0a0a0a',
          soft: '#2a2a2a',
          muted: '#6b6b6b',
          dim: '#9a9a9a',
        },
        // Line: bordas e divisores warm (substitui cinza puro)
        line: {
          DEFAULT: '#e6e1d3',
          strong: '#d4cfb8',
          dark: '#262626',
        },
        // Semantic (sucesso/erro/info)
        emerald: {
          DEFAULT: '#1f9d55',
          soft: '#d7f0df',
        },
        coral: {
          DEFAULT: '#e85a4f',
          soft: '#ffe4e0',
        },
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.secondary.700'),
            '--tw-prose-headings': theme('colors.secondary.500'),
            '--tw-prose-links': theme('colors.primary.600'),
            '--tw-prose-bold': theme('colors.secondary.500'),
            '--tw-prose-counters': theme('colors.secondary.500'),
            '--tw-prose-bullets': theme('colors.primary.500'),
            '--tw-prose-hr': theme('colors.secondary.200'),
            '--tw-prose-quotes': theme('colors.secondary.500'),
            '--tw-prose-quote-borders': theme('colors.primary.500'),
            '--tw-prose-captions': theme('colors.secondary.400'),
            '--tw-prose-code': theme('colors.secondary.500'),
            '--tw-prose-pre-code': theme('colors.secondary.100'),
            '--tw-prose-pre-bg': theme('colors.secondary.500'),
            '--tw-prose-th-borders': theme('colors.secondary.200'),
            '--tw-prose-td-borders': theme('colors.secondary.100'),
            '--tw-prose-invert-body': theme('colors.secondary.200'),
            '--tw-prose-invert-headings': theme('colors.white'),
            '--tw-prose-invert-links': theme('colors.primary.400'),
            '--tw-prose-invert-bold': theme('colors.white'),
            '--tw-prose-invert-counters': theme('colors.secondary.200'),
            '--tw-prose-invert-bullets': theme('colors.primary.500'),
            '--tw-prose-invert-hr': theme('colors.secondary.600'),
            '--tw-prose-invert-quotes': theme('colors.secondary.100'),
            '--tw-prose-invert-quote-borders': theme('colors.primary.500'),
            '--tw-prose-invert-captions': theme('colors.secondary.400'),
            '--tw-prose-invert-code': theme('colors.white'),
            '--tw-prose-invert-pre-code': theme('colors.secondary.200'),
            '--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
            '--tw-prose-invert-th-borders': theme('colors.secondary.500'),
            '--tw-prose-invert-td-borders': theme('colors.secondary.600'),
            a: {
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            h1: { fontWeight: '700' },
            h2: { fontWeight: '600' },
            h3: { fontWeight: '600' },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
