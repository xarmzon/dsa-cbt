import { useState, useRef, useEffect } from "react";
import { NextSeo } from "next-seo";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useUser } from "../hooks/auth";
import api from "../utils/fetcher";
import { componentsErrors, errorMessage } from "../utils/errorHandler";
import DataTable from "../components/general/DataTable";
import useSWR, { useSWRConfig } from "swr";
import Alert, { TypeAlert } from "../components/general/Alert";
import Input from "../components/controls/Input";
import { MESSAGES, ROUTES, FETCH_LIMIT } from "../utils/constants";
import { validFullName, validPhoneNumber } from "../utils/auth";
import { IRegRes } from "../components/dashboard/AuthForm";
import { studentDataTableHeader } from "../data/headers";
import dateformat from "dateformat";
import Link from "next/link";
import Papa from "papaparse";
interface IFormData {
  fullName: string;
  phoneNumber: string;
  courseSelections: string;
}
interface IEditData extends IFormData {}
const Students = () => {
  useUser();
  const fileRef = useRef<HTMLInputElement | null>();
  const msgRef = useRef<HTMLDivElement | undefined>();
  //const formRef = useRef<HTMLFor
  const { mutate } = useSWRConfig();

  const [formDataError, setFormDataError] = useState<IFormData>({
    fullName: "",
    phoneNumber: "",
    courseSelections: "",
  });
  const [formData, setFormData] = useState<IFormData>({
    fullName: "",
    phoneNumber: "",
    courseSelections: "",
  });
  const [resMsg, setResMsg] = useState<IRegRes>({
    type: "error",
    msg: "",
  });
  const [submitText, setSubmitText] = useState<string>("Add Student");
  const [searchVal, setSearchVal] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ msg: string; type: TypeAlert }>({
    msg: "",
    type: "info",
  });
  const { data: studentsData, error: studentsDataError } = useSWR(
    `${ROUTES.API.STUDENT}?search=${searchVal}&page=${page}`
  );

  //if (studentsData) console.log(studentsData);
  const [editID, setEditID] = useState<string>("");

  const resetMessage = () => {
    if (message.msg.length > 0)
      setMessage((prev) => ({ msg: "", type: "info" }));
  };

  const handleSearch = async (val: string) => {
    resetMessage();
    setSearchVal(val);
    //setPage(prev=>1);
  };
  const handleEdit = (id: string) => {
    resetMessage();
    const data = studentsData?.results?.filter((v) => v._id === id)[0];
    //console.log(data)
    if (data) {
      setEditID((prev) => data._id);
      setFormData((prev) => ({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        id: data._id,
        courseSelections: data.courseSelections,
      }));
      setSubmitText((prev) => "Update");
    }
  };

  const handleDeleteAll = async (e) => {
    resetMessage();
    if (confirm("Are you sure?")) {
      try {
        setLoading((prev) => true);
        const { data } = await api.delete(
          `${ROUTES.API.STUDENT}?delete_=${"many"}`
        );
        mutate(`${ROUTES.API.STUDENT}?search=${searchVal}&page=${0}`);
        setMessage((prev) => ({ msg: data.msg, type: "success" }));
      } catch (e) {
        setMessage((prev) => ({ msg: errorMessage(e), type: "error" }));
      } finally {
        setLoading((prev) => false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    resetMessage();
    if (confirm("Are you sure?")) {
      try {
        setLoading((prev) => true);
        const { data } = await api.delete(
          `${ROUTES.API.STUDENT}?id=${id}&delete_=${"one"}`
        );
        mutate(`${ROUTES.API.STUDENT}?search=${searchVal}&page=${0}`);
        setMessage((prev) => ({ msg: data.msg, type: "success" }));
      } catch (error) {
        setMessage((prev) => ({ msg: errorMessage(error), type: "error" }));
      } finally {
        setLoading((prev) => false);
      }
    }
  };
  const handlePagination = (page: number) => {
    resetMessage();
    setPage((prev) => page);
  };

  const handleStudentsUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLoading((prev) => true);
    Papa.parse(e.target.files[0], {
      header: true,
      error: function (err) {
        setMessage((prev) => ({
          msg: "Error occurred while uploading the data",
          type: "error",
        }));
        setLoading((prev) => false);
      },
      complete: async function (results) {
        try {
          //console.log(results);
          const { data: upload } = await api.post(ROUTES.API.STUDENT, {
            students: results.data,
            type: "upload",
          });
          setResMsg((prev) => ({
            ...prev,
            type: "success",
            msg: upload.msg,
          }));
          //console.log(uploadMsg);
        } catch (e) {
          setResMsg((prev) => ({
            ...prev,
            type: "error",
            msg: errorMessage(e),
          }));
        } finally {
          setLoading((prev) => false);
        }
      },
    });
    //setSubmitText(prev=>"Upload Student")
  };

  const handleResMsg = () => {
    if (resMsg.msg.length > 0) setResMsg((prev) => ({ ...prev, msg: "" }));
  };

  const handleFormChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formDataError[name].length > 0)
      setFormDataError((prev) => ({ ...prev, [name]: "" }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleResMsg();
    setFormDataError((prev) => ({
      fullName: "",
      phoneNumber: "",
      courseSelections: "",
    }));
    switch (submitText) {
      case "Add Student":
        if (!validFullName(formData.fullName))
          return setFormDataError((prev) => ({
            ...prev,
            fullName: MESSAGES.FORM.FULL_NAME,
          }));
        if (!validPhoneNumber(formData.phoneNumber))
          return setFormDataError((prev) => ({
            ...prev,
            phoneNumber: MESSAGES.FORM.PHONE_NUMBER,
          }));

        try {
          setSubmitText("Loading...");
          const { data } = await api.post(ROUTES.API.STUDENT, {
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            courseSelections: formData.courseSelections,
            type: "add",
          });
          setFormData((prev) => ({
            fullName: "",
            phoneNumber: "",
            courseSelections: "",
          }));
          setResMsg((prev) => ({
            ...prev,
            type: "success",
            msg: data.msg,
          }));
          mutate(`${ROUTES.API.STUDENT}?search=${searchVal}&page=${0}`);
        } catch (e) {
          setResMsg((prev) => ({
            ...prev,
            type: "error",
            msg: errorMessage(e),
          }));
          const componentErr = componentsErrors(e);
          if (componentErr.length > 0) {
            componentErr.map((err) =>
              setFormDataError((prev) => ({
                ...prev,
                [err.type]: err.msg,
              }))
            );
          }
        } finally {
          setSubmitText("Add Student");
        }
        break;

      case "Upload Student":
        mutate(`${ROUTES.API.STUDENT}?search=${searchVal}&page=${0}`);
        break;

      case "Update":
        setSubmitText("Loading...");
        try {
          const { data: update } = await api.patch(ROUTES.API.STUDENT, {
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            courseSelections: formData.courseSelections,
            id: editID,
          });
          setFormData((prev) => ({
            fullName: "",
            phoneNumber: "",
            courseSelections: "",
          }));
          setSubmitText((prev) => "Add Student");
          setResMsg((prev) => ({
            ...prev,
            type: "success",
            msg: update.msg,
          }));
        } catch (e) {
          setSubmitText((prev) => "Update");
          setResMsg((prev) => ({
            ...prev,
            type: "error",
            msg: errorMessage(e),
          }));
          const componentErr = componentsErrors(e);
          if (componentErr.length > 0) {
            componentErr.map((err) =>
              setFormDataError((prev) => ({
                ...prev,
                [err.type]: err.msg,
              }))
            );
          }
        } finally {
          mutate(`${ROUTES.API.STUDENT}?search=${searchVal}&page=${page}`);
        }
        break;
      default:
        return;
    }
  };
  return (
    <>
      <NextSeo title="Students" nofollow={true} noindex={true} />
      <DashboardLayout className="">
        <h2 className="text-lg text-primary mb-5 font-bold">
          Students Management
        </h2>
        <div className="flex flex-col md:flex-row gap-2">
          <section className="bg-white my-5 p-4 shadow-lg w-full md:w-[30%]">
            {resMsg.msg.length > 0 && (
              <div ref={msgRef} tabIndex={-1} className="my-4">
                <Alert type={resMsg.type}>{resMsg.msg}</Alert>
              </div>
            )}
            <form className="space-y-7" onSubmit={handleSubmit}>
              <Input
                error={formDataError.fullName}
                type="text"
                placeholder="Student Full Name"
                showLabel
                labelValue="Full Name"
                name="fullName"
                minLength={7}
                maxLength={50}
                value={formData.fullName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFormChange(e.target.value, e.target.name)
                }
                required
              />
              {/* <Input
                error={formDataError.jamb}
                type="text"
                placeholder="Student JAMB No."
                showLabel
                labelValue="JAMB Reg."
                name="jamb"
                minLength={7}
                maxLength={50}
                value={formData.jamb}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFormChange(e.target.value, e.target.name)
                }
                required
              /> */}
              {/* <Input
                error={formDataError.email}
                type="email"
                placeholder="Student Email"
                showLabel
                labelValue="Email Address"
                name="email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFormChange(e.target.value, e.target.name)
                }
                required
              /> */}
              <Input
                error={formDataError.phoneNumber}
                type="tel"
                placeholder="Student Phone Number"
                showLabel
                labelValue="Phone Number"
                name="phoneNumber"
                minLength={11}
                maxLength={11}
                value={formData.phoneNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFormChange(e.target.value, e.target.name)
                }
                required
              />
              {/* <Input
                error={formDataError.department}
                type="text"
                placeholder="Student Department"
                showLabel
                labelValue="Department"
                name="department"
                value={formData.department}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFormChange(e.target.value, e.target.name)
                }
                required
              /> */}
              {/* <Input
                error={formDataError.faculty}
                type="text"
                placeholder="Student Faculty"
                showLabel
                labelValue="Faculty"
                name="faculty"
                value={formData.faculty}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFormChange(e.target.value, e.target.name)
                }
                required
              /> */}
              <Input
                error={formDataError.courseSelections}
                type="text"
                placeholder="Enter the course separated by ;"
                showLabel
                labelValue="Course Selections"
                name="courseSelections"
                value={formData.courseSelections}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFormChange(e.target.value, e.target.name)
                }
                required
              />

              <Input name="submit" type="submit" value={submitText} isBtn />
              <div className="p-5 flex flex-col justify-center">
                <input
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleStudentsUpload(e)
                  }
                  ref={fileRef}
                  className="hidden"
                  type="file"
                  accept=".csv"
                  name="upload_file"
                />
                <p
                  onClick={() => {
                    setResMsg((prev) => ({ msg: "", type: "info" }));
                    const fBtn = fileRef?.current;
                    if (!loading) fBtn?.click();
                  }}
                  className="mb-2 text-primary text-center cursor-pointer"
                >
                  {loading ? "Loading..." : "Upload Students"}
                </p>
                <p
                  onClick={handleDeleteAll}
                  className="text-primary text-center cursor-pointer"
                >
                  {loading ? "Loading..." : "Delete All Students"}
                </p>
              </div>
            </form>
          </section>
          <section className="bg-white mt-3 p-3 shadow-lg w-full md:w-[70%]">
            <DataTable
              header={studentDataTableHeader}
              loading={
                !studentsDataError && !studentsData
                  ? true
                  : loading
                  ? true
                  : false
              }
              data={
                !studentsDataError && studentsData
                  ? [
                      ...studentsData.results.map((d) => ({
                        id: d._id,
                        values: [
                          d.fullName,
                          d.phoneNumber,
                          <p>
                            {d.courseSelections.split(";").map((d, i) => (
                              <p key={i}>{d}</p>
                            ))}
                          </p>,
                          dateformat(d.createdAt, "mediumDate"),
                        ],
                      })),
                    ]
                  : []
              }
              handlePagination={(page) => handlePagination(page)}
              onSearch={(val) => handleSearch(val)}
              onEdit={(id) => handleEdit(id)}
              onDelete={(id) => handleDelete(id)}
              totalPage={
                studentsData?.paging?.totalPages
                  ? studentsData?.paging?.totalPages
                  : 1
              }
              page={page}
              perPage={
                studentsData?.paging?.perPage
                  ? studentsData?.paging?.perPage
                  : FETCH_LIMIT
              }
              message={message}
            />
          </section>
        </div>
      </DashboardLayout>
      ;
    </>
  );
};

export default Students;
