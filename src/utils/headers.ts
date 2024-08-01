import { AxiosRequestConfig } from "axios";
import { getToken } from "./token";
const { access_token } = getToken()
export const axiosConfig = { withCredentials: true, timeout: 100000, headers: { Authorization: `Bearer ${access_token}` } }