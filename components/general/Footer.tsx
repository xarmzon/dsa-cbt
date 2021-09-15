import Link from "next/link";
import { APP_NAME, RASTAARC } from "../../utils/constants";
const FootyLink = ({ href, children }) => {
  return (
    <li className="group hover:text-gray-50 text-sm mb-2 md:mb-4 md:mt-2">
      <Link href={href}>{children}</Link>
    </li>
  );
};
const Footer = () => {
  return (
    <footer className="mt-2 px-5 md:px-3 flex justify-center text-xs sm:text-sm md:text-lg text-center">
      <p>
        &copy;{new Date().getFullYear()}, {APP_NAME}. All Right Reserved.
        Crafted and Developed by{" "}
        <a
          className="hover:text-ascent-light text-ascent inline-block"
          href={RASTAARC.GITHUB}
          target="_blank"
        >
          Rastaarc
        </a>
      </p>
    </footer>
  );
};

export default Footer;
