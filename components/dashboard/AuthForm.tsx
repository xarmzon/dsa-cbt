import { useState, useEffect } from "react";
import Input from "../controls/Input";
import api from "../../utils/fetcher";
import { ROUTES } from "../../utils/constants";
import { componentsErrors, errorMessage } from "../../utils/errorHandler";
import { validateRegForm } from "../../utils/auth";
import Alert from "../general/Alert";
import Cookies from "js-cookie";
import { useAppDispatch } from "../../redux/store";
import { setLogin, setUser } from "../../redux/authSlice";
export interface IUser {
  username: string;
  password: string;
}

export interface IRegUser extends IUser {
  email: string;
}

export interface IState {
  login: IUser;
  register: IRegUser;
}

interface IOnchange {
  onChange: (head: string, type: string, value: string) => void;
}

interface ILogin extends IOnchange {
  formData: IUser;
}

interface IReg extends IOnchange {
  formData: IRegUser;
  errors: IError2;
}

interface IError {
  for: string;
  msg: string;
}

interface IError2 {
  username: string;
  email: string;
  password: string;
}
export interface IRegRes {
  type: "error" | "success" | "info";
  msg: string;
}

const Login = ({ formData, onChange }: ILogin) => {
  return (
    <div className="flex flex-col space-y-4">
      <Input
        value={formData.username}
        showLabel
        labelValue="Username"
        name="username"
        required
        onChange={(e) => onChange("login", e.target.name, e.target.value)}
      />
      <Input
        value={formData.password}
        showLabel
        type="password"
        labelValue="Password"
        name="password"
        required
        onChange={(e) => onChange("login", e.target.name, e.target.value)}
      />
    </div>
  );
};

const Register = ({ formData, onChange, errors }: IReg) => {
  return (
    <div className="flex flex-col space-y-4">
      <Input
        value={formData.username}
        showLabel
        labelValue="Username"
        name="username"
        error={errors.username}
        onChange={(e) => onChange("register", e.target.name, e.target.value)}
        required
      />
      <Input
        value={formData.email}
        type="email"
        showLabel
        labelValue="Email"
        name="email"
        error={errors.email}
        onChange={(e) => onChange("register", e.target.name, e.target.value)}
        required
      />
      <Input
        value={formData.password}
        showLabel
        type="password"
        labelValue="Password"
        name="password"
        error={errors.password}
        onChange={(e) => onChange("register", e.target.name, e.target.value)}
        required
      />
    </div>
  );
};

const AuthForm = () => {
  const dispatch = useAppDispatch();
  const [resMsg, setResMsg] = useState<IRegRes>({
    type: "error",
    msg: "",
  });
  const [formType, setFormType] = useState<string>("login");
  const [submitText, setSubmitText] = useState<string>("Login");
  const [errors, setErrors] = useState<IError2>({
    username: "",
    email: "",
    password: "",
  });
  const [formData, setFormData] = useState<IState>({
    login: {
      username: "",
      password: "",
    },
    register: {
      username: "",
      email: "",
      password: "",
    },
  });

  const handleChange = (head: string, type: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [head]: { ...prev[head], [type]: value },
    }));
    if (head === "register") setErrors((prev) => ({ ...prev, [type]: "" }));
    handleResMsg();
  };
  const handleResMsg = () => {
    if (resMsg.msg.length > 0) setResMsg((prev) => ({ ...prev, msg: "" }));
  };
  const resetFormData = () => {
    setFormData({
      login: {
        username: "",
        password: "",
      },
      register: {
        username: "",
        email: "",
        password: "",
      },
    });
  };

  const handleRegistration = async () => {
    const errors_ = validateRegForm(formData.register);
    if (errors_.length > 0) {
      errors_.map((err) =>
        setErrors((prev) => ({
          ...prev,
          [err.type]: err.msg,
        }))
      );
      return;
    }
    setSubmitText("Loading");
    const RegRes = await api.post(ROUTES.API.ADMIN, {
      ...formData.register,
      type: "register",
    });
    resetFormData();
    setResMsg({ type: "success", msg: RegRes.data.msg });
    setSubmitText((prev) => "Login");
    setFormType((prev) => "login");
  };

  useEffect(() => {
    if (formType === "login") setSubmitText("Login");
  }, [formType]);

  const handleLogin = async () => {
    setSubmitText("Loading");
    const loginRes = await api.post(ROUTES.API.ADMIN, {
      ...formData.login,
      type: "login",
    });
    Cookies.set("token", JSON.stringify(loginRes.data.token), {
      expires: 7,
      path: "/",
      sameSite: "strict",
    });
    localStorage.setItem("user", JSON.stringify(loginRes.data.user));
    dispatch(setUser(loginRes.data.user));
    dispatch(setLogin(true));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      handleResMsg();
      switch (submitText) {
        case "Login":
          await handleLogin();
          break;

        case "Register":
          await handleRegistration();
          break;
        default:
          return;
      }
    } catch (e) {
      const componentErr = componentsErrors(e);
      if (componentErr.length > 0) {
        componentErr.map((err) =>
          setErrors((prev) => ({
            ...prev,
            [err.type]: err.msg,
          }))
        );
      }
      setResMsg((prev) => ({ ...prev, type: "error", msg: errorMessage(e) }));
    } finally {
      const text = formType === "login" ? "Login" : "Register";
      setSubmitText(text);
    }
  };

  return (
    <div className="w-full max-w-sm bg-gray-50 text-primary shadow-lg min-h-[10rem] p-5 mx-auto mt-6 rounded-md space-y-5">
      <h2 className="text-center text-xl font-bold">Administrator</h2>
      <p className="text-center text-sm md:text-lg text-secondary">
        Login or Register first in order to have access to the Administrator
        Dashboard
      </p>

      {resMsg.msg.length > 0 && (
        <div className="my-4">
          <Alert type={resMsg.type}>{resMsg.msg}</Alert>
        </div>
      )}
      <form
        method="POST"
        onSubmit={handleSubmit}
        className="flex flex-col space-y-4"
      >
        {formType === "login" ? (
          <Login formData={formData.login} onChange={handleChange} />
        ) : (
          <Register
            errors={errors}
            formData={formData.register}
            onChange={handleChange}
          />
        )}
        <Input type="submit" name="submit" value={submitText} isBtn />
      </form>
      <div className="mt-5 text-center text-sm text-ascent hover:text-ascent-light">
        {formType === "login" ? (
          <p
            onClick={() => {
              setFormType("");
              setSubmitText("Register");
              handleResMsg();
            }}
          >
            Register Here
          </p>
        ) : (
          <p
            onClick={() => {
              setFormType("login");
              setSubmitText("Login");
              handleResMsg();
            }}
          >
            Login Here
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
