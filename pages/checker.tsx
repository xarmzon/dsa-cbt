import { useState, useRef, useEffect } from "react";
import { NextSeo } from "next-seo";
import Input from "../components/controls/Input";
import Footer from "../components/general/Footer";
import Logo from "../components/general/Logo";
import { IRegRes } from "../components/dashboard/AuthForm";
import Alert from "../components/general/Alert";
import api from "../utils/fetcher";
import { APP_NAME, ROUTES } from "../utils/constants";
import { errorMessage } from "../utils/errorHandler";

interface IData {
  value: string;
  error: string;
}

interface R {
  _id: string;
  score: number;
  course: string;
}
interface RData {
  fullName: string;
  phoneNumber: string;
  results: Array<R>;
}
const sText = "Submit";
const ResultChecker = () => {
  const msgRef = useRef<HTMLDivElement | undefined>();

  const [resultsData, setResultsData] = useState<RData | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<IData>({
    value: "",
    error: "",
  });
  const [submitText, setSubmitText] = useState<string>(sText);
  const [resMsg, setResMsg] = useState<IRegRes>({
    type: "error",
    msg: "",
  });
  const handleResMsg = () => {
    if (resMsg.msg.length > 0) setResMsg((prev) => ({ ...prev, msg: "" }));
  };
  const resetFormError = () => {
    if (phoneNumber.error.length > 0)
      setPhoneNumber((prev) => ({ ...prev, error: "" }));
  };
  const restResMsg = () => {
    if (resMsg.msg.length > 0) setResMsg((prev) => ({ msg: "", type: "info" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormError();
    restResMsg();
    handleResMsg();
    switch (submitText) {
      case sText:
        try {
          setResultsData(null);
          setSubmitText("Loading...");
          const { data } = await api.post(ROUTES.API.RESULT, {
            phoneNumber: phoneNumber.value,
          });
          console.log(data.result);
          setResultsData(data.result);
          //setResMsg((prev) => ({ msg: data.msg, type: "success" }));
        } catch (e) {
          setResMsg((prev) => ({ msg: errorMessage(e), type: "error" }));
        } finally {
          setSubmitText(sText);
        }
        break;
      default:
        return;
    }
  };
  return (
    <>
      <NextSeo title="Results Checker" />
      <div className="bg-book bg-no-repeat bg-cover bg-primary bg-blend-multiply backdrop-filter backdrop-blur-[3px] flex flex-col items-center justify-center min-h-screen p-5">
        <div className="mb-4">
        <Logo size="large" rounded />
        </div>
        <div className="text-primary space-y-4 w-full max-w-lg min-h-[300px] bg-gray-50 bg-opacity-95 backdrop-filter backdrop-blur-sm p-5 rounded-md">
          <h1 className="text-center text-primary text-xl font-bold pt-3 mb-2">
            Check My Results
          </h1>
          <div className="my-4">
            {resMsg.msg.length > 0 && (
              <div ref={msgRef} tabIndex={-1} className="my-4">
                <Alert type={resMsg.type}>{resMsg.msg}</Alert>
              </div>
            )}
          </div>
          <div className="mt-5 w-full">
            <form className="space-y-8" onSubmit={handleSubmit}>
              <Input
                placeholder="Phone Number"
                showLabel
                name="phoneNumber"
                labelValue="Phone Number"
                value={phoneNumber.value}
                onChange={(e) =>
                  setPhoneNumber((prev) => ({
                    value: e.target.value,
                    error: "",
                  }))
                }
                error={phoneNumber.error}
              />
              <Input type="submit" name="submit" value={submitText} isBtn />
            </form>
          </div>
          {resultsData && submitText !== "Loading..." && (
            <div className="overflow-x-auto mt-10">
              <h1 className="text-lg px-3 font-bold text-center mb-4">
                {APP_NAME} Results Notification
              </h1>
              <div className="px-3">
                <div className="text-secondary space-y-2 mb-5">
                  <p className="flex">
                    <span className="w-2/5 flex-shrink-0"> Name: </span>
                    <span className="3/5 flex-shrink-0 font-bold px-3 flex-wrap">
                      {resultsData.fullName}
                    </span>
                  </p>

                  <p className="flex">
                    <span className="w-2/5 flex-shrink-0"> Phone Number: </span>
                    <span className="3/5 flex-shrink-0 font-bold px-3">
                      {resultsData.phoneNumber}
                    </span>
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-secondary">Results</h4>
                  <ul className="mb-5">
                    {resultsData.results.map((d, i) => (
                      <li key={i} className="mb-2 space-x-4">
                        <span className="">{d.course}</span>
                        <span
                          className={`font-bold ${
                            d.score >= 70
                              ? "text-green-600"
                              : d.score < 70 && d.score >= 60
                              ? "text-secondary"
                              : d.score < 60 && d.score >= 50
                              ? "text-ascent"
                              : "text-red-600"
                          }`}
                        >
                          {d.score}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="text-gray-200 mt-9 max-w-md mx-auto text-center">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default ResultChecker;
