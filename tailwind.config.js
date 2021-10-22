/**
 * @type {import('@types/tailwindcss/tailwind-config').TailwindConfig}
 */

module.exports = {
  purge: {
    enabled: true,
    mode: "all",
    content: [],
    whitelist: [],
    whitelistPatterns: [],
  },
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  darkMode: "media",
  plugins: [require("@tailwindcss/custom-forms")],
  theme: {
    extend: {
      transitionProperty: {
        height: "height, max-height, min-height",
      },
    },
  },
}
