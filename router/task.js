const express = require("express");
const router = express.Router();
const user = require("../db/models/tasks");
const middleware = require("../middleware/user-middleware");

//create data in the DB

router.post("/task/create", middleware, async (req, res) => {
	const task_instance = new user({ ...req.body, owner: req.user._id });
	try {
		await task_instance.save();
		res.status(201).send(task_instance);
	} catch (error) {
		res.status(400).send(error);
	}
});

//fetch data from the DB
//based on 1)completed:
//         2)sorting
//         3)limit and skip
router.get("/task", middleware, async (req, res) => {
	const comp = req.query.completed;
	const sorting = {};
	if (req.query.sortby) {
		const parts = req.query.sortby.split(":");
		sorting[parts[0]] = parts[1] === "desc" ? -1 : 1;
	}
	try {
		const task_instances = await user
			.find({
				completed: comp === "false" ? false : true,
				owner: req.user._id,
			})
			.limit(parseInt(req.query.limit))
			.skip(parseInt(req.query.limit))
			.sort(sorting);

		if (task_instances.length === 0) {
			return res.status(401).send("please add task to the user");
		}

		res.send(task_instances);
	} catch (error) {
		res.status(400).send(error);
	}
});

//update data
router.patch("/task/update/:id", middleware, async (req, res) => {
	const _id = req.params.id;
	const allowedUpdates = ["description", "completed"];
	const update = Object.keys(req.body);
	const isvalidupdate = update.every((e) => allowedUpdates.includes(e));
	if (!isvalidupdate) return res.status(404).send();
	try {
		const findtask = await user.findOne({ _id: _id, owner: req.user._id });
		console.log(_id);
		update.forEach((e) => {
			findtask[e] = req.body[e];
		});
		await findtask.save();
		if (!findtask) res.status(404).send();
		res.status(200).send(findtask);
	} catch (error) {
		res.status(401).send(error);
	}
});
module.exports = router;
