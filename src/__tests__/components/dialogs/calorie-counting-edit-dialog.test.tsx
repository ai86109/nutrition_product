import { CalorieCountingEditDialog } from "@/components/dialogs/calorie-counting-edit-dialog"
import { DEFAULT_CALORIE_SETTINGS } from "@/hooks/useCalorieSettings"
import { render } from "@testing-library/react"

describe('rendering', () => {
  const mockProps = {
    calorieFactorLists: DEFAULT_CALORIE_SETTINGS,
    updateChecked: jest.fn(),
    updateValue: jest.fn(),
  }

  test('should render the dialog correctly', () => {
    expect(() => {
      render(<CalorieCountingEditDialog {...mockProps} />)
    }).not.toThrow()
  })
})