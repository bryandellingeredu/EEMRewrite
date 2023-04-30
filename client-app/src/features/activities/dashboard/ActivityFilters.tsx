import { Calendar } from "react-calendar";
import { useState } from "react";

interface Props {
    setFilterDate: (date: Date) => void;
    selectedDate: Date;
  }
  
  export default function ActivityFilters({ setFilterDate, selectedDate }: Props) {
    const handleDateChange = (date: Date) => {
      setFilterDate(date);
    };
  
    return (
      <Calendar
        value={selectedDate}
        onChange={(date: Date) => handleDateChange(date)}
      />
    );
  }