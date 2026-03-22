import {type FC, useState, useRef, type DragEvent, type ChangeEvent, type MouseEvent} from "react";
import {uploadFhirFile} from "../services/api.service";
import type {UploadResult} from "../types/fhir.types";
import FileItem from "./FileItem";

const UploadIcon: FC = () => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 15V3m0 0L8 7m4-4 4 4"/>
        <path d="M3 17v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/>
    </svg>
);

interface ImportViewProps {
    onUploadSuccess?: () => void;
}

const ImportView: FC<ImportViewProps> = ({onUploadSuccess}) => {
    const [dragging, setDragging] = useState<boolean>(false);
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState<boolean>(false);
    const [results, setResults] = useState<UploadResult[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const addFiles = (incoming: FileList | null): void => {
        if (!incoming) return;
        setFiles((prev) => [...prev, ...Array.from(incoming)]);
        setResults([]);
    };

    const removeFile = (index: number): void =>
        setFiles((prev) => prev.filter((_, i) => i !== index));

    const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        setDragging(false);
        addFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        setDragging(true);
    };

    const handleFileInput = (e: ChangeEvent<HTMLInputElement>): void =>
        addFiles(e.target.files);

    const openFilePicker = (): void => inputRef.current?.click();

    const handlePickerClick = (e: MouseEvent<HTMLSpanElement>): void => {
        e.stopPropagation();
        openFilePicker();
    };

    const handleUpload = async (): Promise<void> => {
        if (files.length === 0) return;
        setUploading(true);
        setResults([]);

        const settled = await Promise.allSettled(files.map(uploadFhirFile));

        const uploadResults: UploadResult[] = settled.map((s, i) =>
            s.status === "fulfilled"
                ? s.value
                : {
                    success: false,
                    fileName: files[i]?.name ?? "?",
                    patientsImported: 0,
                    errors: [(s as PromiseRejectedResult).reason.message],
                }
        );

        setResults(uploadResults);
        setFiles([]);
        setUploading(false);

        if (uploadResults.every((r) => r.success)) {
            onUploadSuccess?.();
        }
    };

    return (
        <div style={{width: "100%", maxWidth: "560px"}}>

            <div
                className={`drop-area ${dragging ? "dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => files.length === 0 && openFilePicker()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept=".hl7,.json,.xml,.txt"
                    className="hidden-input"
                    onChange={handleFileInput}
                />

                <div className="drop-icon"><UploadIcon/></div>

                <p className="drop-title">
                    {dragging ? "Datei loslassen ..." : "Dateien hierher ziehen"}
                </p>
                <p className="drop-sub">
                    oder <span onClick={handlePickerClick}>Dateien auswaehlen</span>
                </p>
                <p className="drop-meta">HL7 &middot; FHIR &middot; XML &middot; JSON</p>

                {files.length > 0 && (
                    <div className="file-list" onClick={(e) => e.stopPropagation()}>
                        {files.map((file, i) => (
                            <FileItem key={i} file={file} onRemove={() => removeFile(i)}/>
                        ))}
                    </div>
                )}
            </div>

            {files.length > 0 && (
                <button
                    className="upload-btn"
                    onClick={handleUpload}
                    disabled={uploading}
                >
                    {uploading
                        ? "Wird hochgeladen ..."
                        : `${files.length} Datei${files.length > 1 ? "en" : ""} importieren`}
                </button>
            )}

            {results.length > 0 && (
                <div className="upload-results">
                    {results.map((r, i) => (
                        <div key={i} className={`result-item ${r.success ? "result-success" : "result-error"}`}>
                            <span>{r.success ? "✓" : "✗"} {r.fileName}</span>
                            {r.success
                                ? <span>{r.patientsImported} importiert</span>
                                : <span>{r.errors.join(", ")}</span>
                            }
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default ImportView;