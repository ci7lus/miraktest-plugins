/**
 * @type {import('@types/tailwindcss').Config}
 */

module.exports = {
  content: ["./src/tailwind.scss"],
  plugins: [require("@tailwindcss/forms")],
  theme: {
    extend: {
      transitionProperty: {
        height: "height, max-height, min-height",
      },
    },
  },
}
