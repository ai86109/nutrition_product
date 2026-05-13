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
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/60 hover:bg-muted/60">
          <TableHead></TableHead>
          {tableHeaderLists.map((item, index) => (
            <TableHead key={`head-${index}`} className="text-center font-medium">
              <span>{item.value}</span>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {calorieTypeLists.map((type) => (
          <TableRow key={type.id}>
            <TableCell className="bg-muted/60 font-medium">{type.label}</TableCell>
            {tableHeaderLists.map((item) => (
              <TableCell key={`cell-${item.id}`} className="text-center tabular-nums text-primary font-medium">
                {calculateValue(type.label, Number(item.value), valueDigits)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
