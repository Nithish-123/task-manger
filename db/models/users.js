const mongoose = require("mongoose");
const validate = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			uppercase: true,
		},
		age: {
			type: Number,
			default: 0,
		},
		email: {
			type: String,
			unique: true,
			required: true,
			lowercase: true,
			trim: true,
			validate(value) {
				if (!validate.isEmail(value)) throw new Error("invalid email");
			},
		},
		password: {
			required: true,
			type: String,
			trim: true,
			minlength: 7,
			validate(value) {
				if (value.toLowerCase().includes("password"))
					throw new Error("invalid password");
			},
		},
		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
			},
		],
		avatar: { type: Buffer },
	},
	{
		timestamps: true,
	}
);
userSchema.virtual("tasks", {
	ref: "task",
	localField: "_id",
	foreignField: "owner",
});
userSchema.methods.toJSON = function () {
	const user = this;
	const userobj = user.toObject();
	delete userobj.password;
	delete userobj.tokens;
	delete userobj.avatar;
	return userobj;
};
userSchema.methods.tokengeneration = async function () {
	const userthis = this;
	const token = jwt.sign({ _id: userthis._id.toString() }, "nodejscourse");
	userthis.tokens = userthis.tokens.concat({ token });
	await userthis.save();
	return token;
};

userSchema.pre("save", async function (next) {
	const userthis = this;
	if (this.isModified("password")) {
		userthis.password = await bcryptjs.hash(userthis.password, 8);
	}
	next();
});
userSchema.statics.findbycredentials = async (email, password) => {
	const logindata = await User.findOne({ email: email });
	if (!logindata) throw new ERROR("invalid email");
	const ifmatch = await bcryptjs.compare(password, logindata.password);
	if (!ifmatch) throw new ERROR("invalid password");
	return logindata;
};
const User = mongoose.model("task", userSchema);
module.exports = User;
