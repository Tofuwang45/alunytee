"use client";
import { useState, useEffect } from "react";

export default function TestPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadMessage("");
    }
  }

  function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      setUploadMessage("Please select a file first.");
      return;
    }
    setUploadMessage(`File "${selectedFile.name}" uploaded (simulated).`);
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white-50">
      <h1 className="text-2xl font-bold mb-4">Test File Upload</h1>
      <form onSubmit={handleUpload} className="flex flex-col items-center gap-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-black px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload
        </button>
      </form>
      {uploadMessage && (
        <div className="mt-4 text-green-600 font-semibold">{uploadMessage}</div>
      )}
    </div>
  );
}