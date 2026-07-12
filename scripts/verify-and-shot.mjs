// Boot the inlined artifact file directly and shoot mobile + desktop.
import { chromium } from 'playwright'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const file = path.resolve(process.argv[2])
const outDir = path.resolve(process.argv[3])
const url = pathToFileURL(file).toString()
const errors = []
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
})
try {
  // Mobile portrait
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 780 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
  })
  const mp = await mobile.newPage()
  mp.on('pageerror', (e) => errors.push(`m pageerror: ${e.message}`))
  mp.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`m console: ${msg.text()}`)
  })
  await mp.goto(url, { waitUntil: 'load' })
  await mp.waitForSelector('canvas.sim-canvas', { timeout: 8000 })
  await mp.waitForTimeout(9000)
  await mp.screenshot({ path: `${outDir}/shot-mobile.png`, fullPage: true })

  // Desktop wide light
  const dLight = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
  })
  const dp = await dLight.newPage()
  dp.on('pageerror', (e) => errors.push(`dl pageerror: ${e.message}`))
  dp.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`dl console: ${msg.text()}`)
  })
  await dp.goto(url, { waitUntil: 'load' })
  await dp.waitForSelector('canvas.sim-canvas', { timeout: 8000 })
  await dp.waitForTimeout(12000)
  await dp.screenshot({ path: `${outDir}/shot-desktop-light.png` })

  // Desktop wide dark
  const dDark = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
  })
  const dk = await dDark.newPage()
  dk.on('pageerror', (e) => errors.push(`dd pageerror: ${e.message}`))
  dk.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`dd console: ${msg.text()}`)
  })
  await dk.goto(url, { waitUntil: 'load' })
  await dk.waitForSelector('canvas.sim-canvas', { timeout: 8000 })
  await dk.waitForTimeout(12000)
  await dk.screenshot({ path: `${outDir}/shot-desktop-dark.png` })
} finally {
  await browser.close()
}
if (errors.length) {
  console.error('errors:', errors)
  process.exit(1)
}
console.log('OK')
