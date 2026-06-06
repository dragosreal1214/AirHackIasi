"""PNR (saved flight) endpoints. All scoped to the authenticated user."""

from fastapi import APIRouter, BackgroundTasks, Depends, status

from app.deps import CurrentUser, get_current_user
from app.models.schemas import CreatePnrInput, PnrStatus, PnrWithFlight
from app.services import notification_service, pnr_service

router = APIRouter(prefix="/pnrs", tags=["pnrs"])


@router.get("", response_model=list[PnrWithFlight])
async def list_pnrs(
    status: PnrStatus = "active",
    user: CurrentUser = Depends(get_current_user),
) -> list[PnrWithFlight]:
    return await pnr_service.list_pnrs(user.id, status)


@router.post("", response_model=PnrWithFlight, status_code=status.HTTP_201_CREATED)
async def create_pnr(
    payload: CreatePnrInput,
    background: BackgroundTasks,
    user: CurrentUser = Depends(get_current_user),
) -> PnrWithFlight:
    pnr = await pnr_service.create_pnr(user.id, payload)
    # If the new flight is already at high/critical fog risk, alert the user.
    if (
        pnr.disruption_id
        and pnr.current_risk
        and pnr.current_risk.level in ("high", "critical")
    ):
        background.add_task(
            notification_service.dispatch, user.phone_number, pnr.disruption_id
        )
    return pnr


@router.delete("/{pnr_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pnr(
    pnr_id: str,
    user: CurrentUser = Depends(get_current_user),
) -> None:
    await pnr_service.cancel_pnr(user.id, pnr_id)
