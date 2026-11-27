// html-webpack-plugin's default production minify ('auto') strips every HTML
// comment; same options, but keep the author credit comment in <head>.
module.exports = {
  chainWebpack: (config) => {
    if (process.env.NODE_ENV !== 'production') return
    config.plugin('html').tap((args) => {
      args[0].minify = {
        collapseWhitespace: true,
        keepClosingSlash: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        ignoreCustomComments: [/Designed and built by/],
      }
      return args
    })
  },
}
