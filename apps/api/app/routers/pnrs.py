"""PNR (saved flight) endpoints."""

from fastapi import APIRouter, status

from app.models.schemas import CreatePnrInput, PnrStatus, PnrWithFlight
from app.services import pnr_service

router = APIRouter(prefix="/pnrs", tags=["pnrs"])


@router.get("", response_model=list[PnrWithFlight])
async def list_pnrs(status: PnrStatus = "active") -> list[PnrWithFlight]:
    return await pnr_service.list_pnrs(status)


@router.post("", response_model=PnrWithFlight, status_code=status.HTTP_201_CREATED)
async def create_pnr(payload: CreatePnrInput) -> PnrWithFlight:
    return await pnr_service.create_pnr(payload)


@router.delete("/{pnr_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pnr(pnr_id: str) -> None:
    await pnr_service.cancel_pnr(pnr_id)
