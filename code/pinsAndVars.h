#pragma once

// Defining the input pins for the motor
#define PWML 4
#define IN1L 16
#define IN2L 17

// Defining the input pins for the motor
#define PWMR 2
#define IN1R 18
#define IN2R 19


#define delay_time 50
#define motor_increment_factor 0.5

#define throttle_factor 150
#define turn_factor 150


extern int throttle = 0;
extern int turn = 0;

extern int rightMotorSpeed = 0;
extern int leftMotorSpeed = 0;