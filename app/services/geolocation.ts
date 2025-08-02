export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export const getCurrentPosition = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: "お使いのブラウザは位置情報をサポートしていません",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let message = "位置情報の取得に失敗しました";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "位置情報の許可が拒否されました。設定から許可してください。";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "位置情報が利用できません。";
            break;
          case error.TIMEOUT:
            message = "位置情報の取得がタイムアウトしました。";
            break;
        }

        reject({
          code: error.code,
          message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000, // 10 minutes
      }
    );
  });
};

export const watchPosition = (
  onSuccess: (coordinates: Coordinates) => void,
  onError: (error: GeolocationError) => void
): number | null => {
  if (!navigator.geolocation) {
    onError({
      code: 0,
      message: "お使いのブラウザは位置情報をサポートしていません",
    });
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    (error) => {
      let message = "位置情報の監視に失敗しました";
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = "位置情報の許可が拒否されました";
          break;
        case error.POSITION_UNAVAILABLE:
          message = "位置情報が利用できません";
          break;
        case error.TIMEOUT:
          message = "位置情報の取得がタイムアウトしました";
          break;
      }

      onError({
        code: error.code,
        message,
      });
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 300000, // 5 minutes
    }
  );
};

export const clearWatch = (watchId: number): void => {
  navigator.geolocation.clearWatch(watchId);
};