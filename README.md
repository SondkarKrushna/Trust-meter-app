🛡️ Fake News Detector – AI-Powered News Authenticity Checker

Fake News Detector is a MERN stack web application integrated with AI/ML models to analyze the credibility of online news. The platform allows users to paste any news URL and receive a credibility score, verdict, and detailed analysis report powered by Natural Language Processing (NLP).

This project aims to combat misinformation by validating source reliability, content legitimacy, and sensational framing – helping users identify fake or misleading news online.

🚀 Live Demo

🔗 Check it out here:
👉 https://trust-meter-app.vercel.app/

📌 Features

✔ Secure Authentication (Email/Password & Google Sign-In)
✔ Paste any news article URL for analysis
✔ AI-powered credibility evaluation
✔ Confidence percentage score
✔ Detailed report of source trustworthiness
✔ Modern UI & smooth dashboard experience
✔ Logs and access stored securely in MongoDB
✔ Real-time response and progress indication

🧠 How It Works

The system uses NLP and dataset-trained AI models to analyze:

Source reliability

Factual accuracy & claim validation

Sentiment & sensational wording

Dataset-based credibility patterns

Results include:
🔍 Verdict → Credible / Suspicious / Fake
📊 Confidence Score
📌 Key Findings & Explanation

This enhances transparency by showing prediction + reasoning.

🖥️ UI Screenshots
🔐 Secure Login and Authentication
<img src="https://github.com/user-attachments/assets/b87ed647-6a58-45c8-950f-3ceddc9f861f" alt="Auth Screenshot" />
📊 News Analysis Dashboard
<img src="https://github.com/user-attachments/assets/07e3cf90-1340-41c0-ba8a-daaaf0a9d0d8" alt="Dashboard Screenshot" />
🧠 Fake News Detection Results
<img src="https://github.com/user-attachments/assets/6d6c5120-67da-434c-92f7-b70db07e3e72" alt="Results Screenshot" />
🔍 Real-Time User Interaction
<img src="https://github.com/user-attachments/assets/ff69533f-fe1f-43ef-b7c3-79af8228853f" alt="UI Screenshot" />
🛠️ Tech Stack
Component	Technology
Frontend	React.js, TailwindCSS
Backend	Node.js, Express.js
Database	MongoDB
AI/ML	Python, NLP Model trained on Fake/Real News Datasets
Auth	Firebase Authentication (Google Sign-In + Email Login)
Deployment	Vercel (Client) & Backend Services
📂 Project Structure

/client  --> React Frontend
/server  --> Node + Express API
/model   --> Python Fake News Detection Model


⚙️ Installation & Setup (Local)

# Clone the repository
git clone https://github.com/<your-username>/<repo-name>.git

# Install client dependencies
cd client
npm install
npm run dev

# Install server dependencies
cd ../server
npm install
npm start


Ensure Python model service is running on its designated port.

🤖 Machine Learning Model

The AI engine evaluates news using:

NLP feature extraction

Text classification

Pretrained datasets on real vs fake news

Source credibility checks

📌 Use Cases

Journalism verification

Academic research against misinformation

Social media content validation

Public awareness & digital safety

📬 Contact

Developer: Krushna Vitthal Sondkar
📧 Email: (Add your email here)
📌 GitHub: https://github.com/
<your-username>

⭐ Support

If you like this project, please consider giving it a star ⭐ on GitHub!
Your support motivates future enhancements 🚀
