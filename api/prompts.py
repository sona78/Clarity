
from models.user import UserProfile

def create_career_plan_prompt(user_profile: UserProfile) -> str:
    """
    Combines introspection and career plan generation into a single prompt.
    Takes a UserProfile and returns a string prompt for the LLM.
    """
    return f"""
    Carefully analyze the following user's profile, which consists of a list of questions and their corresponding answers. For each question and answer pair, generate actionable insights that will help inform and improve the user's career trajectory and predictions. Focus on identifying strengths, potential challenges, and opportunities relevant to career planning based on the user's responses.

    USER PROFILE (Questions and Answers):
    {user_profile}

    For each of the following categories, return a 2-3 sentence insight that will help guide career prediction and planning. Focus on how each aspect may impact the user's future career direction, adaptability, and success:
    - interests_values
    - work_experience
    - circumstances
    - skills
    - goals

    Now, based on your introspection above, create a comprehensive career plan for this user with specific, actionable milestones.

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
