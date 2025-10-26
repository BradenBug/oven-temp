import { resolve } from 'path'

export default {
  base: '/oven-temp/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html')
      }
    }
  }
}
