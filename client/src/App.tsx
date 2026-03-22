import {type FC, useCallback, useState} from "react";
import type {TabId} from "./types";
import globalStyles from "./styles/globalStyles";
import {usePatients} from "./hooks/usePatients";

import Navbar from "./components/Navbar";
import ImportView from "./components/ImportView";
import PatientsView from "./components/PatientsView";

const App: FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>("import");

    // Hook lebt hier damit ImportView einen Refresh triggern kann
    const {patients, loading, error, refetch} = usePatients();

    const handleTabChange = useCallback((tab: TabId) => {
        setActiveTab(tab);
        if (tab === "patients") refetch();
    }, [refetch]);

    const handleUploadSuccess = useCallback(() => {
        refetch();
        setActiveTab("patients");
    }, [refetch]);

    return (
        <>
            <style>{globalStyles}</style>
            <div className="app">
                <Navbar activeTab={activeTab} onTabChange={handleTabChange}/>
                <main className="main">
                    {activeTab === "import" && (
                        <ImportView onUploadSuccess={handleUploadSuccess}/>
                    )}
                    {activeTab === "patients" && (
                        <PatientsView patients={patients} loading={loading} error={error} refetch={refetch}/>
                    )}
                </main>
            </div>
        </>
    );
};

export default App;