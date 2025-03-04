import { useEffect, useState } from "react";
import Filter from "../components/Filter";
import Table from "../components/Table";
import { SendRequest } from "../utils/utils";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";
import Loading from "../ui/Loading";
import NewUserTableData from "../components/TableData/NewUserTableData";
import { useNotificationSound } from "../contexts/NotificationSoundContext";
import { useRef } from "react";

export default function NewUsers() {
  const [data, setData] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [isAsc, setIsAsc] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { playNotificationSound } = useNotificationSound();
  const usersRef = useRef([]);

  const currentRoute = "crm";
  const requestBody = {
    action: "getnewusers",
    params: {
      take: 150,
      skip: 0,
    },
  };

  const fetchData = async () => {
    try {
      const requestData = await SendRequest(currentRoute, requestBody);
      if (requestData?.result?.users) {
        setData(requestData?.result?.users);
        usersRef.current = requestData?.result?.users;
      } else {
        throw new Error("No users data found");
      }
      setError(null);
    } catch (error) {
      toast.error(error);
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const detectNewUsers = (oldUsers, newUsers) => {
    const oldUserIds = new Set(oldUsers.map((user) => user.id));
    return newUsers.filter((user) => !oldUserIds.has(user.id)); 
  };


  useEffect(() => {
    let intervalId;

    const startPolling = async () => {
      await fetchData(); 
      console.log("ref", usersRef.current);
      intervalId = setInterval(async () => {
        await fetchData();
        const newUsers = data;
        console.log("new users", newUsers);

        const newUserList = detectNewUsers(usersRef.current, newUsers); 

        if (newUserList.length > 0) {
          console.log("New users detected:", newUserList);
          playNotificationSound(); 
        }

        usersRef.current = newUsers;
      }, 300000);
    };

    startPolling();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [playNotificationSound]);

  // useEffect(() => {
  //   fetchData();
  // }, []);

  const refetchData = () => {
    setIsLoading(true);
    fetchData();
  };

  const handleFilterChange = (customerType) => {
    setSelectedFilter(customerType);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedFilter("");
    setCurrentPage(1);
  };

  const handleSort = () => {
    setIsAsc(!isAsc);
  };

  const filteredData = [...data].filter(
    (item) => selectedFilter === "" || item.type === selectedFilter,
  );

  const sortedData = filteredData.sort((a, b) => {
    const dateA = new Date((a.addedDate || "").replace(/\//g, "-"));
    const dateB = new Date((b.addedDate || "").replace(/\//g, "-"));
    return isAsc ? dateA - dateB : dateB - dateA;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const headers = [
    { label: "ردیف", sortable: false },
    { label: "نام", sortable: false },
    { label: "نام خانوادگی", sortable: false },
    { label: "شماره تماس", sortable: false },
    { label: "تاریخ عضویت", sortable: true },
    { label: "حرفه مشتری", sortable: false },
    { label: "عملیات", sortable: false },
  ];

  return (
    <div className="grid gap-8 pt-2">
      <h1 className="text-3xl">کاربران جدید</h1>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <div className="mt-14 grid w-full gap-2 text-center text-lg font-bold text-red-500">
          <p>خطایی در دریافت اطلاعات رخ داده است:</p>
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Filter Component */}
          <Filter
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            setRowAmount={setItemsPerPage}
            typeFilter={true}
          />

          {/* Table Component */}
          <Table
            headerSize={"grid-cols-[8rem,8rem,8rem,8rem,8rem,10rem,5rem]"}
            data={currentItems}
            isAsc={isAsc}
            headers={headers}
            rows={
              <NewUserTableData data={currentItems} refetchData={refetchData} />
            }
            onSort={handleSort}
          />

          {/* Pagination Component */}
          <div className="ml-[22%]">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
