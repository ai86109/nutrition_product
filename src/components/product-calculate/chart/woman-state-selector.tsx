import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function WomanStateSelector({
  womanState,
  pregnancyState,
  handleWomanStateToggle,
  setPregnancyState,
}) {
  return (
    <div className="bg-gray-100 p-4 rounded-md">
      <p>生理狀態</p>
      <div className="mt-2 space-y-2">
        <div className="space-x-2 font-medium text-sm flex items-center">
          <Switch checked={womanState === 'pregnancy'} onCheckedChange={() => handleWomanStateToggle('pregnancy')} />
          <span>懷孕</span>
          <RadioGroup defaultValue="state1" value={pregnancyState} onValueChange={setPregnancyState}>
            <div className="flex items-center space-x-2 font-normal">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="state1" id="s1" />
                <span>第一期</span>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="state2" id="s2" />
                <span>第二期</span>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="state3" id="s3" />
                <span>第三期</span>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>
      <div className="mt-2 space-x-2 font-medium text-sm flex items-center">
        <Switch checked={womanState === 'lactation'} onCheckedChange={() => handleWomanStateToggle('lactation')} />
        <span>哺乳</span>
      </div>
    </div>
  )
}