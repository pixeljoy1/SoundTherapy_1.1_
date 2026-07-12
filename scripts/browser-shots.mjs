// Boot preview + capture mobile & desktop screenshots of the running sim.
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const server = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', '4193'], {
  stdio: 'pipe',
})
await new Promise((r) => setTimeout(r, 2500))

const OUT = process.argv[2] ?? '.'
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
})
try {
  // Mobile portrait — pixel-perfect for a phone.
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 780 },
    deviceScaleFactor: 2,
  })
  const mp = await mobile.newPage()
  await mp.goto('http://127.0.0.1:4193/', { waitUntil: 'networkidle' })
  await mp.waitForSelector('canvas.sim-canvas', { timeout: 8000 })
  await mp.waitForTimeout(6000) // let the sim run so life events accumulate
  await mp.screenshot({ path: `${OUT}/shot-mobile.png` })

  // Tap a dot near center-ish to show the person panel populated. Since dots
  // move, we just click roughly where a building is likely to host activity.
  await mp.mouse.click(200, 240)
  await mp.waitForTimeout(500)
  await mp.screenshot({ path: `${OUT}/shot-mobile-select.png` })

  // Desktop wide.
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  })
  const dp = await desktop.newPage()
  await dp.goto('http://127.0.0.1:4193/', { waitUntil: 'networkidle' })
  await dp.waitForSelector('canvas.sim-canvas', { timeout: 8000 })
  await dp.waitForTimeout(8000)
  await dp.screenshot({ path: `${OUT}/shot-desktop.png`, fullPage: false })
} finally {
  await browser.close()
  server.kill()
}
console.log('done')
