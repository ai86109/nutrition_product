import { TDEEEditDialog } from "@/components/dialogs/tdee-edit-dialog"
import { DEFAULT_TDEE_SETTINGS } from "@/hooks/localStorage-related/useTdeeSettings"
import { render } from "@testing-library/react"

describe('rendering', () => {
  const mockProps = {
    tdeeList: DEFAULT_TDEE_SETTINGS,
    addList: jest.fn(),
    deleteList: jest.fn(),
  }

  test('should render the dialog correctly', () => {
    expect(() => {
      render(<TDEEEditDialog {...mockProps} />)
    }).not.toThrow()
  })
})