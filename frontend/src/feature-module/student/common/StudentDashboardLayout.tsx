import React, { ReactNode } from "react";
import StudentSidebar from "./studentSidebar";
import { useAuth } from "../../../context/AuthContext";

interface StudentDashboardLayoutProps {
  title: string;
  icon?: string;
  subtitle?: string;
  children: ReactNode;
  showHeader?: boolean;
  headerBackground?: string;
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: string;
    color?: string;
  }>;
}

const StudentDashboardLayout: React.FC<StudentDashboardLayoutProps> = ({
  title,
  icon = "isax-document",
  subtitle,
  children,
  showHeader = true,
  headerBackground = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  stats,
}) => {
  const { user } = useAuth();

  return (
    <div className="content mt-4" style={{ minHeight: "100vh" }}>
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-12 col-xl-3 mb-4 mb-xl-0">
            <StudentSidebar />
          </div>

          {/* Main Content */}
          <div className="col-12 col-xl-9">
            {/* Header Section */}
            {showHeader && (
              <div
                style={{
                  background: headerBackground,
                  padding: "2.5rem",
                  borderRadius: "1.5rem",
                  color: "white",
                  marginBottom: "2.5rem",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Title Section */}
                <div className="d-flex align-items-center mb-4">
                  <div
                    style={{
                      width: 70,
                      height: 70,
                      background: "rgba(255, 255, 255, 0.15)",
                      borderRadius: "1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: "1.5rem",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <i
                      className={`isax ${icon}`}
                      style={{
                        fontSize: 32,
                        color: "white",
                      }}
                    />
                  </div>
                  <div>
                    <h1
                      style={{
                        margin: 0,
                        fontSize: "2rem",
                        fontWeight: "700",
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {title}
                    </h1>
                    {subtitle && (
                      <p
                        style={{
                          margin: "0.5rem 0 0 0",
                          opacity: 0.95,
                          fontSize: "1rem",
                        }}
                      >
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats Cards */}
                {stats && stats.length > 0 && (
                  <div className="row g-3">
                    {stats.map((stat, idx) => (
                      <div
                        key={idx}
                        className="col-6 col-sm-6 col-lg-3"
                      >
                        <div
                          style={{
                            background: "rgba(255, 255, 255, 0.12)",
                            padding: "1.25rem",
                            borderRadius: "1rem",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.background = "rgba(255, 255, 255, 0.2)";
                            el.style.transform = "translateY(-4px)";
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.background = "rgba(255, 255, 255, 0.12)";
                            el.style.transform = "translateY(0)";
                          }}
                        >
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <p
                                style={{
                                  margin: "0 0 0.5rem 0",
                                  opacity: 0.9,
                                  fontSize: "0.85rem",
                                  fontWeight: 500,
                                }}
                              >
                                {stat.label}
                              </p>
                              <h3
                                style={{
                                  margin: 0,
                                  fontSize: "1.75rem",
                                  fontWeight: "700",
                                }}
                              >
                                {stat.value}
                              </h3>
                            </div>
                            {stat.icon && (
                              <div
                                style={{
                                  width: 48,
                                  height: 48,
                                  background: "rgba(255, 255, 255, 0.2)",
                                  borderRadius: "0.75rem",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <i
                                  className={`isax ${stat.icon}`}
                                  style={{
                                    fontSize: 20,
                                    color: stat.color || "white",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Main Content Area */}
            <div style={{ paddingRight: "1rem", paddingLeft: "1rem" }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardLayout;
