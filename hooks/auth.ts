import { useAppDispatch, useAppSelector } from "./../redux/store";
import { useEffect } from "react";
import { setLoading, setUser } from "../redux/authSlice";
import Cookies from "js-cookie";
export const useUser = () => {
  const dispatch = useAppDispatch();
  const { isLoading, user } = useAppSelector((state) => state.auth);
  useEffect(() => {
    if (!user) {
      const token = Cookies.get("token");
      if (!token) {
        localStorage.removeItem("user");
      } else {
        const userData = localStorage.getItem("user");
        if (userData) dispatch(setUser(JSON.parse(userData)));
      }
    }
    dispatch(setLoading(false));

    return () => {
      //!user && dispatch(setLoading(true));
    };
  }, [user, isLoading]);
};
