import { useScreenWidth } from "@/hooks/useScreenWidth";
import { act, renderHook } from "@testing-library/react";

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
})

describe('useScreenWidth', () => {
  beforeEach(() => {
    window.addEventListener = jest.fn()
    window.removeEventListener = jest.fn()
  })
  
  describe('initial state', () => {
    it('should initialize screenWidth to 0', () => {
      const { result } = renderHook(() => useScreenWidth());

      expect(result.current.screenWidth).toBe(0);
    });
  })

  describe('resize', () => {
    test('updates screenWidth on window resize', () => {
      const { result } = renderHook(() => useScreenWidth());
      const resizeHandler = (window.addEventListener as jest.Mock).mock.calls[0][1]

      act(() => {
        window.innerWidth = 1024;
        resizeHandler()
      });

      expect(result.current.screenWidth).toBe(1024);
    });
  })
})