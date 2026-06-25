import requests


class OllamaService:

    def __init__(self):

        self.url = "http://localhost:11434/api/generate"

        self.model = "llama3.1"


    def generate(self, prompt):

        response = requests.post(

            self.url,

            json={

                "model": self.model,

                "prompt": prompt,

                "stream": False

            },

            timeout=300

        )

        response.raise_for_status()

        data = response.json()

        return data.get("response", "")


ollama = OllamaService()

