import urllib.request, json, os, uuid

img_path = r'C:\NCLL\ncllball.github.io\images\allstars\hrd_field_diagram.webp'
doc_id = '340d3882-de6e-4b52-916e-d9b503760d7b'
token = 'ol_api_lbfitIJV02TmadBBTuwEBANzEDb5UFcGUGt6vW'
base_url = 'https://outline.shikella.me'

# Step 1: create attachment slot
payload = json.dumps({
    'name': 'hrd_field_diagram.webp',
    'contentType': 'image/webp',
    'size': os.path.getsize(img_path),
    'documentId': doc_id
}).encode()
req = urllib.request.Request(
    f'{base_url}/api/attachments.create',
    data=payload,
    headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
    method='POST'
)
with urllib.request.urlopen(req) as resp:
    r = json.load(resp)

form = r['data']['form']
upload_url = base_url + r['data']['uploadUrl']
attachment_url = base_url + r['data']['attachment']['url']
print(f'Attachment URL: {attachment_url}')

# Step 2: multipart POST with all form fields + file
with open(img_path, 'rb') as f:
    img_data = f.read()

boundary = uuid.uuid4().hex
parts = b''
for k, v in form.items():
    parts += (
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="{k}"\r\n\r\n'
        f'{v}\r\n'
    ).encode()

# file field last
parts += (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="file"; filename="hrd_field_diagram.webp"\r\n'
    f'Content-Type: image/webp\r\n\r\n'
).encode() + img_data + f'\r\n--{boundary}--\r\n'.encode()

put_req = urllib.request.Request(
    upload_url,
    data=parts,
    headers={
        'Authorization': f'Bearer {token}',
        'Content-Type': f'multipart/form-data; boundary={boundary}'
    },
    method='POST'
)
try:
    with urllib.request.urlopen(put_req) as resp:
        print(f'Upload status: {resp.status}')
        print(f'Response: {resp.read()[:200]}')
except urllib.error.HTTPError as e:
    print(f'HTTP {e.code}: {e.read().decode()[:300]}')

print(f'\nAttachment URL: {attachment_url}')
