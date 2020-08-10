const express = require("express");
const middleware = require("../middleware/user-middleware");
const router = express.Router();
const task = require("../db/models/users");
const multer = require("multer");
//create data in the DB

router.post("/user/create", async (req, res) => {
	try {
		const user_instance = new task(req.body);
		const token = await user_instance.tokengeneration();
		res.status(201).send({ user_instance, token });
	} catch (error) {
		res.status(400).send(error);
	}
});

//fetch data from the DB

router.get("/user/me", middleware, async (req, res) => {
	res.send(req.user);
});
//login data
router.post("/user/login", async (req, res) => {
	try {
		const logindata = await task.findbycredentials(
			req.body.email,
			req.body.password
		);
		const token = await logindata.tokengeneration();
		res.status(200).send({ logindata, token });
	} catch (error) {
		console.log(error);
		res.status(400).send(error);
	}
});
//logout data
router.post("/user/logout", middleware, (req, res) => {
	req.user.tokens = req.user.tokens.filter((el) => {
		el.token != req.token;
	});
	req.user.save();
	res.status(200).send();
});
//logout data from all the devices
router.post("/user/logoutall", middleware, (req, res) => {
	req.user.tokens = [];
	req.user.save();
	res.status(200).send();
});
//get data -images,files
const upload = multer({
	limits: {
		fileSize: 1000000,
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(doc|docx|jpg|png|jpeg)$/))
			return cb(new Error("please provide a doc"));
		cb(undefined, true);
	},
});
router.post(
	"/user/upload",
	middleware,
	upload.single("upload"),
	async (req, res) => {
		req.user.avatar = req.file.buffer;
		await req.user.save();
		res.status(200).send(req.user);
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	}
);
// update data
router.patch("/user/update", middleware, async (req, res) => {
	const allowedUpdates = ["name", "age", "password", "email"];
	const update = Object.keys(req.body);
	const isvalidupdate = update.every((e) => allowedUpdates.includes(e));
	if (!isvalidupdate) return res.status(404).send();
	try {
		finduser = req.user;
		update.forEach((e) => {
			finduser[e] = req.body[e];
		});
		await finduser.save();

		res.status(200).send(finduser);
	} catch (error) {
		res.status(400).send();
	}
});
//upload image
router.get("/user/image/:id", async (req, res) => {
	try {
		const avatar = await task.findById({ _id: req.params.id });

		if (!avatar || !avatar.avatar) throw new Error();
		res.set("Content-Type", "image/jpg");
		res.send(avatar.avatar);
	} catch (error) {
		res.status(400).send();
	}
});

module.exports = router;
