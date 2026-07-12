// Verify the inlined artifact HTML boots cleanly in Chromium.
import { chromium } from 'playwright'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const file = path.resolve(process.argv[2])
const url = pathToFileURL(file).toString()

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
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForSelector('canvas.sim-canvas', { timeout: 8000 })
  await page.waitForTimeout(3500)
  const stats = await page.evaluate(() => {
    const canvas = document.querySelector('canvas.sim-canvas')
    return { hasCanvas: !!canvas, w: canvas?.clientWidth, h: canvas?.clientHeight }
  })
  console.log('canvas:', stats)
  const log = await page.locator('.log li').first().innerText().catch(() => '(empty)')
  console.log('first log entry:', log.replace(/\n/g, ' | '))
} finally {
  await browser.close()
}
if (errors.length) {
  console.error('errors:', errors)
  process.exit(1)
}
console.log('OK')
