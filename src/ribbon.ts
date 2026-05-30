export type CornerRibbonPosition = 'left' | 'right' | 'left-bottom' | 'right-bottom'

export type CornerRibbonTarget = string | HTMLElement | DocumentFragment

export type CornerRibbonOptions = {
  text?: string
  position?: CornerRibbonPosition
  color?: string
  textColor?: string
  target?: CornerRibbonTarget | null
  shadow?: boolean
  dismissible?: boolean
  id?: string
  zIndex?: number
}

type ResolvedCornerRibbonOptions = Required<Omit<CornerRibbonOptions, 'target'>> & {
  target: CornerRibbonTarget | null
}

type PositionStyle = {
  wrapper: Partial<CSSStyleDeclaration>
  ribbon: Partial<CSSStyleDeclaration>
}

const DEFAULT_OPTIONS = {
  text: 'label',
  position: 'left',
  color: 'blue',
  textColor: '#ffffff',
  target: null,
  shadow: true,
  dismissible: true,
  id: 'corner-ribbon',
  zIndex: 9999,
} satisfies ResolvedCornerRibbonOptions

const POSITION_STYLES = {
  left: {
    wrapper: { top: '0', left: '0' },
    ribbon: { top: '34px', left: '-48px', transform: 'rotate(-45deg)' },
  },
  right: {
    wrapper: { top: '0', right: '0' },
    ribbon: { top: '34px', right: '-48px', transform: 'rotate(45deg)' },
  },
  'left-bottom': {
    wrapper: { bottom: '0', left: '0' },
    ribbon: { bottom: '34px', left: '-48px', transform: 'rotate(45deg)' },
  },
  'right-bottom': {
    wrapper: { bottom: '0', right: '0' },
    ribbon: { bottom: '34px', right: '-48px', transform: 'rotate(-45deg)' },
  },
} satisfies Record<CornerRibbonPosition, PositionStyle>

const COLOR_MAP: Record<string, string> = {
  blue: '#2563eb',
  red: '#ea4335',
  amber: '#d97706',
  orange: '#ea580c',
  green: '#16a34a',
  black: '#111827',
  slate: '#475569',
  gray: '#4b5563',
  pink: '#db2777',
  purple: '#7c3aed',
  white: '#ffffff',
}

const assignStyles = (element: HTMLElement, styles: Partial<CSSStyleDeclaration>) => {
  Object.assign(element.style, styles)
}

const resolveColor = (color: string) => COLOR_MAP[color] || color || COLOR_MAP.red

const resolveTextColor = (backgroundColor: string, explicitTextColor?: string) => {
  if (explicitTextColor) return explicitTextColor
  return backgroundColor === COLOR_MAP.white || backgroundColor === 'white' ? '#202124' : '#ffffff'
}

const isCornerRibbonPosition = (position: string): position is CornerRibbonPosition =>
  Object.hasOwn(POSITION_STYLES, position)

const normalizeOptions = (options: CornerRibbonOptions = {}): ResolvedCornerRibbonOptions => {
  const position =
    options.position && isCornerRibbonPosition(options.position) ? options.position : 'left'
  const color = resolveColor(options.color || DEFAULT_OPTIONS.color)

  return {
    ...DEFAULT_OPTIONS,
    ...options,
    position,
    color,
    textColor: resolveTextColor(color, options.textColor),
  }
}

const resolveTarget = (target: CornerRibbonTarget | null): HTMLElement | DocumentFragment => {
  if (!target) return document.body
  if (typeof target === 'string') {
    const selected = document.querySelector(target)
    if (!selected) {
      throw new Error('corner-ribbon target was not found')
    }
    return selected as HTMLElement
  }
  return target
}

const createText = (text: string) => {
  if (text === '') return DEFAULT_OPTIONS.text
  return text
}

export const createCornerRibbon = (options: CornerRibbonOptions = {}): HTMLElement => {
  const config = normalizeOptions(options)
  const position = POSITION_STYLES[config.position]
  const host = document.createElement('div')
  const root = config.shadow && host.attachShadow ? host.attachShadow({ mode: 'open' }) : host
  const wrapper = document.createElement('div')
  const ribbon = document.createElement('button')
  const label = document.createElement('span')

  host.dataset.cornerRibbon = config.id
  host.setAttribute('aria-hidden', 'false')

  assignStyles(host, {
    all: 'initial',
    position: 'fixed',
    width: '0',
    height: '0',
    zIndex: String(config.zIndex),
  })

  assignStyles(wrapper, {
    width: '148px',
    height: '148px',
    position: 'fixed',
    overflow: 'hidden',
    zIndex: String(config.zIndex),
    pointerEvents: 'none',
    ...position.wrapper,
  })

  assignStyles(ribbon, {
    appearance: 'none',
    border: '1px solid rgba(255, 255, 255, 0.22)',
    borderRadius: '999px',
    margin: '0',
    position: 'absolute',
    padding: '0',
    backgroundColor: config.color,
    backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(0, 0, 0, 0.16))',
    boxShadow: '0 10px 24px rgb(15 23 42 / 28%)',
    font: "700 12px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    zIndex: String(config.zIndex),
    pointerEvents: 'auto',
    opacity: '1',
    transition: 'opacity 0.18s ease, filter 0.18s ease',
    cursor: config.dismissible ? 'pointer' : 'default',
    ...position.ribbon,
  })

  assignStyles(label, {
    color: config.textColor,
    textDecoration: 'none',
    textShadow: config.textColor === '#ffffff' ? '0 1px 1px rgb(0 0 0 / 24%)' : 'none',
    textAlign: 'center',
    width: '208px',
    minWidth: '208px',
    lineHeight: '28px',
    display: 'inline-block',
    padding: '0 16px',
    boxSizing: 'border-box',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  })

  ribbon.type = 'button'
  ribbon.setAttribute('aria-label', `${createText(config.text)} corner ribbon`)
  label.textContent = createText(config.text)

  ribbon.addEventListener('mouseenter', () => {
    ribbon.style.opacity = '0.88'
    ribbon.style.filter = 'brightness(1.06)'
  })
  ribbon.addEventListener('mouseleave', () => {
    ribbon.style.opacity = '1'
    ribbon.style.filter = 'none'
  })

  if (config.dismissible) {
    ribbon.addEventListener('click', () => {
      host.remove()
    })
  }

  ribbon.append(label)
  wrapper.append(ribbon)
  root.append(wrapper)

  return host
}

export const mountCornerRibbon = (options: CornerRibbonOptions = {}): HTMLElement => {
  const config = normalizeOptions(options)
  const target = resolveTarget(config.target)

  const existing = target.querySelector(`[data-corner-ribbon="${config.id}"]`)
  if (existing) existing.remove()

  const ribbon = createCornerRibbon(config)
  target.append(ribbon)

  return ribbon
}

export const unmountCornerRibbon = (options: CornerRibbonOptions = {}): boolean => {
  const config = normalizeOptions(options)
  const target = resolveTarget(config.target)
  const ribbon = target.querySelector(`[data-corner-ribbon="${config.id}"]`)

  if (ribbon) {
    ribbon.remove()
    return true
  }

  return false
}

export default mountCornerRibbon
