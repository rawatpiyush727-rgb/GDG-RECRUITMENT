import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export const ApplicationsContext = createContext(null);

export function useApplications() {
  const context = useContext(ApplicationsContext);
  if (!context) {
    throw new Error("useApplications must be used within an ApplicationsProvider");
  }
  return context;
}

export function ApplicationsProvider({ children }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    if (!user) {
      setApplications([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.get("/api/applications/mine");
      if (Array.isArray(data)) {
        setApplications(data);
      } else if (Array.isArray(data?.applications)) {
        setApplications(data.applications);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.warn("Could not fetch user applications:", err.message);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;
    if (!user) {
      return;
    }

    api.get("/api/applications/mine")
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) {
          setApplications(data);
        } else if (Array.isArray(data?.applications)) {
          setApplications(data.applications);
        } else {
          setApplications([]);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.warn("Could not fetch user applications:", err.message);
        setApplications([]);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  const hasApplied = useCallback(
    (deptIdOrSlug) => {
      if (!deptIdOrSlug || !applications.length) return false;
      const target = String(deptIdOrSlug).toLowerCase();
      return applications.some((app) => {
        const appId = String(app.departmentId || app.department?.id || app.department?._id || app.departmentSlug || "").toLowerCase();
        return appId === target;
      });
    },
    [applications]
  );

  const getApplication = useCallback(
    (deptIdOrSlug) => {
      if (!deptIdOrSlug || !applications.length) return null;
      const target = String(deptIdOrSlug).toLowerCase();
      return (
        applications.find((app) => {
          const appId = String(app.departmentId || app.department?.id || app.department?._id || app.departmentSlug || "").toLowerCase();
          return appId === target;
        }) || null
      );
    },
    [applications]
  );

  const applyToDepartment = async (departmentId, formData) => {
    const res = await api.post("/api/applications", {
      departmentId,
      ...formData,
    });
    await fetchApplications();
    return res;
  };

  const value = {
    applications,
    loading,
    hasApplied,
    getApplication,
    applyToDepartment,
    refreshApplications: fetchApplications,
  };

  return (
    <ApplicationsContext.Provider value={value}>
      {children}
    </ApplicationsContext.Provider>
  );
}

export default ApplicationsContext;
