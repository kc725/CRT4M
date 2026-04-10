import json
import uuid
from pathlib import Path

ANNOTATIONS_FILE = Path("backend/annotations.json")


def _load() -> dict:
    if not ANNOTATIONS_FILE.exists():
        return {}
    return json.loads(ANNOTATIONS_FILE.read_text())


def _save(data: dict) -> None:
    ANNOTATIONS_FILE.write_text(json.dumps(data, indent=2))


def get_annotations(document_id: str) -> list:
    data = _load()
    return data.get(document_id, [])


def add_annotation(document_id: str, page: int, note: str, selected_text: str) -> dict:
    data = _load()

    if document_id not in data:
        data[document_id] = []

    annotation = {
        "id": str(uuid.uuid4()),
        "page": page,
        "note": note,
        "selected_text": selected_text,
    }

    data[document_id].append(annotation)
    _save(data)
    return annotation


def delete_annotation(document_id: str, annotation_id: str) -> bool:
    data = _load()

    if document_id not in data:
        return False

    before = len(data[document_id])
    data[document_id] = [a for a in data[document_id] if a["id"] != annotation_id]

    if len(data[document_id]) == before:
        return False  # nothing was deleted

    _save(data)
    return True