#pragma once

// Defining the input pins for the motor
#define PWML 4
#define IN1L 13
#define IN2L 17

// Defining the input pins for the motor
#define PWMR 2
#define IN1R 18
#define IN2R 19


#define delay_time 50
#define motor_increment_factor 0.8

#define throttle_factor 150
#define turn_factor 150


extern int throttle;
extern int turn;

extern int rightMotorSpeed;
extern int leftMotorSpeed;