import { useEffect, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
} from "date-fns";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import Link from "next/link";

interface CalendarProps {
  currentDate: Date;
  planStartDate: Date;
  planDuration: number;
}

export default function Calendar({
  currentDate,
  planStartDate,
  planDuration,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(currentDate);
  const [artworkLinks, setArtworkLinks] = useState([]);
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevMonth();
      } else if (e.key === "ArrowRight") {
        nextMonth();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentMonth]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getTitle = (day: Date) => {
    // 将时间都设置为相同的时间（避免时区影响）
    const dayDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const planStartDateNormalized = new Date(
      planStartDate.getFullYear(),
      planStartDate.getMonth(),
      planStartDate.getDate()
    );

    const diffTime = dayDate.getTime() - planStartDateNormalized.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays < planDuration) {
      return `第${diffDays + 1}天`;
    }
    return "";
  };

  // 检查日期是否在计划范围内且在今天之前（含今天）
  const isDateEnabled = (day: Date) => {
    const dayDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const planStartDateNormalized = new Date(
      planStartDate.getFullYear(),
      planStartDate.getMonth(),
      planStartDate.getDate()
    );
    const currentDateNormalized = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    const diffTime = dayDate.getTime() - planStartDateNormalized.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // 检查日期是否在计划范围内且在今天之前（含今天）
    return (
      diffDays >= 0 &&
      diffDays < planDuration &&
      dayDate.getTime() <= currentDateNormalized.getTime()
    );
  };

  const isDateInPlanRange = (day: Date) => {
    const dayDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const planStartDateNormalized = new Date(
      planStartDate.getFullYear(),
      planStartDate.getMonth(),
      planStartDate.getDate()
    );

    const diffTime = dayDate.getTime() - planStartDateNormalized.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 0 && diffDays < planDuration;
  };

  const isLastDayOfPlan = (day: Date) => {
    const dayDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const planStartDateNormalized = new Date(
      planStartDate.getFullYear(),
      planStartDate.getMonth(),
      planStartDate.getDate()
    );

    const diffTime = dayDate.getTime() - planStartDateNormalized.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays === planDuration - 1;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between py-6">
        <button
          onClick={prevMonth}
          className="p-4 cursor-pointer rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="上一个月"
        >
          <HiChevronLeft className="h-5 w-5 text-gray-600 hover:text-gray-900 transition-colors duration-200" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          {format(currentMonth, "yyyy年 MM月")}
        </h2>
        <button
          onClick={nextMonth}
          className="p-4 cursor-pointer rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="下一个月"
        >
          <HiChevronRight className="h-5 w-5 text-gray-600 hover:text-gray-900 transition-colors duration-200" />
        </button>
      </div>

      <div>
        <div className="grid grid-cols-7 gap-1">
          {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
            <div
              key={day}
              className="text-center font-medium text-gray-700 py-3 transition-colors duration-200"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const title = getTitle(day);
            const enabled = isSameMonth(day, monthStart) && isDateEnabled(day);
            const inPlanRange = isDateInPlanRange(day);
            const dateStr = format(day, "yyyyMMdd");
            const isLastDay = isLastDayOfPlan(day);
            const isSame = isSameDay(day, currentDate);

            // 获取当前日期在计划中的索引
            const dayDate = new Date(
              day.getFullYear(),
              day.getMonth(),
              day.getDate()
            );
            const planStartDateNormalized = new Date(
              planStartDate.getFullYear(),
              planStartDate.getMonth(),
              planStartDate.getDate()
            );
            const diffTime =
              dayDate.getTime() - planStartDateNormalized.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // 检查是否有作品链接
            const hasArtwork =
              diffDays >= 0 &&
              diffDays < planDuration &&
              artworkLinks[diffDays];

            // 确定背景颜色
            let bgColorClass = "";
            if (!isSameMonth(day, monthStart)) {
              bgColorClass =
                "bg-gray-200 text-gray-400 hover:cursor-not-allowed";
            } else if (isSame) {
              bgColorClass =
                "bg-blue-500 hover:bg-blue-400 text-white hover:cursor-pointer";
            } else if (enabled) {
              bgColorClass = hasArtwork
                ? "bg-green-400 hover:bg-green-200 hover:cursor-pointer"
                : "bg-orange-400 hover:bg-orange-200 hover:cursor-pointer";
            } else {
              bgColorClass =
                "bg-gray-100 text-gray-500 hover:cursor-not-allowed";
            }

            return (
              <Link
                href={`/${dateStr}`}
                key={index}
                className={`min-h-[100px] p-2 rounded-lg flex flex-col items-center justify-center transition-all duration-300 ${bgColorClass}
    ${isLastDay ? "ring-2 ring-yellow-500" : ""}
    `}
              >
                <time dateTime={format(day, "yyyy-MM-dd")}>
                  {format(day, dateFormat)}
                </time>
                {title && (
                  <div className="flex flex-col items-center mt-1">
                    <span
                      className={`text-xs ${
                        isSame ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {title}
                    </span>
                    {inPlanRange ? (
                      enabled ? (
                        <div
                          className={`text-xs mt-1 transition-colors duration-200 ${
                            isSame ? "text-white" : "text-gray-500"
                          }`}
                        >
                          查看
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 mt-1 ">
                          未开放
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-gray-400 mt-1">计划外</span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
