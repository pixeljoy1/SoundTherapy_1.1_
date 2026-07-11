/**
 * Ambient JSX types for Shidoka's Lit-based custom elements.
 *
 * React 18 forwards any tag with a hyphen to the DOM as a custom element, but
 * TypeScript doesn't know about them without a declaration. Rather than pull in
 * each element's typed props from the Shidoka packages (they change per release),
 * we declare the tags with a permissive shape here. Refine per-tag props when
 * you're pinning a specific Shidoka version and want stricter checking.
 */

import type { DetailedHTMLProps, HTMLAttributes } from 'react'

type WC<T = Record<string, unknown>> = DetailedHTMLProps<
  HTMLAttributes<HTMLElement> & T,
  HTMLElement
>

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'kyn-header': WC<{ rootUrl?: string; appTitle?: string; divider?: boolean }>
      'kyn-header-nav': WC
      'kyn-header-link': WC<{ href?: string; isActive?: boolean }>
      'kyn-header-user-profile': WC<{ name?: string; subtitle?: string }>

      'kyn-side-nav': WC<{ pinned?: boolean }>
      'kyn-side-nav-link': WC<{ href?: string; expanded?: boolean; isActive?: boolean }>

      'kyn-footer': WC<{ rootUrl?: string; copyright?: string }>
      'kyn-footer-nav': WC
      'kyn-footer-link': WC<{ href?: string }>

      'kyn-button': WC<{
        kind?: 'primary' | 'secondary' | 'tertiary' | 'ghost'
        size?: 'sm' | 'md' | 'lg'
        type?: 'button' | 'submit' | 'reset'
        disabled?: boolean
      }>

      'kyn-text-input': WC<{
        name?: string
        label?: string
        type?: 'text' | 'email' | 'password' | 'tel' | 'url'
        placeholder?: string
        value?: string
        required?: boolean
        invalid?: boolean
        invalidText?: string
        caption?: string
      }>

      'kyn-checkbox': WC<{
        name?: string
        value?: string
        checked?: boolean
      }>

      'kyn-link': WC<{ href?: string; kind?: 'primary' | 'inline' | 'ai' }>
    }
  }
}

export {}
