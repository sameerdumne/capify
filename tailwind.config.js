module.exports = {
  content: [
    './src/app/**/*.{ts,tsx,js,jsx}',
    './src/components/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: '#7C3AED',
        accent: '#00E5FF'
      },
      backgroundImage: {
        'gradient-radial-neon': 'radial-gradient(circle at 10% 10%, rgba(124,58,237,0.18), transparent 20%), radial-gradient(circle at 90% 90%, rgba(0,229,255,0.12), transparent 15%)'
      }
    }
  },
  plugins: []
}
