from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional


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

# Base milestone detail class
class BaseMilestoneDetail(BaseModel):
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

# Milestone 1 Detail - Focus on immediate, tactical actions (1-month timeframe)
class Milestone1Detail(BaseMilestoneDetail):
    daily_tasks: List[str] = Field(default=[], description="Daily tasks and habits to establish")
    weekly_goals: List[str] = Field(default=[], description="Weekly goals and checkpoints")
    skill_focus: List[str] = Field(default=[], description="Specific skills to develop this month")
    networking_targets: List[str] = Field(default=[], description="People or groups to connect with")
    immediate_tools: List[Dict[str, str]] = Field(default=[], description="Tools and software to learn")

# Milestone 2 Detail - Focus on building foundations (3-month timeframe)
class Milestone2Detail(BaseMilestoneDetail):
    projects_to_complete: List[str] = Field(default=[], description="Specific projects to finish")
    certifications_target: List[str] = Field(default=[], description="Certifications to pursue")
    portfolio_items: List[str] = Field(default=[], description="Portfolio pieces to create")
    industry_research: List[str] = Field(default=[], description="Industry trends to research")
    mentor_connections: List[str] = Field(default=[], description="Mentors to find and connect with")

# Milestone 3 Detail - Focus on career transitions and growth (1-year timeframe)
class Milestone3Detail(BaseMilestoneDetail):
    career_targets: List[str] = Field(default=[], description="Specific career positions or roles")
    salary_expectations: Dict[str, Any] = Field(default={}, description="Expected salary ranges and negotiation points")
    professional_network: List[str] = Field(default=[], description="Professional network expansion goals")
    leadership_opportunities: List[str] = Field(default=[], description="Leadership roles to pursue")
    market_positioning: List[str] = Field(default=[], description="How to position yourself in the market")

# Milestone 4 Detail - Focus on long-term vision and legacy (5-year timeframe)
class Milestone4Detail(BaseMilestoneDetail):
    vision_statement: str = Field(default="", description="Personal vision for where you want to be")
    financial_goals: Dict[str, Any] = Field(default={}, description="Financial targets and investment strategy")
    industry_impact: List[str] = Field(default=[], description="Ways to impact your industry")
    mentorship_goals: List[str] = Field(default=[], description="How you plan to mentor others")
    exit_strategies: List[str] = Field(default=[], description="Potential exit strategies or retirement plans")
    legacy_projects: List[str] = Field(default=[], description="Projects that will define your legacy")

# Base milestone class
class BaseMilestone(BaseModel):
    milestone_id: str
    timeframe: str
    title: str
    overview: str
    completion_status: float = Field(default=0.0, ge=0, le=100)
    status: str = Field(default="pending", description="pending, in_progress, completed")

# Specific milestone types
class Milestone1(BaseMilestone):
    details: Milestone1Detail
    timeframe: str = Field(default="1_month", description="Fixed timeframe for milestone 1 (1-month)")

class Milestone2(BaseMilestone):
    details: Milestone2Detail
    timeframe: str = Field(default="3_months", description="Fixed timeframe for milestone 2 (3-months)")

class Milestone3(BaseMilestone):
    details: Milestone3Detail
    timeframe: str = Field(default="1_year", description="Fixed timeframe for milestone 3 (1-year)")

class Milestone4(BaseMilestone):
    details: Milestone4Detail
    timeframe: str = Field(default="5_years", description="Fixed timeframe for milestone 4 (5-years)")

# Keep the generic classes for backward compatibility
MilestoneDetail = BaseMilestoneDetail
Milestone = BaseMilestone

# Legacy aliases for backward compatibility
OneMonthMilestone = Milestone1
ThreeMonthMilestone = Milestone2
OneYearMilestone = Milestone3
FiveYearMilestone = Milestone4

OneMonthMilestoneDetail = Milestone1Detail
ThreeMonthMilestoneDetail = Milestone2Detail
OneYearMilestoneDetail = Milestone3Detail
FiveYearMilestoneDetail = Milestone4Detail