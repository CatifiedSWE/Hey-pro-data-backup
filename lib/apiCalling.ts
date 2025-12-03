import axios, { isAxiosError } from "./axios";

interface ApiCallingProps {
  method: "get" | "post" | "put" | "patch" | "delete";
  route: string;
  data?: unknown;
}

interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data: T;
}

const apiCalling = async <T = unknown>({
  method,
  route,
  data,
}: ApiCallingProps): Promise<ApiResponse<T>> => {
  try {
    const response = await axios({
      method,
      url: route,
      data: data ?? null,
    });

    return {
      status: true,
      message: response.data?.message ?? "API call successful",
      data: response.data,
    };
  } catch (error) {
    if (isAxiosError(error)) {
      return {
        status: false,
        message: error.response?.data?.message ?? "API call failed",
        data: error.response?.data ?? null,
      };
    }
    return {
      status: false,
      message: "An unexpected error occurred",
      data: null as unknown as T,
    };
  }
};

export default apiCalling;
export { apiCalling };
