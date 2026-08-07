import React, { useCallback } from 'react';
import { HiOutlineUpload, HiX, HiDocument } from 'react-icons/hi';

const FileUpload = ({ files, setFiles }) => {
  const onDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, [setFiles]);

  const onFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        style={{
          border: '2px dashed var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: 'rgba(0,0,0,0.2)',
          transition: 'var(--transition-normal)'
        }}
        onClick={() => document.getElementById('file-upload').click()}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
      >
        <HiOutlineUpload size={32} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <div style={{ color: 'var(--text-secondary)' }}>
          Dosyaları sürükleyip bırakın veya <span style={{ color: '#8b5cf6' }}>seçmek için tıklayın</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          PDF, Word, Görsel, Kod dosyaları desteklenir
        </div>
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={onFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {files.map((file, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-elevated)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <HiDocument color="#8b5cf6" />
                <span style={{ fontSize: '0.9rem' }}>{file.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB</span>
              </div>
              <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', color: 'var(--error-color)', cursor: 'pointer' }}>
                <HiX />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
