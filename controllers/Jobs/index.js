const AppError = require("../../utils/AppError");
const prisma = require("../../prisma/client");
const ApiFeatures = require("../../utils/apiFeatures");
const validateFields = require("../../utils/helpers/validate-req-body");

class JobController {
  /**
   * Get all jobs
   * @param {req} req
   * @param {res} res
   */

  static async allJobs(req, res) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const features = new ApiFeatures(req.query)
      .pagination()
      .sorting()
      .categorySearching();

    const jobs = await prisma.job.findMany(features.queryOptions);

    const jobcount = await prisma.job.count();
    const hasMore = page * limit < jobcount;
    const nextPage = hasMore ? page + 1 : null;

    res.status(200).json({
      status: "success",
      message: jobs.length ? "All Jobs" : "No Available Job",
      total: jobcount,
      count: jobs.length,
      data: jobs,
      hasMore,
      nextPage,
    });
  }
  /**
   * Post new jobs for job seekers
   * @param {req} req
   * @param {res} res
   */
  static async createJob(req, res) {
    const requiredFields = [
      "title",
      "company",
      "pay",
      "type",
      "aboutCompany",
      "location",
      "shortRoleDescription",
      "fullRoleDescription",
      "keyResponsibility",
      "qualificationAndExperience",
      "methodOfApplication",
      "deadline",
      "jobCategoryIds",
    ];
    validateFields(req, requiredFields);

    const { jobCategoryIds, ...data } = req.body;
    const jobs = await prisma.job.create({
      data: {
        ...data,
        employer: { connect: { id: req.userId } },
        jobCategory: { connect: { id: jobCategoryIds } },
      },
      include: {
        // Include JobCategory in the response
        jobCategory: true,
        // employer: true // Optionally include employer details if needed
      },
    });

    res.status(201).json({
      status: "OK",
      message: "Job posted successfully.",
      data: {
        jobs,
      },
    });
  }

  /**
   * Fetch job by ID
   * @param {req} req
   * @param {res} res
   * @param {next} next
   */
  static async jobById(req, res, next) {
    const jobId = req.params.jobId;
    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      include: {
        applications: true,
        jobCategory: true,
      },
    });

    if (!job) {
      return next(new AppError("No job found with the specifid ID", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Job",
      data: {
        job,
      },
    });
  }

  /**
   * Get a single job posted by an employer
   * @param {req} req
   * @param {res} res
   * @param {next} next
   */

  static async employerJobById(req, res) {
    const jobId = req.params.jobId;
    const empJob = await prisma.employer.findUnique({
      where: {
        id: req.userId,
      },
      select: {
        jobsPosted: {
          where: {
            id: jobId,
          },
        },
      },
    });

    res.status(200).json({
      status: "success",
      message: "Employer Job by Id",
      data: empJob,
    });
  }

  /**
   * Update single job posted by an employer
   * @param {req} req
   * @param {res} res
   * @param {next} next
   */

  static async updatejob(req, res) {
    const jobId = req.params.jobId;

    const updated = await prisma.employer.update({
      where: {
        id: req.userId,
      },
      data: {
        jobsPosted: {
          update: {
            where: {
              id: jobId,
            },
            data: {
              ...req.body,
            },
          },
        },
      },
      select: {
        jobsPosted: {
          where: {
            id: jobId,
          },
        },
      },
    });

    res.status(200).json({
      status: "OK",
      message: "Job updated successfully.",
      data: updated,
    });
  }

  /**
   * Delete single job posted by an employer
   * @param {req} req
   * @param {res} res
   * @param {next} next
   */
  static async deleteJob(req, res) {
    const jobId = req.params.jobId;
    await prisma.employer.update({
      where: {
        id: req.userId,
      },
      data: {
        jobsPosted: {
          deleteMany: [{ id: jobId }],
        },
      },
    });
    res.status(204).json({
      status: "OK",
      message: "Message deleted successfully.",
    });
  }

  /**
   * Jobseeker Apply for a particular job
   * @param {req} req
   * @param {res} res
   * @param {next} next
   */
  static async jobApply(req, res, next) {
    const userId = req.userId;
    const jobId = req.params.jobId;

    validateFields(req, ["proposal", "resumeUrl"]);

    const { proposal, resumeUrl } = req.body;

    if (!userId) return next(new AppError("Missing UserID", 404));

    const jobseeker = await prisma.jobSeeker.findUnique({
      where: {
        id: userId,
      },
    });

    if (!jobseeker) return next(new AppError("No jobseeker with this ID", 404));

    if (!jobId) return next(new AppError("Missing JobID", 404));

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) return next(new AppError("No Job match with this Id", 404));

    const applied = await prisma.application.findFirst({
      where: {
        jobSeekerId: jobseeker.id,
        jobId: jobId,
      },
    });


    if (applied) {
      return next(new AppError("You already applied for this job", 403));
    }

    const appliedJob = await prisma.application.create({
      data: {
        firstName: jobseeker.firstName,
        lastName: jobseeker.lastName,
        email: jobseeker.email,
        phone: jobseeker.phone,
        proposal,
        resumeUrl,
        jobSeekerId: userId,
        jobId: jobId,
      },
    });

    res.status(201).json({
      status: "OK",
      message: "Application successful",
      data: appliedJob,
    });
  }

  /**
   * Employer Updates applicant  Status
   * @param {req} req
   * @param {res} res
   * @param {next} next
   */
  static async jobStatusUpdate(req, res, next) {
    const userId = req.userId;
    const jobId = req.params.jobId;
    const applicationId = req.params.applicationId;

    let { status } = req.body;

    if (!status) {
      status = null;
    }

    const empJob = await prisma.job.findUnique({
      where: {
        id: jobId,
        employerId: userId,
      },
    });

    if (!empJob)
      return next(
        new AppError(
          "This Employer does not have Access to this applicant",
          403
        )
      );

    const applicantion = await prisma.application.findUnique({
      where: {
        id: applicationId,
      },
    });

    if (!applicantion)
      return next(
        new AppError("No application with this id Does not Exist", 404)
      );



    const updated = await prisma.application.update({
      where: {
        id: applicationId,
      },
      data: {
        status,
      },
    });

    res.json({
      status: "success",
      message: `Application Status Updated to ${updated.status}`,
      data: {
        updated,
      },
    });
  }

  /**
   * Job Categories
   * @param {req} req
   * @param {res} res
   * @param {next} next
   */

  static async JobCategories(req, res) {
    const features = new ApiFeatures(req.query).sorting();

    const categories = await prisma.jobCategory.findMany(features.queryOptions);

    res.json({
      status: "success",
      count: categories.length,
      data: categories,
    });
  }
}
module.exports = JobController;
