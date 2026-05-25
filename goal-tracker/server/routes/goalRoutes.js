const express =
  require("express");

const router =
  express.Router();

const {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  editGoal,
} = require(
  "../controllers/goalController"
);

router.get(
  "/",
  getGoals
);

router.post(
  "/",
  createGoal
);

router.put(
  "/:id",
  updateGoal
);

router.put(
  "/edit/:id",
  editGoal
);

router.delete(
  "/:id",
  deleteGoal
);

module.exports =
  router;