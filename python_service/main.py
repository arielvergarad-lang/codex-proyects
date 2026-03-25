from __future__ import annotations

import math
import os
from dataclasses import dataclass
from typing import List, Optional

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field


app = FastAPI(title="DeliveryCore Python Optimizer", version="1.0.0")


class Point(BaseModel):
    lat: float
    lng: float


class Order(BaseModel):
    id: Optional[int] = None
    code: str
    lat: float
    lng: float
    priority: int = Field(default=0, ge=0, le=1)
    service_minutes: int = Field(default=8, ge=1)
    demand: int = Field(default=1, ge=1)


class Marker(BaseModel):
    type: str = "hotspot"
    lat: Optional[float] = None
    lng: Optional[float] = None


class Config(BaseModel):
    scenario: str = "urban"
    traffic: int = Field(default=48, ge=0, le=100)
    weather: int = Field(default=22, ge=0, le=100)


class OptimizeRequest(BaseModel):
    depot: Point
    orders: List[Order]
    markers: List[Marker] = []
    config: Config
    workers: list = []


class OptimizeResponse(BaseModel):
    source: str = "python_fastapi"
    route_codes: List[str]
    eta_total_minutes: int
    speed_kmh: int
    notes: List[str]


@dataclass
class SimplePoint:
    lat: float
    lng: float


def haversine_km(a: SimplePoint, b: SimplePoint) -> float:
    r = 6371.0
    d_lat = math.radians(b.lat - a.lat)
    d_lng = math.radians(b.lng - a.lng)
    lat1 = math.radians(a.lat)
    lat2 = math.radians(b.lat)
    x = math.sin(d_lat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(d_lng / 2) ** 2
    return r * (2 * math.atan2(math.sqrt(x), math.sqrt(1 - x)))


def compute_speed(cfg: Config) -> float:
    scenario_factor = 1.1
    if cfg.scenario == "mixed":
        scenario_factor = 1.0
    elif cfg.scenario == "express":
        scenario_factor = 0.88
    traffic_factor = 1 + (cfg.traffic / 130.0)
    weather_factor = 1 + (cfg.weather / 240.0)
    raw = 41.0 / (scenario_factor * traffic_factor * weather_factor)
    return max(18.0, min(raw, 52.0))


def marker_penalty(markers: List[Marker], point: SimplePoint) -> float:
    penalty = 0.0
    for marker in markers:
        if marker.lat is None or marker.lng is None:
            continue
        if marker.type not in {"hotspot", "unsafe"}:
            continue
        d = haversine_km(point, SimplePoint(marker.lat, marker.lng))
        if d < 2.2:
            penalty += 0.3 if marker.type == "unsafe" else 0.18
    return penalty


def build_route(req: OptimizeRequest) -> List[Order]:
    pool = list(req.orders)
    ordered: List[Order] = []
    current = SimplePoint(req.depot.lat, req.depot.lng)
    while pool:
        def score(order: Order) -> float:
            point = SimplePoint(order.lat, order.lng)
            km = haversine_km(current, point)
            risk_penalty = marker_penalty(req.markers, point)
            priority_bonus = 0.8 if order.priority else 0.0
            return km + (risk_penalty * 2.2) - priority_bonus

        pool.sort(key=score)
        nxt = pool.pop(0)
        ordered.append(nxt)
        current = SimplePoint(nxt.lat, nxt.lng)
    return ordered


def estimate_eta(route: List[Order], req: OptimizeRequest) -> tuple[int, int]:
    speed = compute_speed(req.config)
    current = SimplePoint(req.depot.lat, req.depot.lng)
    total_minutes = 0.0
    for order in route:
        point = SimplePoint(order.lat, order.lng)
        km = haversine_km(current, point)
        travel = (km / speed) * 60.0 * (1 + marker_penalty(req.markers, point))
        total_minutes += travel + order.service_minutes
        current = point
    return int(round(total_minutes)), int(round(speed))


@app.get("/health")
def health():
    return {"ok": True, "service": "python_optimizer"}


@app.post("/optimize", response_model=OptimizeResponse)
def optimize(
    payload: OptimizeRequest,
    x_optimizer_token: str | None = Header(default=None),
):
    expected = os.getenv("PYTHON_OPTIMIZER_TOKEN", "")
    if expected and x_optimizer_token != expected:
        raise HTTPException(status_code=401, detail="invalid optimizer token")
    if not payload.orders:
        return OptimizeResponse(route_codes=[], eta_total_minutes=0, speed_kmh=int(round(compute_speed(payload.config))), notes=["Sin pedidos pendientes."])

    route = build_route(payload)
    eta, speed = estimate_eta(route, payload)
    notes = [
        f"Pedidos considerados: {len(route)}",
        f"Conductores activos reportados: {len(payload.workers)}",
        "Heuristica usada: distancia + riesgo - prioridad.",
    ]
    return OptimizeResponse(
        route_codes=[o.code for o in route],
        eta_total_minutes=eta,
        speed_kmh=speed,
        notes=notes,
    )
