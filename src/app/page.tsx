"use client";
import Image from "next/image";
import Calendar from "./components/Calendar";
import CardList from "./components/ThemeCard";

export default function Home() {
  return (
    <CardList />
    // <Calendar
    //   currentDate={new Date()}
    //   planStartDate={new Date()}
    //   planDuration={100}
    // />
  );
}
