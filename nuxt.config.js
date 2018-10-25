const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { IgnorePlugin } = require('webpack')

const nodeExternals = require('webpack-node-externals')
const resolve = (dir) => require('path').join(__dirname, dir)

const dotenv = require('dotenv')
const env = dotenv.config().parsed

module.exports = {
  watch: ['.env'],

  env,

  mode: 'spa',

  render: {
    ssr: false,
  },

  head: {
    title: 'Кафе',

    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no' },
      { hid: 'description', name: 'description', content: 'Young informatics 2018' },
    ],

    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' },
    ],
  },

  modules: [
    ['@nuxtjs/axios', {
      https: env.API_HTTPS === 'true',
      host: env.API_HOST,
      port: parseInt(env.API_PORT),
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

      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'staleWhileRevalidate',
            strategyOptions: {
              cacheName: 'google-fonts',
            },
          },

          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'cacheFirst',
            strategyOptions: {
              cacheName: 'google-fonts',
            },
          },

          {
            urlPattern: env.UPLOADS_URL + '.*',
            handler: 'staleWhileRevalidate',

            strategyOptions: {
              cacheName: 'uploads',
            },
          },
        ],
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

    '~/plugins/axios.js',
    { src: '~/plugins/persisted-state.js', ssr: false },
    '~/plugins/format.js',
    '~/plugins/datetime-picker.js',
    '~/plugins/validate.js',
    '~/plugins/notifications.js',
    '~/plugins/overdrive.js',
    '~/plugins/driver-tracker.js',
    '~/plugins/html-substring.js',
    '~/plugins/resources.js',
    '~/plugins/morris.js',
    '~/plugins/lodash.js',
  ],

  css: [
    '~/assets/style/app.styl',
  ],
  
  loading: { color: '#3B8070' },
  
  build: {
    babel: {
      plugins: [
        ['transform-imports', {
          'vuetify': {
            'transform': 'vuetify/es5/components/${member}',
            'preventFullImport': true,
          },
        }],
      ],
    },

    vendor: [
      '~/plugins/vuetify.js',
  
      '~/plugins/google-maps.js',
      '~/plugins/google-places-autocomplete.js',
  
      '~/plugins/vue-moment.js',
      '~/plugins/order-status.js',
      '~/plugins/currency.js',
      '~/plugins/uploaded.js',
  
      '~/plugins/axios.js',
      '~/plugins/persisted-state.js',
      '~/plugins/format.js',
      '~/plugins/datetime-picker.js',
      '~/plugins/validate.js',
      '~/plugins/notifications.js',
      '~/plugins/overdrive.js',
      '~/plugins/driver-tracker.js',
      '~/plugins/html-substring.js',
      '~/plugins/resources.js',
      '~/plugins/morris.js',
      '~/plugins/lodash.js',
    ],

    extractCSS: true,
    
    extend (config, ctx) {
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/,
        })
      }

      config.resolve.alias['jquery'] = 'jquery/src/jquery.js'

      if (ctx.isServer) {
        config.externals = [
          nodeExternals({
            whitelist: [/^vuetify/],
          }),
        ]
      }

      if (env.DEV_BUNDLE_ANALYZER === 'true') {
        config.plugins.push(new BundleAnalyzerPlugin({
          analyzerMode: 'static',
        }))
      }

      config.plugins.push(new IgnorePlugin(/^\.\/locale$/, /moment$/))
    },
  },
}
