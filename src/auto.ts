import type { CornerRibbonPosition } from './ribbon.js'
import { mountCornerRibbon } from './ribbon.js'

const currentScript =
  document.currentScript ||
  document.querySelector<HTMLScriptElement>(`script[type="module"][src="${import.meta.url}"]`)
const dataset = currentScript ? currentScript.dataset : {}

mountCornerRibbon({
  text: dataset.text,
  position: dataset.position as CornerRibbonPosition | undefined,
  color: dataset.color,
  textColor: dataset.textColor,
  id: dataset.id,
  target: dataset.target,
  shadow: dataset.shadow !== 'false',
  dismissible: dataset.dismissible !== 'false',
})
