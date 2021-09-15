import { useState, useEffect, useRef } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import Result from "../../../models/ResultModel";
import Question from "../../../models/QuestionModel";
import Student from "../../../models/StudentModel";
import { connectDB } from "../../../utils/database";
import { MESSAGES, ROUTES } from "../../../utils/constants";
import { NextSeo } from "next-seo";
import mongoose from "mongoose";
import LinkButton, { ETypes } from "../../../components/general/LinkButton";
import Footer from "../../../components/general/Footer";
import Logo from "../../../components/general/Logo";
import Pagination from "../../../components/general/Pagination";
import api from "../../../utils/fetcher";
import Loader from "../../../components/general/Loader";
import katex from "katex";
import "katex/dist/katex.css";
import ExamTimer from "../../../components/general/ExamTimer";
export interface ExamPageProps {
  id: string;
  examData: string;
  errorMessage: string;
  examTitle: string;
  studentSubmitted: boolean;
  children?: React.ReactNode;
}

const ExamPage = ({
  id,
  children,
  examData,
  errorMessage,
  examTitle,
  studentSubmitted,
}: ExamPageProps) => {
  const submitRef = useRef<HTMLButtonElement | null>();
  const [questions, _q] = useState(() => JSON.parse(examData).questions || []);
  const [student, _s] = useState(
    () =>
      JSON.parse(examData).student || {
        fullName: "",
        phoneNumber: "",
        id: "",
      }
  );
  const [course, _c] = useState(
    () =>
      JSON.parse(examData).course || {
        timeAllowed: 0,
        id: "",
      }
  );

  const [stopTime, setStopTime] = useState<boolean>(false);
  const [totalQuestions, _t] = useState(() => questions.length);
  const [studentAnswers, setStudentAnswers] = useState(
    Array.from({ length: totalQuestions }, () => ({ value: "", answer: false }))
  );
  const [currentPosition, setCurrentPosition] = useState(0);
  const [submitText, setSubmitText] = useState(() =>
    studentSubmitted ? "Done" : "Submit"
  );
  const [submitError, setSubmitError] = useState<boolean>(false);

  const submitAnswer = () => {
    const btn = submitRef.current;
    btn?.click();
  };
  const handleAnswer = (answer: boolean, pos: number, value: string) => {
    const data = studentAnswers.map((v, i) => {
      if (i === pos) return { answer, value };
      else return v;
    });
    setStudentAnswers((prev) => [...data]);
  };
  const handlePagination = (question: number, type: string) => {
    setCurrentPosition(question - 1);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    switch (submitText) {
      case "Submit":
        if (!stopTime) setStopTime((prev) => true);
        setSubmitText("Loading...");
        try {
          const { data } = await api.patch(ROUTES.API.RESULT, {
            course: course.id,
            exam: id,
            answers: JSON.stringify(studentAnswers),
          });
          setSubmitText("Done");
          localStorage.removeItem("timer");
        } catch (err) {
          setSubmitError(true);
          setSubmitText("Submit");
          //console.log(err);
        }
        break;
      default:
        return;
    }
  };

  return (
    <div>
      <NextSeo title={`${examTitle} Exam`} />
      <header className="fixed top-0 left-0 right-0 w-full p-5 h-16 bg-primary text-gray-50">
        <div className="container flex justify-between items-center">
          <div>
            <Logo />
          </div>
        </div>
      </header>
      <main className="container mt-20 p-4 md:p-4 space-y-8 w-full mb-12">
        {errorMessage.length > 0 ? (
          <div className="w-full flex flex-col items-center justify-center font-bold text-red-700 text-center mt-32 lg:mt-44">
            {errorMessage}
            <p className="mt-4 font-normal">
              <LinkButton
                href="/"
                txt="Pick Another Course"
                type={ETypes.PRIMARY}
                rounded
              />
            </p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row md:justify-between space-y-3 w-full">
              <div className="ring-1 ring-primary shadow-md text-secondary px-4 pt-4 space-y-3 w-full">
                <p>
                  <span className="font-bold text-primary inline-block pr-3">
                    Full Name:{" "}
                  </span>
                  {student.fullName}
                </p>
                <p>
                  <span className="font-bold text-primary inline-block pr-3">
                    Phone Number:{" "}
                  </span>
                  {student.phoneNumber}
                </p>
                <p>
                  <span className="font-bold text-primary inline-block pr-3">
                    Course:{" "}
                  </span>
                  {examTitle}
                </p>
                {/* <p>
                  <span className="font-bold text-primary inline-block pr-3">
                    Time Allowed:{" "}
                  </span>
                  {course.timeAllowed}mins
                </p> */}
                <div className="w-full flex flex-col justify-center items-center p-2">
                  <ExamTimer
                    user={{id:student.id, course:course.id}}
                    stopTime={stopTime}
                    expiryTime={course.timeAllowed}
                    onExpired={submitAnswer}
                  />
                </div>
              </div>
            </div>
            {submitText === "Loading..." ? (
              <div className="mt-8 space-y-5 text-center font-bold text-secondary">
                <Loader text="Submitting..." type="book" />
              </div>
            ) : submitText === "Done" ? (
              <div className="mt-8 space-y-5 text-center">
                <p className="text-green-700 ">{MESSAGES.EXAM_SUCCESSFUL}</p>
                <p>
                  <LinkButton
                    href="/"
                    txt="Pick Another Course"
                    type={ETypes.PRIMARY}
                    rounded
                  />
                </p>
              </div>
            ) : (
              <div>
                {submitError ? (
                  <div className="space-y-7 mt-14 text-red-700 text-center flex flex-col justify-center items-center">
                    <p className="font-bold">
                      Error occurred while submitting your answers. Please try
                      again by clicking the button below.
                    </p>
                    <button
                      onClick={handleSubmit}
                      className="bg-primary px-3 py-1 rounded text-gray-100 hover:text-primary hover:bg-ascent-light"
                    >
                      Submit
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between mb-4 mt-7 items-center">
                      <button
                        ref={submitRef}
                        onClick={handleSubmit}
                        className="bg-primary px-3 py-1 rounded text-gray-100 hover:text-primary hover:bg-ascent-light"
                      >
                        Submit
                      </button>
                      <p className="font-bold text-secondary">
                        Question {currentPosition + 1} of {totalQuestions}
                      </p>
                    </div>
                    <div
                      className="ring-1 ring-primary p-5 mb-4"
                      dangerouslySetInnerHTML={{
                        __html: questions[currentPosition].question,
                      }}
                    ></div>
                    <div className="mb-8">
                      <ul className="space-y-4">
                        {questions[currentPosition].options.map(
                          (
                            op: { value: string; answer: boolean },
                            i: number
                          ) => (
                            <li
                              key={i + +op.answer + currentPosition + op.value}
                              className="space-x-3 flex items-center"
                            >
                              {/* <span className="">
                            {String.fromCharCode(i + 65)}
                          </span> */}
                              <input
                                className="text-primary"
                                name="answer"
                                type="radio"
                                checked={
                                  op.value ===
                                    studentAnswers[currentPosition].value &&
                                  op.answer ===
                                    studentAnswers[currentPosition].answer
                                }
                                value={op.value}
                                onChange={() =>
                                  handleAnswer(
                                    op.answer,
                                    currentPosition,
                                    op.value
                                  )
                                }
                              />
                              <span
                                className=""
                                dangerouslySetInnerHTML={{ __html: op.value }}
                              ></span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                    <div className="my-7 text-center flex justify-center items-center">
                      <Pagination
                        totalPage={totalQuestions > 0 ? totalQuestions : 1}
                        onClick={handlePagination}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <div className="fixed bottom-0 p-5 py-1 left-0 right-0 bg-gray-100 mt-7">
        <Footer />
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  await connectDB();
  const { id } = context.params;
  const examData = {
    course: null,
    student: null,
    questions: null,
  };
  let errorMessage: string = "";
  let examTitle: string = "Unknown";
  let studentSubmitted: boolean = true;
  try {
    const examId =
      id.length > 24 || id.length < 24 ? "61dddddddd44444444343434" : id;
    const exam = await Result.findById(examId).populate("course");
    if (exam) {
      examTitle = exam.course.title;
      const startDateDiff = +new Date(exam.course.startDate) - +new Date();
      if (startDateDiff > 0) {
        errorMessage = MESSAGES.CANT_START_EXAM;
      } else {
        const dueDateDiff = +new Date(exam.course.dueDate) - +new Date();
        if (dueDateDiff < 0) {
          errorMessage = MESSAGES.EXPIRED_EXAM;
        } else {
          if (exam.score < 0) {
            studentSubmitted = false;
            const questions = await Question.aggregate([
              {
                $match: {
                  course: new mongoose.Types.ObjectId(exam.course._id),
                },
              },
              { $sample: { size: exam.course.questionNum || 10 } },
            ]).exec();

            if (questions.length <= 0) {
              errorMessage = MESSAGES.NO_QUESTIONS_YET;
            } else {
              examData.questions = questions.map((q) => ({
                id: q._id,
                question: q.contents,
                options: q.options.map((qq) => ({
                  answer: qq.answer,
                  value: qq.value,
                })),
              }));
            }
          }
          const student = await Student.findById(exam.student);
          examData.student = {
            fullName: student.fullName,
            phoneNumber: student.phoneNumber,
            id: student._id,
          };
          examData.course = {
            id: exam.course._id,
            timeAllowed: exam.course.timeAllowed,
          };
        }
      }
    } else {
      errorMessage = MESSAGES.INVALID_EXAM;
    }
  } catch (e) {
    errorMessage = MESSAGES.FETCH_LOADING_ERROR;
    console.log(e);
  }
  return {
    props: {
      id,
      examData: JSON.stringify(examData),
      errorMessage,
      examTitle,
      studentSubmitted,
    },
  };
};

export default ExamPage;
