import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function InfoPopover({ children }: { children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="material-icons cursor-pointer" style={{ fontSize: '18px', height: '18px' }}>info</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto text-sm">
        <>{children}</>
      </PopoverContent>
    </Popover>
  )
}
