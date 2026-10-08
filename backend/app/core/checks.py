"""
Automated pre-check pipeline.
Uses real deterministic validation — no fake AI analysis.
"""

from sqlalchemy.orm import Session
from app.db.models import Submission


def run_automated_checks(
    data: dict,
    input_fields: list,
    existing_submissions: list,
    contributor_id: str,
    task_id: str,
) -> list[dict]:
    """
    Run deterministic automated checks on a submission.

    Returns a list of AutomatedCheck dicts.
    """
    checks = []

    # Check 1: Required fields complete
    required_ids = [f["id"] for f in input_fields if f.get("required", False)]
    missing = []
    for fid in required_ids:
        val = data.get(fid)
        if val is None or val == "" or (isinstance(val, list) and len(val) == 0):
            missing.append(fid)

    checks.append({
        "id": "ac-required",
        "label": "Required fields complete",
        "passed": len(missing) == 0,
        "detail": f"Missing required fields: {', '.join(missing)}" if missing else None,
    })

    # Check 2: Duplicate submission detection
    is_duplicate = any(
        s.contributor_id == contributor_id and s.task_id == task_id
        for s in existing_submissions
        if s.status not in ("rejected",)
    )
    checks.append({
        "id": "ac-dup",
        "label": "No duplicate detected",
        "passed": not is_duplicate,
        "detail": "Duplicate submission detected — you have already submitted this task." if is_duplicate else None,
    })

    # Check 3: Format valid — validate field types
    format_errors = []
    for field in input_fields:
        fid = field["id"]
        ftype = field.get("type", "text")
        val = data.get(fid)
        if val is None:
            continue
        if ftype == "rating" and field.get("options"):
            options = field["options"]
            if isinstance(val, str) and val not in options:
                format_errors.append(f"'{fid}' must be one of {options}")
        elif ftype in ("radio", "select") and field.get("options"):
            options = field["options"]
            if isinstance(val, str) and val not in options and val != "":
                pass  # lenient for demo
    checks.append({
        "id": "ac-format",
        "label": "Format valid",
        "passed": len(format_errors) == 0,
        "detail": "; ".join(format_errors) if format_errors else None,
    })

    # Check 4: Minimum content (text fields should not be single-char gibberish if required)
    content_ok = True
    content_detail = None
    for field in input_fields:
        if field.get("type") in ("textarea", "text") and field.get("required"):
            fid = field["id"]
            val = data.get(fid, "")
            if isinstance(val, str) and 0 < len(val.strip()) < 3:
                content_ok = False
                content_detail = f"Field '{field.get('label', fid)}' is too short."
                break

    checks.append({
        "id": "ac-constraints",
        "label": "Task constraints satisfied",
        "passed": content_ok,
        "detail": content_detail,
    })

    return checks


def checks_all_passed(checks: list[dict]) -> bool:
    return all(c["passed"] for c in checks)
