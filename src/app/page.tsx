"use client";
import Image from "next/image";
import Calendar from "./components/Calendar";
import CardList from "./components/ThemeCard";
import { HiCalendar, HiHome } from "react-icons/hi";
import { useState } from "react";

export default function Home() {
  const [page, setPage] = useState(true);
  return (
    <div className="w-full h-screen relative">
      {page ? (
        <CardList />
      ) : (
        <Calendar
          currentDate={new Date()}
          planStartDate={new Date(new Date().getFullYear(), 8, 17)}
          planDuration={100}
        />
      )}
      <div className="absolute bottom-4 right-4">
        <div className="tooltip" data-tip={page ? "日历" : "主题"}>
          <label className="swap swap-flip">
            <input
              type="checkbox"
              onChange={() => {
                setPage(!page);
              }}
            />
            <div className="swap-on">
              <HiHome className="h-6 w-6 text-gray-600" />
            </div>
            <div className="swap-off">
              <HiCalendar className="h-6 w-6 text-gray-600" />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
