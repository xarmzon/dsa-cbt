import { useEffect, useState, useRef } from "react";
import { useTimer } from "react-timer-hook";
//import { } from "react-page-visibility"

export type TypeStatus = "success" | "warning" | "error";
export interface ExamTimerProps {
  expiryTime: number;
  onExpired: () => void;
  stopTime?: boolean;
}

export interface ExamTimeTickProps {
  tick: number;
  status: TypeStatus;
}
const ExamTimeTick = ({ tick, status }: ExamTimeTickProps) => {
  return (
    <span
      className={`${
        status === "success"
          ? "text-primary"
          : status === "warning"
          ? "text-ascent"
          : "text-red-600 animate-ping"
      } duration-700 p-1 px-2 min-w-[36px] min-h-[36px]`}
    >
      {tick}
    </span>
  );
};

const ExamTimer = ({ expiryTime, onExpired, stopTime }: ExamTimerProps) => {
  const [time, setTime] = useState<Date>(() => {
    const time = new Date();
    time.setSeconds(time.getSeconds() + expiryTime * 60);
    return time;
  });

  const [status, setStatus] = useState<TypeStatus>("success");
  const { minutes, seconds, restart, isRunning, pause } = useTimer({
    expiryTimestamp: time,
    onExpire: () => {
      onExpired();
    },
    autoStart: true,
  });

  useEffect(() => {
    const t = localStorage.getItem("timer");
    if (t) {
      const tt = new Date();
      const parsedT: { min: number; sec: number } = JSON.parse(t);
      tt.setSeconds(tt.getSeconds() + ((parsedT.min - 1) * 60 - parsedT.sec));
      restart(tt);
    }
  }, []);

  useEffect(() => {
    if (stopTime) pause();
  }, [stopTime]);

  useEffect(() => {
    if ((minutes / expiryTime) * 100 >= 60) {
      setStatus((prev) => "success");
    } else if (
      (minutes / expiryTime) * 100 <= 40 &&
      (minutes / expiryTime) * 100 >= 20
    ) {
      setStatus((prev) => "warning");
    } else {
      setStatus((prev) => "error");
    }
    return () => {
      if (minutes > 0) {
        localStorage.setItem(
          "timer",
          JSON.stringify({ min: minutes, sec: seconds })
        );
      } else {
        localStorage.removeItem("timer");
      }
    };
  }, [minutes]);
  return (
    <>
      {isRunning && (
        <div className={`font-bold text-2xl`}>
          <ExamTimeTick tick={minutes} status={status} />
          {":"}
          <ExamTimeTick tick={seconds} status={status} />
        </div>
      )}
    </>
  );
};

export default ExamTimer;
