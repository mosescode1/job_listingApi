const argon2 = require("argon2");
const jwtFeatures = require("../../utils/jwtFeature");
const redisClient = require("../../redis/redisClient");
const validateFields = require("../../utils/helpers/validate-req-body");
const prisma = require("../../prisma/client");
const AppError = require("../../utils/AppError");
const resetFunc = require("../../utils/resetToken");
const crypto = require("crypto");
const config = require("../../@config");

class EmployerAuthController {
  /**
   * Create new employer account
   * @param {req} req
   * @param {res} res
   * @param {next} next
   * @returns
   */
  static async signup(req, res, next) {
    validateFields(req, [
      "email",
      "password",
      "companyName",
      "companyAddress",
      "companyDescription",
    ]);
    const { email, password, companyName, companyAddress, companyDescription } =
      req.body;

    const findEmp = await prisma.employer.findUnique({
      where: {
        email: email,
      },
    });

    if (findEmp) {
      return next(new AppError("Employer with this email already exists", 404));
    }

    let hashPassword;
    try {
      hashPassword = await argon2.hash(password, { hashLength: 40 });
    } catch (err) {
      return next(new AppError(err.message, 404));
    }

    const emp = await prisma.employer.create({
      data: {
        email,
        companyName,
        password: hashPassword,
        companyAddress,
        companyWebsite: req.body.companyWebsite || null,
        phone: req.body.phone || null,
        companyDescription,
        avatarUrl: req.body.avatarUrl || null,
      },
    });

    emp.password = undefined;
    res.status(201).json({
      status: "OK",
      message: "Employer account created successfully.",
      data: {
        employer: emp,
      },
    });
  }

  /**
   * Sign in employer
   * @param {req} req
   * @param {res} res
   * @param {next} next
   * @returns
   */
  static async login(req, res, next) {
    validateFields(req, ["email", "password"]);
    const { email, password } = req.body;

    const emp = await prisma.employer.findUnique({
      where: {
        email: email,
      },
      select: {
        password: true,
        id: true,
        email: true,
        companyName: true,
        companyWebsite: true,
        companyAddress: true,
        phone: true,
        companyDescription: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!emp) {
      return next(
        new AppError(`No employer found with this email`, 404)
      );
    }

    const verified = await argon2.verify(emp.password, password);

    if (!verified) {
      return next(new AppError("Wrong Password", 403));
    }

    const token = await jwtFeatures.signToken(emp.id);
    const refreshToken = await jwtFeatures.refreshToken(emp.id);

    await prisma.employer.update({
      where: { email: email },
      data: { refreshToken },
    });

    const authTokenKey = `auth:${emp.id}`;
    await redisClient.set(authTokenKey, token, 60 * 60 * 1);

    emp.password = undefined;
    res.status(200).json({
      status: "OK",
      message: "Login successful.",
      accessToken: token,
      refreshToken,
      data: { employer: emp },
    });
  }

  /**
   * Log employer out
   * @param {req} req
   * @param {res} res
   * @param {next} next
   * @returns
   */
  static async logout(req, res, next) {
    try {
      const empId = req.userId;
      const authTokenKey = `auth:${empId}`;
      await redisClient.del(authTokenKey);
      await prisma.jobSeeker.update({
        where: {
          id: empId,
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
    const emp = await prisma.employer.findFirst({
      where: { refreshToken },
    });
    if (!emp) return next(new AppError("Invalid token", 401));

    const decoded = await jwtFeatures.verifyRefreshToken(
      refreshToken,
      config.jwt.refreshSecretToken
    );
    if (!decoded) return next(new AppError("Refresh Token Expired", 401));

    const newAccessToken = jwtFeatures.signToken(emp.id);
    res.status(200).json({ accessToken: newAccessToken });
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
    const emp = await prisma.employer.findUnique({
      where: {
        email: email,
      },
    });

    if (!emp) {
      return next(new AppError("Employer with this email does not exist", 404));
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const token = resetFunc.generateResetToken(resetToken);

    await redisClient.set(`resetToken:${emp.id}`, token, 60 * 60);

    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/employer/resetPassword/${resetToken}?emp_id=${emp.id}`;

    res.status(200).json({
      status: "success",
      message: "Kindly reset your password using the link provided.",
      resetUrl,
      resetToken,
    });
  }

  static async resetPassword(req, res, next) {
    const resetToken = req.params.token;
    const empId = req.query.emp_id;

    validateFields(req, ["newPassword", "confirmPassword"]);
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return next(new AppError("Passwords do not match", 400));
    }

    if (!resetToken) {
      return next(new AppError("Please provide reset token", 404));
    }

    const storedHash = await redisClient.get(`resetToken:${empId}`);

    if (!storedHash) {
      return next(new AppError("Reset token expired", 403));
    }

    // !. verify reset token
    const verifyToken = resetFunc.verifyResetToken(resetToken, storedHash);

    if (!verifyToken) {
      return next(new AppError("Invalid reset token", 403));
    }

    const emp = await prisma.employer.findUnique({
      where: {
        id: empId,
      },
    });

    if (!emp) {
      return next(new AppError("Employer No Longer Available", 404));
    }

    let hashPassword;
    try {
      hashPassword = await argon2.hash(newPassword, { hashLength: 40 });
    } catch (err) {
      return next(new AppError(err.message, 404));
    }

    await prisma.employer.update({
      where: {
        email: emp.email,
      },
      data: {
        password: hashPassword,
      },
    });

    await redisClient.del(`resetToken:${empId}`);

    res.status(200).json({
      status: "success",
      message: "Employer Password updated successfully.",
    });
  }
}

module.exports = EmployerAuthController;
