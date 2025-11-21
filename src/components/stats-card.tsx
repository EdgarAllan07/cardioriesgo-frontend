import React from "react";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: "primary" | "secondary" | "success" | "warning" | "danger";
  trend?: {
    value: number;
    isUpward: boolean;
  };
}

export const StatsCard = ({ title, value, icon, color, trend }: StatsCardProps) => {
  return (
    <Card className="w-full">
      <CardBody>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-small text-default-500">{title}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-semibold">{value}</p>
              {trend && (
                <div className={`flex items-center text-tiny ${trend.isUpward ? 'text-success' : 'text-danger'}`}>
                  <Icon 
                    icon={trend.isUpward ? "lucide:trending-up" : "lucide:trending-down"} 
                    className="mr-1" 
                  />
                  {trend.value}%
                </div>
              )}
            </div>
          </div>
          <div className={`p-2 rounded-medium bg-${color}-100`}>
            <Icon icon={icon} className={`text-${color} text-xl`} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};