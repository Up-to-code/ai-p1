import "@testing-library/jest-native/extend-expect";
import AsyncStorageMock from "@react-native-async-storage/async-storage/jest/async-storage-mock";
import ReanimatedMock from "react-native-reanimated/mock";

jest.mock("react-native-reanimated", () => ReanimatedMock);
jest.mock("@react-native-async-storage/async-storage", () => AsyncStorageMock);
