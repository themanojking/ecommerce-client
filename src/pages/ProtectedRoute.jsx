
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const { user, token } = useSelector((state) => state.auth || {});
  const location = useLocation();

  if (!user || !token) {
    return (
      <Navigate
        to="/signin"
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
