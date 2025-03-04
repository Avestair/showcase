/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useRef, useEffect } from "react";
import { SendRequest } from "../utils/utils.jsx";
import { toast } from "react-hot-toast";

const UserDetailContext = createContext();

export const useUserDetail = () => useContext(UserDetailContext);

export const UserDetailProvider = ({ children }) => {
  const [userId, setUserId] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const userRef = useRef(null);

  const fetchData = async (id) => {
    try {
      const requestBody = {
        action: "getuserdetail",
        params: {
          id: id,
        },
      };

      const requestData = await SendRequest("crm", requestBody);
      console.log(requestData);
      
      if (requestData?.result?.user) {
        setData(requestData.result.user);
        userRef.current = requestData.result.user;
        console.log("User data:", requestData.result.user);
      } else {
        throw new Error("هیچ اطلاعاتی یافت نشد");
      }
      setError(null);
    } catch (error) {
      toast.error(error.message);
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchData(userId);
    }
  }, [userId]);

  return (
    <UserDetailContext.Provider value={{ data, error, isLoading, userRef, userId, setUserId }}>
      {children}
    </UserDetailContext.Provider>
  );
};