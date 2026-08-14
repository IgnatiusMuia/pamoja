import re

# Phrases linked to dating, romance or adult services — intended to catch
# solicitation without false-positiving normal, friendly conversation.
BANNED_TERMS = [
    "escort",
    "escorts",
    "prostitute",
    "prostitution",
    "sex work",
    "sex worker",
    "pay for sex",
    "pay for play",
    "p4p",
    "gfe",
    "girlfriend experience",
    "boyfriend experience",
    "no strings attached",
    "no strings",
    "friends with benefit",
    "fwb",
    "one night stand",
    "ons",
    "casual sex",
    "mileage",
    "bareback",
    "no condom",
    "porn",
    "pornography",
    "striptease",
    "lap dance",
    "mpango wa kando",
    "malaya",
    "kuma",
    "mboro",
]

_TOKEN_RE = re.compile(r"[a-z0-9']+", re.IGNORECASE)


def _words(text: str) -> list[str]:
    return [w.group(0).lower() for w in _TOKEN_RE.finditer(text or "")]


def scan(text: str) -> list[str]:
    """Return banned terms found in text (empty list = clean)."""
    if not text:
        return []
    words = _words(text)
    found: set[str] = set()
    for term in BANNED_TERMS:
        tokens = term.split()
        if len(tokens) == 1:
            if tokens[0] in words:
                found.add(term)
        else:
            joined = " ".join(words)
            if term in joined:
                found.add(term)
    return sorted(found)


def censor(text: str | None, terms: list[str]) -> str:
    """Replace banned terms in text with ***."""
    if not text:
        return text or ""
    out = text
    for term in terms:
        out = re.sub(re.escape(term), "***", out, flags=re.IGNORECASE)
    return out


def flag_message(db, sender: "User", text: str) -> tuple[str, list[str]]:
    """Scan message text; return (censored_body, matched_terms). Creates a report if flagged."""
    from .models import Report

    terms = scan(text)
    if not terms:
        return text, []
    censored = censor(text, terms)
    report = Report(
        reporter_id=sender.id,
        reported_id=sender.id,
        reason="auto-flagged content",
        details=f"Message contained disallowed content: {', '.join(terms)}. Original text censored.",
    )
    db.add(report)
    return censored, terms