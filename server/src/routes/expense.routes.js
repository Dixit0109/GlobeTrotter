const express = require("express");
const {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} = require("../controllers/expense.controller");
const { protect } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route("/")
  .post(addExpense)
  .get(getExpenses);

router.route("/:expenseId")
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;
