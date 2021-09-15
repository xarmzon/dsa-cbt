import { GetServerSideProps } from "next";
import { useState, useRef, useEffect } from "react";
import { NextSeo } from "next-seo";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useUser } from "../hooks/auth";
import Result from "../models/ResultModel";
import { connectDB } from "../utils/database";
import useSWR, { useSWRConfig } from "swr";
import { TypeAlert } from "../components/general/Alert";
import DataTable from "../components/general/DataTable";
import { resultDataTableHeader } from "../data/headers";
import { getResultsData, IResultModelOptions } from "./api/result";
import { FETCH_LIMIT, ROUTES } from "../utils/constants";
import dateformat from "dateformat";
import api from "../utils/fetcher";
import { errorMessage } from "../utils/errorHandler";
export interface ResultsProps {
  results: string;
  children?: React.ReactNode;
}

const Results = ({ results }: ResultsProps) => {
  useUser();

  const { mutate } = useSWRConfig();

  const [searchVal, setSearchVal] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ msg: string; type: TypeAlert }>({
    msg: "",
    type: "info",
  });

  const { data: resultsData, error: resultsDataError } = useSWR(
    `${ROUTES.API.RESULT}?search=${searchVal}&page=${page}`
  );

  const resetMessage = () => {
    if (message.msg.length > 0)
      setMessage((prev) => ({ msg: "", type: "info" }));
  };

  const handleSearch = async (val: string) => {
    resetMessage();
    setSearchVal(val);
  };
  const handleEdit = (id: string) => {
    resetMessage();
  };
  const handleDelete = async (id: string) => {
    resetMessage();
    if (confirm("Are you sure?")) {
      try {
        setLoading((prev) => true);
        const { data } = await api.delete(`${ROUTES.API.RESULT}?id=${id}`);
        mutate(`${ROUTES.API.RESULT}?search=${searchVal}&page=${1}`);
        setMessage((prev) => ({ msg: data.msg, type: "success" }));
      } catch (e) {
        mutate(`${ROUTES.API.RESULT}?search=${searchVal}&page=${page}`);
        setMessage((prev) => ({ msg: errorMessage(e), type: "error" }));
      } finally {
        setLoading((prev) => false);
      }
    }
  };
  const handlePagination = (page: number) => {
    resetMessage();
    setPage((prev) => page);
  };

  return (
    <>
      <NextSeo title="Results" nofollow={true} noindex={true} />
      <DashboardLayout>
        <h2 className="text-lg text-primary mb-5 font-bold">
          Results Management
        </h2>
        <div className="w-full space-y-2 mt-4" onClick={() => resetMessage()}>
          <div className="w-full bg-white shadow-lg p-3">
            <DataTable
              showEdit={false}
              loading={
                !resultsDataError && !resultsData
                  ? true
                  : loading
                  ? true
                  : false
              }
              header={resultDataTableHeader}
              data={
                resultsData && resultsData.items?.length > 0
                  ? resultsData.items.map((d, i) => {
                      return {
                        id: d.result._id,
                        values: [
                          d.fullName,
                          d.phoneNumber,
                          d.result.course.title,
                          <span
                            className={`${
                              d.result.status === "Submitted"
                                ? "text-green-700"
                                : "text-yellow-600"
                            }`}
                          >
                            {d.result.status}
                          </span>,
                          <span
                            className={`${
                              d.result.score === "---"
                                ? "text-gray-400"
                                : d.result.score >= 70
                                ? "text-green-700"
                                : d.result.score < 70 && d.result.score >= 60
                                ? "text-primary"
                                : d.result.score < 60 && d.result.score >= 50
                                ? "text-yellow-700"
                                : "text-red-700"
                            }`}
                          >
                            {d.result.score}
                          </span>,
                          d.result.course.questionNum,
                          dateformat(d.result.examAddedAt, "mediumDate"),
                        ],
                      };
                    })
                  : []
              }
              onSearch={(val: string) => handleSearch(val)}
              handlePagination={(page: number) => handlePagination(page)}
              onDelete={(id: string) => handleDelete(id)}
              onEdit={(id: string) => handleEdit(id)}
              message={message}
              totalPage={
                !resultsDataError &&
                resultsData &&
                resultsData?.paging?.totalPages
                  ? resultsData?.paging?.totalPages
                  : 1
              }
              page={page}
              perPage={
                !resultsDataError && resultsData && resultsData?.paging?.perPage
                  ? resultsData?.paging?.perPage
                  : FETCH_LIMIT
              }
            />
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  await connectDB();
  const page: number = 1;
  const perPage: number = FETCH_LIMIT;

  //const searchTerm = "ade";
  const modelOptions: IResultModelOptions = {
    // match: {
    //   $or: [
    //     { fullName: { $regex: searchTerm, $options: "i" } },
    //     { phoneNumber: { $regex: searchTerm, $options: "i" } },
    //   ],
    // },
  };
  const results = await getResultsData(page - 1, perPage, modelOptions);
  //console.log(results);
  return {
    props: {
      results: JSON.stringify(results),
    },
  };
};

export default Results;
