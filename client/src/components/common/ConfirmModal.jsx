import React from 'react'

export default function ConfirmModal({ title = 'Confirm', message, onConfirm, onCancel, confirmLabel = 'Confirm', cancelLabel = 'Cancel' }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-md w-full">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="mb-4 text-sm text-gray-700">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 border">{cancelLabel}</button>
          <button onClick={onConfirm} className="px-3 py-2 bg-red-600 text-white">{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
