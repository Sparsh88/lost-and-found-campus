module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        warmWhite: '#F7F6F2',
        softSand: '#F1EDE6',
        midnightNavy: {
          DEFAULT: '#0B1F3A',
          hover: '#071527',
          light: '#132c4e',
        },
        electricBlue: {
          DEFAULT: '#0878E8',
          hover: '#0766c6',
        },
        brightAzure: '#0077D9',
        charcoal: '#252A30',
        slateGray: '#586273',
        lightGray: '#D9DDE3',
        skyBlue: '#3B82F6',
        forestGreen: '#168344',
        crimsonRed: '#DC2626',
        amberOrange: '#ED9708',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
