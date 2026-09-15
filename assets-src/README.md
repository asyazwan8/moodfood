# Source artwork

Originals as supplied. **Nothing in here is served or bundled** — it sits
outside `public/` on purpose.

- `background_IPC.png` — the background at full quality (1152×2048, 5.2 MB).
  The app ships `public/brand/background.webp`, a 666 KB WebP derived from it.
  That is a 87% saving, and it matters: the service worker precaches every
  asset so the kiosk works offline, so anything left in `public/` is paid for
  on every install.

To regenerate the shipped version after replacing this file:

```
python3 -c "from PIL import Image; \
  Image.open('assets-src/background_IPC.png').convert('RGB') \
  .save('public/brand/background.webp','WEBP',quality=82,method=6)"
```
