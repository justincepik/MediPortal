import type {FC} from "react";

interface FileItemProps {
    file: File;
    onRemove: () => void;
}

const FileIcon: FC = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
    </svg>
);

const FileItem: FC<FileItemProps> = ({file, onRemove}) => (
    <div className="file-item">
        <FileIcon/>
        {file.name}
        <button className="file-remove" onClick={onRemove}>×</button>
    </div>
);

export default FileItem;