const prisma = require("../../prisma/client");
const AppError = require("../../utils/AppError");
const argon2 = require("argon2");
const ApiFeatures = require("../../utils/apiFeatures");
const { monthlyApplicantData, averageSalary } = require("../../utils/helpers/utils");

class EmployerController {
  /**
   * Get all employers
   * @param {req} req
   * @param {res} res
   */
  static async allEmployers(req, res) {
    const features = new ApiFeatures(req.query).pagination().sorting();
    let employers = await prisma.employer.findMany(features.queryOptions);

    res.status(200).json({
      status: "OK",
      message: "All employers",
      count: employers.length,
      data: {
        employers,
      },
    });
  }

  /**
   * Get employer by id
   * @param {req} req
   * @param {res} res
   * @param {next} next
   * @returns
   */

  static async employerById(req, res, next) {
    const employer = await prisma.employer.findUnique({
      where: {
        id: req.userId,
      },
      include: {
        jobsPosted: {
          include: {
            applications: true,
            jobCategory: true,
          },
        },
      },
    });

    if (!employer) {
      return next(new AppError(`No employer Found with id:${req.userId}`), 404);
    }

    res.status(200).json({
      status: "OK",
      message: "Employer Profile",
      data: {
        employer,
      },
    });
  }

  /**
   * Update employer details
   * @param {req} req
   * @param {res} res
   * @param {next} next
   * @returns
   */

  static async updateEmployer(req, res, next) {
    const employer = await prisma.employer.findUnique({
      where: {
        id: req.userId,
      },
    });
    if (!employer) {
      return next(new AppError(`No Employer Found with id:${req.userId}`), 404);
    }

    const { password, createdAt, updatedAt, ...rest } = req.body;

    if (createdAt || updatedAt) {
      return next(
        new AppError("You cannot update createdAt or updatedAt", 404)
      );
    }

    let hashPassword;
    if (password) {
      try {
        hashPassword = await argon2.hash(password, { hashLength: 40 });
        rest.password = hashPassword;
      } catch (err) {
        return next(new AppError(err.message, 404));
      }
    }

    const updated = await prisma.employer.update({
      where: {
        email: employer.email,
      },
      data: { ...rest },
    });

    res.status(200).json({
      status: "OK",
      message: "Employer details updated successfully.",
      data: {
        employer: updated,
      },
    });
  }

  /**
   * Delete employer account
   * @param {req} req
   * @param {res} res
   */
  static async deleteEmployer(req, res) {
    await prisma.employer.delete({
      where: {
        id: req.userId,
      },
    });

    res.status(204).json({
      status: "OK",
      message: "Employer account deleted successfully.",
    });
  }

  /**
   * Get all jobs posted by an employer
   * @param {req} req
   * @param {res} res
   * @param {next} next
   */

