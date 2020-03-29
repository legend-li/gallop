import { isMarker } from './is'

export type Primitive =
  | null
  | undefined
  | boolean
  | number
  | string
  | symbol
  | bigint

export function createTreeWalker(root: Node) {
  return document.createTreeWalker(root, 133)
}

export function tryParseToNumber(val: Primitive) {
  return isNaN(Number(val)) ? val : Number(val)
}

export function tryParseToString(val: unknown): string {
  if (val === null || val === undefined) return ''
  if (typeof val === 'string') return val
  return JSON.stringify(val)
}

export function digStringBlock(
  rawStr: string,
  head: '(' | '{' | '[' | '<' | '"' | "'" = '(',
  edge: boolean = true
): [string, string] {
  let tail
  switch (head) {
    case '(':
      tail = ')'
      break
    case '{':
      tail = '}'
      break
    case '[':
      tail = ']'
      break
    case '<':
      tail = '>'
      break
    case '"':
      tail = '"'
      break
    case "'":
      tail = "'"
      break
  }
  let startIndex = rawStr.indexOf(head)
  if (startIndex < 0) {
    return ['', rawStr]
  }
  let endIndex
  let stack = [0]
  for (let i = startIndex + 1; i < rawStr.length; i++) {
    if (rawStr[i] === head) {
      stack.push(0)
    } else if (rawStr[i] === tail) {
      stack.pop()
    }

    if (stack.length === 0) {
      endIndex = i
      return [
        rawStr
          .slice(
            edge ? startIndex : startIndex + 1,
            edge ? endIndex + 1 : endIndex
          )
          .trim(),
        rawStr.slice(endIndex + 1)
      ]
    }
  }
  throw new Error('syntax error')
}

export function lastOf<T>(arr: T[]) {
  return arr[arr.length - 1]
}

export function isMatchedSymbol(front: string | undefined, back: string) {
  switch (back) {
    case ')':
      return front === '('
    case '}':
      return front === '{'
    case ']':
      return front === '['
    case '>':
      return front === '<'
    case '"':
      return front === '"'
    case "'":
      return front === "'"
    default:
      return false
  }
}

export function getFuncArgNames(func: Function) {
  const [funcHead] = digStringBlock(func.toString(), undefined, false)
  const arr = funcHead.replace(/(\/\*.*?\*\/)|\s/g, '')
  let res = []
  let temp = ''
  let canPush = true
  let blockStack = []

  for (let i = 0; i < arr.length; i++) {
    const isInBlock = !!blockStack.length
    const cur = arr[i]

    if (isMatchedSymbol(lastOf(blockStack), cur)) {
      blockStack.pop()
      continue
    } else if (
      ['(', ')', '[', ']', '{', '}', '<', '>', '"', "'"].includes(cur)
    ) {
      blockStack.push(cur)
    }

    if (!isInBlock) {
      if (cur === ',') {
        canPush = true
        continue
      }
      if (canPush) {
        temp += cur
        if ([',', '='].includes(arr[i + 1]) || i + 1 === arr.length) {
          res.push(temp)
          temp = ''
          canPush = false
        }
      }
    }
  }
  return res
}

export function extractProps(attr: NamedNodeMap) {
  return Array.from(attr)
    .filter((a) => /^:\S+/.test(a.name) && !isMarker(a.value))
    .reduce((acc, { name, value }) => {
      Reflect.set(acc, name.slice(1), tryParseToNumber(value))
      return acc
    }, {} as any)
}

const is = Object.is
function keys<T>(val: T) {
  return Object.keys(val) as Array<keyof T>
}

export function shallowEqual(objA: unknown, objB: unknown) {
  if (is(objA, objB)) return true
  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }

  const keysA = keys(objA)
  const keysB = keys(objB)

  if (keysA.length !== keysB.length) return false

  for (let i = 0; i < keysA.length; i++) {
    if (!(keysA[i] in objB) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false
    }
  }
  return true
}

export function twoStrArrayCompare(arrA: string[], arrB: string[]) {
  if (arrA.length !== arrB.length) {
    return false
  }
  return arrA.join('') === arrB.join('')
}