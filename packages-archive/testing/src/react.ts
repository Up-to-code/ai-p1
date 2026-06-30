export function testId(id: string) {
  return { "data-testid": id } as const;
}

export function labelledBy(id: string) {
  return { "aria-labelledby": id } as const;
}

export function describedBy(id: string) {
  return { "aria-describedby": id } as const;
}
