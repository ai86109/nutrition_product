import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function InfoPopover({ size = 18, children }: { size?: number, children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="material-icons cursor-pointer" style={{ fontSize: `${size}px`, height: `${size}px` }}>info</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto text-sm">
        <>{children}</>
      </PopoverContent>
    </Popover>
  )
}
