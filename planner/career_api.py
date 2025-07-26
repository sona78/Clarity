from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
import json
from datetime import datetime
import uvicorn
from llm_career_planner import LLMCareerPlanner, CareerPlan, Milestone

app = FastAPI(
    title="Career Transition Plan API",
    description="AI-powered career transition planning with real-time market intelligence",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the planner
planner = LLMCareerPlanner()

# Request Models
class UserProfile(BaseModel):
    current_role: str = Field(..., description="Current job title or position")
    skills: str = Field(..., description="Comma-separated list of current skills")
    interests: str = Field(..., description="Professional interests and passions")
    goals: str = Field(..., description="Career goals and aspirations")
    financials: str = Field(..., description="Financial constraints and considerations")
    
    class Config:
        schema_extra = {
            "example": {
                "current_role": "Software Developer",
                "skills": "Python, JavaScript, SQL, Git",
                "interests": "Machine Learning, Data Analysis, AI",
                "goals": "Transition to Data Science, work on ML projects",
                "financials": "Can handle 3-month income reduction, have savings"
            }
        }

class CareerPlanRequest(BaseModel):
    user_profile: UserProfile
    target_role: str = Field(..., description="Desired role to transition to")
    target_industry: str = Field(default="Technology", description="Target industry")
    location: Optional[str] = Field(default="Remote", description="Preferred work location")
    timeline_months: Optional[int] = Field(default=9, description="Preferred timeline in months")
    
    class Config:
        schema_extra = {
            "example": {
                "user_profile": {
                    "current_role": "Software Developer",
                    "skills": "Python, JavaScript, SQL, Git",
                    "interests": "Machine Learning, Data Analysis, AI",
                    "goals": "Transition to Data Science, work on ML projects",
                    "financials": "Can handle 3-month income reduction, have savings"
                },
                "target_role": "Data Scientist",
                "target_industry": "Technology",
                "location": "Remote",
                "timeline_months": 9
            }
        }

# Response Models
class MilestoneResponse(BaseModel):
    id: str
    title: str
    description: str
    type: str
    priority: str
    estimated_duration_weeks: int
    target_date: str
    prerequisites: List[str]
    success_criteria: List[str]
    resources: List[Dict[str, str]]
    progress: float
    status: str

class MarketInsights(BaseModel):
    salary_range: Optional[Dict[str, int]] = None
    job_growth: Optional[str] = None
    demand_level: Optional[str] = None
    key_skills: Optional[List[str]] = None
    top_companies: Optional[List[str]] = None
    remote_percentage: Optional[int] = None

class CareerPlanResponse(BaseModel):
    user_id: str
    target_role: str
    target_industry: str
    current_role: str
    plan_duration_months: int
    milestones: List[MilestoneResponse]
    market_insights: MarketInsights
    created_date: str
    last_updated: str
    completion_percentage: float

class PlanUpdateRequest(BaseModel):
    milestone_id: str
    progress: float = Field(..., ge=0, le=100, description="Progress percentage (0-100)")
    status: Optional[str] = Field(default=None, description="Status: pending, in_progress, completed")

# Utility functions
def convert_career_plan_to_response(plan: CareerPlan) -> CareerPlanResponse:
    """Convert internal CareerPlan to API response format"""
    milestones_response = []
    for milestone in plan.milestones:
        milestone_response = MilestoneResponse(
            id=milestone.id,
            title=milestone.title,
            description=milestone.description,
            type=milestone.type.value,
            priority=milestone.priority.value,
            estimated_duration_weeks=milestone.estimated_duration_weeks,
            target_date=milestone.target_date,
            prerequisites=milestone.prerequisites,
            success_criteria=milestone.success_criteria,
            resources=milestone.resources,
            progress=milestone.progress,
            status=milestone.status
        )
        milestones_response.append(milestone_response)
    
    market_insights_response = MarketInsights(**plan.market_insights) if plan.market_insights else MarketInsights()
    
    return CareerPlanResponse(
        user_id=plan.user_id,
        target_role=plan.target_role,
        target_industry=plan.target_industry,
        current_role=plan.current_role,
        plan_duration_months=plan.plan_duration_months,
        milestones=milestones_response,
        market_insights=market_insights_response,
        created_date=plan.created_date,
        last_updated=plan.last_updated,
        completion_percentage=plan.completion_percentage
    )

# API Endpoints
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Career Transition Plan API",
        "version": "1.0.0",
        "status": "active",
        "endpoints": {
            "generate_plan": "/api/v1/generate-plan",
            "update_progress": "/api/v1/update-progress/{plan_id}",
            "export_plan": "/api/v1/export-plan/{plan_id}",
            "docs": "/docs"
        }
    }

