// src/components/payments/CreateWeeklyBatchModal.jsx
import React from "react";
import { Calendar } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Alert, AlertDescription } from "../ui/alert";

export default function CreateWeeklyBatchModal({
  open,
  onClose,
  totalAmount,
  commissionCount,
  payoutDate,
  onCreateBatch,
}) {
  const handleOpenChange = (isOpen) => {
    if (!isOpen) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Weekly Payout Batch</DialogTitle>
          <DialogDescription>
            Create a new payout batch for all pending commissions and bonuses
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              This batch will be scheduled for payout on{" "}
              <strong>{payoutDate}</strong> (next Monday)
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl text-[#c20001] mt-1">
                ${totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-600">Commissions</p>
              <p className="text-2xl text-gray-900 mt-1">{commissionCount}</p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Once created, the batch can be reviewed and
              confirmed. After confirmation, you can mark it as paid on the
              payout date. Each commission will be paid only once.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onCreateBatch}
            className="bg-[#c20001] hover:bg-[#a00001] text-white"
          >
            Create Batch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
