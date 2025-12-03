// src/components/payments/ReviewEarlyPayoutRequestModal.jsx
import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Alert, AlertDescription } from "../ui/alert";

export default function ReviewEarlyPayoutRequestModal({
  open,
  onClose,
  request,
  onApprove,
  onReject,
}) {
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    // reset when new request or re-open
    setRejectionReason("");
  }, [request, open]);

  const handleOpenChange = (isOpen) => {
    if (!isOpen) onClose();
  };

  const handleRejectClick = () => {
    onReject(rejectionReason);
  };

  if (!request) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Early Payout Request</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            No request selected. Please select a request to review.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Early Payout Request</DialogTitle>
          <DialogDescription>
            Review and approve or reject this early payout request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Technician</Label>
              <p className="text-sm text-gray-900 mt-1">
                {request.technicianName}
              </p>
            </div>
            <div>
              <Label>Request Date</Label>
              <p className="text-sm text-gray-900 mt-1">
                {request.requestDate}
              </p>
            </div>
            <div>
              <Label>Requested Amount</Label>
              <p className="text-sm text-[#c20001] mt-1">
                ${request.requestedAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <Label>Commissions Count</Label>
              <p className="text-sm text-gray-900 mt-1">
                {request.commissionIds.length}
              </p>
            </div>
          </div>

          <div>
            <Label>Commission IDs</Label>
            <p className="text-sm text-gray-900 mt-1">
              {request.commissionIds.join(", ")}
            </p>
          </div>

          <div>
            <Label>Reason for Early Payout</Label>
            <div className="mt-1 p-3 bg-gray-50 rounded border">
              <p className="text-sm text-gray-900">{request.reason}</p>
            </div>
          </div>

          <div>
            <Label>Rejection Reason (if rejecting)</Label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
            />
          </div>

          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              If approved, this payout will be processed immediately and marked
              as paid. The commissions will be removed from the weekly batch
              cycle.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleRejectClick}
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button
            onClick={onApprove}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Approve &amp; Pay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
