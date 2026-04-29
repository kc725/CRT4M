from typing import BinaryIO

import pdfplumber
from dataclasses import dataclass


@dataclass
class ExtractedDocument:
    title: str
    pages: list[str]
    total_pages: int


def extract_pdf(file_bytes: BinaryIO, filename: str) -> ExtractedDocument:
    pages = []

    with pdfplumber.open(file_bytes) as pdf:
        for page in pdf.pages:
            text = page.extract_text(layout=True)  # layout=True preserves spacing
            pages.append(text or "")               # empty string if page has no text

    return ExtractedDocument(
        title=filename.removesuffix(".pdf"),
        pages=pages,
        total_pages=len(pages),
    )