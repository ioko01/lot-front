import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContextProvider";
import { useNavigate } from "react-router-dom";

function Login() {
    const { login, isUser, status } = useContext(AuthContext);
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate()
    const isLoading = document.getElementById("loading")

    const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault()
        try {
            isLoading!.removeAttribute("style")
            isLoading!.style.position = "fixed"
            
            await login({ username: usernameRef.current!.value, u_password: passwordRef.current!.value })

            if (isUser && status == "SUCCESS") {
                navigate("/")
            }
        } catch (error) {
            // console.log(error)
        }
    }

    return (
        <>
            <form className="mt-4 text-gray-900" id="formSignup">
                <input ref={usernameRef} type={"text"} id="username" name="username" className="block h-8 py-2 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder="Username" />
                <input ref={passwordRef} type={"password"} id="password" name="password" className="block h-8 py-2 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder="Password" />
                <button type={"submit"} onClick={handleSubmit}>Add</button>
            </form>
        </>
    );
}

export default Login;