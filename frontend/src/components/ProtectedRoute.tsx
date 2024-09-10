import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { useState, useEffect } from "react";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        auth().catch(() => { setIsAuthorized(false); });
    }, []);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        if (!refreshToken) {
            setIsAuthorized(false);
            return;
        }
        try {
            const response = await api.post("/api/token/refresh", { refresh: refreshToken });
            if (response.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, response.data.access);
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            console.log(error);
            setIsAuthorized(false)
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorized(false);
            return;
        }
        const decodedToken = jwtDecode(token);
        const tokenExpiration = decodedToken.exp as number;
        const now = Date.now() / 1000;

        if (tokenExpiration < now) {
            await refreshToken();
        } else {
            setIsAuthorized(true);
        }
    };
    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;

//   const token = localStorage.getItem(ACCESS_TOKEN);
//   if (!token) {
//     return <Navigate to="/login" />;
//   }

//   const decodedToken = jwtDecode(token);
//   const currentTime = Date.now() / 1000;

//   if (decodedToken.exp < currentTime) {
//     const refreshToken = localStorage.getItem(REFRESH_TOKEN);
//     if (!refreshToken) {
//       return <Navigate to="/login" />;
//     }

//     api.post("/auth/refresh", { token: refreshToken }).then((response) => {
//       localStorage.setItem(ACCESS_TOKEN, response.data.access);
//       localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
//     });
//   }

//   return <>{children}</>;
// }