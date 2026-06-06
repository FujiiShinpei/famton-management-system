
export async function sendLineMessage(message: string): Promise<boolean> {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const userId = process.env.LINE_USER_ID;

    if (!token || !userId) {
        console.warn("⚠️ LINE_CHANNEL_ACCESS_TOKEN or LINE_USER_ID is not set. Skipping notification.");
        return false;
    }

    try {
        const response = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                to: userId,
                messages: [
                    {
                        type: "text",
                        text: message,
                    }
                ]
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Failed to send LINE message:", response.status, errorText);
            return false;
        }

        return true;
    } catch (error) {
        console.error("❌ Error sending LINE message:", error);
        return false;
    }
}
