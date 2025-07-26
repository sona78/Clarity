import os
from supabase import create_client, Client

from dotenv import load_dotenv

load_dotenv()

url: str = os.getenv("REACT_APP_SUPABASE_URL")
key: str = os.getenv("REACT_APP_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

def getUserInformationFromDB(username: str):
    response = supabase.table("User Information").select("*").eq("username", username).execute()
    
    if response.data:
        user_data = {
            "interests_values": response.data[0]['Interests + Values'],
            "work_experience": response.data[0]['Work Experience'],
            "circumstances": response.data[0]['Circumstances'], 
            "skills": response.data[0]['Skills'],
            "goals": response.data[0]['Goals']
        }
        return user_data