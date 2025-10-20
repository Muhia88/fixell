import React, { useCallback, useRef } from 'react'

export default function ImageUploader({ files, setFiles }) {
  const inputRef = useRef(null)

  const onFiles = useCallback((fileList) => {
    const arr = Array.from(fileList).filter(f => f.type.startsWith('image/'))
    if (arr.length) setFiles((prev) => [...prev, ...arr])
  }, [setFiles])

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onFiles(e.dataTransfer.files)
  }

  const handleSelect = (e) => {
    onFiles(e.target.files)
  }

  const removeAt = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        className="w-full p-6 border-dashed border-2 border-gray-300 rounded text-center mb-4"
      >
        <p>Drag & drop images here, or</p>
        <button onClick={() => inputRef.current && inputRef.current.click()} className="mt-2 px-3 py-1 border">Select images</button>
        <input ref={inputRef} multiple type="file" accept="image/*" onChange={handleSelect} className="hidden" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {files.map((f, i) => (
          <div key={i} className="w-28 h-28 border p-1 relative">
            <button onClick={() => removeAt(i)} className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1">x</button>
            <img src={URL.createObjectURL(f)} alt={f.name} className="max-w-full max-h-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
