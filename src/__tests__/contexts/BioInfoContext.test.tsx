import React from 'react';
import  { renderHook } from '@testing-library/react';
import { BioInfoProvider, useBioInfo } from '@/contexts/BioInfoContext';

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return <BioInfoProvider>{children}</BioInfoProvider>;
}

describe('BioInfoContext', () => {
  test('provides correct initial values', () => {
    const { result } = renderHook(() => useBioInfo(), { wrapper });

    expect(result.current.formData).toEqual({
      height: "",
      weight: "",
      age: "",
    })

    expect(result.current.gender).toBe('man');
  })
})
