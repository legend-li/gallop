import { component, html, useRef } from '@jumoku/jumoku'

component('test-c', (age: number) => {
  return html`
    <span>test-c ${age}</span>
  `
})