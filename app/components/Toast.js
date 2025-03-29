import React from "react";
import Toast from "react-native-toast-message";

export const showToast = (type, text1, text2) => {
  Toast.show({
    type,
    text1,
    text2,
    position: "top",
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 50,
  });
};

const ToastComponent = () => {
  return <Toast />;
};

export default ToastComponent;
