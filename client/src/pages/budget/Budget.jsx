import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, PlusCircle, Plus, Compass } from "lucide-react";
import API from "../../services/api";
import BudgetSummaryCard from "../../components/budget/BudgetSummaryCard";
import CategoryBreakdownCard from "../../components/budget/CategoryBreakdownCard";
import ExpenseRow from "../../components/budget/ExpenseRow";
import ExpenseModal from "../../components/budget/ExpenseModal";
import DeleteExpenseModal from "../../components/budget/DeleteExpenseModal";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";

const Budget = () => {
  const navigate = useNavigate();

  // Trips State
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState(null);

  // Budget & Expenses State
  const [budgetData, setBudgetData] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetError, setBudgetError] = useState(null);

  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [expensesError, setExpensesError] = useState(null);

  // Modals State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch Trips
  const fetchTrips = async () => {
    setTripsLoading(true);
    setTripsError(null);
    try {
      const res = await API.get("/trips");
      if (res.data.success) {
        const fetchedTrips = res.data.data || [];
        setTrips(fetchedTrips);
        if (fetchedTrips.length > 0) {
          setSelectedTripId(fetchedTrips[0]._id);
        }
      }
    } catch (err) {
      setTripsError(
        err.response?.data?.message || err.message || "Failed to load trips"
      );
    } finally {
      setTripsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Fetch Budget & Expenses when selectedTripId changes
  const fetchTripBudgetAndExpenses = async (tripId) => {
    if (!tripId) return;

    setBudgetLoading(true);
    setExpensesLoading(true);
    setBudgetError(null);
    setExpensesError(null);

    // Fetch Budget Summary
    try {
      const bRes = await API.get(`/trips/${tripId}/budget`);
      if (bRes.data.success) {
        setBudgetData(bRes.data.data);
      }
    } catch (err) {
      setBudgetError(
        err.response?.data?.message || "Failed to load budget summary"
      );
    } finally {
      setBudgetLoading(false);
    }

    // Fetch Expenses List
    try {
      const eRes = await API.get(`/trips/${tripId}/expenses`);
      if (eRes.data.success) {
        setExpenses(eRes.data.data || []);
      }
    } catch (err) {
      setExpensesError(
        err.response?.data?.message || "Failed to load expenses list"
      );
    } finally {
      setExpensesLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTripId) {
      fetchTripBudgetAndExpenses(selectedTripId);
    }
  }, [selectedTripId]);

  // Create or Edit Expense Handler
  const handleSubmitExpense = async (payload) => {
    if (!selectedTripId) return false;

    try {
      let res;
      if (expenseToEdit) {
        res = await API.put(
          `/trips/${selectedTripId}/expenses/${expenseToEdit._id}`,
          payload
        );
      } else {
        res = await API.post(`/trips/${selectedTripId}/expenses`, payload);
      }

      if (res.data.success) {
        // Re-fetch budget & expenses to keep UI 100% in sync with backend truth
        await fetchTripBudgetAndExpenses(selectedTripId);
        return true;
      }
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to save expense. Please try again."
      );
      return false;
    }
  };

  // Delete Expense Handler
  const handleDeleteConfirm = async () => {
    if (!expenseToDelete || !selectedTripId) return;

    setDeleteLoading(true);
    try {
      const res = await API.delete(
        `/trips/${selectedTripId}/expenses/${expenseToDelete._id}`
      );
      if (res.data.success) {
        setExpenseToDelete(null);
        // Re-fetch budget & expenses
        await fetchTripBudgetAndExpenses(selectedTripId);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete expense");
    } finally {
      setDeleteLoading(false);
    }
  };

  const selectedTrip = trips.find((t) => t._id === selectedTripId);

  return (
    <div className="space-y-8">
      {/* Header & Trip Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Budget & Expenses
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Monitor real-time spending, category totals, and budget limits.
          </p>
        </div>

        {trips.length > 0 && (
          <div className="flex items-center space-x-3">
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 font-semibold focus:outline-none focus:border-indigo-500 text-sm max-w-xs"
            >
              {trips.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>

            <Button
              onClick={() => {
                setExpenseToEdit(null);
                setIsExpenseModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add Expense
            </Button>
          </div>
        )}
      </div>

      {/* Main Viewport */}
      {tripsLoading ? (
        <LoadingSpinner label="Loading saved trips..." />
      ) : tripsError ? (
        <ErrorMessage message={tripsError} onRetry={fetchTrips} />
      ) : trips.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No trips available"
          description="Create a trip first to start tracking expenses and financial summaries."
          actionLabel="Create a Trip"
          onAction={() => navigate("/create-trip")}
        />
      ) : (
        <div className="space-y-8">
          {/* Budget Summary Progress Card */}
          {budgetLoading ? (
            <LoadingSpinner label="Calculating budget metrics..." />
          ) : budgetError ? (
            <ErrorMessage
              message={budgetError}
              onRetry={() => fetchTripBudgetAndExpenses(selectedTripId)}
            />
          ) : (
            <BudgetSummaryCard budgetData={budgetData} />
          )}

          {/* Grid Layout: Category Breakdown & Expenses List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 1 Column: Category Breakdown */}
            <div className="lg:col-span-1">
              <CategoryBreakdownCard
                categoryBreakdown={budgetData?.categoryBreakdown}
                totalCost={budgetData?.totalCost}
                currency={budgetData?.currency}
              />
            </div>

            {/* Right 2 Columns: Expenses List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Expense Records ({expenses.length})
                </h3>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setExpenseToEdit(null);
                    setIsExpenseModalOpen(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Expense
                </Button>
              </div>

              {expensesLoading ? (
                <LoadingSpinner label="Loading expense records..." />
              ) : expensesError ? (
                <ErrorMessage message={expensesError} />
              ) : expenses.length === 0 ? (
                <EmptyState
                  icon={Wallet}
                  title="No expenses yet"
                  description="Start tracking your travel spending by adding your first expense record."
                  actionLabel="Add Expense"
                  onAction={() => {
                    setExpenseToEdit(null);
                    setIsExpenseModalOpen(true);
                  }}
                />
              ) : (
                <div className="space-y-2.5">
                  {expenses.map((exp) => (
                    <ExpenseRow
                      key={exp._id}
                      expense={exp}
                      onEdit={(e) => {
                        setExpenseToEdit(e);
                        setIsExpenseModalOpen(true);
                      }}
                      onDelete={(e) => setExpenseToDelete(e)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        expenseToEdit={expenseToEdit}
        onSubmitExpense={handleSubmitExpense}
        tripDates={{
          startDate: selectedTrip?.startDate,
          endDate: selectedTrip?.endDate,
        }}
      />

      <DeleteExpenseModal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDeleteConfirm}
        expense={expenseToDelete}
        loading={deleteLoading}
      />
    </div>
  );
};

export default Budget;
