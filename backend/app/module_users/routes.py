from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser, current_user
from app.core.db import get_session
from app.module_users import service
from app.module_users.schemas import LoginIn, ProfilePatch, RefreshIn, RegisterIn, TokenOut, UserOut

router = APIRouter(prefix="/api")


@router.post("/auth/register", response_model=TokenOut, status_code=201)
async def register(data: RegisterIn, session: AsyncSession = Depends(get_session)):
    return await service.register(session, data)


@router.post("/auth/login", response_model=TokenOut)
async def login(data: LoginIn, request: Request, session: AsyncSession = Depends(get_session)):
    client_ip = request.client.host if request.client else "desconocida"
    return await service.login(session, data.email, data.password, client_ip)


@router.post("/auth/refresh", response_model=TokenOut)
async def refresh(data: RefreshIn, session: AsyncSession = Depends(get_session)):
    return await service.refresh(session, data.refresh_token)


@router.post("/auth/logout", status_code=204)
async def logout(data: RefreshIn, session: AsyncSession = Depends(get_session)):
    await service.logout(session, data.refresh_token)
    return Response(status_code=204)


@router.get("/users/me", response_model=UserOut)
async def me(user: CurrentUser = Depends(current_user), session: AsyncSession = Depends(get_session)):
    return await service.get_user(session, user.id)


@router.patch("/users/me", response_model=UserOut)
async def edit_me(
    data: ProfilePatch,
    user: CurrentUser = Depends(current_user),
    session: AsyncSession = Depends(get_session),
):
    return await service.update_profile(session, user.id, data.display_name)
