from google import genai
import os
import json
import uuid
import re
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

def analyze_text_with_gemini():
    try:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        uploaded_file = client.files.upload(file="tnc_input.txt")

        prompt = """
You are a legal assistant. Analyze the uploaded file which contains terms and conditions.

Do the following:
1. Provide a short summary of the agreement.
2. List any potentially harmful or unfavorable clauses to the user.
3. For each, include:
- The clause text
- The reason it's harmful
- A severity level: low, medium, or high

Return only a raw JSON object with the format:
{
  "summary": "...",
  "harmful_clauses": [
    {
      "clause": "...",
      "reason": "...",
      "severity": "low" | "medium" | "high"
    }
  ]
}
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt, uploaded_file]
        )

        raw = response.text.strip()
        cleaned = re.sub(r'^```json\s*|\s*```$', '', raw, flags=re.MULTILINE)
        return json.loads(cleaned)

    except Exception as e:
        error_output = {"error": "Failed to analyze text.", "details": str(e)}
        print(error_output)
        return error_output


def write_json_file(data, length):
    data["raw_text_length"] = length
    filename = f"tnc_analyzer_{uuid.uuid4()}.json"
    path = Path.cwd() / filename
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(str(path))
    except Exception as e:
        with open(path, "w", encoding="utf-8") as f:
            json.dumps({"error": "Failed to write output file.", "details": str(e)})


def main():
    try:
        with open("tnc_input.txt", "r", encoding="utf-8") as f:
            raw_text = f.read()
    except FileNotFoundError:
        print(json.dumps({"error": "tnc_input.txt not found"}))
        return

    result = analyze_text_with_gemini()
    write_json_file(result, len(raw_text))

    try:
        os.remove("tnc_input.txt")
    except Exception as e:
        print("Warning: failed to delete temp file:", e)


if __name__ == "__main__":
    main()
