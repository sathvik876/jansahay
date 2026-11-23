# JanSahay AI

JanSahay helps citizens find schemes, check listed eligibility conditions, read government notices and prepare applications. The directory contains ten sourced schemes focused on Telangana and national programs.

## Run locally

Use Node.js 22 or newer. Both folders have zero npm dependencies.

Run each command in a separate PowerShell terminal from the project root.

```powershell
npm --prefix backend start
```

```powershell
npm --prefix frontend run dev
```

- Frontend [http://localhost:5173](http://localhost:5173)
- Backend health [http://localhost:8000/api/health](http://localhost:8000/api/health)

Chat retrieval, eligibility, browsing, checklists and issue reporting work without a key. To enable PDF and image explanations and optional AI-generated chat answers, copy `backend/.env.example` to `backend/.env`, set `GEMINI_API_KEY` and restart the backend. The configured model must support PDF and image inputs. Keep the key in the backend only.

## Deploy to Render and Vercel

1. Push the project to a Git repository.
2. Create a Render **Web Service** from the repository. Select the **Node** runtime and set **Root Directory** to `backend`, **Build Command** to `npm install` and **Start Command** to `npm start`. Set **Health Check Path** to `/api/health`. Set `NODE_VERSION` to `22`, and add `GEMINI_API_KEY` to enable document analysis. Render supplies the port. Deploy and copy its HTTPS service URL.
3. In `frontend/index.html`, set the `jansahay-api` meta tag's `content` to the Render HTTPS origin, with no `/api` suffix. Commit that edit.
4. Import the repo into Vercel. Set **Root Directory** to `frontend`, **Framework Preset** to **Other** and deploy. This static frontend has no build step and uses the folder root as output. Copy the production HTTPS origin from Vercel.
5. On Render, set `ALLOWED_ORIGINS` to your exact Vercel origin (for example, `https://your-project.vercel.app` without a trailing slash). For multiple allowed origins, separate them with commas. Redeploy and test the Vercel URL.

Localhost addresses are available only from the computer running the servers. The deployed frontend uses the public Render URL, and citizens open the public Vercel URL.

Reports are recorded in `backend/data/reports.jsonl` when running locally. Maintainers can review that file using the report reference. To retain reports across Render redeployments, attach a persistent disk and set `REPORTS_FILE` to a file on its mount, for example `/var/data/reports.jsonl`. Reports on Render's default ephemeral filesystem may disappear after redeploys or restarts.

[Render web services documentation](https://render.com/docs/web-services) · [Vercel build settings](https://vercel.com/docs/deployments/configure-a-build) · [Gemini document processing](https://ai.google.dev/gemini-api/docs/document-processing)

## Demo and tests

Run `npm --prefix backend test` from the project root. In the app, filter Explore Government Schemes by Karnataka and Students to see central schemes. Choose Telangana to see ePASS too. Check a scheme’s requirements, open its personalized checklist, and mark documents ready. Submit feedback from a scheme or assistant answer and find the matching reference in the report file. Test a notice with the Gemini key configured.

The API keeps no account or chat database. Users can opt into browser-local history and clear it. Eligibility answers and checklist progress are held in browser memory for the current visit. Files are sent to Gemini with explicit consent and are processed without application-side file storage. The curated directory shows the source-review date and any verified application cycle. The English scheme records and labels accompany multilingual assistant responses and document explanations. Eligibility results indicate which listed conditions pass or still need confirmation. Official authorities make the final decision.

JanSahay AI is an independent informational project and is not an official government service.
