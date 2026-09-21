import type {Config} from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F5F1E8',
          raised: '#FBF8F0',
          deep: '#ECE5D8',
        },
        ink: {
          DEFAULT: '#2A2724',
          soft: '#6B645D',
        },
        direction: {
          DEFAULT: '#B85C38',
          soft: '#F1E2D7',
        },
        wrong: {
          DEFAULT: '#8B4A47',
          soft: '#F0E2E0',
        },
        sage: {
          DEFAULT: '#7A8B6F',
          soft: '#E7ECE2',
        },
        rule: {
          DEFAULT: '#CFC7BB',
          strong: '#B8AEA1',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Source Serif 4', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'IBM Plex Mono', 'ui-monospace', 'monospace'],
        sans: ['var(--font-sans)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        control: '10px',
        card: '18px',
      },
      spacing: {
        'page-sm': '20px',
        'page-md': '32px',
        'page-lg': '48px',
        'section-sm': '24px',
        'section-md': '34px',
        'section-lg': '48px',
      },
      maxWidth: {
        page: '1120px',
        copy: '820px',
      },
      letterSpacing: {
        label: '.105em',
        eyebrow: '.12em',
      },
    },
  },
  plugins: [],
};

export default config;
