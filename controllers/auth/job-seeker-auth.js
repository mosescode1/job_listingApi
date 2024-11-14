const argon2 = require("argon2");
const jwtFeatures = require("../../utils/jwtFeature");
const redisClient = require("../../redis/redisClient");
const validateFields = require("../../utils/helpers/validate-req-body");
const prisma = require("../../prisma/client");
const AppError = require("../../utils/AppError");
const resetFunc = require("../../utils/resetToken");
const crypto = require("crypto");
const config = require("../../@config");

class JobSeekerAuthController {
  /**
   * Sign in job seeker
   * @param {req} req
   * @param {res} res
   * @param {next} next
   * @returns
   */
  static async login(req, res, next) {
    validateFields(req, ["email", "password"]);
    const { email, password } = req.body;

    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: {
        email: email,
      },
      select: {
        password: true,
        id: true,
        email: true,
        profession: true,
        cv: true,
        firstName: true,
        lastName: true,
        phone: true,
        bio: true,
        resumeUrl: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        yearsOfExperience: true,
      },
    });

    if (!jobSeeker) {
      return next(new AppError(`No user Found with this email`, 404));
    }

    const verified = await argon2.verify(jobSeeker.password, password);
    if (!verified) {
      return next(new AppError("Wrong Password", 403));
    }

    const token = await jwtFeatures.signToken(jobSeeker.id);
    const refreshToken = await jwtFeatures.refreshToken(jobSeeker.id);

    await prisma.jobSeeker.update({
      where: { email: email },
      data: { refreshToken },
    });

    const authTokenKey = `auth:${jobSeeker.id}`;
    await redisClient.set(authTokenKey, token, 60 * 60 * 1);

    jobSeeker.password = undefined;

    res.status(200).json({
      status: "success",
      message: "Login successful.",
      accessToken: token,
      refreshToken,
      data: { jobSeeker },
    });
  }

  /**
   * Create new job seeker account
   * @param {req} req
   * @param {res} res
   * @param {next} next
   * @returns
   */

  static async signup(req, res, next) {
    validateFields(req, [
      "email",
      "password",
      "firstName",
      "lastName",
      "phone",
      "gender",
      "address",
      "profession",
      "yearsOfExperience",
    ]);

    const {
      email,
      password,
      firstName,
      lastName,
      bio,
      phone,
      gender,
      address,
      profession,
      experience,
      education,
      skills,
      certification,
      portfolio,
      yearsOfExperience,
    } = req.body;

    const findUser = await prisma.jobSeeker.findUnique({
      where: {
        email: email,
      },
    });

    if (findUser) {
      return next(
        new AppError("Account with this email already exists", 403)
      );
    }

    let hashPassword;
    try {
      hashPassword = await argon2.hash(password, { hashLength: 40 });
    } catch (err) {
      return next(new AppError(err.message, 404));
    }

    const jobSeeker = await prisma.jobSeeker.create({
      data: {
        firstName,
        email,
        lastName,
        phone,
        profession,
        yearsOfExperience,
        cv: req.body.cv || null,
        password: hashPassword,
        bio: bio || null,
        resumeUrl: req.body.resumeUrl || null,
        avatarUrl: req.body.avatarUrl || null,
        gender,
        address: address
          ? {
            create: address,
          }
          : undefined,

        experience: experience?.length
          ? {
            create: experience,
          }
          : undefined,

        education: education?.length
          ? {
            create: education,
          }
          : undefined,

        portfolio: portfolio?.length
          ? {
            create: portfolio,
          }
          : undefined,

        certification: certification?.length
          ? {
            create: certification,
          }
          : undefined,

        skills: skills?.length
          ? {
            create: skills.map((skill) => ({
              value: skill.value,
            })),
          }
          : undefined,
      },
    });

    jobSeeker.password = undefined;

    res.status(201).json({
      status: "success",
      message: "Job seeker account created successfully",
      data: {
        jobSeeker,
      },
    });
  }

  /**
   * LogOut job seeker out
   * @param {req} req
   * @param {res} res
   * @param {next} next
   * @returns
   */
  static async logout(req, res, next) {
    try {
      const userId = req.userId;
      const authTokenKey = `auth:${userId}`;
      await redisClient.del(authTokenKey);
      await prisma.jobSeeker.update({
        where: {
          id: userId,
        },
        data: {
          refreshToken: null,
        },
      });
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      return next(new AppError(error.message, 404));
    }
  }

  /**
   * Generate new access token
   * @param {req} req
   * @param {res} res
   * @param {next} next
   * @returns
   */
  static async newAccessToken(req, res, next) {
    validateFields(req, ["refreshToken"]);
    const { refreshToken } = req.body;

    const user = await prisma.jobSeeker.findFirst({
      where: { refreshToken },
    });

    if (!user) return next(new AppError("Invalid Refresh Token", 401));

    const decoded = await jwtFeatures.verifyRefreshToken(
      refreshToken,
      config.jwt.refreshSecretToken
      //process.env.REFRESH_TOKEN_SECRET
    );
    if (!decoded) return next(new AppError("Refresh Token Expired", 401));

    const newAccessToken = jwtFeatures.signToken(user.id);
    res.status(200).json({
      status: "success",
      message: "New Access Token",
      accessToken: newAccessToken
    });
  }

  /**
   *
   * @param {req} req
   * @param {res} res
   * @param {next} next
   * @returns
   */

  static async forgotPassword(req, res, next) {
    validateFields(req, ["email"]);

    const { email } = req.body;

    const user = await prisma.jobSeeker.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return next(
        new AppError("Job seeker with this email does not exist", 404)
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const token = resetFunc.generateResetToken(resetToken);
    await redisClient.set(`resetToken:${user.id}`, token, 60 * 60);

    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/user/resetPassword/${resetToken}?user_id=${user.id}`;

    res.status(200).json({
      status: "success",
      message: "Kindly reset your password using the link provided.",
      resetUrl,
      resetToken,
    });
  }

  /**
   * Reset password
   * @param {req} req
   * @param {res} res
   * @param {next} next
   * @returns
   */
  static async resetPassword(req, res, next) {
    const resetToken = req.params.token;
    const userId = req.query.user_id;

    validateFields(req, ["newPassword", "confirmPassword"]);
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return next(new AppError("Passwords do not match", 400));
    }

    if (!resetToken) {
      return next(new AppError("Please provide reset token", 404));
    }

    const storedHash = await redisClient.get(`resetToken:${userId}`);

    if (!storedHash) {
      return next(new AppError("Reset token expired", 401));
    }

    const verifyToken = resetFunc.verifyResetToken(resetToken, storedHash);

    if (!verifyToken) {
      return next(new AppError("Invalid reset token", 401));
    }

    const user = await prisma.jobSeeker.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return next(new AppError("Job seeker not found", 404));
    }

    let hashPassword;
    try {
      hashPassword = await argon2.hash(newPassword, { hashLength: 40 });
    } catch (err) {
      return next(new AppError(err.message, 404));
    }

    await prisma.jobSeeker.update({
      where: {
        email: user.email,
      },
      data: {
        password: hashPassword,
      },
    });

    await redisClient.del(`resetToken:${userId}`);

    res.status(200).json({
      status: "success",
      message: "User Password updated successfully.",
    });
  }
}

module.exports = JobSeekerAuthController;
