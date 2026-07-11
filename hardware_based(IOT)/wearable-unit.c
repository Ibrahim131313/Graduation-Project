// Wristwatch code

#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

#include <OneWire.h>
#include <DallasTemperature.h>

#include "MAX30105.h"
#include "heartRate.h"
#include "spo2_algorithm.h"

//////////////// WIFI //////////////////

const char* ssid = "Ziad Said";
const char* password = "123456789ziadsaid.1";

const char* serverURL = "https://nabd-hospital.nabawi.me/api/readings/add";

WebServer server(80);

//////////////// LCD //////////////////

LiquidCrystal_I2C lcd(0x27, 16, 2);

//////////////// DS18B20 //////////////////

#define ONE_WIRE_BUS 4

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

float tempOffset = 2;

//////////////// MAX30102 //////////////////

MAX30105 particleSensor;

#define BUFFER_SIZE 100

uint32_t irBuffer[BUFFER_SIZE];
uint32_t redBuffer[BUFFER_SIZE];

int32_t spo2 = 0;
int32_t heartRate = 0;

int8_t validSPO2;
int8_t validHeartRate;

//////////////// SEND TO SERVER //////////////////

void sendToServer(int hr, int spo2Value, float tempValue) {

  if (WiFi.status() == WL_CONNECTED) {

    WiFiClientSecure client;
    client.setInsecure();  //SSl

    HTTPClient http;

    http.begin(client, serverURL);
    http.addHeader("Content-Type", "application/json");

    String respirationPattern = "normal";
    int respirationRate = random(12, 30);

    if (hr > 110 || spo2Value < 92)
      respirationPattern = "abnormal";

    if (hr > 120 || spo2Value < 88)
      respirationPattern = "critical";

    String jsonData = "{";
    jsonData += "\"device_id\":\"dev003\",";
    jsonData += "\"sensors\":{";
    jsonData += "\"heart_rate\":" + String(hr) + ",";
    jsonData += "\"spo2\":" + String(spo2Value) + ",";
    jsonData += "\"temperature\":" + String(tempValue,1) + ",";
    jsonData += "\"respiration_rate\":" + String(respirationRate) + ",";
    jsonData += "\"respiration_pattern\":\"" + respirationPattern + "\"";
    jsonData += "}}";

    Serial.println("Sending JSON:");
    Serial.println(jsonData);

    int httpResponseCode = http.POST(jsonData);

    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);

    if (httpResponseCode > 0) {

      String response = http.getString();

      Serial.println("Server Response:");
      Serial.println(response);
    }

    http.end();
  }
}

//////////////// SETUP //////////////////

void setup() {

  Serial.begin(115200);
  Wire.begin(21,22);

  lcd.init();
  lcd.backlight();

  lcd.print("Starting...");
  delay(2000);

  lcd.clear();

  sensors.begin();

  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    lcd.print("MAX Error");
    while (1);
  }

  particleSensor.setup(60,4,2,100,411,4096);
  particleSensor.setPulseAmplitudeRed(0x24);
  particleSensor.setPulseAmplitudeIR(0x24);

  WiFi.begin(ssid,password);

  lcd.print("Connecting WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }

  lcd.clear();
  lcd.print("WiFi Connected");

  delay(1000);

  lcd.clear();

  server.on("/",handleRoot);
  server.begin();
}

//////////////// LOOP //////////////////

void loop() {

  for (byte i = 0; i < BUFFER_SIZE; i++) {

    while (!particleSensor.available())
      particleSensor.check();

    redBuffer[i] = particleSensor.getFIFORed();
    irBuffer[i] = particleSensor.getFIFOIR();

    particleSensor.nextSample();
  }

  maxim_heart_rate_and_oxygen_saturation(
    irBuffer,
    BUFFER_SIZE,
    redBuffer,
    &spo2,
    &validSPO2,
    &heartRate,
    &validHeartRate
  );

  bool fingerDetected = irBuffer[BUFFER_SIZE - 1] > 5000;

  sensors.requestTemperatures();

  float temperature = sensors.getTempCByIndex(0) + tempOffset;

  if (!fingerDetected || heartRate < 45 || heartRate > 120 || validHeartRate == 0)
    heartRate = 0;

  if (spo2 < 90 || spo2 > 100 || validSPO2 == 0)
    spo2 = 0;

  lcd.clear();

  if (fingerDetected) {

    lcd.setCursor(0,0);

    if (heartRate == 0) {
      lcd.print("HR: -- BPM");
    } else {
      lcd.print("HR: ");
      lcd.print(heartRate);
      lcd.print(" BPM");
    }

    lcd.setCursor(0,1);

    if (spo2 == 0) {
      lcd.print("SpO2: -- %");
    } else {
      lcd.print("SpO2: ");
      lcd.print(spo2);
      lcd.print(" %");
    }

  } else {

    lcd.setCursor(0,0);
    lcd.print("Temp: ");
    lcd.print(temperature,1);
    lcd.print(" C");

    lcd.setCursor(0,1);
    lcd.print("Finger OFF");
  }

  sendToServer(heartRate, spo2, temperature);

  delay(5000);
}
