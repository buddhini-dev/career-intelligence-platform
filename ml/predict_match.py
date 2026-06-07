import sys, json, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'database'))

from resume_matcher import match_resume

input_data  = json.loads(sys.argv[1])
resume_text = input_data.get("resume_text", "")
results     = match_resume(resume_text, top_n=5)

print(json.dumps({ "matches": results }))