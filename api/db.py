import os
from supabase import create_client, Client
from dotenv import load_dotenv
from models.milestone import *
from models.user import *
from utils.timestamp_utils import get_current_timestamp

load_dotenv('../.env')

url: str = os.getenv("REACT_APP_SUPABASE_URL")
key: str = os.getenv("REACT_APP_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

CAREER_PLANS = 'Career Plans'
USER_INFORMATION = 'User Information'

def getUserPlanFromDB(username: str):
    user_data = {}
    try:
        # Look up by username field (Career Plans table uses username, not user_id)
        response = supabase.table(CAREER_PLANS).select("*").eq("username", username).execute()
        if response.data:
            # Reconstruct milestone objects from stored data
            milestone_1 = None
            milestone_2 = None
            milestone_3 = None
            milestone_4 = None
            
            if response.data[0]['milestone_1']:
                m1_data = response.data[0]['milestone_1']
                details_data = m1_data.get('details', {})
                milestone_1 = Milestone1(
                    milestone_id=m1_data.get('milestone_id', ''),
                    title=m1_data.get('title', ''),
                    overview=m1_data.get('overview', ''),
                    completion_status=m1_data.get('completion_status', 0.0),
                    status=m1_data.get('status', 'pending'),
                    details=Milestone1Detail(**details_data)
                )
            
            if response.data[0]['milestone_2']:
                m2_data = response.data[0]['milestone_2']
                details_data = m2_data.get('details', {})
                milestone_2 = Milestone2(
                    milestone_id=m2_data.get('milestone_id', ''),
                    title=m2_data.get('title', ''),
                    overview=m2_data.get('overview', ''),
                    completion_status=m2_data.get('completion_status', 0.0),
                    status=m2_data.get('status', 'pending'),
                    details=Milestone2Detail(**details_data)
                )
            
            if response.data[0]['milestone_3']:
                m3_data = response.data[0]['milestone_3']
                details_data = m3_data.get('details', {})
                milestone_3 = Milestone3(
                    milestone_id=m3_data.get('milestone_id', ''),
                    title=m3_data.get('title', ''),
                    overview=m3_data.get('overview', ''),
                    completion_status=m3_data.get('completion_status', 0.0),
                    status=m3_data.get('status', 'pending'),
                    details=Milestone3Detail(**details_data)
                )
            
            if response.data[0]['milestone_4']:
                m4_data = response.data[0]['milestone_4']
                details_data = m4_data.get('details', {})
                milestone_4 = Milestone4(
                    milestone_id=m4_data.get('milestone_id', ''),
                    title=m4_data.get('title', ''),
                    overview=m4_data.get('overview', ''),
                    completion_status=m4_data.get('completion_status', 0.0),
                    status=m4_data.get('status', 'pending'),
                    details=Milestone4Detail(**details_data)
                )
            
            user_data = CareerPlan(
                plan_id=response.data[0]['plan_id'],
                user_id=response.data[0]['username'],
                overview=response.data[0]['overview'],
                milestone_1=milestone_1,
                milestone_2=milestone_2,
                milestone_3=milestone_3,
                milestone_4=milestone_4,
                created_date=response.data[0]['created_date'],
                last_updated=response.data[0]['last_updated']
            )
    except Exception as e:
        print(f"No career plan found for {username}: {e}")
    
    return user_data




def storeUserPlanInDB(plan: CareerPlan):

    try:
        plan_db = {
            "plan_id": plan.plan_id,
            "username": plan.user_id,  # Career Plans table uses username field
            "created_date": plan.created_date,
            "last_updated": get_current_timestamp(),
            "overview": plan.overview,
            "milestone_1": plan.milestone_1.model_dump() if plan.milestone_1 else None,
            "milestone_2": plan.milestone_2.model_dump() if plan.milestone_2 else None,
            "milestone_3": plan.milestone_3.model_dump() if plan.milestone_3 else None,
            "milestone_4": plan.milestone_4.model_dump() if plan.milestone_4 else None
        }

        # Try to insert first, if it fails due to conflict, update instead
        try:
            data = supabase.table(CAREER_PLANS).insert(plan_db).execute()
        except Exception as insert_error:
            # If insert fails (likely due to existing record), try update instead
            data = supabase.table(CAREER_PLANS).update(plan_db).eq("username", plan.user_id).execute()
    except Exception as e:
        print(f"Unable to store Career Plan to db {e}")


def getUserInformationFromDB(username: str):
    # Look up by user_id (which contains the email) instead of username field
    response = supabase.table(USER_INFORMATION).select("*").eq("username", username).execute()
    
    if response.data:
        user_profile = UserProfile(
            username=response.data[0]['username'],
            interests_values=response.data[0]['Interests + Values'],
            work_experience=response.data[0]['Work Experience'],
            circumstances=response.data[0]['Circumstances'],
            skills=response.data[0]['Skills'],
            goals=response.data[0]['Goals'],
            created_at=response.data[0].get('created_at'),
            last_updated=response.data[0].get('last_updated')
        )

        return user_profile