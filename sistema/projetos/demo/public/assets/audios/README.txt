Audio assets.

The legacy data files (/public/data/*.json) reference audio under this folder,
e.g. /assets/audios/respiracao-consciente.mp3 . Those binary audio files were
not part of the migration input and were intentionally omitted (per request).

Drop the real .mp3 files here using the exact paths referenced in the JSON to
enable playback. The player wiring (script.js) is fully migrated and will work
as soon as the files are present.
