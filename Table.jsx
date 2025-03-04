/* eslint-disable react/prop-types */
import { IoIosArrowRoundDown } from "react-icons/io";

export default function Table({
  isAsc,
  headers,
  rows,
  headerSize,
  onAmountSort,
  onDateSort,
}) {
  const handleSort = (sortKey) => {
    if (sortKey === "amount") {
      onAmountSort(); 
    } else if (sortKey === "payedDate") {
      onDateSort(); 
    }
  };

  return (
    <div className="w-fit rounded-lg border border-gray-200">
      {/* Header */}
      <div
        className={`grid ${headerSize} gap-8 border-b border-gray-300 bg-gray-100 p-3 px-6`}
      >
        {headers.map((header, index) =>
          header.sortable ? (
            <div
              key={index}
              onClick={() => handleSort(header.sortKey)} // Call handleSort with sortKey
              className="flex cursor-pointer select-none gap-1"
            >
              <p>{header.label}</p>
              <IoIosArrowRoundDown
                className={`h-6 w-6 transition-all duration-500 ${isAsc ? "rotate-180" : ""}`}
              />
            </div>
          ) : (
            <p key={index}>{header.label}</p>
          ),
        )}
      </div>
      {rows}
    </div>
  );
}
