#include "motorcontrol.h"
#include "pinsAndVars.h"
#include <Arduino.h>

void motorcontrol_init()
{
    pinMode(PWML, OUTPUT);
    pinMode(IN1L, OUTPUT);
    pinMode(IN2L, OUTPUT);

    pinMode(PWMR, OUTPUT);
    pinMode(IN1R, OUTPUT);
    pinMode(IN2R, OUTPUT);
}


void motorspeed_control(int current_speed_left, int current_speed_right)
{
    leftMotorSpeed += (current_speed_left - leftMotorSpeed) * motor_increment_factor;
    rightMotorSpeed += (current_speed_right - rightMotorSpeed) * motor_increment_factor;

    if (leftMotorSpeed > 0)
    {
        analogWrite(PWML, leftMotorSpeed);
        digitalWrite(IN1L, HIGH);
        digitalWrite(IN2L, LOW);
    }
    else
    {
        analogWrite(PWML, -leftMotorSpeed);
        digitalWrite(IN1L, LOW);
        digitalWrite(IN2L, HIGH);
    }

    if (rightMotorSpeed > 0)
    {
        analogWrite(PWMR, rightMotorSpeed);
        digitalWrite(IN1R, HIGH);
        digitalWrite(IN2R, LOW);
    }
    else
    {
        analogWrite(PWMR, -rightMotorSpeed);
        digitalWrite(IN1R, LOW);
        digitalWrite(IN2R, HIGH);
    }
    
    delay(delay_time);
}