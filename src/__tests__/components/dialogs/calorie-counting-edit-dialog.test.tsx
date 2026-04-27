import { CalorieCountingEditDialog } from "@/components/dialogs/calorie-counting-edit-dialog"
import { render } from "@testing-library/react"

describe('rendering', () => {
  test('should render the dialog correctly', () => {
    expect(() => {
      render(<CalorieCountingEditDialog />)
    }).not.toThrow()
  })
})