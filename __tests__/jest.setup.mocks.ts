jest.mock("@/store/eventBus", () => ({
  eventBus: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
}));
