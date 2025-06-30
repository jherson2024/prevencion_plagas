from fastapi import APIRouter, HTTPException, Query
from database import get_connection
from typing import List, Dict

router = APIRouter()