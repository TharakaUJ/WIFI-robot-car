#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoWebsockets.h>
#include <ArduinoJson.h>
#include "wifi_cred.h"
#include "wifi.h"
#include "pinsAndVars.h"

using namespace websockets;

WebsocketsServer webSocket;
WebsocketsClient client;

// Handle incoming WebSocket messages
void handleWrite(const WebsocketsMessage &message)
{
    String payload = message.data(); // Extract message content as a String
    Serial.println("Received: " + payload);
    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, payload.c_str()); // Use payload for deserialization

    if (error)
    {
        Serial.println("Failed to parse JSON");
        Serial.println(error.c_str());
        return;
    }
    throttle = doc["throttle"] | 0;
    turn = doc["turn"] | 0;
}

// Function to initialize Wi-Fi
void setupWiFi()
{
    Serial.print("Connecting to Wi-Fi...");
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConnected to Wi-Fi. IP: " + WiFi.localIP().toString());
}

void wifiSetup()
{
    setupWiFi(); // Initialize Wi-Fi

    webSocket.listen(80); // Start WebSocket server
    Serial.println("WebSocket server started. Connect to ws://" + WiFi.localIP().toString() + ":80");
}

void wifiLoop(void *parameter)
{
    for (;;)
    {
        // Infinite loop
        if (!client.available())
        {
            throttle = 0;
            turn = 0;
            client = webSocket.accept();
            Serial.println("Client connected");
        }
        else
        {
            client.poll();
            auto message = client.readBlocking();
            handleWrite(message);
            Serial.println("Message received");
        }

        vTaskDelay(100 / portTICK_PERIOD_MS); // Non-blocking delay
    }
}
