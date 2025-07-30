from typing import Dict, List, Any, Optional
import json
from datetime import datetime, timedelta
from exa_py import Exa
from db import getUserInformationFromDB, storeUserPlanInDB
from models.milestone import *
from models.user import *
from clients import openai_client
from prompts import create_career_plan_prompt
from utils.timestamp_utils import get_current_timestamp


# Note: Plan storage now handled by database functions in db.py

class CascadingPlanManager:
    def __init__(self):
        self.milestone_order = ["1_month", "3_months", "1_year", "5_years"]
    
    def generate_initial_plan(self, user_profile: UserProfile) -> CareerPlan:
        """Generate initial career plan with all milestones"""
        
        # Generate comprehensive plan using LLM
        prompt = create_career_plan_prompt(user_profile)
        
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert career strategist. Generate comprehensive career transition plans with cascading milestone dependencies."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=3500
            )
            
            llm_response = response.choices[0].message.content
            return self.parse_comprehensive_plan(llm_response, user_profile)
            
        except Exception as e:
            raise Exception(f"LLM generation failed: {e}")
    
    def process_user_thoughts_to_updates(self, plan: CareerPlan, milestone_timeframe: str, user_thoughts: str, context: str = "") -> MilestoneUpdate:
        """Process user's natural language thoughts into structured milestone updates"""
        
        # Map timeframe to the correct milestone field
        milestone_field_map = {
            "1_month": plan.milestone_1,
            "3_months": plan.milestone_2,
            "1_year": plan.milestone_3,
            "5_years": plan.milestone_4
        }
        
        if milestone_timeframe not in milestone_field_map or milestone_field_map[milestone_timeframe] is None:
            raise ValueError(f"Invalid milestone timeframe: {milestone_timeframe}")
            
        current_milestone = milestone_field_map[milestone_timeframe]
        
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
            response = openai_client.chat.completions.create(
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
    
    def update_milestone_with_cascade(self, plan: CareerPlan, milestone_timeframe: str, updates: MilestoneUpdate) -> CareerPlan:
        """Update a specific milestone and cascade changes to subsequent milestones"""
        
        if milestone_timeframe not in self.milestone_order:
            raise ValueError(f"Invalid milestone timeframe: {milestone_timeframe}")
        
        # Map timeframe to the correct milestone field
        milestone_field_map = {
            "1_month": plan.milestone_1,
            "3_months": plan.milestone_2,
            "1_year": plan.milestone_3,
            "5_years": plan.milestone_4
        }
        
        if milestone_timeframe not in milestone_field_map or milestone_field_map[milestone_timeframe] is None:
            raise ValueError(f"Milestone {milestone_timeframe} not found in plan")
        
        milestone_index = self.milestone_order.index(milestone_timeframe)
        
        # Update the target milestone
        self.apply_milestone_updates(milestone_field_map[milestone_timeframe], updates)
        
        # Cascade updates to subsequent milestones
        subsequent_milestones = self.milestone_order[milestone_index + 1:]
        
        if subsequent_milestones:
            # Generate updated plan for subsequent milestones
            updated_plan = self.regenerate_subsequent_milestones(
                plan, milestone_timeframe, subsequent_milestones
            )
            
            # Update the plan with new milestone fields
            for timeframe in subsequent_milestones:
                if timeframe == "1_month":
                    plan.milestone_1 = updated_plan.milestone_1
                elif timeframe == "3_months":
                    plan.milestone_2 = updated_plan.milestone_2
                elif timeframe == "1_year":
                    plan.milestone_3 = updated_plan.milestone_3
                elif timeframe == "5_years":
                    plan.milestone_4 = updated_plan.milestone_4
                
            plan.last_updated = get_current_timestamp()
            
            storeUserPlanInDB(plan)
        
        return plan
    
    def regenerate_subsequent_milestones(self, plan: CareerPlan, updated_milestone: str, subsequent_milestones: List[str]) -> CareerPlan:
        """Regenerate subsequent milestones based on updated milestone"""
        
        # Create context for LLM about the changes
        milestone_field_map = {
            "1_month": plan.milestone_1,
            "3_months": plan.milestone_2,
            "1_year": plan.milestone_3,
            "5_years": plan.milestone_4
        }
        
        updated_milestone_data = milestone_field_map[updated_milestone]
        
        cascade_prompt = f"""
        A user has updated their {updated_milestone} milestone in their career transition plan. 
        Please regenerate the subsequent milestones to align with these changes.

        ORIGINAL PLAN CONTEXT:
        User ID: {plan.user_id}
        Plan Overview: {plan.overview}
        
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
            response = openai_client.chat.completions.create(
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
            
            # Create updated plan object with individual milestone fields
            updated_plan = CareerPlan(
                plan_id=plan.plan_id,
                user_id=plan.user_id,
                overview=plan.overview,
                milestone_1=updated_milestones.get("1_month", plan.milestone_1),
                milestone_2=updated_milestones.get("3_months", plan.milestone_2),
                milestone_3=updated_milestones.get("1_year", plan.milestone_3),
                milestone_4=updated_milestones.get("5_years", plan.milestone_4),
                created_date=plan.created_date,
                last_updated=get_current_timestamp(),
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
    

    def parse_comprehensive_plan(self, llm_response: str, user_profile: UserProfile) -> CareerPlan:
        """Parse LLM response into comprehensive career plan"""
        
        try:
            # Extract JSON from response
            start_idx = llm_response.find('{')
            end_idx = llm_response.rfind('}') + 1
            
            if start_idx == -1 or end_idx == 0:
                raise ValueError("No JSON found in response")
            
            json_str = llm_response[start_idx:end_idx]
            parsed_data = json.loads(json_str)
            
            # Create individual milestone objects
            milestone_1 = None
            milestone_2 = None
            milestone_3 = None
            milestone_4 = None
        
            for timeframe in self.milestone_order:
                if timeframe in parsed_data.get('milestones', {}):
                    m_data = parsed_data['milestones'][timeframe]
                    details_data = m_data.get('details', {})
                    
                    # Create the appropriate milestone detail type based on timeframe
                    if timeframe == "1_month":
                        milestone_detail = Milestone1Detail(
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
                            last_updated=get_current_timestamp(),
                            # milestone 1 specific fields
                            daily_tasks=details_data.get('daily_tasks', []),
                            weekly_goals=details_data.get('weekly_goals', []),
                            skill_focus=details_data.get('skill_focus', []),
                            networking_targets=details_data.get('networking_targets', []),
                            immediate_tools=details_data.get('immediate_tools', [])
                        )
                        milestone_1 = Milestone1(
                            milestone_id=f"{timeframe}_{get_current_timestamp().split('T')[0].replace('-', '')}",
                            title=m_data.get('title', f'{timeframe} milestone'),
                            overview=m_data.get('overview', ''),
                            details=milestone_detail
                        )
                    elif timeframe == "3_months":
                        milestone_detail = Milestone2Detail(
                            title=m_data.get('title', f'{timeframe} milestone'),
                            description=m_data.get('overview', ''),
                            timeline_weeks=details_data.get('timeline_weeks', 12),
                            key_objectives=details_data.get('key_objectives', []),
                            success_metrics=details_data.get('success_metrics', []),
                            recommended_actions=details_data.get('recommended_actions', []),
                            resources=details_data.get('resources', []),
                            potential_challenges=details_data.get('potential_challenges', []),
                            dependencies=details_data.get('dependencies', []),
                            budget_estimate=details_data.get('budget_estimate', 0.0),
                            exa_research_topics=details_data.get('exa_research_topics', []),
                            last_updated=get_current_timestamp(),
                            # milestone 2 specific fields
                            projects_to_complete=details_data.get('projects_to_complete', []),
                            certifications_target=details_data.get('certifications_target', []),
                            portfolio_items=details_data.get('portfolio_items', []),
                            industry_research=details_data.get('industry_research', []),
                            mentor_connections=details_data.get('mentor_connections', [])
                        )
                        milestone_2 = Milestone2(
                            milestone_id=f"{timeframe}_{get_current_timestamp().split('T')[0].replace('-', '')}",
                            title=m_data.get('title', f'{timeframe} milestone'),
                            overview=m_data.get('overview', ''),
                            details=milestone_detail
                        )
                    elif timeframe == "1_year":
                        milestone_detail = Milestone3Detail(
                            title=m_data.get('title', f'{timeframe} milestone'),
                            description=m_data.get('overview', ''),
                            timeline_weeks=details_data.get('timeline_weeks', 52),
                            key_objectives=details_data.get('key_objectives', []),
                            success_metrics=details_data.get('success_metrics', []),
                            recommended_actions=details_data.get('recommended_actions', []),
                            resources=details_data.get('resources', []),
                            potential_challenges=details_data.get('potential_challenges', []),
                            dependencies=details_data.get('dependencies', []),
                            budget_estimate=details_data.get('budget_estimate', 0.0),
                            exa_research_topics=details_data.get('exa_research_topics', []),
                            last_updated=get_current_timestamp(),
                            # milestone 3 specific fields
                            career_targets=details_data.get('career_targets', []),
                            salary_expectations=details_data.get('salary_expectations', {}),
                            professional_network=details_data.get('professional_network', []),
                            leadership_opportunities=details_data.get('leadership_opportunities', []),
                            market_positioning=details_data.get('market_positioning', [])
                        )
                        milestone_3 = Milestone3(
                            milestone_id=f"{timeframe}_{get_current_timestamp().split('T')[0].replace('-', '')}",
                            title=m_data.get('title', f'{timeframe} milestone'),
                            overview=m_data.get('overview', ''),
                            details=milestone_detail
                        )
                    elif timeframe == "5_years":
                        milestone_detail = Milestone4Detail(
                            title=m_data.get('title', f'{timeframe} milestone'),
                            description=m_data.get('overview', ''),
                            timeline_weeks=details_data.get('timeline_weeks', 260),
                            key_objectives=details_data.get('key_objectives', []),
                            success_metrics=details_data.get('success_metrics', []),
                            recommended_actions=details_data.get('recommended_actions', []),
                            resources=details_data.get('resources', []),
                            potential_challenges=details_data.get('potential_challenges', []),
                            dependencies=details_data.get('dependencies', []),
                            budget_estimate=details_data.get('budget_estimate', 0.0),
                            exa_research_topics=details_data.get('exa_research_topics', []),
                            last_updated=get_current_timestamp(),
                            # milestone 4 specific fields
                            vision_statement=details_data.get('vision_statement', ''),
                            financial_goals=details_data.get('financial_goals', {}),
                            industry_impact=details_data.get('industry_impact', []),
                            mentorship_goals=details_data.get('mentorship_goals', []),
                            exit_strategies=details_data.get('exit_strategies', []),
                            legacy_projects=details_data.get('legacy_projects', [])
                        )
                        milestone_4 = Milestone4(
                            milestone_id=f"{timeframe}_{get_current_timestamp().split('T')[0].replace('-', '')}",
                            title=m_data.get('title', f'{timeframe} milestone'),
                            overview=m_data.get('overview', ''),
                            details=milestone_detail
                        )
            
            # Create career plan
            # Generate plan ID with current timestamp
            timestamp_str = get_current_timestamp().replace(':', '').replace('-', '').replace('T', '_').split('.')[0]
            plan_id = f"plan_{user_profile.username}_{timestamp_str}"
            
            plan = CareerPlan(
                plan_id=plan_id,
                user_id=user_profile.username,
                overview=parsed_data.get('overview', {}),
                milestone_1=milestone_1,
                milestone_2=milestone_2,
                milestone_3=milestone_3,
                milestone_4=milestone_4,
                created_date=get_current_timestamp(),
                last_updated=get_current_timestamp()
            )
            
            # Plan will be stored in database by the calling function
            
            return plan
            
        except Exception as e:
            raise Exception(f"Failed to parse comprehensive plan: {e}")
    
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
    
    def create_minimal_cascade_updates(self, plan: CareerPlan, updated_milestone: str, subsequent_milestones: List[str]) -> CareerPlan:
        """Create minimal updates for cascade if LLM fails"""
        
        updated_milestones = {}
        
        milestone_field_map = {
            "1_month": plan.milestone_1,
            "3_months": plan.milestone_2,
            "1_year": plan.milestone_3,
            "5_years": plan.milestone_4
        }
        
        for timeframe in subsequent_milestones:
            if timeframe in milestone_field_map and milestone_field_map[timeframe]:
                existing = milestone_field_map[timeframe]
                # Mark as updated due to cascade
                existing.details.last_updated = datetime.now().isoformat()
                existing.details.dependencies.append(f"Updated due to {updated_milestone} changes")
                updated_milestones[timeframe] = existing
        
        return CareerPlan(
            plan_id=plan.plan_id,
            user_id=plan.user_id,
            overview=plan.overview,
            milestone_1=updated_milestones.get("1_month", plan.milestone_1),
            milestone_2=updated_milestones.get("3_months", plan.milestone_2),
            milestone_3=updated_milestones.get("1_year", plan.milestone_3),
            milestone_4=updated_milestones.get("5_years", plan.milestone_4),
            created_date=plan.created_date,
            last_updated=datetime.now().isoformat(),
            version=plan.version + 1
        )
