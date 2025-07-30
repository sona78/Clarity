from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
from models.milestone import Milestone1, Milestone2, Milestone3, Milestone4

class UserProfile(BaseModel):
    username: str = Field(..., description="Unique username for the user")
    interests_values: str = Field(..., description="Interests and values")
    work_experience: str = Field(..., description="Work experience details")
    circumstances: str = Field(..., description="Personal circumstances")
    skills: str = Field(..., description="Skills and competencies")
    goals: str = Field(..., description="Career goals and aspirations")
    created_at: Optional[str] = Field(default=None, description="Timestamp when the profile was created")
    last_updated: Optional[str] = Field(default=None, description="Timestamp when the profile was last updated")



class CareerPlan(BaseModel):
    plan_id: str
    user_id: str
    overview: Dict[str, Any]
    milestone_1: Optional[Milestone1] = Field(default=None, description="Milestone 1 with immediate focus (1-month)")
    milestone_2: Optional[Milestone2] = Field(default=None, description="Milestone 2 with foundation building (3-months)")
    milestone_3: Optional[Milestone3] = Field(default=None, description="Milestone 3 with career transition focus (1-year)")
    milestone_4: Optional[Milestone4] = Field(default=None, description="Milestone 4 with long-term vision (5-years)")
    created_date: str
    last_updated: str
    version: int = Field(default=1, description="Plan version for tracking changes")


