// makit code

#include "DHT.h"
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ================= LCD =================
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ================= FLAME =================
#define FLAME_PIN    34
#define BUZZER_PIN   25
#define READ_COUNT   10
#define START_DELAY  2000

int THRESHOLD = 0;

// ================= DHT11 =================
#define DHTPIN   27
#define DHTTYPE  DHT11

DHT dht(DHTPIN, DHTTYPE);

const byte KARAKTER_DERAJAT = 0;

byte derajat[] = {
  B00111,
  B00101,
  B00111,
  B00000,
  B00000,
  B00000,
  B00000,
  B00000
};

// ================= MQ5 =================
#define MQ5_PIN 33
#define LED_PIN 26

int baseline = 0;

// ================= FUNCTIONS =================

// Flame read
int readFlame() {
  long sum = 0;

  for (int i = 0; i < READ_COUNT; i++) {
    sum += analogRead(FLAME_PIN);
    delay(10);
  }

  return sum / READ_COUNT;
}

// Gas read
int readGas() {
  long sum = 0;

  for (int i = 0; i < 20; i++) {
    sum += analogRead(MQ5_PIN);
    delay(5);
  }

  return sum / 20;
}

// ================= SETUP =================
void setup() {

  Serial.begin(115200);

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);

  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_PIN, LOW);

  Wire.begin(21, 22);

  lcd.init();
  lcd.backlight();
  lcd.clear();

  lcd.createChar(KARAKTER_DERAJAT, derajat);

  dht.begin();

  delay(START_DELAY);

  // ===== FLAME CALIBRATION =====
  Serial.println("Calibrating Flame...");

  long baseSum = 0;

  for (int i = 0; i < 50; i++) {
    baseSum += readFlame();
    delay(50);
  }

  int baseValue = baseSum / 50;

  THRESHOLD = baseValue - 800;

  if (THRESHOLD < 0)
    THRESHOLD = 0;

  Serial.print("Flame Threshold: ");
  Serial.println(THRESHOLD);

  // ===== MQ5 CALIBRATION =====
  lcd.setCursor(0, 0);
  lcd.print("Calibrating Gas");

  long sum = 0;

  for (int i = 0; i < 100; i++) {
    sum += readGas();
    delay(20);
  }

  baseline = sum / 100;

  lcd.clear();
}

// ================= LOOP =================
void loop() {

  // ================= FLAME =================
  int flameValue = readFlame();

  if (flameValue < THRESHOLD) {
    digitalWrite(BUZZER_PIN, HIGH);
    Serial.println("FIRE DETECTED!");
  } else {
    digitalWrite(BUZZER_PIN, LOW);
  }

  // ================= DHT11 =================
  delay(2000);

  float hum = dht.readHumidity();
  float temp = dht.readTemperature();

  // ================= MQ5 =================
  int gas = readGas();

  int diff = gas - baseline;

  int gasPercent = map(diff, 0, 1500, 0, 100);
  gasPercent = constrain(gasPercent, 0, 100);

  // LED control
  if (gasPercent < 40) {
    digitalWrite(LED_PIN, LOW);
  } else {
    digitalWrite(LED_PIN, HIGH);
  }

  // ================= SERIAL =================
  Serial.print("Temp: ");
  Serial.print(temp);
  Serial.print("C | Hum: ");
  Serial.print(hum);
  Serial.print("% | Gas: ");
  Serial.print(gasPercent);
  Serial.print("% | Flame: ");
  Serial.println(flameValue);

  // ================= LCD =================
  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.print(temp);
  lcd.write(KARAKTER_DERAJAT);
  lcd.print(" H:");
  lcd.print(hum);

  lcd.setCursor(0, 1);

  if (gasPercent < 40 && flameValue > THRESHOLD) {
    lcd.print("SAFE        ");
  } else {
    lcd.print("DANGER!     ");
  }

  delay(1000);
}
