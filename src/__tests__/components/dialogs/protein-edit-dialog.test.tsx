import { ProteinEditDialog } from "@/components/dialogs/protein-edit-dialog"
import { render } from "@testing-library/react"

describe('rendering', () => {
  test('should render the dialog correctly', () => {
    expect(() => {
      render(<ProteinEditDialog />)
    }).not.toThrow()
  })
})