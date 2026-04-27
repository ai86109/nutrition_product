import { TDEEEditDialog } from "@/components/dialogs/tdee-edit-dialog"
import { render } from "@testing-library/react"

describe('rendering', () => {
  test('should render the dialog correctly', () => {
    expect(() => {
      render(<TDEEEditDialog />)
    }).not.toThrow()
  })
})