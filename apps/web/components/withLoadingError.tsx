import React from "react";
import styles from "./withLoadingError.module.css";

export function withLoadingError(hook: Function) {
  const { data, isLoading, error } = hook();

  // 重试函数，直接刷新页面
  const handleRetry = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  // 返回首页
  const handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  if (isLoading) {
    return {
      data: null,
      element: (
        <div className={styles.centerScreen}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className={styles.spin} style={{marginBottom: 16}}>
            <circle cx="24" cy="24" r="20" stroke="#1976d2" strokeWidth="4" opacity="0.2"/>
            <path d="M44 24c0-11.046-8.954-20-20-20" stroke="#1976d2" strokeWidth="4" strokeLinecap="round"/>
          </svg>
          <div>加载中…</div>
        </div>
      )
    };
  }
  if (error) {
    return {
      data: null,
      element: (
        <div className={`${styles.centerScreen} ${styles.error}`}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{marginBottom: 16}}>
            <circle cx="24" cy="24" r="20" stroke="#d32f2f" strokeWidth="4" opacity="0.2"/>
            <path d="M16 16l16 16M32 16L16 32" stroke="#d32f2f" strokeWidth="4" strokeLinecap="round"/>
          </svg>
          <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 8 }}>
            很抱歉，页面加载失败
          </div>
          <div style={{ color: "#b71c1c", marginBottom: 16 }}>
            {error.response?.data?.message || error.message || "未知错误"}
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <button
              onClick={handleRetry}
              style={{
                padding: "8px 24px",
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: 500
              }}
            >
              重试
            </button>
            <button
              onClick={handleGoHome}
              style={{
                padding: "8px 24px",
                background: "#f5f5f5",
                color: "#1976d2",
                border: "1px solid #1976d2",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: 500
              }}
            >
              返回首页
            </button>
          </div>
        </div>
      )
    };
  }
  return { data, element: null };
}