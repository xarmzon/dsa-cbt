import { useAppSelector } from "../../redux/store";
import Footer from "../general/Footer";
import Loader from "../general/Loader";
import Header from "./Header";
import Sidebar from "./Sidebar";
import AuthForm from "./AuthForm";

const DashboardLayout = (props) => {
  const auth = useAppSelector((state) => state.auth);
  return (
    <div>
      <Header />
      <Sidebar />
      <div className="mt-20 ml-7 p-5 text-secondary min-h-[400px]">
        {auth.isLoading ? (
          <Loader type="book" />
        ) : auth.user ? (
          props.children
        ) : (
          <AuthForm />
        )}
      </div>
      <div className="ml-7 mt-4 p-2 text-center px-4 text-secondary h-14">
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
