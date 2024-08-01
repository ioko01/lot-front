import axios, { AxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_OPS_URL; // Replace with your API URL

export interface AuthResponse {
    access_token: string;
    refresh_token?: string;
}

export interface UserCredentials {
    username: string;
    u_password: string;
}

export class AuthService {
    static async login(credentials: UserCredentials): Promise<AuthResponse> {
        try {
            const response = await axios.post<AuthResponse>(
                `${API_URL}/auth/login`,
                credentials
            );
            if (response.data && response.status == 200) {
                return response.data;
            } else {
                return { access_token: "invalid" };
            }
        } catch (error) {
            return { access_token: "invalid" };
        }

    }

    static async logout(user_id: string, token: string): Promise<{ user_id: string } | any> {
        try {
            const axiosConfig: AxiosRequestConfig = { withCredentials: true, timeout: 10000, headers: { Authorization: `Bearer ${token}` } }
            const response = await axios.post(`${API_URL}/auth/logout`, { user_id: user_id }, axiosConfig)

            return response.data;
        } catch (error) {

        }
    }

    // Implement other authentication methods like registration, logout, etc.
}