import os
import uuid

import boto3


class R2Service:
    def __init__(self) -> None:
        self.account_id = os.environ["R2_ACCOUNT_ID"]
        self.bucket = os.environ["R2_BUCKET"]
        self.public_base_url = os.environ["R2_PUBLIC_BASE_URL"].rstrip("/")
        self.client = boto3.client(
            "s3",
            endpoint_url=f"https://{self.account_id}.r2.cloudflarestorage.com",
            aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
            aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
            region_name="auto",
        )

    def build_key(self, filename: str) -> str:
        suffix = filename.split(".")[-1].lower()
        return f"announcements/{uuid.uuid4()}.{suffix}"

    def presign_put(self, key: str, content_type: str, expires_in: int = 900) -> str:
        return self.client.generate_presigned_url(
            ClientMethod="put_object",
            Params={"Bucket": self.bucket, "Key": key, "ContentType": content_type},
            ExpiresIn=expires_in,
        )

    def init_multipart_upload(self, key: str, content_type: str) -> str:
        response = self.client.create_multipart_upload(
            Bucket=self.bucket,
            Key=key,
            ContentType=content_type,
        )
        return response["UploadId"]

    def presign_part(self, key: str, upload_id: str, part_number: int, expires_in: int = 900) -> str:
        return self.client.generate_presigned_url(
            ClientMethod="upload_part",
            Params={
                "Bucket": self.bucket,
                "Key": key,
                "UploadId": upload_id,
                "PartNumber": part_number,
            },
            ExpiresIn=expires_in,
        )

    def complete_multipart_upload(self, key: str, upload_id: str, parts: list[dict]) -> dict:
        return self.client.complete_multipart_upload(
            Bucket=self.bucket,
            Key=key,
            UploadId=upload_id,
            MultipartUpload={"Parts": parts},
        )

    def public_url(self, key: str) -> str:
        return f"{self.public_base_url}/{key}"
