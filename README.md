🛡️ Fake News Detector – AI-Powered News Authenticity Checker

Fake News Detector is a MERN stack web application integrated with AI/ML models to verify the credibility of online news articles. The platform allows users to securely sign in and analyze any news URL to determine whether the content is credible, suspicious, or fake. The system leverages Natural Language Processing techniques to extract article content and evaluate news authenticity, providing a confidence score and a detailed reliability analysis.

<img width="1917" height="904" alt="Screenshot 2025-12-30 102947" src="https://github.com/user-attachments/assets/b87ed647-6a58-45c8-950f-3ceddc9f861f" />

Once authenticated, users are directed to a modern and intuitive dashboard where they can paste a news URL. The backend fetches and processes the article using an AI model trained on real and fake news datasets. It checks source reliability, factual accuracy, presence of sensational language, and dataset-supported credibility patterns. During the evaluation, a loading state reflects the ongoing analysis.

<img width="1917" height="914" alt="Screenshot 2025-12-30 103020" src="https://github.com/user-attachments/assets/07e3cf90-1340-41c0-ba8a-daaaf0a9d0d8" />

When the AI completes its evaluation, users receive a comprehensive breakdown that includes the credibility verdict, percentage confidence score, explanation of reasoning, and key findings about the article’s trustworthiness. This enhances transparency and boosts user trust by showing not just the prediction but the logic behind it.

<img width="1919" height="909" alt="Screenshot 2025-12-30 103121" src="https://github.com/user-attachments/assets/6d6c5120-67da-434c-92f7-b70db07e3e72" />

The application securely manages user authentication through Email/Password and Google Sign-In, ensuring only verified users can access the analysis feature. MongoDB handles user data and analysis logs, while the Node.js/Express backend provides API endpoints for communication between the React client and the Python-based AI model server. The architecture ensures scalability and smooth real-time data flow across all services.

<img width="1899" height="902" alt="Screenshot 2025-12-30 103247" src="https://github.com/user-attachments/assets/ff69533f-fe1f-43ef-b7c3-79af8228853f" />

This project demonstrates a powerful combination of full-stack development and AI-driven journalism support, helping users detect misinformation online efficiently. It is an excellent application of applied machine learning, cybersecurity awareness, and modern web development tools to ensure the spread of credible information.


Open the given link to check the output of the project
https://trust-meter-app.vercel.app/
