 import { app } from "./app";




 async function startLocalServer() {
     const expressApp = await app();
     const PORT = Number(process.env.PORT || 3000);

     expressApp.listen(PORT, () => {
         console.log(`Server running on http://localhost:${PORT}`)
     });
    
 }

 startLocalServer();