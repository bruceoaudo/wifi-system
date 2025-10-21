"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export interface RouterInfo {
  mac?: string;
  ip?: string;
  linkOrig?: string;
}

const RouterInfoContext = createContext<RouterInfo | undefined>(undefined);

interface RouterInfoProviderProps {
  children: ReactNode;
}

export const RouterInfoProvider: React.FC<RouterInfoProviderProps> = ({
  children,
}) => {
  const [routerInfo, setRouterInfo] = useState<RouterInfo | null>(null);

  useEffect(() => {
    // Check if info exists in localStorage first
    const savedInfo = localStorage.getItem("routerInfo");
    if (savedInfo) {
      try {
        setRouterInfo(JSON.parse(savedInfo));
        return; // Skip reading URL params if we already have stored info
      } catch (e) {
        console.error("Failed to parse router info:", e);
      }
    }

    // Extract query params from URL (initial login)
    const params = new URLSearchParams(window.location.search);

    if (!params.get("mac") || !params.get("ip")) {
      console.warn(
        "No router info in URL"
      );
      return;
    }

    const info: RouterInfo = {
      // You can restore your real mac/ip fetching here
      mac: params.get("mac") || undefined,
      ip: params.get("ip") || undefined,
      linkOrig: params.get("orig") || undefined,
    };

    // Save to state and localStorage
    setRouterInfo(info);
    localStorage.setItem("routerInfo", JSON.stringify(info));

    console.log("Router info extracted:", info);
  }, []);

  // Watch for routerInfo changes and sync to localStorage
  useEffect(() => {
    if (routerInfo && Object.keys(routerInfo).length > 0) {
      localStorage.setItem("routerInfo", JSON.stringify(routerInfo));
    }
  }, [routerInfo]);

  return (
    <RouterInfoContext.Provider value={routerInfo || {}}>
      {children}
    </RouterInfoContext.Provider>
  );
};

export const useRouterInfo = (): RouterInfo => {
  const context = useContext(RouterInfoContext);
  if (context === undefined) {
    throw new Error("useRouterInfo must be used inside a RouterInfoProvider");
  }
  return context;
};
