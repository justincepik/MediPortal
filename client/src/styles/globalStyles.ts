const globalStyles: string = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #F4F3EF;
    color: #1a1a1a;
  }

  /* ── Layout ── */
  .app {
    min-height: 100vh;
    background: #F4F3EF;
  }

  .main {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 56px);
    padding: 40px 24px;
  }

  /* ── Navbar ── */
  .navbar {
    height: 56px;
    background: #1C1C1E;
    display: flex;
    align-items: center;
    padding: 0 32px;
    gap: 4px;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 1px 0 rgba(255,255,255,0.06);
  }

  .nav-brand {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    color: #888;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-right: 24px;
    padding-right: 24px;
    border-right: 1px solid #333;
  }

  .nav-tab {
    height: 36px;
    padding: 0 16px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: #777;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    letter-spacing: 0.01em;
  }

  .nav-tab:hover           { background: rgba(255,255,255,0.07); color: #ccc; }
  .nav-tab.active          { background: rgba(255,255,255,0.12); color: #fff; }

  /* ── Drop Zone ── */
  .drop-area {
    width: 100%;
    max-width: 560px;
    border: 1.5px dashed #C8C5BB;
    border-radius: 16px;
    background: #FAFAF8;
    padding: 64px 48px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
  }

  .drop-area:hover,
  .drop-area.dragging {
    border-color: #4A6CF7;
    background: #F0F2FF;
    transform: scale(1.008);
    box-shadow: 0 8px 32px rgba(74,108,247,0.10);
  }

  .drop-icon {
    width: 52px;
    height: 52px;
    margin: 0 auto 20px;
    background: #EDECEA;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .drop-area:hover .drop-icon,
  .drop-area.dragging .drop-icon { background: #DDE2FF; }

  .drop-icon svg {
    width: 24px;
    height: 24px;
    stroke: #888;
    transition: stroke 0.2s;
  }

  .drop-area:hover .drop-icon svg,
  .drop-area.dragging .drop-icon svg { stroke: #4A6CF7; }

  .drop-title {
    font-size: 17px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 8px;
  }

  .drop-sub           { font-size: 14px; color: #888; line-height: 1.5; }
  .drop-sub span      { color: #4A6CF7; font-weight: 500; cursor: pointer; }

  .drop-meta {
    margin-top: 24px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #bbb;
    letter-spacing: 0.04em;
  }

  /* ── File List ── */
  .file-list {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .file-item {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #F0F2FF;
    border: 1px solid #D4DCFF;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #3a4a9e;
    font-weight: 500;
  }

  .file-item svg   { stroke: #4A6CF7; flex-shrink: 0; }

  .file-remove {
    margin-left: auto;
    background: none;
    border: none;
    cursor: pointer;
    color: #aaa;
    font-size: 16px;
    line-height: 1;
    padding: 0 2px;
    border-radius: 4px;
    transition: color 0.15s;
  }

  .file-remove:hover { color: #e05; }

  .hidden-input { display: none; }

  /* ── Patients Table ── */
  .patients-wrap {
    width: 100%;
    max-width: 900px;
    padding: 8px 0;
  }

  .patients-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .patients-title  { font-size: 22px; font-weight: 600; color: #1a1a1a; }

  .patients-count {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #aaa;
    letter-spacing: 0.04em;
  }

  .table-card {
    background: #fff;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04);
  }

  table               { width: 100%; border-collapse: collapse; }
  thead               { background: #F7F7F5; }

  thead th {
    padding: 13px 20px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-family: 'DM Mono', monospace;
    border-bottom: 1px solid #EEECEA;
  }

  tbody tr            { border-bottom: 1px solid #F2F0EC; transition: background 0.1s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover      { background: #FAFAF8; }

  tbody td            { padding: 14px 20px; font-size: 14px; color: #333; }

  .patient-id   { font-family: 'DM Mono', monospace; font-size: 12px; color: #aaa; }
  .patient-name { font-weight: 500; color: #1a1a1a; }

  /* ── Status Badge ── */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
  }

  .badge-active   { background: #E8F7EE; color: #1a7a42; }
  .badge-inactive { background: #F2F2F2; color: #888; }

  .badge-dot               { width: 6px; height: 6px; border-radius: 50%; }
  .badge-active .badge-dot   { background: #2db55d; }
  .badge-inactive .badge-dot { background: #bbb; }
  
  
  /* ── Upload Button ── */
  .upload-btn {
    width: 100%;
    margin-top: 12px;
    padding: 12px;
    background: #4A6CF7;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, opacity 0.15s;
  }
 
  .upload-btn:hover    { background: #3a5ce6; }
  .upload-btn:disabled { opacity: 0.6; cursor: not-allowed; }
 
  /* ── Upload Results ── */
  .upload-results {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
 
  .result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
  }
 
  .result-success { background: #E8F7EE; color: #1a7a42; border: 1px solid #b8e6c8; }
  .result-error   { background: #FEF2F2; color: #b91c1c; border: 1px solid #fecaca; }
 
  /* ── Error Banner ── */
  .error-banner {
    margin-bottom: 16px;
    padding: 12px 16px;
    background: #FEF2F2;
    border: 1px solid #fecaca;
    border-radius: 10px;
    color: #b91c1c;
    font-size: 14px;
  }
 
  /* ── Skeleton Loading ── */
  .skeleton {
    display: block;
    width: 80%;
    height: 14px;
    border-radius: 6px;
    background: linear-gradient(90deg, #f0f0ee 25%, #e8e8e5 50%, #f0f0ee 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }
 
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
 
  /* ── Refetch Button ── */
  .refetch-btn {
    background: none;
    border: 1px solid #ddd;
    border-radius: 6px;
    width: 28px;
    height: 28px;
    cursor: pointer;
    font-size: 14px;
    color: #888;
    transition: all 0.15s;
  }
 
  .refetch-btn:hover    { background: #f0f0ee; color: #333; }
  .refetch-btn:disabled { opacity: 0.4; cursor: not-allowed; }
`;

export default globalStyles;