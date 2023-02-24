module.exports = {
  content: ['./templates/event_template.html'],
  purge: [
    './_includes/**/*.html',
    './_layouts/**/*.html',
    './_posts/*.md',
    './*.html',
  ],
  theme: {
    colors: {
      'background': '#1E1E3F',
      'text': '#A599E9',
      'link': '#FAD000',
      'link_visited': '#6943FF',
    },
    extend: {
      maxWidth: { '1/2': '50%' },
    },
    fontFamily: {
      'sans': ['Fira Sans', 'sans-serif']
    },
  },
  variants: {},
  plugins: [],
}
