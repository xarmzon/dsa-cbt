import Input from "../controls/Input";
import { useState, useEffect, useRef } from "react";
import api from "../../utils/fetcher";
import { ROUTES } from "../../utils/constants";
import { componentsErrors, errorMessage } from "../../utils/errorHandler";
import { IRegRes } from "./AuthForm";
import Alert from "../general/Alert";
import { useRouter } from "next/router";
import { useSWRConfig } from "swr";
export interface ICourse {
  msg: string;
  value: string;
}

export interface IFormData {
  title: string;
  questionNum: string;
  optionNum: string;
  startDate: string;
  dueDate: string;
  timeAllowed: string;
}

export interface EditData extends IFormData {
  _id: string;
}

export interface AddCourseFormProps {
  editData?: EditData;
  children?: React.ReactNode;
  isUpdate?: boolean;
  searchVal: string;
  page: number;
}

const AddCourseForm = ({
  page,
  searchVal,
  editData,
  isUpdate = false,
}: AddCourseFormProps) => {
  const { mutate } = useSWRConfig();

  const messageRef = useRef<HTMLDivElement | undefined>();
  const router = useRouter();
  const [submitText, setSubmitText] = useState<string>(() =>
    isUpdate ? "Update" : "Add Course"
  );
  const [errors, setErrors] = useState<IFormData>({
    title: "",
    questionNum: "",
    optionNum: "",
    startDate: "",
    dueDate: "",
    timeAllowed: "",
  });
  const [formData, setFormData] = useState<IFormData>({
    title: "",
    questionNum: "",
    optionNum: "",
    startDate: "",
    dueDate: "",
    timeAllowed: "",
  });
  const [courseId, setCourseId] = useState<string>("");
  const [resMsg, setResMsg] = useState<IRegRes>({
    type: "error",
    msg: "",
  });

  useEffect(() => {
    if (editData) {
      //console.log(editData);
      setFormData((prev) => ({
        title: editData.title,
        questionNum: editData.questionNum,
        optionNum: editData.optionNum,
        startDate: editData.startDate,
        dueDate: editData.dueDate,
        timeAllowed: editData.timeAllowed,
      }));
      setSubmitText("Update");
    }
  }, [editData]);

  const handleChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    handleResMsg();
  };
  const handleResMsg = () => {
    if (resMsg.msg.length > 0) setResMsg((prev) => ({ ...prev, msg: "" }));
  };
  const resetFormData = () => {
    setFormData({
      title: "",
      questionNum: "",
      optionNum: "",
      startDate: "",
      dueDate: "",
      timeAllowed: "",
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    handleResMsg();
    switch (submitText) {
      case "Add Course":
        try {
          setSubmitText("Loading...");
          const { data } = await api.post(ROUTES.API.ADMIN, {
            ...formData,
            type: "addCourse",
          });
          setCourseId(data.course._id);
          setSubmitText("Add Questions");
          //resetFormData();
        } catch (e) {
          setSubmitText("Add Course");
          const componentErr = componentsErrors(e);
          if (componentErr.length > 0) {
            componentErr.map((err) =>
              setErrors((prev) => ({
                ...prev,
                [err.type]: err.msg,
              }))
            );
          }
          setResMsg((prev) => ({
            ...prev,
            type: "error",
            msg: errorMessage(e),
          }));
        } finally {
          const div = messageRef.current;
          div.focus();
        }
        break;
      case "Add Questions":
        setSubmitText("Loading...");
        router.push({
          pathname: ROUTES.ADD_QUESTIONS,
          query: { id: courseId },
        });
        break;

      case "Update":
        try {
          setSubmitText("Loading...");
          const { data: updateData } = await api.patch(ROUTES.API.ADMIN, {
            ...formData,
            _id: editData._id,
            update: "course",
          });
          setResMsg((prev) => ({
            ...prev,
            type: "success",
            msg: updateData.msg,
          }));
          resetFormData();
          setSubmitText("Add Course");
          mutate(`${ROUTES.API.COURSE}?search=${searchVal}&page=${page}`);
        } catch (e) {
          setSubmitText("Update");
          const componentErr = componentsErrors(e);
          if (componentErr.length > 0) {
            componentErr.map((err) =>
              setErrors((prev) => ({
                ...prev,
                [err.type]: err.msg,
              }))
            );
          }
          setResMsg((prev) => ({
            ...prev,
            type: "error",
            msg: errorMessage(e),
          }));
          //console.log(err);
        } finally {
          const div = messageRef.current;
          div.focus();
        }
        break;
      default:
        return;
    }
  };
  return (
    <div tabIndex={-1} ref={messageRef} className="w-full space-y-4">
      {resMsg.msg.length > 0 && (
        <div className="my-4">
          <Alert type={resMsg.type}>{resMsg.msg}</Alert>
        </div>
      )}
      <form
        method="post"
        onSubmit={handleSubmit}
        className="w-full h-full space-y-5"
      >
        <Input
          value={formData.title}
          name="title"
          type="text"
          showLabel
          labelValue="Course Title"
          placeholder="Eg: MAT413-2"
          required
          error={errors.title}
          onChange={(e) => handleChange(e.target.value, e.target.name)}
        />
        <Input
          value={formData.questionNum}
          name="questionNum"
          showLabel
          type="number"
          min="5"
          labelValue="Number of Questions"
          placeholder="Eg: 20"
          required
          error={errors.questionNum}
          onChange={(e) => handleChange(e.target.value, e.target.name)}
        />
        <Input
          value={formData.optionNum}
          name="optionNum"
          showLabel
          type="number"
          labelValue="Number of Options"
          placeholder="Eg: 4 for ABCD"
          required
          error={errors.optionNum}
          onChange={(e) => handleChange(e.target.value, e.target.name)}
        />
        <Input
          value={formData.startDate}
          name="startDate"
          showLabel
          type="date"
          labelValue="Starts Date"
          placeholder="Eg: 2021-05-20"
          required
          error={errors.startDate}
          onChange={(e) => handleChange(e.target.value, e.target.name)}
        />
        <Input
          value={formData.dueDate}
          name="dueDate"
          showLabel
          type="date"
          labelValue="Ends Date"
          placeholder="Eg: 2021-05-20"
          required
          error={errors.dueDate}
          onChange={(e) => handleChange(e.target.value, e.target.name)}
        />
        <Input
          value={formData.timeAllowed}
          name="timeAllowed"
          showLabel
          type="number"
          min="0"
          labelValue="Time Allowed(min)"
          placeholder="Eg: 30"
          required
          error={errors.timeAllowed}
          onChange={(e) => handleChange(e.target.value, e.target.name)}
        />
        <Input type="submit" name="submit" value={submitText} isBtn />
      </form>
    </div>
  );
};

export default AddCourseForm;
