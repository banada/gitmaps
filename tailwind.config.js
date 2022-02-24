module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
    // defaultLineHeights: true,
    // standardFontWeights: true
  },
  purge: {
    enabled: true,
    content: ['./src/client/components/**/*.js']
  },
  theme: {
    extend: {
        screens: {
            '2xl': '1440px',
            '3xl': '1600px',
            '4xl': '1700px'
        }
    }
  },
  variants: {},
  plugins: []
}
