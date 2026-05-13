import { usePagination } from "@/hooks/usePagination";
import { act, renderHook } from "@testing-library/react";
import { largeScreenWidth, smallScreenWidth } from "../utils/test-data";

const mockScreenWidth = jest.fn();
jest.mock("@/hooks/useScreenWidth", () => ({
  useScreenWidth: () => mockScreenWidth()
}));


describe('usePagination', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockScreenWidth.mockReturnValue({ screenWidth: smallScreenWidth });
  })

  test('should initialize with default values', () => {
    const { result } = renderHook(() => usePagination());

    expect(result.current.currentPage).toBe(1);
    expect(result.current.itemsPerPage).toBe(5);
  });

  test('resize to larger screen updates itemsPerPage', () => {
    mockScreenWidth.mockReturnValue({ screenWidth: largeScreenWidth });
    const { result } = renderHook(() => usePagination());

    expect(result.current.itemsPerPage).toBe(10);
  })

  test('update page and itemsPerPage', () => {
    const { result } = renderHook(() => usePagination());
    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.setCurrentPage(2);
    });
    expect(result.current.currentPage).toBe(2);
  });

  test('override mobile and desktop itemsPerPage via options', () => {
    mockScreenWidth.mockReturnValue({ screenWidth: smallScreenWidth });
    const { result: mobileResult } = renderHook(() =>
      usePagination({ mobile: 25, desktop: 25 })
    );
    expect(mobileResult.current.itemsPerPage).toBe(25);

    mockScreenWidth.mockReturnValue({ screenWidth: largeScreenWidth });
    const { result: desktopResult } = renderHook(() =>
      usePagination({ mobile: 25, desktop: 25 })
    );
    expect(desktopResult.current.itemsPerPage).toBe(25);
  });
})