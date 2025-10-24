import os
import requests
import mimetypes
from urllib.parse import urljoin

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')
SUPABASE_BUCKET = os.environ.get('SUPABASE_BUCKET', 'images')

if not SUPABASE_URL:
    raise RuntimeError('SUPABASE_URL not set in environment')
if not SUPABASE_SERVICE_KEY:
    print('Warning: SUPABASE_SERVICE_KEY not set — uploads will fail if attempted')

STORAGE_BASE = urljoin(SUPABASE_URL, '/storage/v1')

HEADERS = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}'
}


def upload_file(file_stream, dest_path, content_type=None):
    """
    Upload a file-like object to the Supabase storage bucket and return the public URL.
    dest_path should be the path within the bucket, e.g. 'uploads/1234.jpg'
    """
    if not SUPABASE_SERVICE_KEY:
        raise RuntimeError('SUPABASE_SERVICE_KEY is required for server-side uploads')

    if content_type is None:
        content_type = mimetypes.guess_type(dest_path)[0] or 'application/octet-stream'

    upload_url = f"{STORAGE_BASE}/object/{SUPABASE_BUCKET}/{dest_path}"

    resp = requests.put(upload_url, data=file_stream, headers={**HEADERS, 'Content-Type': content_type})
    if not resp.ok:
        raise RuntimeError(f'Upload failed: {resp.status_code} {resp.text}')

    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{dest_path}"
    return public_url


def public_url(path):
    return f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{path}"


def delete_file(path):
    """Delete an object at the given path inside the bucket. Path is the storage path (no bucket prefix)."""
    if not SUPABASE_SERVICE_KEY:
        raise RuntimeError('SUPABASE_SERVICE_KEY is required for server-side delete')

    delete_url = f"{STORAGE_BASE}/object/{SUPABASE_BUCKET}/{path}"
    resp = requests.delete(delete_url, headers=HEADERS)
    if not resp.ok:
        raise RuntimeError(f'Delete failed: {resp.status_code} {resp.text}')
    return True


def delete_file_by_url(url):
    """Given a public URL returned by public_url, extract the path and delete the file."""
    prefix = f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/"
    if url.startswith(prefix):
        path = url[len(prefix):]
        return delete_file(path)

    if url.startswith('/'):
        raise ValueError('Local uploads should be deleted via filesystem')

    marker = f"/{SUPABASE_BUCKET}/"
    if marker in url:
        idx = url.index(marker) + len(marker)
        path = url[idx:]
        return delete_file(path)

    raise ValueError('Could not determine storage path from URL')
