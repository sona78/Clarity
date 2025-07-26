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