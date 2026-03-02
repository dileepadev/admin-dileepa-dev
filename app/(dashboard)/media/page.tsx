import { UploadPage } from './upload-page';

export default function MediaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Media Upload</h1>
        <p className="text-muted-foreground">Upload and manage images via Cloudinary.</p>
      </div>

      <UploadPage />
    </div>
  );
}
