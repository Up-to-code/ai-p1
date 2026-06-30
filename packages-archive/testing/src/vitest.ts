export type ResettableMock = {
  mockReset: () => unknown;
};

export function resetMocks(...mocks: ResettableMock[]) {
  for (const mock of mocks) {
    mock.mockReset();
  }
}
