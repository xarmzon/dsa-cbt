import Navbar from "./Navbar";
import Logo from "../general/Logo";

const Header = () => {
  return (
    <div className="flex justify-between items-center h-16 fixed top-0 left-0 right-0 w-full bg-primary shadow-lg text-white p-5 z-50">
      <Logo />

      <Navbar />
    </div>
  );
};

export default Header;
