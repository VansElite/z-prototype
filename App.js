import { Audio } from "expo-av";
import { Camera } from "expo-camera";
import { Accelerometer } from "expo-sensor";
import { Magnetometer } from "expo-sensors";
import { Gyroscope } from "expo-sensors";
import Constants from "expo-constants";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import React, { useEffect, useRef, useState } from "react";
import { Button, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  // Panel Controller
  const [vNotif, setVNotif] = useState(false);
  const [vGeo, setVGeo] = useState(false);
  const [vCamera, setVCamera] = useState(false);
  const [vAccelerometer, setVAccelerometer] = useState(false);
  const [vMag, setVMag] = useState(false);
  const [vGyro, setVGyro] = useState(false);

  // Hooks Notif
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  //  Hooks Geo
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  //Hooks Camera
  const [hasPermission, setHasPermission] = useState(null);

  // Hooks Accel
  const [dataAccel, setDataAccel] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState(null);

  // Hooks Magnet
  const [dataMag, setDataMag] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState(null);

  // Hooks Gyro
  const [dataGyro, setDataGyro] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState(null);

  // Hooks
  // Hooks
  // Hooks
  
  // #1 Notifications and Special Notifications
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // #2 Geo-Location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  let textGeoLocation = "Waiting..";
  if (errorMsg) {
    textGeoLocation = errorMsg;
  } else if (location) {
    textGeoLocation = JSON.stringify(location);
  }

  // #3 Camera
  const [type, setType] = useState(Camera.Constants.Type.back);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  // #4 Speaker
  const playSound = async () => {
    const sound = new Audio.Sound();
    try {
      await sound.loadAsync(require("./assets/risitas.mp3"));
      await sound.playAsync();
    } catch (error) {}
  };

  // #13 Bluetooth
  // #14 Infrared
  // #15 NFC
  // #16 Accelerometer Access
  const _slow = () => {
    Accelerometer.setUpdateInterval(1000);
  };

  const _fast = () => {
    Accelerometer.setUpdateInterval(16);
  };

  const _subscribe = () => {
    setSubscription(
      Accelerometer.addListener((accelerometerData) => {
        setDataAccel(accelerometerData);
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  const { x, y, z } = dataAccel;

  // #17 Magnetometer Access
  const _slow = () => {
    Magnetometer.setUpdateInterval(1000);
  };

  const _fast = () => {
    Magnetometer.setUpdateInterval(16);
  };

  const _subscribe = () => {
    setSubscription(
      Magnetometer.addListener((result) => {
        setDataMag(result);
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  const { x, y, z } = dataMag;

  // #18 Gyroscope Access
  const _slow = () => {
    Gyroscope.setUpdateInterval(1000);
  };

  const _fast = () => {
    Gyroscope.setUpdateInterval(16);
  };

  const _subscribe = () => {
    setSubscription(
      Gyroscope.addListener((gyroscopeData) => {
        setDataGyro(gyroscopeData);
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  const { x, y, z } = dataGyro;
  // #19 Access to Cellular Phone Number
  // #20 Access to Device Serial Number
  // #21 Access to Device IMEI Number
  // #22 Non-connection use (caching)

  return (
    <ScrollView style={{ padding: 40 }}>
      {/* #1 Notifications and Special Notifications */}
      <Button title="Notifications and Special Notifications" onPress={() => setVNotif(!vNotif)}></Button>
      <View
        style={{
          display: vNotif ? null : "none",
        }}
      >
        <Text>Your expo push token: {expoPushToken}</Text>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Text>Title: {notification && notification.request.content.title} </Text>
          <Text>Body: {notification && notification.request.content.body}</Text>
          <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
        </View>
        <Button
          title="Press to schedule a notification"
          onPress={async () => {
            await schedulePushNotification();
          }}
        />
      </View>

      {/* #2 Geo-Location */}
      <Button title="Geo-Location" onPress={() => setVGeo(!vGeo)}></Button>
      <View
        style={{
          display: vGeo ? null : "none",
        }}
      >
        <Text>{textGeoLocation}</Text>
      </View>

      {/* #3 Camera */}
      <Button title="Camera" onPress={() => setVCamera(!vCamera)}></Button>
      <View style={{ display: vCamera ? null : "none" }}>
        <Camera type={type} style={{ height: 100 }}>
          <View>
            <TouchableOpacity
              onPress={() => {
                setType(type === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back);
              }}
            >
              <Text> Flip </Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </View>

      {/* #4 Speaker */}
      <Button title="Play Sound" onPress={playSound}></Button>

      {/* // #13 Bluetooth */}
      {/* // #14 Infrared */}
      {/* // #15 NFC  */}
      {/* // #16 Accelerometer Access */}
      <Button title="Accelerometer" onPress={() => setVAccelerometer(!vAccelerometer)}></Button>
      <View style={{ display: vAccelerometer ? null : "none" }}>
        <Text style={styles.text}>Accelerometer: (in Gs where 1 G = 9.81 m s^-2)</Text>
        <Text style={styles.text}>
          x: {round(x)} y: {round(y)} z: {round(z)}
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={subscription ? _unsubscribe : _subscribe} style={styles.button}>
            <Text>{subscription ? "On" : "Off"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={_slow} style={[styles.button, styles.middleButton]}>
            <Text>Slow</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={_fast} style={styles.button}>
            <Text>Fast</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* // #17 Magnetometer Access  */}
      <Button title="Magnetometer" onPress={() => setVMag(!vMag)}></Button>
      <View
        style={{
          display: vMag ? null : "none",
        }}
      >
        <Text style={styles.text}>Magnetometer:</Text>
        <Text style={styles.text}>
          x: {round(x)} y: {round(y)} z: {round(z)}
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={subscription ? _unsubscribe : _subscribe} style={styles.button}>
            <Text>{subscription ? "On" : "Off"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={_slow} style={[styles.button, styles.middleButton]}>
            <Text>Slow</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={_fast} style={styles.button}>
            <Text>Fast</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* // #18 Gyroscope Access */}
      <Button title="Gyroscope" onPress={() => setVGyro(!vGyro)}></Button>
      <View
        style={{
          display: vGyro ? null : "none",
        }}
      >
        <Text style={styles.text}>Accelerometer: (in Gs where 1 G = 9.81 m s^-2)</Text>
        <Text style={styles.text}>
          x: {round(x)} y: {round(y)} z: {round(z)}
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={subscription ? _unsubscribe : _subscribe} style={styles.button}>
            <Text>{subscription ? "On" : "Off"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={_slow} style={[styles.button, styles.middleButton]}>
            <Text>Slow</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={_fast} style={styles.button}>
            <Text>Fast</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* // #19 Access to Cellular Phone Number  */}
      {/* // #20 Access to Device Serial Number */}
      {/* // #21 Access to Device IMEI Number */}
      {/* // #22 Non-connection use (caching) */}
    </ScrollView>
  );
}

// #1 Notifications and Special Notifications
async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: "Here is the notification body",
      data: { data: "goes here" },
    },
    trigger: { seconds: 2 },
  });
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}
