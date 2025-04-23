import axios from "axios";
export const getUserIdFromToken = async (setUserId) => {
  try {
    const response = await axios.get(`/api/get-user-id`, {
      withCredentials: true,
    });
    if (response.status === 200) {
      setUserId(response.data.userId);
    }
  } catch (error) {
    console.log(error);
  }
};
