import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useBioInfo } from "@/contexts/BioInfoContext";
import { useBioInfoCalculations } from "@/hooks/useBioInfoCalculations";
import { useMemo } from "react";

interface CalculationTableProps {
  factors: { id: number, value: string | number, checked: boolean }[],
  valueDigits: number
}

export default function CalculationTable({ factors, valueDigits }: CalculationTableProps) {
  const { rounding, pbw, ibw, abw } = useBioInfoCalculations();
  const { calorieTypeLists: types } = useBioInfo()

  const calorieTypeLists = useMemo(() => types.filter(type => type.checked), [types]);
  const tableHeaderLists = useMemo(() => factors.filter(factor => factor.checked), [factors]);

  if (calorieTypeLists.length === 0 || tableHeaderLists.length === 0) return null;

  const calculateValue = (type: string, factor: number, digits: number = 2): number | string => {
    if (type === 'PBW') return rounding(pbw * factor, digits);
    else if (type === 'IBW') return rounding(ibw * factor, digits);
    else if (type === 'ABW') return rounding(abw * factor, digits);
    else return '--';
  }

  return (
    <div className="overflow-hidden rounded-lg ring-1 ring-border/60">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60 border-b-0">
            <TableHead className="w-14"></TableHead>
            {tableHeaderLists.map((item, index) => (
              <TableHead key={`head-${index}`} className="text-center font-medium text-muted-foreground tabular-nums">
                <span>{item.value}</span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {calorieTypeLists.map((type) => (
            <TableRow key={type.id} className="transition-colors hover:bg-muted/30">
              <TableCell className="relative bg-muted/40 font-semibold text-xs">
                <span className="absolute inset-y-2 left-0 w-0.5 rounded-r-full bg-primary/60" />
                {type.label}
              </TableCell>
              {tableHeaderLists.map((item) => (
                <TableCell key={`cell-${item.id}`} className="text-center">
                  <span className="inline-flex items-center justify-center min-w-[3rem] rounded-md bg-primary/5 ring-1 ring-primary/15 px-2 py-0.5 text-sm tabular-nums text-primary font-medium">
                    {calculateValue(type.label, Number(item.value), valueDigits)}
                  </span>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
