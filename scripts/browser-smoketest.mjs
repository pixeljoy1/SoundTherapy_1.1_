// Boots the built preview and verifies the simulator renders + no console errors.
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

const server = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', '4192'], {
  stdio: 'pipe',
})
await new Promise((r) => setTimeout(r, 2500))

const errors = []
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
})
try {
  const page = await browser.newPage({ viewport: { width: 400, height: 800 } })
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`)
  })
  await page.goto('http://127.0.0.1:4192/', { waitUntil: 'networkidle' })
  await page.waitForSelector('canvas.sim-canvas', { timeout: 8000 })
  // Give the sim a couple of seconds to tick.
  await page.waitForTimeout(2500)
  const title = await page.title()
  const stats = await page.evaluate(() => {
    const canvas = document.querySelector('canvas.sim-canvas')
    return { hasCanvas: !!canvas, w: canvas?.clientWidth, h: canvas?.clientHeight }
  })
  const chronicleFirst = await page.locator('.log li').first().innerText().catch(() => '(empty)')
  console.log('title:', title)
  console.log('canvas:', stats)
  console.log('first log entry:', chronicleFirst.replace(/\n/g, ' | '))
} finally {
  await browser.close()
  server.kill()
}
if (errors.length) {
  console.error('page errors:')
  for (const e of errors) console.error('  -', e)
  process.exit(1)
}
console.log('OK — no runtime errors')
