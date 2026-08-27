import nextCoreWebVitals from "eslint-config-next/core-web-vitals"
import nextTypeScript from "eslint-config-next/typescript"

const config = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    ignores: [".next/**", "out/**", "public/sw.js", "public/swe-worker-*.js", "test-results/**", "playwright-report/**"],
  },
]

export default config
