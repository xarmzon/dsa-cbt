import { useState, useRef, useEffect } from "react";
import QuillEditor from "../general/QuillEditor";
import Input from "../controls/Input";
import api from "../../utils/fetcher";
import { ROUTES } from "../../utils/constants";
import { IRegRes } from "./AuthForm";
import { componentsErrors, errorMessage } from "../../utils/errorHandler";
import Alert from "../general/Alert";
import { useSWRConfig } from "swr";
export interface IOptions {
  value: string;
  answer: boolean;
}
export interface IQuestionForm {
  contents: string;
  options: IOptions[];
}

export interface IQEditData extends IQuestionForm {
  id: string;
}
export interface QuestionFormProps {
  optionsNum: number;
  course: string;
  page: number;
  searchVal: string;
  editData: IQEditData;
}
const QuestionForm = (props: QuestionFormProps) => {
  const { mutate } = useSWRConfig();
  const msgRef = useRef<HTMLDivElement | undefined>();
  const [optionsNum, _] = useState(() =>
    Array.from({ length: props.optionsNum })
  );
  const [formData, setFormData] = useState<IQuestionForm>(() => {
    return {
      contents: "",
      options: optionsNum.map(() => ({ value: "", answer: false })),
    };
  });
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [resMsg, setResMsg] = useState<IRegRes>({
    type: "error",
    msg: "",
  });

  useEffect(() => {
    if (props.editData) {
      //console.log(props.editData);
      setFormData((prev) => ({
        contents: props.editData.contents,
        options: props.editData.options,
      }));
      setSubmitText("Update");
      setIsEdit((prev) => true);
    }
    return () =>
      setFormData((prev) => ({
        contents: "",
        options: prev.options.map((d) => ({ answer: false, value: "" })),
      }));
  }, [props.editData]);

  const [submitText, setSubmitText] = useState<string>("Add Question");

  const handleResMsg = () => {
    if (resMsg.msg.length > 0) setResMsg((prev) => ({ ...prev, msg: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleResMsg();
    switch (submitText) {
      case "Add Question":
        setSubmitText("Loading...");
        try {
          const { data } = await api.post(ROUTES.API.QUESTION, {
            course: props.course,
            ...formData,
          });

          mutate(
            `${ROUTES.API.QUESTION}/${props.course}?search=${props.searchVal}&page=${props.page}`
          );
          setResMsg((prev) => ({
            ...prev,
            type: "success",
            msg: data.msg,
          }));
          msgRef?.current?.focus();
          //setFormData((prev) => ({ ...prev, contents: "" }));
        } catch (e) {
          setResMsg((prev) => ({
            ...prev,
            type: "error",
            msg: errorMessage(e),
          }));
        } finally {
          setSubmitText("Add Question");
        }
        break;

      case "Update":
        try {
          setSubmitText("Loading...");
          const fData = { ...formData, qId: props.editData.id };
          //console.log(fData);
          const { data: update } = await api.patch(
            `${ROUTES.API.QUESTION}/${props.course}`,
            fData
          );
          setResMsg((prev) => ({
            ...prev,
            type: "success",
            msg: update.msg,
          }));
          setFormData((prev) => ({
            contents: "",
            options: prev.options.map((d) => ({ answer: false, value: "" })),
          }));
          msgRef?.current?.focus();
          //console.log(update);
          mutate(
            `${ROUTES.API.QUESTION}/${props.course}?search=${props.searchVal}&page=${props.page}`
          );

          setSubmitText("Add Question");
        } catch (e) {
          //console.log(e);
          setSubmitText("Update");
          setResMsg((prev) => ({
            ...prev,
            type: "error",
            msg: errorMessage(e),
          }));
        }
        break;
      default:
        return;
    }
  };

  return (
    <div>
      <div className="w-full md:w-[95%] md:mx-auto max-w-md">
        {resMsg.msg.length > 0 && (
          <div ref={msgRef} tabIndex={-1} className="my-4">
            <Alert type={resMsg.type}>{resMsg.msg}</Alert>
          </div>
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        method="post"
        className="pb-5 flex flex-col md:flex-row md:space-x-3 md:justify-center md:px-2"
      >
        <div className="md:w-4/6">
          <QuillEditor
            value={formData.contents}
            onChange={(
              text: string,
              delta: any,
              source: string,
              editor: any
            ) => {
              handleResMsg();
              setFormData((prev) => ({ ...prev, contents: text }));
            }}
          />
        </div>
        <div className="px-1 pt-3 md:w-2/6 space-y-7">
          {optionsNum.map((_, i) => (
            <div key={i} className="relative">
              <QuillEditor
                theme="bubble"
                className="w-full h-full overflow-y-auto"
                value={formData.options[i]?.value || ""}
                onChange={(value: string) => {
                  handleResMsg();
                  setFormData((prev) => ({
                    ...prev,
                    options: [
                      ...prev.options.map((d, ii) =>
                        ii === i ? { value, answer:d.answer } : d
                      ),
                    ],
                  }));
                }}
              />

              <span className="absolute bottom-0 h-5 p-3 left-0 bg-primary text-gray-100 w-4 flex justify-center items-center">
                {String.fromCharCode(65 + i)}
              </span>
              <input
                checked={isEdit && formData.options[i].answer}
                value={formData.options[i].value}
                onChange={() => {
                  //console.log(formData.options);
                  setFormData((prev) => ({
                    ...prev,
                    options: prev.options.map((dd, iii) => {
                      if (iii === i) dd.answer = true;
                      else dd.answer = false;
                      return dd;
                    }),
                  }));
                }}
                type="radio"
                name="answer"
                className="absolute top-1/2 transform -translate-y-1/2 text-primary right-2 h-4 w-4 rounded-full checked:ring-1 checked:ring-primary"
              />
            </div>
          ))}
          <Input type="submit" name="submit" value={submitText} isBtn />
        </div>
      </form>
    </div>
  );
};

//F(z) = Z^{-1}\left\{\frac{2z}{z-1}\right\}
export default QuestionForm;
