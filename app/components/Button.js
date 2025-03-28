import { TouchableOpacity, Text } from "react-native";

export const PrimaryButton = ({ onPress, title, className = "", disabled = false }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`bg-blue-600 p-4 rounded-lg ${disabled ? "opacity-50" : ""} ${className}`}
    >
      <Text className="text-white text-center font-bold text-lg">{title}</Text>
    </TouchableOpacity>
  );
};

export const SecondaryButton = ({ onPress, title, className = "", disabled = false }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`border border-blue-600 p-4 rounded-lg bg-white ${disabled ? "opacity-50" : ""} ${className}`}
    >
      <Text className="text-blue-600 text-center font-bold text-lg">{title}</Text>
    </TouchableOpacity>
  );
};

export default { PrimaryButton, SecondaryButton };
