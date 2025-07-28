from db import getUserInformationFromDB, getUserPlanFromDB, storeUserPlanInDB
from api import generate_cascading_plan
import asyncio

if __name__ == "__main__":
    # This test demonstrates the error from file_context_0:
    # Field required [type=missing, input_value={'plan_id': 'plan_sona.om...1.095566', 'version': 1}, input_type=dict]
    # For further information visit https://errors.pydantic.dev/2.11/v/missing

    # Simulate fetching a user profile and generating a plan using the API logic
    username = "sona.om78@gmail.com"
    user_profile = getUserPlanFromDB(username)
    print("User profile fetched from DB:")
    print(user_profile)

    # # Try to generate a plan using the API function (which returns a CareerPlan)
    # async def test_generate_and_store():
    #     plan = await generate_cascading_plan(username)
    #     print("Generated plan:")
    #     print(plan)
    #     print("Plan stored successfully.")

    # asyncio.run(test_generate_and_store())