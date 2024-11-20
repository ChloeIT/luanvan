import React from "react";
import { DashboardStats } from "../components";

export const DashBoard = () => {
  return (
    <div className="flex-1">
      <div className="grid lg:grid-cols-1 mt-2 md:grid-cols-2 grid-cols-1 gap-6">
        <DashboardStats />
      </div>
    </div>
  );
};
