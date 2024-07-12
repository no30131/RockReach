import { jwtDecode } from "jwt-decode";

export const getUserFromToken = () => {
  const getCookie = (name) => {
    const cookieArr = document.cookie.split("; ");
    for (let i = 0; i < cookieArr.length; i++) {
      const cookiePair = cookieArr[i].split("=");
      if (name === cookiePair[0]) {
        return decodeURIComponent(cookiePair[1]);
      }
    }
    return null;
  };

  const token = getCookie("token");
  if (!token) {
    console.error("No token found");
    return null;
  }

  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error("Error decoding token: ", error);
    return null;
  }
};

export const deleteToken = () => {
  document.cookie = "token=; Max-Age=0; path=/";
};

