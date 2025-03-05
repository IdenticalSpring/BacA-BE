import { useState } from 'react';

export default function UploadForm() {
  const [video, setVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [videoURL, setVideoURL] = useState('');

  const handleFileChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!video) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('video', video);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setVideoURL(data.url);
    setUploading(false);
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Video'}
      </button>
      {videoURL && (
        <p>
          Uploaded Video:{' '}
          <a href={videoURL} target="_blank">
            {videoURL}
          </a>
        </p>
      )}
    </div>
  );
}
