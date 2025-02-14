#!/usr/bin/python
# -*- coding:utf-8 -*-
import math

import numpy as np
import adafruit_dht
import time
import ADS1256
import RPi.GPIO as GPIO
import board
from prometheus_client import start_http_server, CollectorRegistry
from prometheus_client.core import GaugeMetricFamily
import random 
import time
import requests
import adafruit_dht
import mpu6050 as gyro

ADC = ADS1256.ADS1256()
ADC.ADS1256_init()
# DHT11 connected to GPIO 4
dhtDevice = adafruit_dht.DHT11(board.D4)
gyroDevice = gyro.mpu6050(0x68)
boot_stabil = gyroDevice.get_gyro_data()

class DLC_sensor_Collector(object):

    def collect(self):
        ADC_Value = ADC.ADS1256_GetAll()
        gauge_metric = GaugeMetricFamily("DLC_sensors_gauge", "deepgadget DLC sensors telemetry", labels=['server_name','metric','description'])
        #7 = leak detection leak = < 4.2
        gauge_metric.add_metric(["sg-tt00","LEAK detection","if leak: value < 4.1"], round(float(ADC_Value[7]*5.0/0x7fffff), 3))
        #6 = water level LOW > 1
        gauge_metric.add_metric(["sg-tt00","Fluid level", "if empty: value > 1"], round(float(ADC_Value[6]*5.0/0x7fffff), 3))
        #4 = water temp 34.3 = 1.386 35 = 1.360 35.6 = 1.346 37.6 = 1.282 35.7 = 1.348
        gauge_metric.add_metric(["sg-tt00","Fluid temperature", "degree celcious"], self.fluid_temp_calc(float(ADC_Value[4]*5.0/0x7fffff)))
        chassis_temp = dhtDevice.temperature
        chassis_humit = dhtDevice.humidity
        gauge_metric.add_metric(["sg-tt00","Chassis temperature", "degree celcious"], chassis_temp)
        gauge_metric.add_metric(["sg-tt00","Chassis humidity", "%"], chassis_humit)
        gauge_metric.add_metric(["sg-tt00","Chassis stability", "1 is stable, 0 is unstable, may server in oscillatting"], self.chassis_stabil_calc())
        yield gauge_metric

    # fluid temperature fomula generate by several measured data using linear regression. 
    # x: Raw sensing data(ADC_Value, y: Degree celcisous
    def fluid_temp_calc(self, raw_data):
        coeff_a = 50.453
        coeff_b = -1.177
        celcious = coeff_a * raw_data ** coeff_b
        celcious = round(celcious, 1)
        return celcious

    def in_range(self, n, start, end):
        return start <= n <= end if end >= start else end <= n <= start

    def chassis_stabil_calc(self):
        # get x, y, z, axis value. type: dict
        current_stabil= gyroDevice.get_gyro_data()
        curr_x = current_stabil['x'] 
        curr_y = current_stabil['y']
        curr_z = current_stabil['z']
        init_x = boot_stabil['x']
        init_y = boot_stabil['y']
        init_z = boot_stabil['z']
        print(curr_x)
        is_stable = 1

        # Compare current xyz coordinate data with boot xyz data. 
        if abs(curr_x - init_x) > 5 and abs(curr_y - init_y) > 5 or abs(curr_z - init_z) > 5:
            is_stable = 0
        else:
            is_stable = 1
        return is_stable

if __name__ == "__main__":
    port = 9003
    frequency = 10
    try:
        registry = CollectorRegistry()
        sensor_collector = DLC_sensor_Collector()
        registry.register(sensor_collector)
        start_http_server(port, registry=registry)
    except Exception as error:
        # Error happen fairly often, DHT's are hard to read, just keep going 
        GPIO.cleanup()
        ADC = ADS1256.ADS1256()
        ADC.ADS1256_init()
        # DHT11 connected to GPIO 4
        dhtDevice = adafruit_dht.DHT11(board.D4)
        gyroDevice = gyro.mpu6050(0x68)
        time.sleep(1.0)
        # If sensing fail, initialize ADS1256 module. 
        pass
    while True:
        print("DLC sensor telemetry initiate..")
        time.sleep(frequency)
