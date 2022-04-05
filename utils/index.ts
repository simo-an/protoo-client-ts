export const isFunction = (target: object): boolean => typeof target === 'function'
export const isString = (target: any): boolean => typeof target === 'string'

export const cloneArray = (array: Array<any>) => array.slice(0) || []

//

export const isClosedViaServer = (code: number): boolean => code === 4000