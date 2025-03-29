from fastapi import FastAPI

from app.api import routes  # if you have routes

app = FastAPI()

app.include_router(routes.router)
