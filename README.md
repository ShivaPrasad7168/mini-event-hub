# How To Run the Project:
https://mini-event-hub.vercel.app/

# Environmental variables needed
VITE_SUPABASE_PROJECT_ID="qxbxswysfwntvoqkkwtl"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4Ynhzd3lzZndudHZvcWtrd3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTY4MjIsImV4cCI6MjA3NzQ5MjgyMn0.lngKrzz4XzIka8J2P9Luu-Fb_2P0D8f-VTXZeQyoNG4"
VITE_SUPABASE_URL="https://qxbxswysfwntvoqkkwtl.supabase.co"

# Screenshots:
<img width="1339" height="430" alt="image" src="https://github.com/user-attachments/assets/04da04e4-17d6-41f4-a742-b9f7effb2ea4" />
<img width="428" height="573" alt="image" src="https://github.com/user-attachments/assets/494f7f39-3ae2-4c79-86f6-8f8491694178" />
<img width="1024" height="451" alt="image" src="https://github.com/user-attachments/assets/26fd37e3-857f-4d78-ae52-a4a9127bd68c" />
<img width="497" height="621" alt="image" src="https://github.com/user-attachments/assets/2eb58110-9752-4a40-842f-08ae5e2f86c2" />
<img width="540" height="608" alt="image" src="https://github.com/user-attachments/assets/3d66d083-47b0-47bb-81d7-1dcc87ddf93a" />
<img width="1366" height="700" alt="image" src="https://github.com/user-attachments/assets/0598149a-2a63-49ba-b0c1-433c3b86a6b4" />

# Challanges That I Faced and How I Solved
1. Backend setup friction
Challenge: Setting up a Node/Express backend locally took time due to dependency mismatches and missing environment variables. 
Solution: Added a clean package.json with exact versions, a .env.example, and a Scripts section for dev/prod; documented setup in README so the app runs with one command.

2.Deployment and testing
Challenge: “Works on my machine” issues after deployment. 
Solution: Deployed on Vercel, set environment variables in the dashboard.
