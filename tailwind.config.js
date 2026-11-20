module.exports = {
  content: [
    "./*.html",
    "./_layouts/**/*.html",
    "./_includes/**/*.html",
    "./_procedures/**/*.md",
    "./_symptoms/**/*.md",
    "./_causes/**/*.md",
    "./_commands/**/*.md"
  ],
  theme: {
    extend: {
      boxShadow: { soft: "0 10px 30px rgba(15, 23, 42, 0.08)" }
    }
  },
  plugins: []
};
