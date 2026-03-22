import { type FC } from "react";

interface StatusBadgeProps {
    active: boolean;
}

const StatusBadge: FC<StatusBadgeProps> = ({ active }) => (
    <span className={`badge ${active ? "badge-active" : "badge-inactive"}`}>
    <span className="badge-dot" />
        {active ? "Aktiv" : "Inaktiv"}
  </span>
);

export default StatusBadge;