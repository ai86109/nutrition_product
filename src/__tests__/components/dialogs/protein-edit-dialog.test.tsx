import { ProteinEditDialog } from "@/components/dialogs/protein-edit-dialog"
import { DEFAULT_PROTEIN_SETTINGS } from "@/hooks/localStorage-related/useProteinSettings"
import { render } from "@testing-library/react"

describe('rendering', () => {
  const mockProps = {
    proteinList: DEFAULT_PROTEIN_SETTINGS,
    updateChecked: jest.fn(),
    updateValue: jest.fn(),
    resetToDefault: jest.fn(),
  }

  test('should render the dialog correctly', () => {
    expect(() => {
      render(<ProteinEditDialog {...mockProps} />)
    }).not.toThrow()
  })
})