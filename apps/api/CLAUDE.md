# Aerly API Backend

## Architecture

- FastAPI app entry: `app/main.py`
- Routers under `app/routers/` map to URL paths
- Business logic in `app/services/`
- DB queries via SQLAlchemy 2.0 in `app/db/queries/`
- Pydantic models in `app/models/`
- Background jobs via Celery in `app/tasks/`

## Dependencies pattern

Use FastAPI dependency injection. Common ones in `app/deps.py`:

```python
from app.deps import get_current_user, get_db, get_redis

@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    ...
```

## Database queries

ALWAYS async. Use SQLAlchemy 2.0 syntax:

```python
from sqlalchemy import select
from app.db.models import User

async def get_user_by_id(db: AsyncSession, user_id: UUID) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()
```

## Error handling

Raise `HTTPException` with structured detail:

```python
raise HTTPException(
    status_code=409,
    detail={
        "code": "PNR_ALREADY_EXISTS",
        "message": "Acest zbor este deja în lista ta.",
        "details": {"pnr_id": str(existing.id)}
    }
)
```

Error handler middleware turns this into the API error format defined in `docs/api-spec.md`.

## Logging

```python
import structlog
logger = structlog.get_logger(__name__)
logger.info("event_name", key1=value1, key2=value2)
```

Never use `print()` or `logging` module directly.

## Testing

Smoke tests in `tests/`. Focus on:
- Auth flow
- PNR CRUD
- Alternative scoring
- ML prediction (rule-based + model)

Skip:
- Trivial getters
- Pure presentation logic
- External API mocking depths

## ML model

Models stored in `app/ml/models/*.joblib`. Loaded at app startup via `lifespan` context manager. Never load model per-request.

Fallback to rule-based prediction if model loading fails.
