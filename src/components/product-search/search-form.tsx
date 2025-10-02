import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TYPE_OPTIONS, CATEGORY_OPTIONS, OPERATOR_OPTIONS } from "@/utils/constants"
import { useProduct } from "@/contexts/ProductContext";
import { SearchState } from "@/types";

interface SearchInputProps {
  value: string;
  onChange: (field: keyof SearchState, value: string | string[]) => void;
}

const SearchInput = ({ value, onChange }: SearchInputProps) => {
  return (
    <div className="relative w-full">
      <Input placeholder="關鍵字搜尋" value={value} onChange={(e) => onChange("searchValue", e.target.value)} />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange("searchValue", "")}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
          aria-label="清除搜尋"
        >
          <span className="material-icons cursor-pointer" style={{ fontSize: '18px', height: '18px' }}>cancel</span>
        </Button>
      )}
    </div>
  )
}

interface SingleSelectProps {
  value: string;
  options: { id: string; name: string }[];
  selectType: keyof SearchState;
  placeholder: string;
  onChange: (field: keyof SearchState, value: string) => void;
}

const SingleSelect = ({ value, options, selectType, placeholder, onChange }: SingleSelectProps) => {
  return (
    <Select value={value} onValueChange={(value) => onChange(selectType, value)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

interface MultiSelectProps {
  selectedCate: string[];
  onChange: (value: string, index: number) => void;
}

const MultiSelect = ({ selectedCate, onChange }: MultiSelectProps) => {
  const selectors = [
    { index: 0, value: selectedCate[0], placeholder: "選擇類別", options: CATEGORY_OPTIONS },
    { index: 1, value: selectedCate[1], placeholder: "或", options: OPERATOR_OPTIONS },
    { index: 2, value: selectedCate[2], placeholder: "選擇類別", options: CATEGORY_OPTIONS },
  ]

  return (
    <div className="flex space-x-2 w-full justify-between">
      {selectors.map(({ index, value, placeholder, options }) => (
        <Select key={index} value={value} onValueChange={(value) => onChange(value, index)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  )
}

interface SearchFormProps {
  formState: SearchState;
  onUpdateField: (field: keyof SearchState, value: string | string[]) => void;
  onSearch: () => void;
  onReset: () => void;
  handlePageChange: (page: number) => void;
}

export default function SearchForm({ formState, onUpdateField, onSearch, onReset, handlePageChange }: SearchFormProps) {
  const { brandOptions } = useProduct()
  
  const handleSearchSubmit = (): void => {
    onSearch()
    handlePageChange(1) // Reset to the first page after search
  }

  const handleSelectCateChange = (value: string, index: number): void => {
    if (index < 0 || index >= formState.selectedCate.length) return;
    const newCate = [...formState.selectedCate]
    newCate[index] = value

    onUpdateField("selectedCate", newCate)
  }

  return (
    <>
      <p className="text-sm mb-1">＊所有欄位皆為選填，請自由搭配</p>
      <div className="flex items-start flex-col max-w-[300px] gap-1 overflow-x-auto">
        <SearchInput value={formState.searchValue} onChange={onUpdateField} />

        <SingleSelect value={formState.selectedBrand} options={brandOptions} selectType="selectedBrand" placeholder="選擇品牌" onChange={onUpdateField} />
        <SingleSelect value={formState.selectedType} options={TYPE_OPTIONS} selectType="selectedType" placeholder="選擇劑型" onChange={onUpdateField} />
        <MultiSelect selectedCate={formState.selectedCate} onChange={handleSelectCateChange} />

        <div className="flex gap-2 w-full mt-1">
          <Button className="flex-1 cursor-pointer" onClick={handleSearchSubmit}>搜尋</Button>
          <Button className="w-[100px] cursor-pointer" variant="destructive" onClick={onReset}>重置所有設定</Button>
        </div>
      </div>
    </>
  )
}