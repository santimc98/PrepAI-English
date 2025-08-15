// Mock for @react-native-async-storage/async-storage
const mockStorage: Record<string, string> = {};

const AsyncStorage = {
  getItem: jest.fn((key: string): Promise<string | null> => {
    return Promise.resolve(mockStorage[key] || null);
  }),
  setItem: jest.fn((key: string, value: string): Promise<void> => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string): Promise<void> => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
  clear: jest.fn((): Promise<void> => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    return Promise.resolve();
  }),
};

export default AsyncStorage;
