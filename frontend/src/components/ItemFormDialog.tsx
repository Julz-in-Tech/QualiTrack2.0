import { useEffect, useState } from "react";
import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type InspectionItem, emptyItem } from "@/lib/receiving-types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: InspectionItem | null;
  onSave: (item: Omit<InspectionItem, "id"> & { id?: number }) => void;
  onScanRequest: () => void;
  scannedBarcode?: string | null;
  onScannedConsumed?: () => void;
};

export function ItemFormDialog({
  open, onOpenChange, initial, onSave,
  onScanRequest, scannedBarcode, onScannedConsumed,
}: Props) {
  const [item, setItem] = useState<Omit<InspectionItem, "id"> & { id?: number }>(initial ?? emptyItem);

  useEffect(() => { if (open) setItem(initial ?? emptyItem); }, [open, initial]);

  useEffect(() => {
    if (scannedBarcode) {
      setItem((p) => ({ ...p, barcode: scannedBarcode }));
      onScannedConsumed?.();
    }
  }, [scannedBarcode, onScannedConsumed]);

  function update<K extends keyof typeof item>(key: K, value: string) {
    setItem((cur) => {
      const next = { ...cur, [key]: value };
      const received = parseInt(next.qtyReceived, 10) || 0;
      if (key === "qtyReceived") { next.qtyGood = value; next.qtyBad = "0"; }
      else if (key === "qtyBad") { next.qtyGood = Math.max(0, received - (parseInt(value, 10) || 0)).toString(); }
      else if (key === "qtyGood") { next.qtyBad = Math.max(0, received - (parseInt(value, 10) || 0)).toString(); }
      return next;
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{initial ? "Edit item" : "Add new item"}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="partNumber">Part number *</Label>
              <Input id="partNumber" value={item.partNumber} onChange={(e) => update("partNumber", e.target.value)} placeholder="PCB-CTRL-001" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="barcode">Barcode</Label>
              <div className="flex gap-2">
                <Input id="barcode" value={item.barcode} onChange={(e) => update("barcode", e.target.value)} placeholder="Scan or enter" />
                <Button type="button" variant="outline" size="icon" onClick={onScanRequest}><ScanLine className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={2} value={item.description} onChange={(e) => update("description", e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="grid gap-2"><Label htmlFor="qtyOrdered">Qty ordered</Label><Input id="qtyOrdered" type="number" min="0" value={item.qtyOrdered} onChange={(e) => update("qtyOrdered", e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="qtyReceived">Qty received *</Label><Input id="qtyReceived" type="number" min="0" value={item.qtyReceived} onChange={(e) => update("qtyReceived", e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="qtyGood">Qty good</Label><Input id="qtyGood" type="number" min="0" value={item.qtyGood} onChange={(e) => update("qtyGood", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="grid gap-2"><Label htmlFor="qtyBad">Qty bad</Label><Input id="qtyBad" type="number" min="0" value={item.qtyBad} onChange={(e) => update("qtyBad", e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="batchNumber">Batch number</Label><Input id="batchNumber" value={item.batchNumber} onChange={(e) => update("batchNumber", e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="expiryDate">Expiry date</Label><Input id="expiryDate" type="date" value={item.expiryDate} onChange={(e) => update("expiryDate", e.target.value)} /></div>
          </div>
          <div className="grid gap-2"><Label htmlFor="serialNumbers">Serial numbers</Label><Textarea id="serialNumbers" rows={2} value={item.serialNumbers} onChange={(e) => update("serialNumbers", e.target.value)} placeholder="Comma separated" /></div>
          <div className="grid gap-2"><Label htmlFor="location">Storage location</Label><Input id="location" value={item.location} onChange={(e) => update("location", e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { if (!item.partNumber || !item.qtyReceived) return; onSave(item); }}>
            {initial ? "Update item" : "Add item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
