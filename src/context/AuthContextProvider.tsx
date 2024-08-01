import React, {
    ReactNode,
    useState,
    useContext,
    createContext,
    useEffect,
} from 'react'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { getToken } from '../utils/token'
import { AuthService, UserCredentials } from '../services/AuthService'
import { IUserDoc } from '../models/Id'
import { IUserMySQL } from '../models/User'
import jwtDecode from 'jwt-decode'
import { IToken } from '../models/Token'

export interface AuthProviderProps {
    children?: ReactNode
}

export interface UserContextState {
    isUser: IUserDoc
    status: LOGIN_STATE
    id?: string
}

type LOGIN_STATE = "LOADING" | "NULL" | "ERROR" | "SUCCESS" | "NETWORK_ERROR" | "LOGOUT";

export const UserStateContext = createContext<UserContextState>(
    {} as UserContextState,
)
export interface AuthContextData {
    isUser: IUserMySQL | null
    status: LOGIN_STATE
    login: (credentials: UserCredentials) => Promise<void>
    logout: (user_id: string) => Promise<{ user_id: string }>
}

export const AuthContext = React.createContext<AuthContextData>(
    {} as AuthContextData,
)

export function useAuth(): AuthContextData {
    return useContext(AuthContext)
}

async function fetchAuth(token: string): Promise<AxiosResponse<any, any> | any> {
    try {
        const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${token}` } }
        const response = await axios.get(import.meta.env.VITE_OPS_URL + "/me", axiosConfig)
        if (response && response.status == 200) {
            return response
        }
    } catch (error: any) {
        if (error.response.status == 401) {
            localStorage.removeItem(import.meta.env.VITE_OPS_TOKEN)
            localStorage.removeItem(import.meta.env.VITE_OPS_REFRESH_TOKEN)
            location.reload()
        }
        return error
    }
}

export const AuthContextProvider = ({ children }: AuthProviderProps): JSX.Element => {
    const [isUser, setIsUser] = useState<IUserMySQL | null>(null)
    const [status, setStatus] = useState<LOGIN_STATE>("LOADING");
    const refreshToken = async () => {
        try {
            const refresh_token = localStorage.getItem(import.meta.env.VITE_OPS_REFRESH_TOKEN);
            axios.post(import.meta.env.VITE_OPS_URL + '/auth/refresh', { refresh_token: refresh_token })
                .then((response: AxiosResponse<any, any>) => {
                    localStorage.setItem(import.meta.env.VITE_OPS_TOKEN, response.data.access_token)
                    localStorage.setItem(import.meta.env.VITE_OPS_REFRESH_TOKEN, response.data.refresh_token!)
                })
                .catch((err) => {
                    if (err.response.status == 401) {
                        localStorage.removeItem(import.meta.env.VITE_OPS_TOKEN)
                        localStorage.removeItem(import.meta.env.VITE_OPS_REFRESH_TOKEN)
                        setStatus("LOGOUT")
                        setIsUser(null)
                    }
                })
        } catch (error) {
            setIsUser(null);
        }
    };
    const accessToken = async () => {
        const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
        if (access_token) {
            refreshToken()
            fetchAuth(access_token).then((user: AxiosResponse<any, any>) => {
                setIsUser(user.data)
                setStatus("SUCCESS")
            })
                .catch((err) => {
                    localStorage.removeItem(import.meta.env.VITE_OPS_TOKEN)
                    localStorage.removeItem(import.meta.env.VITE_OPS_REFRESH_TOKEN)
                    setStatus("LOGOUT")
                    setIsUser(null)
                })
        } else if (status !== "LOGOUT") {
            setStatus("LOGOUT")
        }
    }
    useEffect(() => {
        if (!isUser) accessToken()
        if (isUser) {
            const interval = setInterval(() => {
                refreshToken();
            }, 10 * 60 * 1000); // Refresh every 10 minutes
            return () => clearInterval(interval);
        }
    }, [isUser])

    const login = async (credentials: UserCredentials) => {
        AuthService.login(credentials).then((response) => {
            localStorage.setItem(import.meta.env.VITE_OPS_TOKEN, response.access_token)
            localStorage.setItem(import.meta.env.VITE_OPS_REFRESH_TOKEN, response.refresh_token!)
            if (response.access_token) {
                fetchAuth(response.access_token).then((user) => {
                    setIsUser(user.data)
                    setStatus("SUCCESS")
                })
                    .catch((err) => {
                        localStorage.removeItem(import.meta.env.VITE_OPS_TOKEN)
                        localStorage.removeItem(import.meta.env.VITE_OPS_REFRESH_TOKEN)
                        setStatus("LOGOUT")
                        setIsUser(null)
                    })
            } else {
                setStatus("LOGOUT")
            }
        })


    };

    const logout = async (user_id: string) => {
        const access_token = localStorage.getItem(import.meta.env.VITE_OPS_TOKEN);
        const response = await AuthService.logout(user_id, access_token!)
        localStorage.removeItem(import.meta.env.VITE_OPS_TOKEN)
        localStorage.removeItem(import.meta.env.VITE_OPS_REFRESH_TOKEN)
        if (response) {
            setStatus("LOGOUT")
        }
        return response
    };

    const values = {
        isUser,
        status,
        login,
        logout
    }

    return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export const useUserContext = (): UserContextState => {
    return useContext(UserStateContext)
}