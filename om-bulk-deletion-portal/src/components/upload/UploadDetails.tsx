type UploadDetailsProps = {
  uploadId: number | string;
};

export function UploadDetails({ uploadId }: UploadDetailsProps) {
  return <div>Upload #{uploadId}</div>;
}
