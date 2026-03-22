import type {FC} from "react";
import type {TabId} from "../types";

interface Tab {
    id: TabId;
    label: string;
}

interface NavbarProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

const TABS: Tab[] = [
    {id: "import", label: "Import"},
    {id: "patients", label: "Patients"},
];

const Navbar: FC<NavbarProps> = ({activeTab, onTabChange}) => {
    return (
        <nav className="navbar">
            <span className="nav-brand">MediPortal</span>

            {TABS.map(({id, label}) => (
                <button
                    key={id}
                    className={`nav-tab ${activeTab === id ? "active" : ""}`}
                    onClick={() => onTabChange(id)}
                >
                    {label}
                </button>
            ))}
        </nav>
    );
};

export default Navbar;