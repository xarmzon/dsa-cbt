import { NextSeo } from "next-seo";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useUser } from "../hooks/auth";
import { HiOutlineBookOpen, HiOutlineUsers } from "react-icons/hi";
import useSWR from "swr";
import { ROUTES } from "../utils/constants";
import dateformat from "dateformat";

export type Color = "primary" | "green" | "red" | "yellow";
export interface CardProps {
  head: string;
  children: React.ReactNode;
  color?: Color;
  icon?: React.ReactNode;
}

export interface RecentCardProps {
  header?: string;
  children: React.ReactNode;
}
export interface ListItemProps {
  primaryText: string | React.ReactNode;
  secondaryText: string | React.ReactNode;
}
export interface ListDataProps {
  data: ListItemProps[];
  loading: boolean;
}

const InfoCard = ({ head, children, color = "primary", icon }: CardProps) => {
  return (
    <div
      className={`shadow-md w-full md:min-w-[12rem] min-h-[130px] p-5 rounded ring-1 ${
        color === "primary"
          ? "ring-primary bg-purple-100"
          : color === "green"
          ? "ring-green-800 bg-green-50"
          : color === "red"
          ? "ring-red-800 bg-red-50"
          : "ring-ascent-light bg-yellow-50"
      }`}
    >
      <div className={`flex justify-between`}>
        <p className={`mb-3 text-gray-400 flex-1`}>{head}</p>
        {icon && (
          <p
            className={`font-bold text-3xl ${
              color === "primary"
                ? "text-primary"
                : color === "green"
                ? "text-green-800"
                : color === "red"
                ? "text-red-900"
                : "text-ascent"
            }`}
          >
            {icon}
          </p>
        )}
      </div>
      <div
        className={`mt-2 text-3xl font-bold ${
          color === "primary"
            ? "text-primary"
            : color === "green"
            ? "text-green-600"
            : color === "red"
            ? "text-red-600"
            : "text-ascent"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

const RecentCard = ({ header, children }: RecentCardProps) => {
  return (
    <div className={`bg-gray-50 p-5 shadow-md w-full`}>
      <h4 className={`mb-4 text-gray-400`}>{header}</h4>
      <div className={``}>{children}</div>
    </div>
  );
};

const ListItem = ({ primaryText, secondaryText }: ListItemProps) => {
  return (
    <li className="py-4">
      <p className="font-bold text-primary">{primaryText}</p>
      <p className="text-sm text-secondary mt-1">{secondaryText}</p>
    </li>
  );
};

const ListData = ({ data, loading }: ListDataProps) => {
  return (
    <>
      {loading ? (
        <div className="text-xl mt-5 w-full h-full flex items-center justify-center text-primary font-bold">
          Loading...
        </div>
      ) : (
        data.length > 0 && (
          <ul className="divide-y-2 divide-gray-200">
            {data.map((d, i) => {
              return (
                <ListItem
                  key={i}
                  primaryText={d.primaryText}
                  secondaryText={d.secondaryText}
                />
              );
            })}
          </ul>
        )
      )}
    </>
  );
};

const Dashboard = () => {
  useUser();

  const { data: dashboardData, error: dashboardDataError } = useSWR(
    ROUTES.API.DASHBOARD
  );

  //if (dashboardData) console.log(dashboardData);

  return (
    <>
      <NextSeo title="Dashboard" nofollow={true} noindex={true} />
      <DashboardLayout>
        <h2 className="text-lg text-primary mb-5 font-bold">Dashboard</h2>
        <div className={`flex flex-col  sm:flex-row gap-5 w-full`}>
          <InfoCard head="Courses" color="primary" icon={<HiOutlineBookOpen />}>
            {!dashboardDataError && !dashboardData && "Loading..."}
            {!dashboardDataError && dashboardData && dashboardData.totalCourses}
          </InfoCard>
          <InfoCard head="Students" color="green" icon={<HiOutlineUsers />}>
            {!dashboardDataError && !dashboardData && "Loading..."}
            {!dashboardDataError &&
              dashboardData &&
              dashboardData.totalStudents}
          </InfoCard>
        </div>
        <div className="w-full flex gap-10 flex-col md:flex-row mt-5">
          <RecentCard header="Recent Results">
            <ListData
              loading={!dashboardDataError && !dashboardData ? true : false}
              data={
                dashboardData && dashboardData.recentResults?.length > 0
                  ? dashboardData.recentResults.map((d, i) => {
                      return {
                        primaryText: d.student.fullName,
                        secondaryText: (
                          <span className="flex flex-col text-gray-500">
                            <span className="space-x-2">
                              <span className="font-bold">Course:</span>{" "}
                              {d.course.title}
                            </span>
                            <span
                              className={`${
                                (d.score / d.course.questionNum) * 100 >= 70
                                  ? "text-green-600"
                                  : (d.score / d.course.questionNum) * 100 <
                                      70 &&
                                    (d.score / d.course.questionNum) * 100 >= 60
                                  ? "text-primary"
                                  : (d.score / d.course.questionNum) * 100 <
                                      60 &&
                                    (d.score / d.course.questionNum) * 100 >= 50
                                  ? "text-ascent"
                                  : "text-red-600"
                              }`}
                            >
                              <span className={`font-bold`}>Score:</span>{" "}
                              {Math.round(
                                (d.score / d.course.questionNum) * 100
                              )}
                              %
                            </span>

                            <span>
                              <span className="font-bold">Date:</span>{" "}
                              {dateformat(d.createdAt, "mediumDate")}
                            </span>
                          </span>
                        ),
                      };
                    })
                  : [
                      {
                        primaryText: "",
                        secondaryText: "",
                      },
                    ]
              }
            />
          </RecentCard>
          <RecentCard header="Recent Students">
            <ListData
              loading={!dashboardDataError && !dashboardData ? true : false}
              data={
                dashboardData && dashboardData.recentStudents?.length > 0
                  ? dashboardData.recentStudents.map((d, i) => {
                      return {
                        primaryText: d.fullName,
                        secondaryText: (
                          <span className="flex flex-col text-gray-500">
                            <span className="space-x-2">
                              <span className="font-bold">Phone:</span>{" "}
                              {d.phoneNumber}
                            </span>
                            <span>
                              <span className="font-bold">Joined On:</span>{" "}
                              {dateformat(d.createdAt, "mediumDate")}
                            </span>
                          </span>
                        ),
                      };
                    })
                  : [
                      {
                        primaryText: "",
                        secondaryText: "",
                      },
                    ]
              }
            />
          </RecentCard>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
