import { useState } from "react";
import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; onScan: (barcode: string) => void; };

export function BarcodeScannerDialog({ open, onOpenChange, onScan }: Props) {
  const [value, setValue] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Barcode scanner</DialogTitle></DialogHeader>
        <div className="flex flex-col items-center gap-3 rounded-md border-2 border-dashed border-primary/50 bg-muted/40 p-8 text-center">
          <ScanLine className="h-12 w-12 text-primary" />
          <p className="text-sm text-muted-foreground">Position the barcode in the scanner</p>
          <Input autoFocus placeholder="Or enter barcode manually" value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && value.trim()) { onScan(value.trim()); setValue(""); } }} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { if (value.trim()) { onScan(value.trim()); setValue(""); } }}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
