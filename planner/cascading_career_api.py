from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
import json
from datetime import datetime, timedelta
import uvicorn
from llm_career_planner import LLMCareerPlanner
import requests
from exa_py import Exa
import yaml

app = FastAPI(
    title="Cascading Career Milestone API",
    description="Career planning with cascading milestone updates",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Set to False when using allow_origins=["*"]
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Initialize services
planner = LLMCareerPlanner()

try:
    with open('env.yaml', 'r') as f:
        config = yaml.safe_load(f)
        exa_api_key = config.get('EXA_API_KEY')
        if exa_api_key:
            exa = Exa(api_key=exa_api_key)
        else:
            exa = None
except Exception as e:
    exa = None

# Enhanced Models
class UserProfile(BaseModel):
    current_role: str = Field(..., description="Current job title or position")
    skills: str = Field(..., description="Comma-separated list of current skills")
    interests: str = Field(..., description="Professional interests and passions")
    goals: str = Field(..., description="Career goals and aspirations")
    financials: str = Field(..., description="Financial constraints and considerations")
    circumstances: Optional[str] = Field(default="", description="Personal circumstances")
    experience_years: Optional[int] = Field(default=0, description="Years of professional experience")
    education_level: Optional[str] = Field(default="", description="Highest education level")

class MilestoneUpdateRequest(BaseModel):
    user_thoughts: str = Field(..., description="User's thoughts, concerns, or desired changes in natural language")
    context: Optional[str] = Field(default="", description="Additional context or constraints")
    
class MilestoneUpdate(BaseModel):
    objectives: Optional[List[str]] = Field(default=None, description="Updated key objectives")
    timeline_weeks: Optional[int] = Field(default=None, description="Updated timeline in weeks")
    focus_areas: Optional[List[str]] = Field(default=None, description="Updated focus areas")
    budget: Optional[float] = Field(default=None, description="Budget allocation for this milestone")
    user_notes: Optional[str] = Field(default="", description="User-added notes and preferences")
    priority_level: Optional[str] = Field(default="medium", description="high, medium, or low priority")

class MilestoneDetail(BaseModel):
    title: str
    description: str
    timeline_weeks: int
    key_objectives: List[str]
    success_metrics: List[str]
    recommended_actions: List[str]
    resources: List[Dict[str, str]]
    potential_challenges: List[str]
    dependencies: List[str] = Field(default=[], description="Dependencies on previous milestones")
    budget_estimate: Optional[float] = Field(default=0.0, description="Estimated cost for milestone")
    exa_research_topics: List[str] = Field(default=[], description="Topics for additional research")
    user_notes: str = Field(default="", description="User-added information")
    priority_level: str = Field(default="medium", description="Priority level")
    last_updated: str

class Milestone(BaseModel):
    milestone_id: str
    timeframe: str
    title: str
    overview: str
    details: MilestoneDetail
    completion_status: float = Field(default=0.0, ge=0, le=100)
    status: str = Field(default="pending", description="pending, in_progress, completed")

class CareerPlan(BaseModel):
    plan_id: str
    user_id: str
    target_role: str
    target_industry: str
    overview: Dict[str, Any]
    milestones: Dict[str, Milestone]  # Keys: "1_month", "3_months", "1_year", "5_years"
    created_date: str
    last_updated: str
    version: int = Field(default=1, description="Plan version for tracking changes")

# In-memory storage (in production, use database)
plans_storage: Dict[str, CareerPlan] = {}

class CascadingPlanManager:
    def __init__(self):
        self.llm_planner = LLMCareerPlanner()
        self.milestone_order = ["1_month", "3_months", "1_year", "5_years"]
    
    def generate_initial_plan(self, user_profile: UserProfile, target_role: str, target_industry: str) -> CareerPlan:
        """Generate initial career plan with all milestones"""
        
        # Convert to dict for LLM processing
        user_data = {
            "current_role": user_profile.current_role,
            "skills": user_profile.skills,
            "interests": user_profile.interests,
            "goals": user_profile.goals,
            "financials": user_profile.financials,
            "circumstances": user_profile.circumstances,
            "experience_years": user_profile.experience_years,
            "education_level": user_profile.education_level
        }
        
        # Generate comprehensive plan using LLM
        prompt = self.create_comprehensive_prompt(user_data, target_role, target_industry)
        
        try:
            response = self.llm_planner.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert career strategist. Generate comprehensive career transition plans with cascading milestone dependencies."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=3500
            )
            
            llm_response = response.choices[0].message.content
            return self.parse_comprehensive_plan(llm_response, user_data, target_role, target_industry)
            
        except Exception as e:
            print(f"LLM generation failed: {e}")
            return self.create_fallback_plan(user_data, target_role, target_industry)
    
    def process_user_thoughts_to_updates(self, plan_id: str, milestone_timeframe: str, user_thoughts: str, context: str = "") -> MilestoneUpdate:
        """Process user's natural language thoughts into structured milestone updates"""
        
        if plan_id not in plans_storage:
            raise ValueError(f"Plan {plan_id} not found")
        
        plan = plans_storage[plan_id]
        current_milestone = plan.milestones[milestone_timeframe]
        
        # Create prompt for LLM to reason about user thoughts and generate updates
        reasoning_prompt = f"""
        A user wants to update their {milestone_timeframe} career milestone. 
        
        CURRENT MILESTONE:
        Title: {current_milestone.title}
        Current Objectives: {', '.join(current_milestone.details.key_objectives)}
        Current Timeline: {current_milestone.details.timeline_weeks} weeks
        Current Notes: {current_milestone.details.user_notes}
        
        USER'S THOUGHTS: "{user_thoughts}"
        
        ADDITIONAL CONTEXT: "{context}"
        
        Based on the user's thoughts, reason about what changes they want and generate structured updates.
        Consider their concerns, constraints, and desired modifications.
        
        Respond in JSON format:
        {{
            "reasoning": "Why these changes make sense based on user's thoughts",
            "updates": {{
                "objectives": ["updated objective 1", "updated objective 2"],
                "timeline_weeks": 12,
                "focus_areas": ["area1", "area2"],
                "user_notes": "Updated notes incorporating user thoughts",
                "priority_level": "high/medium/low"
            }}
        }}
        """
        
        try:
            response = self.llm_planner.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert career coach who interprets user concerns and translates them into actionable milestone updates."},
                    {"role": "user", "content": reasoning_prompt}
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            llm_response = response.choices[0].message.content
            
            # Parse the response
            start_idx = llm_response.find('{')
            end_idx = llm_response.rfind('}') + 1
            
            if start_idx == -1 or end_idx == 0:
                raise ValueError("No JSON found in LLM response")
            
            json_str = llm_response[start_idx:end_idx]
            parsed_data = json.loads(json_str)
            
            updates_data = parsed_data.get('updates', {})
            
            # Create MilestoneUpdate object
            milestone_update = MilestoneUpdate(
                objectives=updates_data.get('objectives'),
                timeline_weeks=updates_data.get('timeline_weeks'),
                focus_areas=updates_data.get('focus_areas'),
                user_notes=updates_data.get('user_notes', user_thoughts),
                priority_level=updates_data.get('priority_level', 'medium')
            )
            
            print(f"LLM Reasoning: {parsed_data.get('reasoning', 'No reasoning provided')}")
            
            return milestone_update
            
        except Exception as e:
            print(f"Failed to process user thoughts: {e}")
            # Fallback: create basic update with user thoughts as notes
            return MilestoneUpdate(
                user_notes=f"User feedback: {user_thoughts}. Context: {context}",
                priority_level='medium'
            )
    
    def update_milestone_with_cascade(self, plan_id: str, milestone_timeframe: str, updates: MilestoneUpdate) -> CareerPlan:
        """Update a specific milestone and cascade changes to subsequent milestones"""
        
        if plan_id not in plans_storage:
            raise ValueError(f"Plan {plan_id} not found")
        
        plan = plans_storage[plan_id]
        
        if milestone_timeframe not in self.milestone_order:
            raise ValueError(f"Invalid milestone timeframe: {milestone_timeframe}")
            
        if milestone_timeframe not in plan.milestones:
            raise ValueError(f"Milestone {milestone_timeframe} not found in plan")
        
        milestone_index = self.milestone_order.index(milestone_timeframe)
        
        # Update the target milestone
        self.apply_milestone_updates(plan.milestones[milestone_timeframe], updates)
        
        # Cascade updates to subsequent milestones
        subsequent_milestones = self.milestone_order[milestone_index + 1:]
        
        if subsequent_milestones:
            # Generate updated plan for subsequent milestones
            updated_plan = self.regenerate_subsequent_milestones(
                plan, milestone_timeframe, subsequent_milestones
            )
            
            # Update the plan
            plan.milestones.update(updated_plan.milestones)
            plan.last_updated = datetime.now().isoformat()
            plan.version += 1
            
            plans_storage[plan_id] = plan
        
        return plan
    
    def regenerate_subsequent_milestones(self, plan: CareerPlan, updated_milestone: str, subsequent_milestones: List[str]) -> CareerPlan:
        """Regenerate subsequent milestones based on updated milestone"""
        
        # Create context for LLM about the changes
        updated_milestone_data = plan.milestones[updated_milestone]
        
        cascade_prompt = f"""
        A user has updated their {updated_milestone} milestone in their career transition plan. 
        Please regenerate the subsequent milestones to align with these changes.

        ORIGINAL PLAN CONTEXT:
        Target Role: {plan.target_role}
        Target Industry: {plan.target_industry}
        
        UPDATED {updated_milestone.upper()} MILESTONE:
        Title: {updated_milestone_data.title}
        Objectives: {', '.join(updated_milestone_data.details.key_objectives)}
        Timeline: {updated_milestone_data.details.timeline_weeks} weeks
        User Notes: {updated_milestone_data.details.user_notes}
        Priority: {updated_milestone_data.details.priority_level}
        
        MILESTONES TO UPDATE: {', '.join(subsequent_milestones)}
        
        Please regenerate these subsequent milestones ensuring they:
        1. Build logically on the updated {updated_milestone} milestone
        2. Maintain realistic timelines and dependencies
        3. Align with the user's stated goals and constraints
        4. Keep the same overall career transition objective
        
        Return in JSON format with the same structure as before.
        """
        
        try:
            response = self.llm_planner.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert career strategist updating career plans based on milestone changes."},
                    {"role": "user", "content": cascade_prompt}
                ],
                temperature=0.7,
                max_tokens=2500
            )
            
            llm_response = response.choices[0].message.content
            
            # Parse the response and update only the subsequent milestones
            updated_milestones = self.parse_milestone_updates(llm_response, subsequent_milestones)
            
            # Create updated plan object
            updated_plan = CareerPlan(
                plan_id=plan.plan_id,
                user_id=plan.user_id,
                target_role=plan.target_role,
                target_industry=plan.target_industry,
                overview=plan.overview,
                milestones=updated_milestones,
                created_date=plan.created_date,
                last_updated=datetime.now().isoformat(),
                version=plan.version + 1
            )
            
            return updated_plan
            
        except Exception as e:
            print(f"Cascade update failed: {e}")
            # Return minimal updates if LLM fails
            return self.create_minimal_cascade_updates(plan, updated_milestone, subsequent_milestones)
    
    def apply_milestone_updates(self, milestone: Milestone, updates: MilestoneUpdate):
        """Apply user updates to a milestone"""
        
        if updates.objectives:
            milestone.details.key_objectives = updates.objectives
        
        if updates.timeline_weeks:
            milestone.details.timeline_weeks = updates.timeline_weeks
        
        if updates.focus_areas:
            # Add focus areas to objectives if not already there
            for area in updates.focus_areas:
                if area not in milestone.details.key_objectives:
                    milestone.details.key_objectives.append(f"Focus on {area}")
        
        if updates.budget:
            milestone.details.budget_estimate = updates.budget
        
        if updates.user_notes:
            milestone.details.user_notes = updates.user_notes
        
        if updates.priority_level:
            milestone.details.priority_level = updates.priority_level
        
        milestone.details.last_updated = datetime.now().isoformat()
    
    def create_comprehensive_prompt(self, user_data: Dict[str, Any], target_role: str, target_industry: str) -> str:
        """Create prompt for comprehensive plan generation"""
        
        return f"""
        Based on this user's profile, create a comprehensive career plan with specific, actionable milestones.
        
        USER PROFILE:
        - Current Role: {user_data.get('current_role', 'Not specified')}
        - Skills: {user_data.get('skills', 'Not specified')}
        - Interests: {user_data.get('interests', 'Not specified')}
        - Goals: {user_data.get('goals', 'Not specified')}
        - Financial Situation: {user_data.get('financials', 'Not specified')}
        - Circumstances: {user_data.get('circumstances', 'Not specified')}
        - Experience: {user_data.get('experience_years', 0)} years
        - Education: {user_data.get('education_level', 'Not specified')}
        
        Create a realistic career plan based ONLY on what the user wants (their goals and interests).
        
        RESPOND WITH THIS EXACT JSON STRUCTURE:
        
        {{
            "overview": {{
                "summary": "2-3 sentence summary based on user's specific goals",
                "key_focus_areas": ["area1", "area2", "area3"],
                "estimated_timeline": "Timeline based on user's goals",
                "success_probability": "Assessment with reasoning",
                "market_outlook": "Market analysis for user's target area",
                "salary_projection": {{"entry": "range", "mid": "range", "senior": "range"}},
                "critical_skills_gap": ["skill1", "skill2", "skill3"]
            }},
            "milestones": {{
                "1_month": {{
                    "title": "Foundation Phase",
                    "overview": "What to accomplish in month 1",
                    "details": {{
                        "timeline_weeks": 4,
                        "key_objectives": ["objective1", "objective2", "objective3"],
                        "success_metrics": ["metric1", "metric2"],
                        "recommended_actions": ["action1", "action2"],
                        "resources": [{{"name": "resource", "url": "url", "type": "course"}}],
                        "potential_challenges": ["challenge1", "challenge2"],
                        "dependencies": [],
                        "budget_estimate": 0.0,
                        "exa_research_topics": ["topic1", "topic2"]
                    }}
                }},
                "3_months": {{
                    "title": "Development Phase",
                    "overview": "Goals for months 1-3",
                    "details": {{
                        "timeline_weeks": 12,
                        "key_objectives": ["objective1", "objective2"],
                        "success_metrics": ["metric1", "metric2"],
                        "recommended_actions": ["action1", "action2"],
                        "resources": [{{"name": "resource", "url": "url", "type": "certification"}}],
                        "potential_challenges": ["challenge1", "challenge2"],
                        "dependencies": ["Complete 1_month foundation"],
                        "budget_estimate": 200.0,
                        "exa_research_topics": ["topic1", "topic2"]
                    }}
                }},
                "1_year": {{
                    "title": "Implementation Phase",
                    "overview": "Year one objectives",
                    "details": {{
                        "timeline_weeks": 52,
                        "key_objectives": ["objective1", "objective2"],
                        "success_metrics": ["metric1", "metric2"],
                        "recommended_actions": ["action1", "action2"],
                        "resources": [{{"name": "resource", "url": "url", "type": "experience"}}],
                        "potential_challenges": ["challenge1", "challenge2"],
                        "dependencies": ["Complete 3_months development"],
                        "budget_estimate": 500.0,
                        "exa_research_topics": ["topic1", "topic2"]
                    }}
                }},
                "5_years": {{
                    "title": "Mastery Phase",
                    "overview": "Long-term goals",
                    "details": {{
                        "timeline_weeks": 260,
                        "key_objectives": ["objective1", "objective2"],
                        "success_metrics": ["metric1", "metric2"],
                        "recommended_actions": ["action1", "action2"],
                        "resources": [{{"name": "resource", "url": "url", "type": "leadership"}}],
                        "potential_challenges": ["challenge1", "challenge2"],
                        "dependencies": ["Complete 1_year implementation"],
                        "budget_estimate": 1000.0,
                        "exa_research_topics": ["topic1", "topic2"]
                    }}
                }}
            }}
        }}
        
        Base everything on the user's stated goals and interests. Be specific and actionable.
        """
    
    def parse_comprehensive_plan(self, llm_response: str, user_data: Dict[str, Any], target_role: str, target_industry: str) -> CareerPlan:
        """Parse LLM response into comprehensive career plan"""
        
        try:
            # Extract JSON from response
            start_idx = llm_response.find('{')
            end_idx = llm_response.rfind('}') + 1
            
            if start_idx == -1 or end_idx == 0:
                raise ValueError("No JSON found in response")
            
            json_str = llm_response[start_idx:end_idx]
            parsed_data = json.loads(json_str)
            
            # Create milestones
            milestones = {}
            
            for timeframe in self.milestone_order:
                if timeframe in parsed_data.get('milestones', {}):
                    m_data = parsed_data['milestones'][timeframe]
                    details_data = m_data.get('details', {})
                    
                    milestone_detail = MilestoneDetail(
                        title=m_data.get('title', f'{timeframe} milestone'),
                        description=m_data.get('overview', ''),
                        timeline_weeks=details_data.get('timeline_weeks', 4),
                        key_objectives=details_data.get('key_objectives', []),
                        success_metrics=details_data.get('success_metrics', []),
                        recommended_actions=details_data.get('recommended_actions', []),
                        resources=details_data.get('resources', []),
                        potential_challenges=details_data.get('potential_challenges', []),
                        dependencies=details_data.get('dependencies', []),
                        budget_estimate=details_data.get('budget_estimate', 0.0),
                        exa_research_topics=details_data.get('exa_research_topics', []),
                        last_updated=datetime.now().isoformat()
                    )
                    
                    milestone = Milestone(
                        milestone_id=f"{timeframe}_{datetime.now().strftime('%Y%m%d')}",
                        timeframe=timeframe,
                        title=m_data.get('title', f'{timeframe} milestone'),
                        overview=m_data.get('overview', ''),
                        details=milestone_detail
                    )
                    
                    milestones[timeframe] = milestone
            
            # Create career plan
            plan_id = f"plan_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            plan = CareerPlan(
                plan_id=plan_id,
                user_id="user_001",
                target_role=target_role,
                target_industry=target_industry,
                overview=parsed_data.get('overview', {}),
                milestones=milestones,
                created_date=datetime.now().isoformat(),
                last_updated=datetime.now().isoformat()
            )
            
            # Store in memory
            plans_storage[plan_id] = plan
            
            return plan
            
        except Exception as e:
            print(f"Failed to parse comprehensive plan: {e}")
            return self.create_fallback_plan(user_data, target_role, target_industry)
    
    def parse_milestone_updates(self, llm_response: str, milestone_timeframes: List[str]) -> Dict[str, Milestone]:
        """Parse LLM response for milestone updates"""
        
        # Simplified parsing for milestone updates
        # In production, this would be more robust
        updated_milestones = {}
        
        for timeframe in milestone_timeframes:
            # Create basic updated milestone
            milestone_detail = MilestoneDetail(
                title=f"Updated {timeframe} milestone",
                description=f"Updated milestone for {timeframe}",
                timeline_weeks=4,
                key_objectives=[f"Updated objective for {timeframe}"],
                success_metrics=[f"Updated metric for {timeframe}"],
                recommended_actions=[f"Updated action for {timeframe}"],
                resources=[],
                potential_challenges=[],
                last_updated=datetime.now().isoformat()
            )
            
            milestone = Milestone(
                milestone_id=f"{timeframe}_{datetime.now().strftime('%Y%m%d')}",
                timeframe=timeframe,
                title=f"Updated {timeframe} milestone",
                overview=f"Updated overview for {timeframe}",
                details=milestone_detail
            )
            
            updated_milestones[timeframe] = milestone
        
        return updated_milestones
    
    def create_fallback_plan(self, user_data: Dict[str, Any], target_role: str, target_industry: str) -> CareerPlan:
        """Create fallback plan if LLM fails"""
        
        milestones = {}
        
        for i, timeframe in enumerate(self.milestone_order):
            milestone_detail = MilestoneDetail(
                title=f"{timeframe.replace('_', ' ').title()} Phase",
                description=f"Basic milestone for {timeframe}",
                timeline_weeks=4 * (i + 1),
                key_objectives=[f"Complete {timeframe} objectives"],
                success_metrics=[f"Achieve {timeframe} goals"],
                recommended_actions=[f"Execute {timeframe} plan"],
                resources=[],
                potential_challenges=[],
                last_updated=datetime.now().isoformat()
            )
            
            milestone = Milestone(
                milestone_id=f"{timeframe}_{datetime.now().strftime('%Y%m%d')}",
                timeframe=timeframe,
                title=f"{timeframe.replace('_', ' ').title()} Phase",
                overview=f"Basic overview for {timeframe}",
                details=milestone_detail
            )
            
            milestones[timeframe] = milestone
        
        plan_id = f"fallback_plan_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        plan = CareerPlan(
            plan_id=plan_id,
            user_id="user_001",
            target_role=target_role,
            target_industry=target_industry,
            overview={"summary": "Basic career transition plan"},
            milestones=milestones,
            created_date=datetime.now().isoformat(),
            last_updated=datetime.now().isoformat()
        )
        
        plans_storage[plan_id] = plan
        return plan
    
    def create_minimal_cascade_updates(self, plan: CareerPlan, updated_milestone: str, subsequent_milestones: List[str]) -> CareerPlan:
        """Create minimal updates for cascade if LLM fails"""
        
        updated_milestones = {}
        
        for timeframe in subsequent_milestones:
            if timeframe in plan.milestones:
                existing = plan.milestones[timeframe]
                # Mark as updated due to cascade
                existing.details.last_updated = datetime.now().isoformat()
                existing.details.dependencies.append(f"Updated due to {updated_milestone} changes")
                updated_milestones[timeframe] = existing
        
        return CareerPlan(
            plan_id=plan.plan_id,
            user_id=plan.user_id,
            target_role=plan.target_role,
            target_industry=plan.target_industry,
            overview=plan.overview,
            milestones=updated_milestones,
            created_date=plan.created_date,
            last_updated=datetime.now().isoformat(),
            version=plan.version + 1
        )

