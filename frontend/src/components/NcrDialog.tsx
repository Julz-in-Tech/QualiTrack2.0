import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type NcrPrefill } from "@/lib/receiving-types";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; prefill: NcrPrefill | null; onSubmit: (data: NcrPrefill) => void; };

export function NcrDialog({ open, onOpenChange, prefill, onSubmit }: Props) {
  const [data, setData] = useState<NcrPrefill | null>(prefill);
  useEffect(() => { setData(prefill); }, [prefill, open]);
  if (!data) return null;
  function update<K extends keyof NcrPrefill>(key: K, value: string) { setData((cur) => (cur ? { ...cur, [key]: value } : cur)); }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />Non-Conformance Report (NCR)
          </DialogTitle>
          <DialogDescription>Defective or missing items were detected during receiving inspection. Review and submit the NCR.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2"><Label>Incident number</Label><Input value={data.incidentNumber} onChange={(e) => update("incidentNumber", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Incident date</Label><Input type="date" value={data.incidentDate} onChange={(e) => update("incidentDate", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Supplier / company</Label><Input value={data.recipientCompanyName} onChange={(e) => update("recipientCompanyName", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Order reference (PO)</Label><Input value={data.orderReference} onChange={(e) => update("orderReference", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Part number</Label><Input value={data.partNumber} onChange={(e) => update("partNumber", e.target.value)} /></div>
            <div className="grid gap-2"><Label>Affected quantity</Label><Input type="number" value={data.affectedQuantity} onChange={(e) => update("affectedQuantity", e.target.value)} /></div>
            <div className="grid gap-2 sm:col-span-2"><Label>Serial / batch / UID</Label><Input value={data.serialUidBatch} onChange={(e) => update("serialUidBatch", e.target.value)} /></div>
          </div>
          <div className="grid gap-2"><Label>Non-conformance description</Label><Textarea rows={3} value={data.nonConformanceDescription} onChange={(e) => update("nonConformanceDescription", e.target.value)} /></div>
          <div className="grid gap-2"><Label>Desired outcome</Label><Textarea rows={2} value={data.desiredOutcome} onChange={(e) => update("desiredOutcome", e.target.value)} /></div>
          <div className="grid gap-2"><Label>Root cause analysis</Label><Textarea rows={2} value={data.rootCauseAnalysis} onChange={(e) => update("rootCauseAnalysis", e.target.value)} /></div>
          <div className="grid gap-2"><Label>Corrective / preventive actions</Label><Textarea rows={2} value={data.correctivePreventiveActions} onChange={(e) => update("correctivePreventiveActions", e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={() => { if (data) onSubmit(data); }}>Submit NCR</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
