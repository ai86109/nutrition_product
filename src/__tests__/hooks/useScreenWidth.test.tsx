import { useScreenWidth } from "@/hooks/useScreenWidth";
import { act, renderHook } from "@testing-library/react";
import { defaultScreenWidth } from "../utils/test-data";

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: defaultScreenWidth
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
        window.innerWidth = defaultScreenWidth;
        resizeHandler()
      });

      expect(result.current.screenWidth).toBe(1024);
    });
  })
})