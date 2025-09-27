# ConnectFlow: AI-Powered WhatsApp Lead Conversion
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Kuse1995/generated-app-20250927-232112)
> An AI-powered platform that uses an OpenAI Assistant on WhatsApp to convert leads for social media services and notifies you when they're ready to pay.
ConnectFlow is a sophisticated platform designed to automate client outreach and lead qualification via WhatsApp. It seamlessly integrates a powerful OpenAI Assistant with Twilio's WhatsApp API. The core mission of the AI is to engage potential clients, present social media service packages, and persuade them to subscribe. When a client expresses a clear intent to purchase, the system automatically flags them as a 'hot lead' and sends an email notification to the sales team, enabling a human agent to finalize the deal. The application features a minimalist, professional dashboard to monitor all conversations in real-time, view chat histories, and manage qualified leads, providing a complete, streamlined solution for modern sales automation.
## ✨ Key Features
-   **Automated WhatsApp Conversations**: Engages potential clients using a powerful OpenAI Assistant.
-   **Seamless Twilio Integration**: Connects directly to the Twilio WhatsApp API for real-time messaging.
-   **Intelligent Lead Qualification**: Identifies clients with purchase intent and flags them as 'hot leads'.
-   **Email Notifications**: Automatically sends an email to the sales team when a lead is ready to pay.
-   **Real-time Dashboard**: A minimalist, professional dashboard to monitor all conversations.
-   **Conversation History**: View complete chat histories for any client.
-   **Dedicated Leads View**: A filtered view to quickly access high-priority, payment-ready leads.
## 🚀 Technology Stack
-   **Frontend**: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide React
-   **Backend**: Cloudflare Workers, Hono, Durable Objects
-   **Core APIs**: OpenAI Assistants API, Twilio WhatsApp API
-   **Package Manager**: Bun
## 🏁 Getting Started
Follow these instructions to get a local copy up and running for development and testing purposes.
### Prerequisites
-   [Node.js](https://nodejs.org/en/) (v18 or later)
-   [Bun](https://bun.sh/)
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up)
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated
-   An [OpenAI account](https://platform.openai.com/) with API access
-   A [Twilio account](https://www.twilio.com/try-twilio) with a WhatsApp-enabled number
### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/connectflow.git
    cd connectflow
    ```
2.  **Install dependencies:**
    ```bash
    bun install
    ```
3.  **Configure Environment Variables:**
    Create a `.dev.vars` file in the root of the project for local development. This file is used by Wrangler to load environment variables.
    ```ini
    # .dev.vars
    # OpenAI Configuration
    OPENAI_API_KEY="sk-..."
    ASSISTANT_ID="asst_..."
    # Twilio Configuration
    TWILIO_ACCOUNT_SID="AC..."
    TWILIO_AUTH_TOKEN="..."
    TWILIO_PHONE_NUMBER="+14155238886"
    ```
    **Note:** For production, you must set these as secrets in your Cloudflare Worker dashboard.
## 💻 Development
To start the development server, which runs both the Vite frontend and the Cloudflare Worker locally, run:
```bash
bun dev
```
This will start the application, typically available at `http://localhost:3000`. The frontend will hot-reload on changes, and the worker will restart automatically.
## 🛠️ Usage
1.  **Deploy the Worker**: First, deploy the application to Cloudflare to get a public URL.
2.  **Configure Twilio Webhook**:
    -   Go to your Twilio console and navigate to the settings for your WhatsApp-enabled phone number.
    -   Under "Messaging", find the "A MESSAGE COMES IN" webhook setting.
    -   Set the webhook URL to your deployed worker's endpoint: `https://<your-worker-name>.<your-subdomain>.workers.dev/api/twilio/whatsapp`
    -   Ensure the method is set to `HTTP POST`.
3.  **Start a Conversation**: Send a message from WhatsApp to your Twilio number.
4.  **Monitor Dashboard**: Open the application's URL to see the conversation appear in real-time on the dashboard.
## ☁️ Deployment
This project is designed for seamless deployment to Cloudflare Workers.
**Note:** This application uses standard Cloudflare Workers and Durable Objects. It does **not** require the "Workers for Platforms" feature.
1.  **Deploy with Wrangler:**
    Run the deployment script. This will build the frontend application and deploy it along with the worker to your Cloudflare account.
    ```bash
    bun run deploy
    ```
2.  **Set Production Secrets:**
    After the initial deployment, you must add your API keys and other secrets to the production environment via the Cloudflare dashboard or using the Wrangler CLI.
    ```bash
    wrangler secret put OPENAI_API_KEY
    wrangler secret put ASSISTANT_ID
    wrangler secret put TWILIO_ACCOUNT_SID
    wrangler secret put TWILIO_AUTH_TOKEN
    wrangler secret put TWILIO_PHONE_NUMBER
    ```
    Wrangler will prompt you to enter the value for each secret. These secrets will be securely available to your worker.
3.  **Deploy with the Button:**
    Alternatively, you can deploy this project with a single click.
    [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Kuse1995/generated-app-20250927-232112)
## 📂 Project Structure
-   `src/`: Contains all the frontend React application code, including pages, components, and utilities.
-   `worker/`: Contains all the backend Cloudflare Worker code, including the Hono router, Durable Objects (`agent.ts`, `app-controller.ts`), and API integration logic.
-   `wrangler.jsonc`: Configuration file for the Cloudflare Worker, including bindings and build settings.
-   `vite.config.ts`: Configuration for the Vite frontend development server and build process.
## 🤝 Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for bugs, feature requests, or improvements.
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
## 📄 License
This project is licensed under the MIT License. See the `LICENSE` file for details.