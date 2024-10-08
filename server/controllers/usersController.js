const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.createUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  const provider = "native";
  const public = "public";
  const introduce = "Let's climb!";
  const image =
    "https://rockreach-0618.s3.ap-southeast-2.amazonaws.com/account2.png";

  if (name.length > 15) {
    return res.status(400).json({ error: "名字不能超過15個字元！" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      provider,
      public,
      introduce,
      image,
    });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, {
      domain: ".me2vegan.com",
      sameSite: "None",
      httpOnly: false,
      secure: true,
      maxAge: 3600000,
    });

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "此信箱未註冊" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "密碼不正確" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, {
      domain: ".me2vegan.com",
      sameSite: "None",
      httpOnly: false,
      secure: true,
      maxAge: 3600000,
    });

    res.status(200).json({ message: "登入成功", user, token });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select("name introduce image");
    if (!user) {
      return res.status(404).json({ error: "查無此使用者！" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

exports.getUserByName = async (req, res, next) => {
  try {
    const name = req.params.name;
    const user = await User.findOne({ name });
    if (!user) {
      return res.status(404).json({ error: "查無此使用者！" });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

exports.checkEmail = async (req, res, next) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(409)
        .json({ exists: true, message: "此信箱已註冊，請前往登入！" });
    }
    res.status(200).json({ exists: false });
  } catch (error) {
    next(error);
  }
};

exports.checkName = async (req, res, next) => {
  try {
    const { name } = req.params;
    const user = await User.findOne({ name });
    if (user) {
      return res
        .status(409)
        .json({ exists: true, message: "此名字已被使用，請使用其他名字！" });
    }
    res.status(200).json({ exists: false });
  } catch (error) {
    next(error);
  }
};
