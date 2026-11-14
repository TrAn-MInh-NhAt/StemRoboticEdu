#ifndef ARDUINO_MOCK_H
#define ARDUINO_MOCK_H
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

// Pin mode constants
#define INPUT 0
#define OUTPUT 1
#define INPUT_PULLUP 2
#define HIGH 1
#define LOW 0
#define LED_BUILTIN 13

// Core Arduino macros
#define pinMode(pin, mode) ((void)(pin), (void)(mode))
#define digitalWrite(pin, val) ((void)(pin), (void)(val))
#define analogWrite(pin, val) ((void)(pin), (void)(val))
#define delay(ms) ((void)(ms))
#define constrain(x, a, b) ((x)<(a)?(a):((x)>(b)?(b):(x)))
#define map(x, in_min, in_max, out_min, out_max) ((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min)

// Mock sensor reads
static inline int analogRead(int pin) { (void)pin; return 512; }
static inline int digitalRead(int pin) { (void)pin; return 0; }
static inline unsigned long millis(void) { return 0UL; }
static inline unsigned long micros(void) { return 0UL; }
static inline unsigned long pulseIn(int pin, int val) { (void)pin; (void)val; return 1000UL; }

// Serial mock
struct SerialClass {
    void begin(int baud) { (void)baud; }
    template<typename T> void print(T val) { printf("%s", std::to_string(val).c_str()); }
    template<typename T> void println(T val) { printf("%s\n", std::to_string(val).c_str()); }
    void println() { printf("\n"); }
    void print(const char* s) { printf("%s", s); }
    void println(const char* s) { printf("%s\n", s); }
    void print(float f, int d=2) { printf("%.*f", d, f); }
    void println(float f, int d=2) { printf("%.*f\n", d, f); }
    bool available() { return 0; }
    int read() { return -1; }
    int parseInt() { return 0; }
    float parseFloat() { return 0.0f; }
};
extern SerialClass Serial;
#endif // ARDUINO_MOCK_H
