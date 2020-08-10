const User = require("../db/models/users");
const jwt = require("jsonwebtoken");

const middleware = async (req, res, next) => {
	try {
		const token = req.header("Authorization").replace("Bearer ", "");

		const decodedtoken = jwt.verify(token, "nodejscourse");
		const user = await User.findOne({
			_id: decodedtoken._id,
			"tokens.token": token,
		});
		if (!user) throw new Error();
		req.token = token;
		req.user = user;
		next();
	} catch (error) {
		res.status(401).send("please authenticate");
	}
};

module.exports = middleware;
