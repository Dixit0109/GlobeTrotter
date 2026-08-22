import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";

const DeleteExpenseModal = ({ isOpen, onClose, onConfirm, expense, loading }) => {
  if (!expense) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Expense?">
      <div className="space-y-4">
        <div className="flex items-start space-x-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-rose-200">
              Delete expense of {expense.currency || "$"}{expense.amount}?
            </p>
            <p className="text-rose-300/80">
              This action cannot be undone. Trip budget totals will automatically recalculate.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Delete Expense
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteExpenseModal;
