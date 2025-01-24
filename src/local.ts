import { app } from "./app";
import { CustomLogger } from "./logging/CustomLogger";



 async function startLocalServer() {
    const logger: CustomLogger = new CustomLogger({ logLevel:'debug' })

    try {
        const expressApp = await app();
        const PORT = Number(process.env.PORT || 3000);

        expressApp.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`)
        });
    } catch (error) {
        logger.error(
            'Failed to start server',
            'StartLocalServe',
            {
                ererrorMessage: error instanceof Error
                ? error.message
                : String(error)
            });
        process.exit(1);
    }
     
    
 }

 startLocalServer();