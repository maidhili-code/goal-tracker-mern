const Goal = require("../models/Goal");

// CREATE
const createGoal = async (
  req,
  res
) => {
  try {
    const goal =
      await Goal.create(
        req.body
      );

    res
      .status(201)
      .json(goal);
  } catch (error) {
    res
      .status(500)
      .json({
        message:
          error.message,
      });
  }
};

// GET ALL
const getGoals = async (
  req,
  res
) => {
  try {
    const goals =
      await Goal.find().sort(
        {
          createdAt: -1,
        }
      );

    res
      .status(200)
      .json(goals);
  } catch (error) {
    res
      .status(500)
      .json({
        message:
          error.message,
      });
  }
};

// UPDATE PROGRESS
const updateGoal =
  async (req, res) => {
    try {
      const goal =
        await Goal.findById(
          req.params.id
        );

      if (!goal) {
        return res
          .status(404)
          .json({
            message:
              "Goal not found",
          });
      }

      if (
        req.body?.complete
      ) {
        goal.progress =
          100;

        goal.status =
          "Completed";
      } else {
        goal.progress =
          Math.min(
            goal.progress +
              10,
            100
          );

        goal.status =
          goal.progress ===
          100
            ? "Completed"
            : "In Progress";
      }

      await goal.save();

      res
        .status(200)
        .json(goal);
    } catch (error) {
      res
        .status(500)
        .json({
          message:
            error.message,
        });
    }
  };

// EDIT GOAL
const editGoal = async (
  req,
  res
) => {
  try {
    const updatedGoal =
      await Goal.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    res.json(
      updatedGoal
    );
  } catch (error) {
    res
      .status(500)
      .json({
        message:
          error.message,
      });
  }
};

// DELETE
const deleteGoal =
  async (req, res) => {
    try {
      await Goal.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Goal deleted",
      });
    } catch (error) {
      res
        .status(500)
        .json({
          message:
            error.message,
        });
    }
  };

module.exports = {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  editGoal,
};