@app.post("/api/v1/generate-plan", response_model=CareerPlanResponse)
async def generate_career_plan(request: CareerPlanRequest):
    """
    Generate a comprehensive career transition plan using AI and real-time market data.
    
    - **user_profile**: Complete user profile including skills, goals, and constraints
    - **target_role**: Desired role to transition to (e.g., "Data Scientist")
    - **target_industry**: Target industry (default: "Technology")
    - **location**: Preferred work location (default: "Remote")
    - **timeline_months**: Preferred timeline in months (default: 9)
    """
    try:
        # Convert request to dictionary format
        user_data = {
            "current_role": request.user_profile.current_role,
            "skills": request.user_profile.skills,
            "interests": request.user_profile.interests,
            "goals": request.user_profile.goals,
            "financials": request.user_profile.financials
        }
        
        # Generate plan using LLM
        career_plan = planner.generate_career_plan_with_llm(
            user_data=user_data,
            target_role=request.target_role,
            target_industry=request.target_industry
        )
        
        # Convert to response format
        response = convert_career_plan_to_response(career_plan)
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate career plan: {str(e)}")

@app.put("/api/v1/update-progress/{plan_id}")
async def update_milestone_progress(plan_id: str, update: PlanUpdateRequest):
    """
    Update progress for a specific milestone in a career plan.
    
    - **plan_id**: Unique identifier for the career plan
    - **milestone_id**: ID of the milestone to update
    - **progress**: Progress percentage (0-100)
    - **status**: Optional status update (pending, in_progress, completed)
    """
    try:
        # In a real implementation, you would:
        # 1. Load the plan from database using plan_id
        # 2. Update the specific milestone
        # 3. Save back to database
        # 4. Return updated plan
        
        # For now, return a success message
        return {
            "message": f"Progress updated for milestone {update.milestone_id} in plan {plan_id}",
            "milestone_id": update.milestone_id,
            "new_progress": update.progress,
            "new_status": update.status,
            "updated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update progress: {str(e)}")

@app.get("/api/v1/export-plan/{plan_id}")
async def export_career_plan(plan_id: str, format: str = "json"):
    """
    Export a career plan in the specified format.
    
    - **plan_id**: Unique identifier for the career plan
    - **format**: Export format (json, markdown)
    """
    try:
        # In a real implementation, you would load the plan from database
        # For now, return a placeholder response
        
        if format not in ["json", "markdown"]:
            raise HTTPException(status_code=400, detail="Format must be 'json' or 'markdown'")
        
        return {
            "message": f"Plan {plan_id} exported in {format} format",
            "format": format,
            "exported_at": datetime.now().isoformat(),
            "download_url": f"/downloads/plan_{plan_id}.{format}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export plan: {str(e)}")

@app.get("/api/v1/market-insights/{role}")
async def get_market_insights(role: str, industry: str = "Technology"):
    """
    Get current market insights for a specific role and industry.
    
    - **role**: Job role to research (e.g., "Data Scientist")
    - **industry**: Industry to focus on (default: "Technology")
    """
    try:
        # Gather market intelligence
        market_data = planner.gather_market_intelligence(role, industry)
        
        return {
            "role": role,
            "industry": industry,
            "market_data": market_data,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get market insights: {str(e)}")

@app.post("/api/v1/validate-profile")
async def validate_user_profile(profile: UserProfile):
    """
    Validate and analyze a user profile for career transition readiness.
    
    - **profile**: User profile to validate
    """
    try:
        # Basic validation and analysis
        skills_count = len([s.strip() for s in profile.skills.split(',') if s.strip()])
        
        readiness_score = 0
        feedback = []
        
        # Analyze profile completeness
        if len(profile.current_role) > 5:
            readiness_score += 20
        else:
            feedback.append("Provide more detailed current role information")
        
        if skills_count >= 3:
            readiness_score += 25
        else:
            feedback.append("List at least 3 current skills")
        
        if len(profile.interests) > 10:
            readiness_score += 20
        else:
            feedback.append("Provide more detailed interests")
        
        if len(profile.goals) > 10:
            readiness_score += 20
        else:
            feedback.append("Provide more specific career goals")
        
        if len(profile.financials) > 5:
            readiness_score += 15
        else:
            feedback.append("Consider financial planning for transition")
        
        return {
            "profile_completeness": f"{readiness_score}%",
            "skills_identified": skills_count,
            "readiness_level": "High" if readiness_score >= 80 else "Medium" if readiness_score >= 60 else "Low",
            "feedback": feedback,
            "recommended_next_steps": [
                "Complete profile if needed",
                "Generate career transition plan",
                "Review market insights for target role"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to validate profile: {str(e)}")

# Run the API server
if __name__ == "__main__":
    uvicorn.run(
        "career_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )