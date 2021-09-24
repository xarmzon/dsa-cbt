export const APP_NAME: string = `De Scholars Academy`;
export const RASTAARC = {
  GITHUB: "https://www.github.com/rastaarc",
  TWITTER: "https://www.twitter.com/rastaarcl",
};
export const ENTITY_NUMBERS = {
  USERNAME_MAX: 15,
  USERNAME_MIN: 6,
  FULLNAME_MAX: 50,
  FULLNAME_MIN: 10,
  PASSWORD_MAX: 15,
  PASSWORD_MIN: 6,
};
export const USER_TYPES = {
  STUDENT: "1",
  ADMIN: "3",
};

export const ROUTES = {
  DASHBOARD: "/dashboard",
  COURSES: "/courses",
  STUDENTS: "/students",
  RESULTS: "/results",
  RESULTS_CHECKER: "/checker",
  ADD_QUESTIONS: "/course/[id]/questions",
  EXAM: "/exam/[id]",
  EXAM_SUMMARY: "/exam/[id]/summary",
  API: {
    ADMIN: "/admin",
    COURSE: "/course",
    QUESTION: "/question",
    STUDENT: "/student",
    RESULT: "/result",
    DASHBOARD: "/dashboard",
  },
};
export const MESSAGES = {
  EXAM_SUCCESSFUL:
    "You have successfully submitted your Exam. Your Result will be passed accross to you.",
  NO_QUESTIONS_YET: "Sorry! No questions for this exam yet. Check back later.",
  EXPIRED_EXAM: "Sorry! the date for this exam has expired.",
  CANT_START_EXAM:
    "Sorry! you can't start this exam yet. Please wait for the starting date of the exam.",
  CANT_REGISTER_EXAM: "Sorry! you can't register for this exam.",
  OLD_STUDENT_SUCCEFUL: "Welcome back, Press Start to continue",
  NEW_STUDENT_SUCCEFUL:
    "Test record added successfully, Press Start to continue",
  CANT_RESIT: "Sorry, you can't re-sit for this course again.",
  ACCOUNT_EXIST:
    "Sorry, An account already exist with one of the details supplied",
  INVALID_REQUEST: "Invalid Request",
  BAD_REQUEST: "Bad Request, please try again with valid request data",
  NO_VALID_CREDENTIALS: "No credentials supplied, Please try again",
  INVALID_CREDENTIALS: "Sorry! Invalid credentials supplied, Please try again",
  INVALID_QUESTION_DATA:
    "Sorry! Invalid Question's data supplied, Please try again",
  INVALID_COURSE: "Sorry! Invalid Course ID supplied, Please try again",
  NEW_ACCOUNT_SUCCESSFUL:
    "Your Account has been created successfully. You can now login with your details.",
  NEW_ACCOUNT_STUDENT_SUCCESSFUL:
    "New Student Account(s) inserted successfully. ",
  LOGOUT_SUCCESSFUL: "Your account has been logged out successfully",
  QUESTION_UPDATED_SUCCESSFUL: "The Question has been updated successfully.",
  COURSE_UPDATED_SUCCESSFUL: "The Course has been updated successfully.",
  NEW_COURSE_SUCCESSFUL:
    "The Course has been created successfully. You can now add the questions.",
  NEW_QUESTION_SUCCESSFUL: "The Question has been inserted successfully.",
  UNKNOWN_ERROR: "Unknown Error occurred. Please try again",
  INVALID_USERNAME: "Invalid Username supplied. Please choose another one",
  INVALID_EMAIL: "Invalid Email supplied. Please try again",
  LOGIN_SUC: "Account Loggedin successfully",
  LOGIN_ERR: "Sorry, Your username or password is incorrect",
  INVALID_EXAM: "Sorry, We can't find the Exam data with the supplied details",
  NO_RESULT: "Sorry, We can't find any Result with the details supplied",
  NO_STUDENT: "Sorry, We can't find any Student with the details supplied",
  NO_USER: "Sorry, We can't find the User with the supplied details",
  USER_EXIST:
    "Sorry! This Username has been registered. Choose another one for your account",
  COURSE_EXIST:
    "Sorry! This course has been registered. Try again with another title",
  STUDENT_UPDATED: "The Student Data has been updated successfully.",
  STUDENT_DELETED: "The Student Data has been deleted successfully.",
  RESULT_DELETED: "The Result has been deleted successfully.",
  COURSE_DELETED: "The Course has been deleted successfully.",
  QUESTION_DELETED: "The Question has been deleted successfully.",
  EMAIL_EXIST:
    "Sorry! This Email has been registered. Choose another one for your account",
  FORM_ERROR: "Please fill the form properly",
  LOGIN_REQUIRED: "Please login first before you can access that page",
  ADMIN_REQUIRED: "Sorry! only Admin can access that page",
  ALREADY_LOGIN: "Please Logout first before you can have access to that page",
  FETCH_LOADING_ERROR:
    "Error Occurred while fetching the data. Please use the refresh button to reload the data",
  FETCH_LOADING_SUCCESS: "Data Fetched successfully",
  FETCH_LOADING_DATA: "Loading Data.........",
  NO_DATA_TO_DISPLAY: "SORRY! NO DATA AVAILABLE TO DISPLAY",
  EXAM_NOT_FOUND: "Oops! We can't find the Exam from the details supplied",
  RESULT_NOT_FOUND: "Oops! We can't find the Result you're looking for",
  COURSE_NOT_FOUND: "Oops! We can't find the Course you're looking for",
  QUESTION_NOT_FOUND: "Oops! We can't find the Question you're looking for",
  GENERAL_ERROR_MESSAGE:
    "Oops! Something went wrong with your request. please try again",
  NO_COURSE_DATA: "No Class Data To Display Right Now",
  METHOD_NOT_ALLOWED: "Sorry, Method not allowed or not yet supported",
  FORM: {
    FULL_NAME: `Invalid full name, please try again with minimum of ${ENTITY_NUMBERS.FULLNAME_MIN} and maximum of ${ENTITY_NUMBERS.FULLNAME_MAX} letters`,
    PHONE_NUMBER: `Invalid Nigeria phone number supplied`,
    USERNAME: `Invalid username supplied, please try again with minimum of ${ENTITY_NUMBERS.USERNAME_MIN} and maximum of ${ENTITY_NUMBERS.USERNAME_MAX} letters`,
    JAMB_NUM: `Invalid JAMB Registration No. supplied, please try again`,
    COURSE: `No course selected. Please select a course`,
    EMAIL: "Invalid email supplied, please try again",
    PASSWORD: `Invalid password, please supplied a minimum of ${
      ENTITY_NUMBERS.PASSWORD_MIN
    } characters with ${1} or more uppercase letters and ${1} or more numbers`,
    CPASSWORD: "The supplied passwords do not match, please try again",
  },
};
export const FETCH_LIMIT = 10;
export const FETCH_SKIP = 10;


export const DESCRIPTIONS: string = `BEST Tutorial Plug on Mathematics, Physics, Chemistry, and Statistics Courses? Created To Tutor, Mentor, Guide, and Lead Students to Obtaining the Best Grades In Their Subjects/Courses. Unilorin, Kwara State, Nigeria`;
