module.exports = {
  purge: [
    './_includes/**/*.html',
    './_layouts/**/*.html',
    './_posts/*.md',
    './tenplates/**/*.html',
    './*.html',
  ],
  darkMode: false,
  theme: {
    extend: {
      maxWidth: {'1/2': '50%'},
    },
    fontFamily: {
      'sans': ['Fira Sans', 'sans-serif']
    },
  },
  variants: {},
  plugins: [],
}
