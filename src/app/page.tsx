"use client";
import Image from "next/image";
import Calendar from "./components/Calendar";
import CardList from "./components/ThemeCard";
import { HiCalendar, HiHome, HiMenu } from "react-icons/hi";
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
          planStartDate={new Date()}
          planDuration={100}
        />
      )}
      <div className="absolute bottom-4 right-4">
        <label className="swap swap-flip">
          <input
            type="checkbox"
            onChange={() => {
              setPage(!page);
            }}
          />

          <div className="swap-on">
            {/* <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer flex items-center justify-center"> */}
            <HiHome className="h-6 w-6 text-gray-600" />
            {/* </button> */}
          </div>
          <div className="swap-off">
            {/* <button className="p-2 rounded-full hover:bg-gray-200 cursor-pointer flex items-center justify-center"> */}
            <HiCalendar className="h-6 w-6 text-gray-600" />
            {/* </button> */}
          </div>
        </label>
      </div>
    </div>
  );
}
