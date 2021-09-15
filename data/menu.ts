import React from "react";
import {
  HiOutlineChartPie,
  HiOutlineBookOpen,
  HiOutlineUserGroup,
  HiOutlineUsers,
} from "react-icons/hi";

import { ROUTES, USER_TYPES } from "./../utils/constants";
export interface IMenu {
  link: string;
  for: string;
  text: string;
  Icon: React.FC;
}
export const menu: IMenu[] = [
  {
    link: ROUTES.DASHBOARD,
    for: USER_TYPES.ADMIN,
    text: "Dashboard",
    Icon: HiOutlineChartPie,
  },
  {
    link: ROUTES.COURSES,
    for: USER_TYPES.ADMIN,
    text: "Courses",
    Icon: HiOutlineBookOpen,
  },
  {
    link: ROUTES.RESULTS,
    for: USER_TYPES.ADMIN,
    text: "Results",
    Icon: HiOutlineUsers,
  },
];