manager = CascadingPlanManager()

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "Cascading Career Milestone API v3.0",
        "features": {
            "individual_milestone_endpoints": True,
            "cascading_updates": True,
            "dependency_tracking": True,
            "exa_integration": True
        },
        "milestone_endpoints": {
            "1_month": "/api/v3/milestone/1_month/{plan_id}",
            "3_months": "/api/v3/milestone/3_months/{plan_id}",
            "1_year": "/api/v3/milestone/1_year/{plan_id}",
            "5_years": "/api/v3/milestone/5_years/{plan_id}"
        }
    }

@app.post("/api/v3/generate-plan", response_model=CareerPlan)
async def generate_cascading_plan(user_profile: UserProfile):
    """Generate initial career plan with cascading milestone structure"""
    try:
        # Extract target role and industry from user profile goals/interests
        target_role = user_profile.goals.split(',')[0].strip() if user_profile.goals else "Career Transition"
        target_industry = "Technology"  # Default, could be inferred from goals/interests
        
        plan = manager.generate_initial_plan(user_profile, target_role, target_industry)
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate plan: {str(e)}")

@app.get("/api/v3/plan/{plan_id}", response_model=CareerPlan)
async def get_plan(plan_id: str):
    """Get complete career plan"""
    if plan_id not in plans_storage:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plans_storage[plan_id]

