import { useState, useEffect, useMemo, useRef } from "react";
import { NextSeo } from "next-seo";
import useSWR from "swr";
import AddCourseForm, { EditData } from "../components/dashboard/AddCourseForm";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import DataTable from "../components/general/DataTable";
import { courseDataTableHeader } from "../data/headers";
import { useUser } from "../hooks/auth";
import { ROUTES, FETCH_LIMIT } from "../utils/constants";
import dateformat from "dateformat";
import api from "../utils/fetcher";
import { useSWRConfig } from "swr";
import { TypeAlert } from "../components/general/Alert";
import { errorMessage } from "../utils/errorHandler";
import Link from "next/link";
const Courses = () => {
  useUser();
  const { mutate } = useSWRConfig();
  const [searchVal, setSearchVal] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ msg: string; type: TypeAlert }>({
    msg: "",
    type: "info",
  });
  const { data: courseData, error: courseError } = useSWR(
    `${ROUTES.API.COURSE}?search=${searchVal}&page=${page}`
  );
  const [editData, setEditData] = useState<EditData>();
  //const [isUpdate, setIsUpdate] = useState<boolean>(false);
  //console.log(data);
  const resetMessage = () => {
    if (message.msg.length > 0)
      setMessage((prev) => ({ msg: "", type: "info" }));
  };

  const handleSearch = async (val: string) => {
    resetMessage();
    setSearchVal(val);
  };
  const handleEdit = async (id: string) => {
    const data = courseData.results.filter((d) => d._id === id)[0];
    setEditData({
      _id: data._id,
      title: data.title,
      optionNum: data.optionNum,
      questionNum: data.questionNum,
      timeAllowed: data.timeAllowed,
      startDate: dateformat(data.startDate, "yyyy-mm-dd"),
      dueDate: dateformat(data.dueDate, "yyyy-mm-dd"),
    });
  };
  const handleDelete = async (id: string) => {
    try {
      resetMessage();
      if (confirm("Are you sure?")) {
        const { data } = await api.delete(`${ROUTES.API.COURSE}?id=${id}`);
        setMessage((prev) => ({ msg: data.msg, type: "success" }));
      }
    } catch (e) {
      setMessage((prev) => ({ msg: errorMessage(e), type: "error" }));
    } finally {
      mutate(`${ROUTES.API.COURSE}?search=${searchVal}&page=${page}`);
      setLoading(false);
    }
  };
  return (
    <>
      <NextSeo title="Courses" nofollow={true} noindex={true} />
      <DashboardLayout>
        <h2 className="text-lg text-primary mb-5 font-bold">
          Course Management
        </h2>

        <div className="flex flex-col md:flex-row space-y-10 md:space-y-0 md:space-x-5">
          <div className="md:w-2/5 flex-shrink-0 space-y-2 min-h-[100px]">
            <h2 className="text-secondary text-sm md:text-lg">New Course</h2>
            <div className="bg-white shadow-lg p-3">
              <AddCourseForm
                editData={editData}
                searchVal={searchVal}
                page={page}
              />
            </div>
          </div>
          <div className="w-full md:w-3/5 space-y-2">
            <h2 className="text-sm md:text-lg text-secondary">Course List</h2>
            <div className="w-full bg-white shadow-lg p-3">
              {/* {!data && !error && "Loading....."}
              {!error && data && JSON.stringify(data, null, 4)} */}
              <DataTable
                header={courseDataTableHeader}
                loading={
                  !courseError && !courseData ? true : loading ? true : false
                }
                data={
                  !courseError && courseData
                    ? [
                        ...courseData.results.map((d) => ({
                          id: d._id,
                          values: [
                            <Link
                              href={{
                                pathname: ROUTES.ADD_QUESTIONS,
                                query: { id: d._id },
                              }}
                            >
                              <a className="underline">{d.title}</a>
                            </Link>,
                            d.questionNum,
                            d.timeAllowed,
                            dateformat(d.startDate, "mediumDate"),
                            dateformat(d.dueDate, "mediumDate"),
                            dateformat(d.createdAt, "mediumDate"),
                          ],
                        })),
                      ]
                    : []
                }
                handlePagination={(page) => {
                  setPage(page);
                  resetMessage();
                }}
                onSearch={(val) => handleSearch(val)}
                onEdit={(id) => handleEdit(id)}
                onDelete={(id) => handleDelete(id)}
                totalPage={
                  courseData?.paging?.totalPages
                    ? courseData?.paging?.totalPages
                    : 1
                }
                page={page}
                perPage={
                  courseData?.paging?.perPage
                    ? courseData?.paging?.perPage
                    : FETCH_LIMIT
                }
                message={message}
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Courses;
