#include <Arduino.h>
#include "wifi.h"

void setup()
{
    // put your setup code here, to run once:
    Serial.begin(9600);

    // wifi
    wifiSetup();

    // Create a FreeRTOS task for the WiFi loop
    xTaskCreate(
        wifiLoop,    // Task function
        "WiFi Task", // Task name
        4096,        // Stack size (in bytes)
        NULL,        // Task parameters
        1,           // Priority
        NULL         // Task handle
    );
}

void loop()
{
    Serial.print("loop");
}