  static async allEmployerJobs(req, res) {
    try {
      const employerJobs = await prisma.employer.findUnique({
        where: {
          id: req.userId,
        },
        include: {
          jobsPosted: {
            include: {
              applications: true,
              jobCategory: true,
            },
          },
        },
      });

      if (!employerJobs) {
        return res.status(404).json({
          status: "error",
          message: "Employer not found",
        });
      }

      const allJobs = employerJobs.jobsPosted;

      res.status(200).json({
        status: "OK",
        message: "All jobs posted",
        count: allJobs.length,
        data: allJobs,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  /**
   * Get all applicants who applied for a job
   * @param {req} req
   * @param {res} res
   * @param {next} next
   */

  static async viewApplicants(req, res, next) {
    const jobId = req.params.jobId;
    const empId = req.userId;

    if (!jobId) {
      return next(new Error("Mising Job Id", 404));
    }
    const jobDetails = await prisma.job.findUnique({
      where: {
        id: jobId,
        employerId: empId,
      },
    });
    const applicants = await prisma.job
      .findUnique({
        where: {
          id: jobId,
          employerId: empId,
        },
      })
      .applications();

    res.status(200).json({
      status: "success",
      message: "All applicants",
      data: {
        title: jobDetails.title,
        applicants,
      },
    });
  }

  /**
   * Get a particular applicant profile who applied for a job
   * @param {req} req
   * @param {res} res
   * @param {next} next
   */
  static async viewApplicantProfile(req, res, next) {
    const { jobSeekerId: userId, jobId } = req.params;

    // Find the applicant and include their details
    const applicant = await prisma.jobSeeker.findUnique({
      where: {
        id: userId,
      },
      omit: {
        refreshToken: true,
      },
      include: {
        address: true,
        skills: true,
        portfolio: true,
        certification: true,
        experience: true,
        education: true,
        applications: {
          where: {
            jobId: jobId, // Filter applications by the specified jobId
          },
        },
      },
    });

    if (!applicant) {
      return next(new AppError(`No Jobseeker Found with id: ${userId}`, 404));
    }

    res.status(200).json({
      status: "OK",
      message: "Job seeker",
      data: {
        applicant,
      },
    });
  }

  /**
   * Get Employer Overview
   * @param {req} req
   * @param {res} res
   * @param {next} next
   */

  static async employerOverview(req, res) {


    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
    ];

    const empId = req.userId;


    // * LOGIC
    const [overview, applicantsPerMonth, jobCategoryData] = await Promise.all([

      // NOTE: Fetch employer overview
      prisma.employer.findUnique({
        where: {
          id: empId,
        },
        select: {
          companyName: true,
          _count: {
            select: {
              jobsPosted: true, // This counts the number of jobs posted by the employer
            },
          },
          jobsPosted: {
            select: {
              _count: {
                select: {
                  applications: true, // This counts the number of applicants per job
                },
              },
              status: true,
            },
          },
        },
      }),

      // NOTE: Fetch the number of applicants per month
      prisma.application.groupBy({
        by: ['createdAt'],
        where: {
          job: {
            employerId: empId,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),

      // NOTE: Fetch the number of jobs in each category
      prisma.jobCategory.findMany({
        where: {
          jobs: {
            some: {
              employerId: empId,
            },
          },
        },
        select: {
          name: true,  // Category name
          jobs: {
            where: {
              employerId: empId,
            },
            select: {
              jobCategory: true// Count of jobs in this category for this employer
            },
          },
        },
      }),
    ]);


    // TODO: Fetch the average salary per month
    const averageSalaryPerMonth = await prisma.job.groupBy({
      by: ['posted'], // Groups jobs by the 'posted' date
      where: {
        employerId: empId, // Filters jobs by the given employer ID
      },
      _max: {
        averagePay: true
      },
      _count: true
    });



    // NOTE Processing the result
    const monthlyApplicants = monthlyApplicantData(applicantsPerMonth, monthNames);
    const averagePay = averageSalary(averageSalaryPerMonth, monthNames);

    console.log(monthlyApplicants);

    // * NOTE Total number of jobs posted by the employer
    const totalJobsPosted = overview._count.jobsPosted;
    const totalApplicants = overview.jobsPosted.reduce(
      (acc, jobsPosted) => acc + jobsPosted._count.applications,
      0
    );

    // * NOTE Count the number of active jobs
    const activeJobs = overview.jobsPosted.filter(
      (job) => job.status === "Active"
    ).length;

    // * NOTE: Count the number of jobs in each category
    const categoryData = jobCategoryData.map(item => {
      return {
        name: item.name,
        count: item.jobs.length
      }
    })



    // NOTE: SEND RESULT
    res.status(200).json({
      status: "success",
      message: "Employer Overview",
      data: {
        totalJobsPosted,
        totalApplicants,
        activeJobs,
        averagePay,
        monthlyApplicants,
        jobCategoryData: categoryData

      },
    });
  }
}

module.exports = EmployerController;
