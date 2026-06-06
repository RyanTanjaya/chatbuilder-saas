-- AddColumn: optional outbound webhook fired when a new conversation starts
ALTER TABLE "chatbots" ADD COLUMN "webhookUrl" TEXT;
