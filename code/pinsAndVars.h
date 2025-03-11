#pragma once

// Defining the input pins for the motor
#define PWML 4
#define IN1L 16
#define IN2L 17

// Defining the input pins for the motor
#define PWMR 2
#define IN1R 18
#define IN2R 19


#define delay_time 60
#define motor_increment_factor 1

#define throttle_factor 120
#define turn_factor 120


extern int throttle;
extern int turn;

extern int rightMotorSpeed;
extern int leftMotorSpeed;