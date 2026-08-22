import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";

const STANDARD_CATEGORIES = ["transport", "stay", "activities", "meals", "other"];

const CURRENCY_OPTIONS = [
  { code: "USD", label: "USD — US Dollar" },
  { code: "INR", label: "INR — Indian Rupee" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "AED", label: "AED — UAE Dirham" },
  { code: "JPY", label: "JPY — Japanese Yen" },
  { code: "SGD", label: "SGD — Singapore Dollar" },
  { code: "THB", label: "THB — Thai Baht" },
  { code: "AUD", label: "AUD — Australian Dollar" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
];

const ExpenseModal = ({
  isOpen,
  onClose,
  expenseToEdit,
  onSubmitExpense,
  tripDates,
}) => {
  const isEditing = !!expenseToEdit;

  const [categorySelect, setCategorySelect] = useState("meals");
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (expenseToEdit) {
        const cat = expenseToEdit.category || "meals";
        if (STANDARD_CATEGORIES.includes(cat)) {
          setCategorySelect(cat);
          setCustomCategoryName("");
        } else {
          setCategorySelect("custom");
          setCustomCategoryName(cat);
        }
        setAmount(expenseToEdit.amount !== undefined ? expenseToEdit.amount : "");
        setCurrency(expenseToEdit.currency || "USD");
        setDate(
          expenseToEdit.date
            ? new Date(expenseToEdit.date).toISOString().split("T")[0]
            : ""
        );
        setDescription(expenseToEdit.description || "");
      } else {
        setCategorySelect("meals");
        setCustomCategoryName("");
        setAmount("");
        setCurrency("USD");
        setDate(new Date().toISOString().split("T")[0]);
        setDescription("");
      }
      setError(null);
    }
  }, [isOpen, expenseToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalCategory = categorySelect;
    if (categorySelect === "custom") {
      finalCategory = customCategoryName.trim();
      if (!finalCategory) {
        setError("Custom category name is required");
        return;
      }
    }

    if (amount === "" || isNaN(Number(amount)) || Number(amount) < 0) {
      setError("Amount must be a non-negative number");
      return;
    }

    if (!currency) {
      setError("Currency is required");
      return;
    }

    if (!date) {
      setError("Date is required");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      category: finalCategory,
      amount: Number(amount),
      currency: currency.trim().toUpperCase(),
      date,
      description: description.trim(),
    };

    const success = await onSubmitExpense(payload);

    setSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Expense" : "Add New Expense"}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Category
          </label>
          <select
            value={categorySelect}
            onChange={(e) => setCategorySelect(e.target.value)}
            disabled={submitting}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
          >
            <option value="transport">Transport</option>
            <option value="stay">Accommodation / Stay</option>
            <option value="activities">Activities & Tours</option>
            <option value="meals">Meals & Dining</option>
            <option value="other">Other / Misc</option>
            <option value="custom">Custom category...</option>
          </select>
        </div>

        {categorySelect === "custom" && (
          <Input
            label="Custom Category Name *"
            value={customCategoryName}
            onChange={(e) => setCustomCategoryName(e.target.value)}
            placeholder="e.g. Visa Fees, Insurance, Shopping..."
            disabled={submitting}
            maxLength={50}
            required
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            disabled={submitting}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={submitting}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Expense Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={submitting}
          required
        />

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Description / Notes (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="e.g. Tourist visa fee, lunch at local bistro..."
            disabled={submitting}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting} disabled={submitting}>
            {isEditing ? "Save Changes" : "Add Expense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenseModal;
