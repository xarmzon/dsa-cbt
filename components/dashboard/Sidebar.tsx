import { useState } from "react";
import { menu } from "../../data/menu";
import Link from "next/link";
import { useRouter } from "next/router";
import { HiChevronDoubleLeft, HiChevronDoubleRight } from "react-icons/hi";

const Sidebar = () => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const handleSidebar = () => setSidebarOpen((prev) => !prev);
  return (
    <aside
      className={`${
        sidebarOpen ? "w-36 md:w-48 shadow-lg" : "w-10 shadow-md"
      } z-40 fixed left-0 top-16 bottom-0 bg-white pt-5 transition-all duration-700`}
    >
      <div className="absolute text-sm md:text-lg top-1 -right-5 h-5 w-5 bg-primary text-gray-50 flex items-center justify-center cursor-pointer">
        {sidebarOpen ? (
          <HiChevronDoubleLeft onClick={handleSidebar} />
        ) : (
          <HiChevronDoubleRight onClick={handleSidebar} />
        )}
      </div>

      <ul
        className={`mt-4 h-72 text-primary overflow-y-auto overflow-x-hidden w-full flex flex-col space-y-3 md:space-y-6`}
      >
        {menu.map((m) => (
          <li key={m.link} title={m.text} onClick={() => setSidebarOpen(false)}>
            <Link href={m.link}>
              <a
                className={`flex items-center space-x-4 md:space-x-5 pl-3 py-3 ${
                  router.pathname === m.link && "bg-primary text-white"
                } md:text-lg lg:text-xl`}
              >
                <span>
                  <m.Icon />
                </span>
                <span>{m.text}</span>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
