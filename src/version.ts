/**
 * App build version.
 * On CI each deploy gets a fresh, monotonically-increasing number from the
 * GitHub Actions run number (injected as VITE_BUILD). Locally it falls back to
 * buildInfo.json so dev builds still show a number.
 */
import buildInfo from './buildInfo.json'

const ciBuild = import.meta.env.VITE_BUILD
export const BUILD = ciBuild ? Number(ciBuild) : buildInfo.build
/** Display string: v1.00, v1.01, … v1.42 … */
export const APP_VERSION = `v1.${String(BUILD).padStart(2, '0')}`
