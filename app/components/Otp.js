import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OtpInput } from 'react-native-otp-entry';

const OTPInput = ({ value, setValue }) => {
  return (
    <View style={styles.container}>
      <OtpInput
        numberOfDigits={6}
        focusColor="blue"
        autoFocus
        onTextChange={setValue}
        theme={{
          containerStyle: styles.otpContainer,
          pinCodeContainerStyle: styles.pinCodeContainer,
          pinCodeTextStyle: styles.pinCodeText,
          focusStickStyle: styles.focusStick,
          focusedPinCodeContainerStyle: styles.focusedPinCodeContainer,
          filledPinCodeContainerStyle: styles.filledPinCodeContainer,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  otpContainer: {
    marginBottom: 20,
  },
  pinCodeContainer: {
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 8,
    width: 45,
    height: 55,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinCodeText: {
    fontSize: 20,
    color: '#333',
  },
  focusStick: {
    backgroundColor: 'blue',
  },
  focusedPinCodeContainer: {
    borderColor: 'blue',
  },
  filledPinCodeContainer: {
    borderColor: 'green',
  },
});

export default OTPInput;
