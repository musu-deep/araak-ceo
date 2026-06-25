from services.ollama_service import OllamaService


class PricingAgent:

    def __init__(self):
        self.ai = OllamaService()


    def run(self, axis, project_text, instruction):

        prompt = f"""
أنت وكيل التسعير التنفيذي داخل CEO OFFICE 360.

المحور:
{axis}

وصف المشروع:
{project_text}

المطلوب:
{instruction}

قم بإعداد تقرير تنفيذي يشمل:

1- التحليل التنفيذي

2- التكلفة المتوقعة

3- المخاطر

4- التوصيات

5- القرار المقترح للرئيس التنفيذي

اجعل الإجابة احترافية ومختصرة.
"""

        return self.ai.generate(prompt)


pricing_agent = PricingAgent()