@app.get("/api/v3/milestone/{timeframe}/{plan_id}", response_model=Milestone)
async def get_milestone(plan_id: str, timeframe: str):
    """Get specific milestone"""
    if plan_id not in plans_storage:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    plan = plans_storage[plan_id]
    if timeframe not in plan.milestones:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    return plan.milestones[timeframe]

@app.get("/api/v3/plans")
async def list_all_plans():
    """Get all available plan IDs for easy reference"""
    return {
        "plans": [
            {
                "plan_id": plan_id,
                "target_role": plan.target_role,
                "target_industry": plan.target_industry,
                "created_date": plan.created_date,
                "version": plan.version
            }
            for plan_id, plan in plans_storage.items()
        ],
        "total_plans": len(plans_storage)
    }

@app.put("/api/v3/milestone/{timeframe}/{plan_id}/update-naturally", response_model=CareerPlan)
async def update_milestone_naturally(plan_id: str, timeframe: str, request: MilestoneUpdateRequest):
    """
    Update a milestone using natural language thoughts/concerns.
    The LLM will reason about your input and update the milestone accordingly.
    
    Example: "I'm worried the timeline is too aggressive given my current workload"
    """
    try:
        if timeframe not in ["1_month", "3_months", "1_year", "5_years"]:
            raise HTTPException(status_code=400, detail="Invalid milestone timeframe")
        
        # Process user thoughts into structured updates
        structured_updates = manager.process_user_thoughts_to_updates(
            plan_id, timeframe, request.user_thoughts, request.context
        )
        
        # Apply the cascading update
        updated_plan = manager.update_milestone_with_cascade(plan_id, timeframe, structured_updates)
        
        return updated_plan
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update milestone: {str(e)}")

