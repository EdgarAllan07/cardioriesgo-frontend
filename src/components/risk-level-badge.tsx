import React from "react";
import { Badge } from "@heroui/react";

interface RiskLevelBadgeProps {
  riskLevel: number;
  showText?: boolean;
}

export const RiskLevelBadge = ({ riskLevel, showText = true }: RiskLevelBadgeProps) => {
  let color: "success" | "warning" | "danger";
  let text: string;

  if (riskLevel < 40) {
    color = "success";
    text = "Riesgo Bajo";
  } else if (riskLevel < 70) {
    color = "warning";
    text = "Riesgo Moderado";
  } else {
    color = "danger";
    text = "Riesgo Alto";
  }

  return (
    <Badge color={color} variant="flat">
      {showText ? text : `${riskLevel}%`}
    </Badge>
  );
};