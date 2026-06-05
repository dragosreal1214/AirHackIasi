"""Disruption + alternatives endpoints."""

from fastapi import APIRouter, status

from app.models.schemas import Alternative, Disruption
from app.services import alternatives_service

router = APIRouter(tags=["disruptions"])


@router.get("/disruptions/{disruption_id}", response_model=Disruption)
async def get_disruption(disruption_id: str) -> Disruption:
    return await alternatives_service.get_disruption(disruption_id)


@router.get(
    "/disruptions/{disruption_id}/alternatives",
    response_model=list[Alternative],
)
async def get_alternatives(disruption_id: str) -> list[Alternative]:
    return await alternatives_service.get_alternatives(disruption_id)


@router.post(
    "/alternatives/{alternative_id}/select",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def select_alternative(alternative_id: str) -> None:
    await alternatives_service.select_alternative(alternative_id)
