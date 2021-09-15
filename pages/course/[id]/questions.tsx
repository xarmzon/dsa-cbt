import { NextSeo } from "next-seo";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { useUser } from "../../../hooks/auth";
import { getCourseData } from "../../api/course";
import { connectDB } from "../../../utils/database";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../redux/store";
import { FETCH_LIMIT, MESSAGES, ROUTES } from "../../../utils/constants";
import QuestionForm, {
  IQEditData,
} from "../../../components/dashboard/QuestionForm";
import useSWR from "swr";
import DataTable from "../../../components/general/DataTable";
import { questionDataTableHeader } from "../../../data/headers";
import { TypeAlert } from "../../../components/general/Alert";
import dateformat from "dateformat";
import api from "../../../utils/fetcher";
import { errorMessage } from "../../../utils/errorHandler";
export interface QuestionsProps {
  course: string;
  courseTitle: string;
  children?: React.ReactNode;
}

const Questions = ({ course, children, courseTitle }: QuestionsProps) => {
  const router = useRouter();
  useUser();
  const [courseData, _] = useState(() => JSON.parse(course));
  const loading = useAppSelector((state) => state.auth.isLoading);
  const [searchVal, setSearchVal] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [message, setMessage] = useState<{ msg: string; type: TypeAlert }>({
    msg: "",
    type: "info",
  });
  const [editData, setEditData] = useState<IQEditData>();
  const { data: questionsData, error: questionsError } = useSWR(
    `${ROUTES.API.QUESTION}/${
      courseData._id ? courseData._id : "6"
    }?search=${searchVal}&page=${page}`
  );

  const handleSearch = async (val: string) => {
    resetMessage();
    setSearchVal(val);
  };
  const resetMessage = () => {
    if (message.msg.length > 0)
      setMessage((prev) => ({ msg: "", type: "info" }));
  };
  const handleEdit = async (id: string) => {
    resetMessage();
    const data = questionsData?.results?.filter((d) => d._id === id)[0];
    if (data) {
      setEditData((prev) => ({
        contents: data.contents,
        options: data.options,
        id: data._id,
      }));
    }
  };
  const handleDelete = async (id: string) => {
    resetMessage();
    if (confirm("Are you sure?")) {
      try {
        setLoadingData((prev) => true);
        const { data } = await api.delete(`${ROUTES.API.QUESTION}/${id}`);
        setMessage((prev) => ({ msg: data.msg, type: "success" }));
      } catch (error) {
        setMessage((prev) => ({ msg: errorMessage(error), type: "error" }));
      } finally {
        setLoadingData((prev) => false);
      }
    }
  };
  const handlePagination = (page: number) => {
    resetMessage();
    setPage(page);
  };

  useEffect(() => {
    !loading && !courseData && router.push(ROUTES.COURSES);
    return () => {};
  }, [loading]);

  return (
    <>
      <NextSeo
        title={`${courseTitle} Questions`}
        nofollow={true}
        noindex={true}
      />
      <DashboardLayout>
        {!loading && courseData && (
          <div className="space-y-7 w-full">
            <h2 className="text-lg text-primary font-bold">
              Questions Management
            </h2>
            <div className="w-full">
              <div className="w-full">
                <div className="w-full max-w-md md:mx-auto px-3 py-2 text-secondary ring-2 ring-gray-300 shadow-sm line-clamp-1 font-bold">
                  Course: {courseData.title}
                </div>
              </div>
            </div>
            <div className="w-full">
              <QuestionForm
                editData={editData}
                optionsNum={courseData.option || 4}
                course={courseData._id || "6"}
                page={page}
                searchVal={searchVal}
              />
            </div>
            <div className="w-full bg-white shadow-lg p-3">
              <DataTable
                header={questionDataTableHeader}
                data={
                  !questionsError && !questionsData
                    ? []
                    : questionsData.results.map((d, i) => {
                        return {
                          id: d._id,
                          values: [
                            <span
                              key={d.contents}
                              title={d.contents}
                              className="line-clamp-3"
                              dangerouslySetInnerHTML={{ __html: d.contents }}
                            />,
                            d.options.map((o) => (
                              <span
                                key={o.value}
                                title={o.value}
                                className="block line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: o.value }}
                              />
                            )),
                            <span
                              key={d.content + i}
                              title={
                                d.options.filter((o) => o.answer === true)[0]
                                  ?.value
                              }
                              className="block line-clamp-2"
                              dangerouslySetInnerHTML={{
                                __html: d.options.filter(
                                  (o) => o.answer === true
                                )[0]?.value,
                              }}
                            />,
                            dateformat(d.createdAt, "mediumDate"),
                          ],
                        };
                      })
                }
                loading={
                  !questionsData && !questionsError
                    ? true
                    : !loadingData
                    ? false
                    : true
                }
                page={page}
                perPage={
                  questionsData && questionsData?.paging?.perPage
                    ? questionsData.paging.perPage
                    : FETCH_LIMIT
                }
                totalPage={
                  questionsData && questionsData?.paging?.totalPages
                    ? questionsData.paging.totalPages
                    : 1
                }
                message={message}
                onSearch={(val: string) => handleSearch(val)}
                onEdit={(id: string) => handleEdit(id)}
                onDelete={(id: string) => handleDelete(id)}
                handlePagination={(page: number) => handlePagination(page)}
              />
            </div>
          </div>
        )}
        {!loading && !courseData && (
          <h2 className="text-center text-lg text-primary font-bold">
            {MESSAGES.COURSE_NOT_FOUND}
          </h2>
        )}
      </DashboardLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id: courseId } = context.params;
  await connectDB();
  let course: string;
  let courseTitle: string = "Uknown";
  try {
    const data = await getCourseData(courseId as string);
    if (data) {
      course = JSON.stringify(data);
      courseTitle = data.title;
    }
  } catch {
    course = "";
  }
  //console.log(course);
  return {
    props: {
      course,
      courseTitle,
    },
  };
};

export default Questions;
