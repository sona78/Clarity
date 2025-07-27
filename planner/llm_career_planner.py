import json
import os
import yaml
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum
from openai import OpenAI

class MilestoneType(Enum):
    SKILL_DEVELOPMENT = "skill_development"
    CERTIFICATION = "certification"
    NETWORKING = "networking"
    PORTFOLIO = "portfolio"
    JOB_APPLICATION = "job_application"
    EDUCATION = "education"
    FINANCIAL = "financial"
    EXPERIENCE = "experience"

class Priority(Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

@dataclass
class Milestone:
    id: str
    title: str
    description: str
    type: MilestoneType
    priority: Priority
    estimated_duration_weeks: int
    target_date: str
    prerequisites: List[str]
    success_criteria: List[str]
    resources: List[Dict[str, str]]
    progress: float = 0.0
    status: str = "pending"

@dataclass
class CareerPlan:
    user_id: str
    target_role: str
    target_industry: str
    current_role: str
    plan_duration_months: int
    milestones: List[Milestone]
    market_insights: Dict[str, Any]
    created_date: str
    last_updated: str
    completion_percentage: float = 0.0

class LLMCareerPlanner:
    def __init__(self):
        self.load_config()
        self.setup_openai()
        
    def load_config(self):
        """Load configuration from env.yaml"""
        try:
            with open('./env.yaml', 'r') as f:
                config = yaml.safe_load(f)
                self.openai_api_key = config.get('OPENAPI_KEY')
        except Exception as e:
            raise Exception(f"Failed to load config: {e}")
    
    def setup_openai(self):
        """Initialize OpenAI client"""
        if not self.openai_api_key:
            raise Exception("OpenAI API key not found in env.yaml")
        self.client = OpenAI(api_key=self.openai_api_key)
    
    def web_search(self, query: str, num_results: int = 5) -> List[Dict[str, Any]]:
        """Perform web search for current market data"""
        try:
            # Using DuckDuckGo API as a free alternative
            search_url = f"https://api.duckduckgo.com/"
            params = {
                'q': query,
                'format': 'json',
                'no_html': '1',
                'skip_disambig': '1'
            }
            
            response = requests.get(search_url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                results = []
                
                # Extract relevant results
                for item in data.get('RelatedTopics', [])[:num_results]:
                    if 'Text' in item and 'FirstURL' in item:
                        results.append({
                            'title': item.get('Text', '')[:100],
                            'url': item.get('FirstURL', ''),
                            'snippet': item.get('Text', '')
                        })
                
                return results
            else:
                return []
                
        except Exception as e:
            print(f"Web search failed: {e}")
            return []
    
    def gather_market_intelligence(self, target_role: str, target_industry: str) -> str:
        """Gather current market intelligence using web search"""
        search_queries = [
            f"{target_role} salary 2025 {target_industry}",
            f"{target_role} skills demand 2025",
            f"{target_role} job market trends 2025",
            f"{target_role} certification requirements 2025",
            f"{target_industry} hiring trends 2025"
        ]
        
        market_data = []
        for query in search_queries:
            results = self.web_search(query, 3)
            for result in results:
                market_data.append(f"Query: {query}\nResult: {result['snippet']}\n")
        
        return "\n".join(market_data)

    def generate_markdown_blurb(self, career_plan: CareerPlan) -> str:
        """
        Use OpenAI to turn the structured career plan data into a markdown blurb
        with foresight, insights, and actionable advice, including headings and details.
        """
        # Prepare a summary of the plan for the LLM
        plan_summary = {
            "target_role": career_plan.target_role,
            "target_industry": career_plan.target_industry,
            "current_role": career_plan.current_role,
            "plan_duration_months": career_plan.plan_duration_months,
            "milestones": [
                {
                    "title": m.title,
                    "description": m.description,
                    "type": m.type.value if hasattr(m.type, "value") else str(m.type),
                    "priority": m.priority.value if hasattr(m.priority, "value") else str(m.priority),
                    "estimated_duration_weeks": m.estimated_duration_weeks,
                    "success_criteria": m.success_criteria,
                    "resources": m.resources,
                    "prerequisites": m.prerequisites,
                    "status": m.status
                }
                for m in career_plan.milestones
            ],
            "market_insights": career_plan.market_insights,
            "created_date": career_plan.created_date
        }

        prompt = (
            "You are a career coach and future-of-work expert. "
            "Given the following structured career plan data, write a markdown-formatted blurb for the user. "
            "The blurb should:\n"
            "- Start with a motivating summary and outlook for the next 1-2 years in this career path.\n"
            "- Highlight key milestones and what to expect at each stage, using markdown headings.\n"
            "- Offer insights about the skills, market trends, and potential challenges ahead.\n"
            "- Give actionable advice and encouragement, referencing the plan's details.\n"
            "- Use markdown formatting (##, ###, bullet points, etc) for clarity and engagement.\n"
            "Be concise but insightful, and make sure to include foresight about the industry and role.\n\n"
            f"Structured Plan Data (JSON):\n{json.dumps(plan_summary, indent=2)}"
        )

        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert career coach and future-of-work analyst."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=900
            )
            markdown_blurb = response.choices[0].message.content
            return markdown_blurb
        except Exception as e:
            print(f"Failed to generate markdown blurb: {e}")
            return "Could not generate summary at this time."

    def generate_career_plan_with_llm(self, user_data: Dict[str, Any], target_role: str, target_industry: str) -> CareerPlan:
        """Generate career plan using OpenAI LLM with market intelligence"""
        
        # Gather current market data
        market_intelligence = self.gather_market_intelligence(target_role, target_industry)
        
        # Create prompt for LLM
        prompt = self.create_planning_prompt(user_data, target_role, target_industry, market_intelligence)
        
        try:
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert career transition advisor with access to current market data. Generate detailed, actionable career transition plans."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            llm_response = response.choices[0].message.content
            
            # Parse LLM response into structured plan
            career_plan = self.parse_llm_response(llm_response, user_data, target_role, target_industry, market_intelligence)

            markdown = self.generate_markdown_blurb(career_plan)
            return markdown
            
        except Exception as e:
            print(f"LLM generation failed: {e}")
            # Fallback to basic plan
            return self.create_fallback_plan(user_data, target_role, target_industry)
    
    def generate_career_plan_markdown(self, user_data: Dict[str, Any]) -> str:
        """Generate career plan as markdown text using OpenAI LLM"""
        
        # Create prompt for markdown generation
        prompt = f"""
        Create a comprehensive career transition plan in markdown format for the following profile:
        
        **User Profile:**
        - Interests & Values: {user_data.get('interests_values', '')}
        - Work Experience: {user_data.get('work_experience', '')}
        - Circumstances: {user_data.get('circumstances', '')}
        - Skills: {user_data.get('skills', '')}
        - Goals: {user_data.get('goals', '')}

        
        Generate a detailed markdown career transition plan with the following sections:
        1. Executive Summary
        2. Current State Analysis
        3. Target Role Analysis
        4. Skill Gap Analysis
        5. Action Plan with Timeline (specific milestones)
        6. Market Insights
        7. Resources & Next Steps
        
        Use proper markdown formatting with headers, bullet points, tables where appropriate.
        """
        
        try:
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert career transition advisor. Generate detailed, actionable career transition plans in markdown format."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=3000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error calling OpenAI API: {e}")
            # Fallback markdown plan
            return self.generate_fallback_markdown_plan(user_data)
    
    def generate_fallback_markdown_plan(self, user_data: Dict[str, Any]) -> str:
        """Generate a basic markdown plan when API fails"""
        return f"""
# Career Transition Plan: 


## Current Profile
- **Skills:** {user_data.get('skills', 'Not specified')}
- **Goals:** {user_data.get('goals', 'Not specified')}
- **Interests & Values:** {user_data.get('interests_values', 'Not specified')}

## Action Plan
1. **Skill Development** (Weeks 1-12)
   - Identify key skills
   - Enroll in relevant courses
   
2. **Portfolio Building** (Weeks 4-16)
   - Create projects showcasing target skills
   - Document work experience
   
3. **Networking** (Weeks 8-20)
   - Connect with professionals
   - Attend industry events

4. **Job Search** (Weeks 16-24)
   - Apply to positions
   - Prepare for interviews

## Next Steps
- Review and refine this plan
- Begin skill development activities
- Set up tracking system for progress
"""
    
    def create_planning_prompt(self, user_data: Dict[str, Any], target_role: str, target_industry: str, market_data: str) -> str:
        """Create comprehensive prompt for LLM plan generation"""
        
        prompt = f"""
Create a comprehensive career transition plan for someone transitioning to {target_role} in {target_industry}.

USER PROFILE:
- Current Role: {user_data.get('current_role', 'Not specified')}
- Current Skills: {user_data.get('skills', 'Not specified')}
- Interests: {user_data.get('interests', 'Not specified')}
- Goals: {user_data.get('goals', 'Not specified')}
- Financial Situation: {user_data.get('financials', 'Not specified')}

CURRENT MARKET DATA:
{market_data}

REQUIREMENTS:
Generate a detailed 2-year career transition plan with the following structure:

1. MARKET ANALYSIS:
   - Current salary ranges for {target_role}
   - Job market demand and growth projections
   - Key skills in highest demand
   - Top companies hiring
   - Remote work percentage

2. MILESTONES (create 6-8 milestones):
For each milestone, provide:
   - Title and description
   - Type (skill_development, certification, networking, portfolio, job_application, education, financial, experience)
   - Priority (high, medium, low)
   - Duration in weeks
   - Success criteria (2-3 specific, measurable goals)
   - Resources (2-3 specific learning resources with URLs where possible)
   - Prerequisites (if any)

3. SKILLS GAP ANALYSIS:
   - Missing critical skills
   - Existing relevant skills
   - Recommended learning path

IMPORTANT: Base recommendations on the current market data provided. Prioritize skills and certifications that are actually in demand in 2025. Make the plan realistic and actionable.

Format the response as JSON with this structure:
{{
    "market_analysis": {{
        "salary_range": {{"entry": 0, "mid": 0, "senior": 0}},
        "job_growth": "string",
        "demand_level": "string",
        "key_skills": ["skill1", "skill2"],
        "top_companies": ["company1", "company2"],
        "remote_percentage": 0
    }},
    "milestones": [
        {{
            "title": "string",
            "description": "string",
            "type": "skill_development",
            "priority": "high",
            "duration_weeks": 4,
            "success_criteria": ["criteria1", "criteria2"],
            "resources": [{{"name": "resource name", "url": "url", "type": "course"}}],
            "prerequisites": []
        }}
    ],
    "skills_analysis": {{
        "missing_skills": ["skill1", "skill2"],
        "existing_skills": ["skill1", "skill2"],
        "recommended_path": "string"
    }}
}}
"""
        return prompt
    
    def parse_llm_response(self, llm_response: str, user_data: Dict[str, Any], market_data: str) -> CareerPlan:
        """Parse LLM response into structured CareerPlan object"""
        
        try:
            # Try to extract JSON from LLM response
            start_idx = llm_response.find('{')
            end_idx = llm_response.rfind('}') + 1
            
            if start_idx == -1 or end_idx == 0:
                raise ValueError("No JSON found in response")
            
            json_str = llm_response[start_idx:end_idx]
            parsed_data = json.loads(json_str)
            
            # Create milestones from parsed data
            milestones = []
            current_date = datetime.now()
            
            for i, milestone_data in enumerate(parsed_data.get('milestones', [])):
                milestone = Milestone(
                    id=f"M{i+1:03d}",
                    title=milestone_data.get('title', f'Milestone {i+1}'),
                    description=milestone_data.get('description', ''),
                    type=MilestoneType(milestone_data.get('type', 'skill_development')),
                    priority=Priority(milestone_data.get('priority', 'medium')),
                    estimated_duration_weeks=milestone_data.get('duration_weeks', 4),
                    target_date=(current_date + timedelta(weeks=sum([m.get('duration_weeks', 4) for m in parsed_data.get('milestones', [])[:i+1]]))).isoformat(),
                    prerequisites=milestone_data.get('prerequisites', []),
                    success_criteria=milestone_data.get('success_criteria', []),
                    resources=milestone_data.get('resources', [])
                )
                milestones.append(milestone)
            
            # Create career plan
            plan = CareerPlan(
                user_id="user_001",
                target_role=target_role,
                target_industry=target_industry,
                current_role=user_data.get('current_role', 'Current Position'),
                plan_duration_months=24,
                milestones=milestones,
                market_insights=parsed_data.get('market_analysis', {}),
                created_date=datetime.now().isoformat(),
                last_updated=datetime.now().isoformat()
            )
            
            return plan
            
        except Exception as e:
            print(f"Failed to parse LLM response: {e}")
            return self.create_fallback_plan(user_data, target_role, target_industry)
    
    def create_fallback_plan(self, user_data: Dict[str, Any], target_role: str, target_industry: str) -> CareerPlan:
        """Create a basic fallback plan if LLM fails"""
        
        milestones = [
            Milestone(
                id="M001",
                title=f"Research {target_role} Requirements",
                description=f"Thoroughly research current requirements and trends for {target_role} roles",
                type=MilestoneType.SKILL_DEVELOPMENT,
                priority=Priority.HIGH,
                estimated_duration_weeks=2,
                target_date=(datetime.now() + timedelta(weeks=2)).isoformat(),
                prerequisites=[],
                success_criteria=["Complete market research", "Identify skill gaps"],
                resources=[{"name": "Industry Reports", "url": "#", "type": "research"}]
            ),
            Milestone(
                id="M002",
                title="Develop Core Skills",
                description="Focus on developing the most in-demand skills for the target role",
                type=MilestoneType.SKILL_DEVELOPMENT,
                priority=Priority.HIGH,
                estimated_duration_weeks=8,
                target_date=(datetime.now() + timedelta(weeks=10)).isoformat(),
                prerequisites=["M001"],
                success_criteria=["Complete online courses", "Build practical projects"],
                resources=[{"name": "Online Learning Platform", "url": "#", "type": "course"}]
            )
        ]
        
        return CareerPlan(
            user_id="user_001",
            target_role=target_role,
            target_industry=target_industry,
            current_role=user_data.get('current_role', 'Current Position'),
            plan_duration_months=9,
            milestones=milestones,
            market_insights={"note": "Fallback plan - limited market data"},
            created_date=datetime.now().isoformat(),
            last_updated=datetime.now().isoformat()
        )
    
    def export_plan(self, plan: CareerPlan, format: str = "json") -> str:
        """Export career plan in specified format"""
        
        if format == "json":
            # Convert dataclasses to dict for JSON serialization
            plan_dict = asdict(plan)
            return json.dumps(plan_dict, indent=2, default=str)
        
        elif format == "markdown":
            md_content = f"""# 🚀 Career Transition Plan: {plan.target_role}

**Target Industry:** {plan.target_industry}  
**Current Role:** {plan.current_role}  
**Plan Duration:** {plan.plan_duration_months} months  
**Completion:** {plan.completion_percentage:.1f}%  
**Created:** {plan.created_date}  
**Last Updated:** {plan.last_updated}

## 📊 Market Insights

"""
            
            if plan.market_insights:
                insights = plan.market_insights
                if 'salary_range' in insights:
                    salary = insights['salary_range']
                    md_content += f"**💰 Salary Range:**\n"
                    md_content += f"- Entry Level: ${salary.get('entry', 'N/A'):,}\n"
                    md_content += f"- Mid Level: ${salary.get('mid', 'N/A'):,}\n"
                    md_content += f"- Senior Level: ${salary.get('senior', 'N/A'):,}\n\n"
                
                if 'job_growth' in insights:
                    md_content += f"**📈 Job Growth:** {insights['job_growth']}\n"
                if 'demand_level' in insights:
                    md_content += f"**🔥 Demand Level:** {insights['demand_level']}\n"
                if 'remote_percentage' in insights:
                    md_content += f"**🏠 Remote Work:** {insights['remote_percentage']}%\n\n"
                
                if 'key_skills' in insights:
                    md_content += f"**🎯 Key Skills in Demand:**\n"
                    for skill in insights['key_skills']:
                        md_content += f"- {skill}\n"
                    md_content += "\n"
            
            md_content += "## 🎯 Milestones\n\n"
            
            for milestone in plan.milestones:
                status_emoji = "✅" if milestone.status == "completed" else "🔄" if milestone.status == "in_progress" else "⏳"
                type_emoji = {"skill_development": "📚", "certification": "🏆", "networking": "🤝", "portfolio": "💼", "job_application": "📝"}.get(milestone.type.value, "📋")
                priority_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(milestone.priority.value, "⚪")
                
                md_content += f"""### {status_emoji} {type_emoji} {milestone.title} ({milestone.id})

{priority_emoji} **Priority:** {milestone.priority.value.title()}  
⏱️ **Duration:** {milestone.estimated_duration_weeks} weeks  
📅 **Target Date:** {milestone.target_date}  
📈 **Progress:** {milestone.progress:.0f}%

{milestone.description}

**Success Criteria:**
{chr(10).join(f"- {criteria}" for criteria in milestone.success_criteria)}

**Resources:**
{chr(10).join(f"- [{resource.get('name', 'Resource')}]({resource.get('url', '#')})" for resource in milestone.resources)}

---

"""
            
            return md_content
        
        return "Unsupported format"

    def load_user_data(self, file_path: str) -> Dict[str, Any]:
        """Load user data from JSON file"""
        try:
            with open(file_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {"interests": "", "goals": "", "skills": "", "financials": "", "current_role": ""}

if __name__ == "__main__":
    planner = LLMCareerPlanner()
    
    # Load user data
    user_data = planner.load_user_data("/home/kcoelho/WorkUp/Clarity/user.json")
    
    # Generate plan using LLM
    print("🤖 Generating AI-powered career transition plan...")
    plan = planner.generate_career_plan_with_llm(
        user_data=user_data,
        target_role="Data Scientist",
        target_industry="Technology"
    )
    
    # Export and display plan
    print("\n" + "="*60)
    print(planner.export_plan(plan, "markdown"))