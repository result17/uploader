function checkConcurrency(type: any): boolean {
  return (Number.isInteger(type) && type > 0 && type !== Infinity)
}

export { checkConcurrency }