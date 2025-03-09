#include <Arduino.h>
#include "wifi.h"
#include "motorcontrol.h"
#include "pinsAndVars.h"

void setup()
{
    // put your setup code here, to run once:
    Serial.begin(9600);

    // wifi
    wifiSetup();
    motorcontrol_init();
}

void loop()
{
    Serial.print("loop");
    wifiLoop();

    int newRightMotorSpeed, newLeftMotorSpeed;

    newRightMotorSpeed = throttle * throttle_factor + turn * turn_factor;
    newLeftMotorSpeed = throttle * throttle_factor - turn * turn_factor;

    constrain(newLeftMotorSpeed, 0, 255);
    constrain(newRightMotorSpeed, 0, 255);

    motorspeed_control(newLeftMotorSpeed, newRightMotorSpeed);  
}