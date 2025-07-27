import os
from supabase import create_client, Client
# from cascading_career_api import UserProfile
from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()

url: str = os.getenv("REACT_APP_SUPABASE_URL")
key: str = os.getenv("REACT_APP_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)


class UserProfile(BaseModel):
    username: str = Field(..., description="Unique username for the user")
    interests_values: str = Field(..., description="Interests and values")
    work_experience: str = Field(..., description="Work experience details")
    circumstances: str = Field(..., description="Personal circumstances")
    skills: str = Field(..., description="Skills and competencies")
    goals: str = Field(..., description="Career goals and aspirations")


def getUserInformationFromDB(username: str):
    response = supabase.table("User Information").select("*").eq("username", username).execute()
    
    if response.data:
        user_profile = UserProfile(
            username=response.data[0]['username'],
            interests_values=response.data[0]['Interests + Values'],
            work_experience=response.data[0]['Work Experience'],
            circumstances=response.data[0]['Circumstances'],
            skills=response.data[0]['Skills'],
            goals=response.data[0]['Goals']
        )

        return user_profile
    else:
        # Return a default profile for users not in database
        return UserProfile(
            username=username,
            interests_values="Passionate about technology and innovation. Values continuous learning, work-life balance, and making meaningful impact through technology",
            work_experience="Currently working in business/operations role. Strong foundation in analytical thinking and problem-solving",
            circumstances="Can handle moderate income changes during transition. Prefer flexible learning schedule. Available for evening courses",
            skills="Analytical thinking, Problem-solving, Communication, Project management, Business analysis",
            goals="Transition to a technical role within 12-18 months. Focus on building practical skills. Target career growth and higher earning potential"
        )

    
if __name__ == "__main__":
    print(getUserInformationFromDB("sona.om78@gmail.com"))