# Archived memory 2026-09-12

Key: `mask-needs-a-text-only-element-ellipsis` (renamed — overlapped the
unrelated `mask-needs-a-text-only-element` mask-image trap).

Text: text-overflow never reaches an anonymous flex item: truncate on an
inline-flex button clips with no ellipsis, so the label needs its own
truncating element.

New key: `truncate-needs-a-label-element`. Renamed with owner approval.
