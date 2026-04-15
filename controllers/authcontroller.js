const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hash,
      role: req.body.role || "user"
    });

    res.json(user);
  } catch {
    res.status(500).json({ error: "register failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ error: "not found" });

    const ok = await bcrypt.compare(req.body.password, user.password);
    if (!ok) return res.json({ error: "wrong password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ token, user });
  } catch {
    res.status(500).json({ error: "login failed" });
  }
};