@app.put("/api/v3/milestone/{timeframe}/{plan_id}", response_model=CareerPlan)
async def update_milestone_with_cascade(plan_id: str, timeframe: str, updates: MilestoneUpdate):
    """
    Update a specific milestone and cascade changes to all subsequent milestones.
    
    This is the key feature - when you update milestone 2, milestones 3 and 4 automatically adjust.
    """
    try:
        if timeframe not in ["1_month", "3_months", "1_year", "5_years"]:
            raise HTTPException(status_code=400, detail="Invalid milestone timeframe")
        
        updated_plan = manager.update_milestone_with_cascade(plan_id, timeframe, updates)
        return updated_plan
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update milestone: {str(e)}")

@app.post("/api/v3/milestone/{timeframe}/{plan_id}/enhance")
async def enhance_milestone_with_exa(plan_id: str, timeframe: str, research_topics: List[str]):
    """Enhance specific milestone with Exa research"""
    try:
        if not exa:
            raise HTTPException(status_code=503, detail="Exa service not available")
        
        if plan_id not in plans_storage:
            raise HTTPException(status_code=404, detail="Plan not found")
        
        # Perform Exa research and update milestone
        enhanced_insights = {}
        for topic in research_topics:
            search_results = exa.search(
                query=f"{topic} career transition 2025",
                type="neural",
                num_results=3,
                text=True
            )
            
            insights = []
            for result in search_results.results:
                insights.append({
                    "title": result.title,
                    "url": result.url,
                    "snippet": result.text[:200] + "..." if result.text else ""
                })
            
            enhanced_insights[topic] = insights
        
        # Update milestone with research
        plan = plans_storage[plan_id]
        milestone = plan.milestones[timeframe]
        milestone.details.exa_research_topics = research_topics
        milestone.details.user_notes += f"\n\nExa Research conducted on: {', '.join(research_topics)}"
        milestone.details.last_updated = datetime.now().isoformat()
        
        return {
            "message": f"Enhanced {timeframe} milestone with Exa research",
            "research_topics": research_topics,
            "insights": enhanced_insights,
            "enhanced_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to enhance milestone: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "cascading_career_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )