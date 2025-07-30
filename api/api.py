from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
import uvicorn
from exa_py import Exa
import yaml
import os
from db import getUserInformationFromDB, getUserPlanFromDB, storeUserPlanInDB
from plan_manager import CascadingPlanManager
from models.milestone import *
from models.user import *
from utils.timestamp_utils import parse_timestamp, is_timestamp_newer

app = FastAPI(
    title="Cascading Career Milestone API",
    description="Career planning with cascading milestone updates",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your domain
    allow_credentials=False,  # Set to False when using allow_origins=["*"]
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Note: Static files and frontend routing are handled by Vercel configuration
# The frontend build is served separately as a static deployment

try:
    # Try to load from env.yaml first (local development)
    exa_api_key = None
    if os.path.exists('env.yaml'):
        with open('env.yaml', 'r') as f:
            config = yaml.safe_load(f)
            exa_api_key = config.get('EXA_API_KEY')
    
    # Fallback to environment variable (production)
    if not exa_api_key:
        exa_api_key = os.getenv('EXA_API_KEY')
    
    if exa_api_key:
        exa = Exa(api_key=exa_api_key)
    else:
        exa = None
except Exception as e:
    exa = None



manager = CascadingPlanManager()

# Note: timestamp utilities now imported from utils.timestamp_utils

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "Cascading Career Milestone API v3.0",
        "features": {
            "individual_milestone_endpoints": True,
            "cascading_updates": True,
            "dependency_tracking": True,
            "exa_integration": True,
            "natural_language_processing": True
        },
        "cascade_endpoints": {
            "update_with_cascade": "PUT /api/v3/milestone/{timeframe}/{username}/update-cascade",
            "direct_update": "PUT /api/v3/milestone/{timeframe}/{username}/direct-update",
            "regenerate_subsequent": "POST /api/v3/plan/{username}/regenerate-subsequent",
            "process_thoughts": "POST /api/v3/milestone/{timeframe}/{username}/process-thoughts"
        },
        "milestone_endpoints": {
            "generate_plan": "POST /api/v3/generate-plan/{username}",
            "1_month": "/api/v3/milestone/1_month/{username}",
            "3_months": "/api/v3/milestone/3_months/{username}", 
            "1_year": "/api/v3/milestone/1_year/{username}",
            "5_years": "/api/v3/milestone/5_years/{username}",
            "generic": "/api/v3/milestone/{timeframe}/{username}"
        },
        "milestone_types": {
            "1_month": "Milestone1 - Focus on immediate, tactical actions with daily tasks and networking",
            "3_months": "Milestone2 - Focus on foundation building with projects and certifications",
            "1_year": "Milestone3 - Focus on career transitions with salary expectations and positioning",
            "5_years": "Milestone4 - Focus on long-term vision with financial goals and legacy projects"
        },
        "usage_examples": {
            "update_cascade": "Use natural language to update a milestone and cascade changes to subsequent ones",
            "direct_update": "Directly update milestone with structured data and cascade changes",
            "regenerate_subsequent": "Regenerate specific milestones based on changes to an earlier one",
            "process_thoughts": "Process natural language thoughts into structured updates (preview only)"
        }
    }

@app.post("/api/v3/generate-plan/{username}", response_model=CareerPlan)
async def generate_cascading_plan(username: str):
    """Generate initial career plan with cascading milestone structure"""
    try:
        career_plan = getUserPlanFromDB(username)
        print(f"User Plan {career_plan}")
            
        user_profile = getUserInformationFromDB(username)
        print(f"Retrieved user profile: {user_profile}")

        
        # Check if we should return existing plan (only if both timestamps exist and plan is newer)
        if career_plan and career_plan.last_updated and user_profile.last_updated:
            if is_timestamp_newer(career_plan.last_updated, user_profile.last_updated):
                print(f"Returning existing plan (plan: {career_plan.last_updated} > user: {user_profile.last_updated})")
                return career_plan
            else:
                print(f"Generating new plan (plan: {career_plan.last_updated} <= user: {user_profile.last_updated})")
            
        if not user_profile:
            raise HTTPException(status_code=404, detail=f"User {username} not found")

        print(f"Generating plan for {username}")
        plan = manager.generate_initial_plan(user_profile)
        storeUserPlanInDB(plan)
        return plan
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating plan: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate plan: {str(e)}")


# Cascade Update API Endpoints
@app.put("/api/v3/milestone/{timeframe}/{username}/update-cascade")
async def update_milestone_with_cascade(
    timeframe: str, 
    username: str, 
    request: MilestoneUpdateRequest
):
    """
    Update a milestone using natural language thoughts and cascade changes to subsequent milestones
    """
    try:
        # Get existing plan
        plan = getUserPlanFromDB(username)
        if not plan:
            raise HTTPException(status_code=404, detail=f"No plan found for user {username}")
        
        # Validate timeframe
        valid_timeframes = ["1_month", "3_months", "1_year", "5_years"]
        if timeframe not in valid_timeframes:
            raise HTTPException(status_code=400, detail=f"Invalid timeframe. Must be one of: {valid_timeframes}")
        
        # Process user thoughts into structured updates
        milestone_updates = manager.process_user_thoughts_to_updates(
            plan, timeframe, request.user_thoughts, request.context
        )
        
        # Apply cascade updates
        updated_plan = manager.update_milestone_with_cascade(
            plan, timeframe, milestone_updates
        )
        
        return {
            "message": f"Successfully updated {timeframe} milestone with cascade effects",
            "updated_plan": updated_plan,
            "processed_updates": milestone_updates,
            "cascade_affected": manager.milestone_order[manager.milestone_order.index(timeframe) + 1:] if timeframe != "5_years" else []
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in cascade update: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update milestone: {str(e)}")

@app.put("/api/v3/milestone/{timeframe}/{username}/direct-update")
async def direct_milestone_update(
    timeframe: str,
    username: str,
    updates: MilestoneUpdate
):
    """
    Directly update a milestone with structured updates and cascade to subsequent milestones
    """
    try:
        # Get existing plan
        plan = getUserPlanFromDB(username)
        if not plan:
            raise HTTPException(status_code=404, detail=f"No plan found for user {username}")
        
        # Validate timeframe
        valid_timeframes = ["1_month", "3_months", "1_year", "5_years"]
        if timeframe not in valid_timeframes:
            raise HTTPException(status_code=400, detail=f"Invalid timeframe. Must be one of: {valid_timeframes}")
        
        # Apply cascade updates
        updated_plan = manager.update_milestone_with_cascade(
            plan, timeframe, updates
        )
        
        return {
            "message": f"Successfully updated {timeframe} milestone with direct updates",
            "updated_plan": updated_plan,
            "applied_updates": updates,
            "cascade_affected": manager.milestone_order[manager.milestone_order.index(timeframe) + 1:] if timeframe != "5_years" else []
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in direct update: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update milestone: {str(e)}")

@app.post("/api/v3/plan/{username}/regenerate-subsequent")
async def regenerate_subsequent_milestones_endpoint(
    username: str,
    updated_milestone: str,
    subsequent_milestones: List[str]
):
    """
    Regenerate specific subsequent milestones based on changes to an earlier milestone
    """
    try:
        # Get existing plan
        plan = getUserPlanFromDB(username)
        if not plan:
            raise HTTPException(status_code=404, detail=f"No plan found for user {username}")
        
        # Validate milestones
        valid_timeframes = ["1_month", "3_months", "1_year", "5_years"]
        if updated_milestone not in valid_timeframes:
            raise HTTPException(status_code=400, detail=f"Invalid updated_milestone. Must be one of: {valid_timeframes}")
        
        for milestone in subsequent_milestones:
            if milestone not in valid_timeframes:
                raise HTTPException(status_code=400, detail=f"Invalid milestone in subsequent_milestones: {milestone}")
        
        # Regenerate subsequent milestones
        updated_plan = manager.regenerate_subsequent_milestones(
            plan, updated_milestone, subsequent_milestones
        )
        
        # Store updated plan
        storeUserPlanInDB(updated_plan)
        
        return {
            "message": f"Successfully regenerated milestones: {subsequent_milestones}",
            "updated_plan": updated_plan,
            "based_on": updated_milestone,
            "regenerated_milestones": subsequent_milestones
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in regenerating milestones: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to regenerate milestones: {str(e)}")

@app.post("/api/v3/milestone/{timeframe}/{username}/process-thoughts")
async def process_user_thoughts_endpoint(
    timeframe: str,
    username: str,
    request: MilestoneUpdateRequest
):
    """
    Process user's natural language thoughts into structured milestone updates (without applying them)
    """
    try:
        # Get existing plan
        plan = getUserPlanFromDB(username)
        if not plan:
            raise HTTPException(status_code=404, detail=f"No plan found for user {username}")
        
        # Validate timeframe
        valid_timeframes = ["1_month", "3_months", "1_year", "5_years"]
        if timeframe not in valid_timeframes:
            raise HTTPException(status_code=400, detail=f"Invalid timeframe. Must be one of: {valid_timeframes}")
        
        # Process user thoughts into structured updates
        milestone_updates = manager.process_user_thoughts_to_updates(
            plan, timeframe, request.user_thoughts, request.context
        )
        
        return {
            "message": "Successfully processed user thoughts",
            "timeframe": timeframe,
            "user_thoughts": request.user_thoughts,
            "context": request.context,
            "processed_updates": milestone_updates,
            "note": "These updates have not been applied. Use /update-cascade to apply them."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error processing thoughts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process thoughts: {str(e)}")

# TODO: Legacy endpoints to be reimplemented:
# - PUT /api/v3/milestone/{timeframe}/{username}/update-naturally (replaced by update-cascade)
# - PUT /api/v3/milestone/{timeframe}/{username} (replaced by direct-update)  
# - POST /api/v3/milestone/{timeframe}/{username}/enhance

if __name__ == "__main__":
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )