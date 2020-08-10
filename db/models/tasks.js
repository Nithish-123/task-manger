const mongoose = require("mongoose");
const validate = require("validator");
const taskschema = new mongoose.Schema(
	{
		description: {
			type: String,
			trim: true,
			lowecase: true,
			required: true,
		},
		completed: {
			type: Boolean,
			default: false,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "task",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);
const taskuser = mongoose.model("users", taskschema);

module.exports = taskuser;
