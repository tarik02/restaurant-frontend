const env = {
  API_HTTPS: false,
  API_HOST: '192.168.1.10',
  API_PORT: 8080,
  API_PREFIX: '/api/v1/',

  UPLOADS_URL: 'http://192.168.1.10:8080/',
}

module.exports = {
  env,

  mode: 'spa',
  
  /*
  ** Headers of the page
  */
  head: {
    title: 'restaurant',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no' },
      { hid: 'description', name: 'description', content: 'Young informatics 2018' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' }
    ]
  },
  modules: [
    ['@nuxtjs/axios', {
      https: env.API_HTTPS,
      host: env.API_HOST,
      port: env.API_PORT,
      prefix: env.API_PREFIX,
    }],
    ['@nuxtjs/toast', {
      duration: 2500,
    }],
    ['@nuxtjs/pwa', {
      meta: {
        nativeUI: true,
        theme_color: '#F5F5F5',
      },
      manifest: {
        name: 'Ресторан',
        lang: 'ua',
      },
    }],
  ],
  plugins: [
    '~/plugins/vuetify.js',

    '~/plugins/google-maps.js',
    '~/plugins/google-places-autocomplete.js',

    '~/plugins/vue-moment.js',
    '~/plugins/order-status.js',
    '~/plugins/currency.js',
    '~/plugins/uploaded.js',
  ],
  css: [
    '~/assets/style/app.styl',
  ],
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    vendor: [
      '~/plugins/vuetify.js',
    ],
    extractCSS: true,
    /*
    ** Run ESLint on save
    */
    extend (config, ctx) {
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
