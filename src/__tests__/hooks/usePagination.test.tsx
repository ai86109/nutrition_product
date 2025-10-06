import { usePagination } from "@/hooks/usePagination";
import { act, renderHook } from "@testing-library/react";

let mockScreenWidth = 800;

jest.mock("@/hooks/useScreenWidth", () => ({
  useScreenWidth: () => ({ screenWidth: mockScreenWidth })
}));


describe('usePagination', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should initialize with default values', () => {
    const { result } = renderHook(() => usePagination());

    expect(result.current.currentPage).toBe(1);
    expect(result.current.itemsPerPage).toBe(5);
  });

  test('resize to larger screen updates itemsPerPage', () => {
    mockScreenWidth = 1800;

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
})