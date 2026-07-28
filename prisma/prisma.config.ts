import { defineConfig } from '@prisma/internals'
import { join } from 'path'

export default defineConfig({
  dataProxy: {
    enabled: false,
  },
})
