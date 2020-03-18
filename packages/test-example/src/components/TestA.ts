import { component, html } from '@jumoku/jumoku'
import { data, context } from './TestB'

component('test-a', () =>
  html`
    <div>
      ${data.children.map(
        (c, index) => html`
          <div>
            <span>${c}</span>
            <button @click="${() => data.children.splice(index, 1)}">
              delete this
            </button>
          </div>
        `
      )}
    </div>
  `.useContext([context])
)