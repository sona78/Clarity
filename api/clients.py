import os
from dotenv import load_dotenv
from openai import OpenAI
from exa_py import Exa

# Load environment variables from .env file
load_dotenv('../.env')

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise Exception("OPENAI_API_KEY not found in environment variables")

EXA_API_KEY = os.getenv("EXA_API_KEY")
if not EXA_API_KEY:
    raise Exception("EXA_API_KEY not found in environment variables")

openai_client = OpenAI(api_key=OPENAI_API_KEY)

exa_client = Exa(api_key=EXA_API_KEY)